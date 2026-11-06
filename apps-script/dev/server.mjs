// Local stand-in for the deployed Apps Script web app, for developing the
// upload and admin pages without touching the real Drive folder.
//
// It runs the real ../Code.gs against in-memory fakes of the Apps Script
// services. Sign-in tokens are "dev:<email>"; the site shows an email box
// instead of the Google button when NEXT_PUBLIC_GOOGLE_CLIENT_ID=dev.
//
//   node apps-script/dev/server.mjs        (listens on http://127.0.0.1:8787)

import { createHash, randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { createServer } from "node:http"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

const PORT = Number(process.env.PORT || 8787)
const ORIGIN = `http://127.0.0.1:${PORT}`
const here = dirname(fileURLToPath(import.meta.url))

const props = {
  FOLDER_ID: "local-folder",
  CLIENT_ID: "dev",
  ADMIN_EMAILS: process.env.ADMIN_EMAILS || "admin@lab.test",
  SITE_URL: "http://localhost:3000",
  SHEET_ID: "local-sheet",
}

// --- Drive ------------------------------------------------------------------

const files = new Map()
const folders = new Map()

const iterator = (items) => {
  let i = 0
  return { hasNext: () => i < items.length, next: () => items[i++] }
}

class FakeFolder {
  constructor(id, name, parentId = null) {
    Object.assign(this, {
      id,
      name,
      parentId,
      created: new Date(),
      trashed: false,
    })
  }
  getId() {
    return this.id
  }
  getName() {
    return this.name
  }
  getDateCreated() {
    return this.created
  }
  isTrashed() {
    return this.trashed
  }
  getFiles() {
    return iterator([...files.values()].filter((f) => f.parentId === this.id))
  }
  getFolders() {
    return iterator([...folders.values()].filter((f) => f.parentId === this.id))
  }
  createFile(blob) {
    const file = new FakeFile(blob.name, blob.mimeType, blob.bytes, this.id)
    files.set(file.id, file)
    return file
  }
}

class FakeFile {
  constructor(name, mimeType, bytes, parentId, description = "") {
    Object.assign(this, {
      id: randomUUID().replace(/-/g, ""),
      name,
      mimeType,
      bytes,
      parentId,
      description,
      created: new Date(),
      trashed: false,
    })
  }
  getId() {
    return this.id
  }
  getName() {
    return this.name
  }
  setName(name) {
    this.name = name
    return this
  }
  getMimeType() {
    return this.mimeType
  }
  getSize() {
    return this.bytes.length
  }
  getDateCreated() {
    return this.created
  }
  getDescription() {
    return this.description
  }
  setDescription(d) {
    this.description = d
    return this
  }
  isTrashed() {
    return this.trashed
  }
  setTrashed(t) {
    this.trashed = t
    return this
  }
  getParents() {
    return iterator([folders.get(this.parentId)])
  }
  setContent(text) {
    this.bytes = Buffer.from(text, "utf8")
    return this
  }
  getBlob() {
    return { getDataAsString: () => this.bytes.toString("utf8") }
  }
}

const DriveApp = {
  getFolderById(id) {
    const folder = folders.get(id)
    if (!folder) throw new Error("No folder " + id)
    return folder
  },
  getFileById(id) {
    const file = files.get(id)
    if (!file) throw new Error("No file " + id)
    return file
  },
}

// --- Sheets -----------------------------------------------------------------

const memberRows = [
  [
    "email",
    "name",
    "role",
    "status",
    "note",
    "requestedAt",
    "decidedAt",
    "decidedBy",
  ],
]
const membersSheet = {
  getName: () => "members",
  getMaxRows: () => 1000,
  setName() {
    return this
  },
  setFrozenRows() {},
  getDataRange: () => ({ getValues: () => memberRows.map((r) => [...r]) }),
  appendRow(row) {
    memberRows.push([...row])
    return this
  },
  getRange: (row) => ({
    getValues: () => [[...memberRows[row - 1]]],
    setValues: ([values]) => {
      memberRows[row - 1] = [...values]
    },
    setFontWeight() {},
    setDataValidation() {},
  }),
  deleteRow(row) {
    memberRows.splice(row - 1, 1)
  },
}
const spreadsheet = {
  getId: () => "local-sheet",
  getUrl: () => "http://localhost/local-sheet",
  getSheets: () => [membersSheet],
  getSheetByName: () => membersSheet,
}
const SpreadsheetApp = {
  create: () => spreadsheet,
  openById: () => spreadsheet,
  newDataValidation: () => ({
    requireValueInList() {
      return this
    },
    build: () => ({}),
  }),
}

// The admin changing one member's status by hand in the sheet.
const editStatusInSheet = (email, status) => {
  const statusColumn = memberRows[0].indexOf("status") + 1
  const index = memberRows.findIndex((r) => r[0] === email)
  if (index < 1) throw new Error("No member " + email)
  const oldValue = memberRows[index][statusColumn - 1]
  memberRows[index][statusColumn - 1] = status
  context.onMembersSheetEdit({
    oldValue,
    range: {
      getSheet: () => membersSheet,
      getColumn: () => statusColumn,
      getLastColumn: () => statusColumn,
      getRow: () => index + 1,
      getLastRow: () => index + 1,
    },
  })
}

// --- Everything else ----------------------------------------------------------

const outbox = []
const cache = new Map()
const triggers = []

const services = {
  DriveApp,
  SpreadsheetApp,
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (k) => props[k] ?? null,
      setProperty: (k, v) => {
        props[k] = v
      },
    }),
  },
  CacheService: {
    getScriptCache: () => ({
      get: (k) => cache.get(k) ?? null,
      put: (k, v) => cache.set(k, v),
    }),
  },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ScriptApp: {
    getProjectTriggers: () => [...triggers],
    deleteTrigger: (t) => triggers.splice(triggers.indexOf(t), 1),
    newTrigger: (handler) => ({
      forSpreadsheet: () => ({
        onEdit: () => ({
          create: () =>
            triggers.push({ getHandlerFunction: () => handler, handler }),
        }),
      }),
    }),
  },
  Utilities: {
    DigestAlgorithm: { SHA_256: "sha256" },
    computeDigest: (alg, s) => createHash(alg).update(s).digest(),
    base64EncodeWebSafe: (buf) => Buffer.from(buf).toString("base64url"),
    base64Decode: (s) => Buffer.from(s, "base64"),
    newBlob: (bytes, mimeType, name) => ({
      bytes: Buffer.from(bytes),
      mimeType,
      name,
    }),
  },
  UrlFetchApp: {
    fetch(url) {
      const token = new URL(url).searchParams.get("id_token") || ""
      const email = token.startsWith("dev:")
        ? token.slice(4).trim().toLowerCase()
        : ""
      const body = email
        ? {
            aud: props.CLIENT_ID,
            email,
            email_verified: "true",
            name: email.split("@")[0],
            exp: String(Math.floor(Date.now() / 1000) + 3600),
          }
        : { error: "invalid_token" }
      return {
        getResponseCode: () => (email ? 200 : 400),
        getContentText: () => JSON.stringify(body),
      }
    },
  },
  MailApp: {
    sendEmail(to, subject, body, options = {}) {
      outbox.push({ to, subject, body, ...options, at: new Date().toISOString() })
      console.log(`[mail] to=${to} subject="${subject}"`)
    },
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (content) => ({
      setMimeType() {
        return this
      },
      getContent: () => content,
    }),
  },
  Logger: { log: (...a) => console.log("[gas]", ...a) },
}

const context = vm.createContext({ ...services, console })
vm.runInContext(readFileSync(join(here, "..", "Code.gs"), "utf8"), context, {
  filename: "Code.gs",
})

// --- Seed data ------------------------------------------------------------------

const board = new FakeFolder(props.FOLDER_ID, "AIS Board (local)")
folders.set(board.id, board)
context.setup()
const sub = new FakeFolder("local-sub", "lab_photos_W2", board.id)
folders.set(sub.id, sub)

const svg = (label, color) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="${color}"/><text x="320" y="215" font-family="sans-serif" font-size="44" fill="white" text-anchor="middle">${label}</text></svg>`
  )
const seed = (name, mimeType, bytes, by) => {
  const f = new FakeFile(
    name,
    mimeType,
    bytes,
    board.id,
    by ? `Uploaded via AIS Board by ${by}` : ""
  )
  files.set(f.id, f)
}
seed(
  "welcome.txt",
  "text/plain",
  Buffer.from("# Welcome to AIS Lab\nHave a nice day!"),
  null
)
seed(
  "lab_poster_F20260901.svg",
  "image/svg+xml",
  svg("Lab poster", "#2563eb"),
  null
)
seed(
  "member_slide_F20261001T20261231.svg",
  "image/svg+xml",
  svg("Member slide", "#16a34a"),
  "member@lab.test"
)
seed(
  "SI_2025_F20250411.json",
  "application/json",
  Buffer.from(
    JSON.stringify({
      name: "SI 2025",
      date: "2025-12-10 10:00:00",
      address: "Hiroshima",
    })
  ),
  null
)
memberRows.push([
  "member@lab.test",
  "member",
  "member",
  "approved",
  "",
  new Date().toISOString(),
  new Date().toISOString(),
  props.ADMIN_EMAILS.split(",")[0],
])

// --- HTTP -------------------------------------------------------------------------

const withThumbs = (data) => {
  const add = (it) =>
    it &&
    it.id &&
    files.has(it.id) &&
    files.get(it.id).mimeType.startsWith("image/")
      ? { ...it, thumbnailUrl: `${ORIGIN}/files/${it.id}` }
      : it
  return Array.isArray(data) ? data.map(add) : add(data)
}

createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  const url = new URL(req.url, ORIGIN)

  if (req.method === "GET" && url.pathname.startsWith("/files/")) {
    const file = files.get(url.pathname.slice(7))
    if (!file) return res.writeHead(404).end()
    res.writeHead(200, { "Content-Type": file.mimeType })
    return res.end(file.bytes)
  }
  if (req.method === "GET" && url.pathname === "/outbox") {
    res.writeHead(200, { "Content-Type": "application/json" })
    return res.end(JSON.stringify(outbox, null, 2))
  }
  if (req.method === "GET" && url.pathname === "/sheet") {
    res.writeHead(200, { "Content-Type": "application/json" })
    return res.end(JSON.stringify(memberRows, null, 2))
  }
  // /sheet-edit?email=a@b.test&status=approved
  if (req.method === "GET" && url.pathname === "/sheet-edit") {
    const { email, status } = Object.fromEntries(url.searchParams)
    editStatusInSheet(email, status)
    return res.writeHead(204).end()
  }
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" })
    return res.end(context.doGet().getContent())
  }
  if (req.method !== "POST") return res.writeHead(405).end()

  let body = ""
  req.on("data", (chunk) => (body += chunk))
  req.on("end", () => {
    const out = JSON.parse(
      context.doPost({ postData: { contents: body } }).getContent()
    )
    if (out.ok) out.data = withThumbs(out.data)
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(out))
  })
}).listen(PORT, "127.0.0.1", () => {
  console.log(`AIS Board dev API on ${ORIGIN}`)
  console.log(
    `  admin:  dev:${props.ADMIN_EMAILS.split(",")[0]}   member: dev:member@lab.test`
  )
})
