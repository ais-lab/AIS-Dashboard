/**
 * AIS Board API: a small Apps Script web app that lets lab members sign in
 * with Google, request access, and upload to the board's Drive folder.
 *
 * It runs as the Google account that deployed it (the board admin), so
 * members never need Drive access themselves. Members live in a Google Sheet.
 * Setup steps are in apps-script/README.md.
 *
 * Script properties:
 *   FOLDER_ID     Drive folder the board reads from (required)
 *   CLIENT_ID     OAuth client ID used by the site's "Sign in with Google" (required)
 *   ADMIN_EMAILS  Comma-separated emails that are always admins and get the
 *                 access requests (default: DEFAULT_ADMIN_EMAIL)
 *   SITE_URL      Public board URL, used in notification emails (optional)
 *   SHEET_ID      Members sheet, created by setup() (set automatically)
 */

var DEFAULT_ADMIN_EMAIL = "ais.aislab@gmail.com"
var MEMBER_COLUMNS = ["email", "name", "role", "status", "note", "requestedAt", "decidedAt", "decidedBy"]
var UPLOADED_BY_PREFIX = "Uploaded via AIS Board by "
var EDITABLE_TEXT_TYPES = ["text/plain", "text/markdown", "application/json"]
var SHEET_TRIGGER = "onMembersSheetEdit"

// ---------------------------------------------------------------------------
// Entry points

function doGet() {
  return json_({ ok: true, data: { service: "aisboard", version: 1 } })
}

function doPost(e) {
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || "{}")
    var handler = ACTIONS[req.action]
    if (!handler) throw apiError_("unknown_action", "Unknown action: " + req.action)
    var account = account_(verifyToken_(req.token))
    return json_({ ok: true, data: handler(account, req) })
  } catch (err) {
    return json_({ ok: false, code: err.code || "error", error: String(err.message || err) })
  }
}

/** Run once from the Apps Script editor: checks the folder, creates the members sheet, watches it for edits. */
function setup() {
  var cfg = config_()
  var folder = DriveApp.getFolderById(cfg.folderId)
  var ss = cfg.sheetId ? SpreadsheetApp.openById(cfg.sheetId) : createMembersSheet_()
  watchMembersSheet_(ss)
  Logger.log("Members sheet: " + ss.getUrl())
  Logger.log("Board folder OK: " + folder.getName())
  Logger.log("Access requests go to: " + cfg.adminEmails.join(", "))
}

/** Lives in the deployer's Drive, not the board folder: that folder is public and the board would show it. */
function createMembersSheet_() {
  var ss = SpreadsheetApp.create("AIS Board members")
  var sheet = ss.getSheets()[0].setName("members")
  sheet.appendRow(MEMBER_COLUMNS)
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, MEMBER_COLUMNS.length).setFontWeight("bold")
  addDropdown_(sheet, "status", ["pending", "approved", "rejected"])
  addDropdown_(sheet, "role", ["member", "admin"])
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", ss.getId())
  return ss
}

function addDropdown_(sheet, column, values) {
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values).build()
  sheet.getRange(2, MEMBER_COLUMNS.indexOf(column) + 1, sheet.getMaxRows() - 1, 1).setDataValidation(rule)
}

function watchMembersSheet_(ss) {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === SHEET_TRIGGER) ScriptApp.deleteTrigger(trigger)
  })
  ScriptApp.newTrigger(SHEET_TRIGGER).forSpreadsheet(ss).onEdit().create()
}

/**
 * Trigger: changing status by hand in the sheet does what the /admin buttons do.
 * Only hand edits fire this, so the buttons never send a second email.
 */
function onMembersSheetEdit(e) {
  var range = e.range
  var sheet = range.getSheet()
  var statusColumn = MEMBER_COLUMNS.indexOf("status") + 1
  if (sheet.getName() !== "members") return
  if (range.getColumn() > statusColumn || range.getLastColumn() < statusColumn) return

  for (var row = Math.max(range.getRow(), 2); row <= range.getLastRow(); row++) {
    var values = sheet.getRange(row, 1, 1, MEMBER_COLUMNS.length).getValues()[0]
    var email = normalizeEmail_(values[0])
    var status = String(values[statusColumn - 1])
    if (!email || (status !== "approved" && status !== "rejected")) continue
    withLock_(function () {
      upsertMember_(email, { decidedAt: new Date().toISOString(), decidedBy: "members sheet" })
    })
    if (status === "approved" && e.oldValue !== "approved") notifyApproved_(email)
  }
}

var ACTIONS = {
  me: function (account) {
    return account
  },

  requestAccess: function (account, req) {
    // Asking twice must not email the admin twice. Removed members can ask again.
    if (account.status !== "none") return account
    var note = String(req.note || "").slice(0, 500)
    withLock_(function () {
      upsertMember_(account.email, {
        name: account.name,
        role: "member",
        status: "pending",
        note: note,
        requestedAt: new Date().toISOString(),
        decidedAt: "",
        decidedBy: "",
      })
    })
    notifyAdmins_(account, note)
    return account_(account)
  },

  listItems: function (account) {
    requireApproved_(account)
    var folder = boardFolder_()
    var items = []
    var files = folder.getFiles()
    while (files.hasNext()) {
      var file = files.next()
      if (!file.isTrashed()) items.push(itemOf_(file, account))
    }
    var folders = folder.getFolders()
    while (folders.hasNext()) {
      var sub = folders.next()
      if (!sub.isTrashed()) {
        items.push({
          id: sub.getId(),
          name: sub.getName(),
          mimeType: "application/vnd.google-apps.folder",
          size: 0,
          createdAt: sub.getDateCreated().toISOString(),
          uploadedBy: null,
          canEdit: false,
        })
      }
    }
    return items
  },

  upload: function (account, req) {
    requireApproved_(account)
    var name = cleanName_(req.filename)
    var bytes = Utilities.base64Decode(String(req.data || ""))
    var blob = Utilities.newBlob(bytes, String(req.mimeType || "application/octet-stream"), name)
    var file = boardFolder_().createFile(blob)
    file.setDescription(UPLOADED_BY_PREFIX + account.email)
    return itemOf_(file, account)
  },

  getContent: function (account, req) {
    var file = editableFile_(account, req.id)
    if (EDITABLE_TEXT_TYPES.indexOf(file.getMimeType()) < 0) {
      throw apiError_("bad_request", "Only text and event files can be edited")
    }
    return { id: file.getId(), content: file.getBlob().getDataAsString() }
  },

  updateItem: function (account, req) {
    var file = editableFile_(account, req.id)
    if (req.filename) file.setName(cleanName_(req.filename))
    if (typeof req.content === "string") {
      if (EDITABLE_TEXT_TYPES.indexOf(file.getMimeType()) < 0) {
        throw apiError_("bad_request", "Only text and event files can be edited")
      }
      file.setContent(req.content)
    }
    return itemOf_(file, account)
  },

  deleteItem: function (account, req) {
    editableFile_(account, req.id).setTrashed(true)
    return { id: req.id }
  },

  listMembers: function (account) {
    requireAdmin_(account)
    var admins = config_().adminEmails
    var rows = readMembers_().map(function (m) {
      delete m.row
      m.owner = admins.indexOf(m.email) >= 0
      return m
    })
    admins.forEach(function (email) {
      var listed = rows.some(function (m) {
        return m.email === email
      })
      if (!listed) rows.push({ email: email, name: "", role: "admin", status: "approved", owner: true })
    })
    return rows
  },

  decide: function (account, req) {
    requireAdmin_(account)
    var status = req.status === "approved" ? "approved" : "rejected"
    var email = normalizeEmail_(req.email)
    withLock_(function () {
      if (!findMember_(email)) throw apiError_("not_found", "No request from " + email)
      upsertMember_(email, {
        status: status,
        decidedAt: new Date().toISOString(),
        decidedBy: account.email,
      })
    })
    if (status === "approved") notifyApproved_(email)
    return ACTIONS.listMembers(account)
  },

  setRole: function (account, req) {
    requireAdmin_(account)
    var email = normalizeEmail_(req.email)
    var role = req.role === "admin" ? "admin" : "member"
    withLock_(function () {
      if (!findMember_(email)) throw apiError_("not_found", "Not a member: " + email)
      upsertMember_(email, { role: role })
    })
    return ACTIONS.listMembers(account)
  },

  removeMember: function (account, req) {
    requireAdmin_(account)
    var email = normalizeEmail_(req.email)
    if (config_().adminEmails.indexOf(email) >= 0) {
      throw apiError_("bad_request", "Owners are set in the script properties")
    }
    withLock_(function () {
      var found = findMember_(email)
      if (found) membersSheet_().deleteRow(found.row)
    })
    return ACTIONS.listMembers(account)
  },
}

// ---------------------------------------------------------------------------
// Auth

function verifyToken_(token) {
  if (!token) throw apiError_("signed_out", "Sign in first")
  var cache = CacheService.getScriptCache()
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)
  var key = "tok:" + Utilities.base64EncodeWebSafe(digest)
  var cached = cache.get(key)
  if (cached) return JSON.parse(cached)

  var res = UrlFetchApp.fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token),
    { muteHttpExceptions: true }
  )
  if (res.getResponseCode() !== 200) throw apiError_("signed_out", "Sign-in expired")
  var info = JSON.parse(res.getContentText())
  if (info.aud !== config_().clientId) throw apiError_("signed_out", "Token is for another app")
  if (String(info.email_verified) !== "true") throw apiError_("signed_out", "Email not verified")

  var user = {
    email: normalizeEmail_(info.email),
    name: info.name || "",
    picture: info.picture || "",
  }
  var ttl = Math.min(600, Number(info.exp) - Math.floor(Date.now() / 1000))
  if (ttl > 0) cache.put(key, JSON.stringify(user), ttl)
  return user
}

function account_(user) {
  var base = { email: user.email, name: user.name, picture: user.picture }
  if (config_().adminEmails.indexOf(user.email) >= 0) {
    return Object.assign(base, { role: "admin", status: "approved", owner: true })
  }
  var member = findMember_(user.email)
  if (!member) return Object.assign(base, { role: "member", status: "none", owner: false })
  return Object.assign(base, { role: member.role || "member", status: member.status, owner: false })
}

function requireApproved_(account) {
  if (account.status !== "approved") throw apiError_("not_approved", "Your access has not been approved yet")
}

function requireAdmin_(account) {
  requireApproved_(account)
  if (account.role !== "admin") throw apiError_("forbidden", "Admins only")
}

// ---------------------------------------------------------------------------
// Drive

function boardFolder_() {
  return DriveApp.getFolderById(config_().folderId)
}

function itemOf_(file, account) {
  var uploadedBy = uploadedBy_(file)
  var item = {
    id: file.getId(),
    name: file.getName(),
    mimeType: file.getMimeType(),
    size: file.getSize(),
    createdAt: file.getDateCreated().toISOString(),
    uploadedBy: uploadedBy,
    canEdit: account.role === "admin" || uploadedBy === account.email,
  }
  // Countdown events hide themselves after their date, so the list needs it.
  if (item.mimeType === "application/json") {
    try {
      item.eventDate = JSON.parse(file.getBlob().getDataAsString()).date || null
    } catch (err) {
      item.eventDate = null
    }
  }
  return item
}

function uploadedBy_(file) {
  var desc = file.getDescription() || ""
  return desc.indexOf(UPLOADED_BY_PREFIX) === 0 ? desc.slice(UPLOADED_BY_PREFIX.length).trim() : null
}

/** The script can reach the admin's whole Drive, so every edit is checked against the board folder. */
function editableFile_(account, id) {
  requireApproved_(account)
  var file
  try {
    file = DriveApp.getFileById(String(id))
  } catch (err) {
    throw apiError_("not_found", "File not found")
  }
  var folderId = config_().folderId
  var parents = file.getParents()
  var inBoard = false
  while (parents.hasNext()) {
    if (parents.next().getId() === folderId) inBoard = true
  }
  if (!inBoard || file.isTrashed()) throw apiError_("not_found", "File not found")
  if (!itemOf_(file, account).canEdit) throw apiError_("forbidden", "You can only change your own uploads")
  return file
}

function cleanName_(name) {
  var clean = String(name || "")
    .replace(/[\u0000-\u001f/\\]/g, "")
    .trim()
    .slice(0, 200)
  if (!clean) throw apiError_("bad_request", "File name is empty")
  return clean
}

// ---------------------------------------------------------------------------
// Members sheet

function membersSheet_() {
  var sheetId = config_().sheetId
  if (!sheetId) throw apiError_("not_configured", "Run setup() in the Apps Script editor first")
  return SpreadsheetApp.openById(sheetId).getSheetByName("members")
}

function readMembers_() {
  var values = membersSheet_().getDataRange().getValues()
  var out = []
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue
    var m = { row: i + 1 }
    MEMBER_COLUMNS.forEach(function (col, j) {
      var v = values[i][j]
      m[col] = v instanceof Date ? v.toISOString() : String(v)
    })
    m.email = normalizeEmail_(m.email)
    out.push(m)
  }
  return out
}

function findMember_(email) {
  var members = readMembers_()
  for (var i = 0; i < members.length; i++) {
    if (members[i].email === email) return members[i]
  }
  return null
}

function upsertMember_(email, fields) {
  var sheet = membersSheet_()
  var existing = findMember_(email)
  var merged = Object.assign({ email: email }, existing || {}, fields)
  var row = MEMBER_COLUMNS.map(function (col) {
    return cellText_(merged[col] == null ? "" : merged[col])
  })
  if (existing) sheet.getRange(existing.row, 1, 1, row.length).setValues([row])
  else sheet.appendRow(row)
}

/** Notes and names come from anyone with a Google account: "=IMPORTXML(...)" must stay text in the admin's sheet. */
function cellText_(value) {
  return /^[=+\-@]/.test(String(value)) ? "'" + value : value
}

// ---------------------------------------------------------------------------
// Email

function notifyAdmins_(account, note) {
  var cfg = config_()
  var ways = []
  if (cfg.siteUrl) ways.push("On the site: " + cfg.siteUrl.replace(/\/$/, "") + "/admin/")
  ways.push(
    "In the members sheet (set status to approved or rejected): " +
      "https://docs.google.com/spreadsheets/d/" + cfg.sheetId + "/edit"
  )
  var body =
    (account.name || account.email) + " (" + account.email + ") asked to post on the AIS Board." +
    (note ? '\n\nNote: "' + note + '"' : "") +
    "\n\nTo approve or decline:\n- " + ways.join("\n- ")
  cfg.adminEmails.forEach(function (to) {
    MailApp.sendEmail(to, "AIS Board: access request from " + account.email, body, { replyTo: account.email })
  })
}

function notifyApproved_(email) {
  var cfg = config_()
  var link = cfg.siteUrl ? " Start here: " + cfg.siteUrl.replace(/\/$/, "") + "/upload/" : ""
  MailApp.sendEmail(email, "AIS Board: you can now post", "Your access to the AIS Board was approved." + link)
}

// ---------------------------------------------------------------------------
// Helpers

function config_() {
  var props = PropertiesService.getScriptProperties()
  var folderId = props.getProperty("FOLDER_ID")
  var clientId = props.getProperty("CLIENT_ID")
  if (!folderId || !clientId) throw apiError_("not_configured", "FOLDER_ID and CLIENT_ID must be set")
  return {
    folderId: folderId,
    clientId: clientId,
    sheetId: props.getProperty("SHEET_ID"),
    siteUrl: props.getProperty("SITE_URL") || "",
    adminEmails: String(props.getProperty("ADMIN_EMAILS") || DEFAULT_ADMIN_EMAIL)
      .split(",")
      .map(normalizeEmail_)
      .filter(Boolean),
  }
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase()
}

function withLock_(fn) {
  var lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    return fn()
  } finally {
    lock.releaseLock()
  }
}

function apiError_(code, message) {
  var err = new Error(message)
  err.code = code
  return err
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)
}
