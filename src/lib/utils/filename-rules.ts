export interface FilenameTokens {
  from?: string
  to?: string
  durationDays?: number
  weight?: number
}

export interface ParsedFilename {
  from?: string
  to?: string
  weight: number
  displaySeconds?: number
  hasFromToken: boolean
  hasToToken: boolean
  hasDurationToken: boolean
  hasWeightToken: boolean
  hasDisplaySecondsToken: boolean
  conflict?: string
}

const pad = (n: number) => String(n).padStart(2, "0")

export const toYYYYMMDD = (date: Date): string =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`

// Local calendar date as YYYY-MM-DD. toISOString() would give the UTC date,
// which in Japan is still yesterday until 9am.
export const todayIso = (now = new Date()): string =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

// "2026-11-01" (from an <input type="date">) as local midnight.
export const fromIsoDate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// A title like "Room D101" would otherwise be read as "show for 101 days",
// so token letters followed by a digit are lowercased.
export const safeBaseName = (base: string): string =>
  base.replace(/[FTDWS](?=\d)/g, (c) => c.toLowerCase())

// "seminar_F20261101T20261115.png" -> { title: "seminar", extension: "png" }
export const splitFilename = (
  name: string
): { title: string; extension: string } => {
  const ext = name.match(/\.([A-Za-z0-9]{1,5})$/)
  const stem = ext ? name.slice(0, -ext[0].length) : name
  const title = stem
    .replace(/F\d{8}|T\d{8}|D\d+|W\d+|S\d+/g, "")
    .replace(/_{2,}/g, "_")
    .replace(/^[_\s-]+|[_\s-]+$/g, "")
  return { title: title || stem, extension: ext ? ext[1] : "" }
}

export type ScheduleStatus = "showing" | "scheduled" | "ended" | "invalid"

export const scheduleStatus = (
  parsed: ParsedFilename,
  today = todayIso()
): ScheduleStatus => {
  if (!parsed.from || !parsed.to || parsed.from > parsed.to) return "invalid"
  if (parsed.from > today) return "scheduled"
  if (parsed.to < today) return "ended"
  return "showing"
}

export const FOREVER = "9999-12-31"

export const fromYYYYMMDD = (s: string): Date | null => {
  if (!/^\d{8}$/.test(s)) return null
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  const d = new Date(iso + "T00:00:00Z")
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return null
  return d
}

export const parseFilename = (filename: string): ParsedFilename => {
  const fMatch = filename.match(/F(\d{8})/)
  const tMatch = filename.match(/T(\d{8})/)
  const dMatch = filename.match(/D(\d+)/)
  const wMatch = filename.match(/W(\d+)/)
  const sMatch = filename.match(/S(\d+)/)

  const result: ParsedFilename = {
    weight: 1,
    hasFromToken: !!fMatch,
    hasToToken: !!tMatch,
    hasDurationToken: !!dMatch,
    hasWeightToken: !!wMatch,
    hasDisplaySecondsToken: !!sMatch,
  }

  if (wMatch) {
    const w = parseInt(wMatch[1], 10)
    if (!isNaN(w)) result.weight = w
  }

  if (sMatch) {
    const s = parseInt(sMatch[1], 10)
    if (!isNaN(s) && s > 0) result.displaySeconds = s
  }

  if (tMatch && dMatch) {
    result.conflict = "Both T (end date) and D (duration) are set; one wins."
    return result
  }

  let fromDate: Date
  if (fMatch) {
    const parsed = fromYYYYMMDD(fMatch[1])
    if (!parsed) {
      result.conflict = `Invalid F date: ${fMatch[1]}`
      return result
    }
    fromDate = parsed
  } else {
    const today = new Date()
    fromDate = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    )
  }

  let toDate: Date
  if (tMatch) {
    const parsed = fromYYYYMMDD(tMatch[1])
    if (!parsed) {
      result.conflict = `Invalid T date: ${tMatch[1]}`
      return result
    }
    toDate = parsed
  } else if (dMatch) {
    const days = parseInt(dMatch[1], 10)
    if (isNaN(days) || days <= 0) {
      result.conflict = `Invalid D value: ${dMatch[1]}`
      return result
    }
    toDate = new Date(fromDate)
    toDate.setUTCDate(fromDate.getUTCDate() + days)
  } else {
    toDate = new Date(Date.UTC(9999, 11, 31))
  }

  result.from = fromDate.toISOString().slice(0, 10)
  result.to = toDate.toISOString().slice(0, 10)
  return result
}

export interface BuildOptions {
  base: string
  extension?: string
  from?: Date | null
  endMode?: "to" | "duration" | "forever"
  to?: Date | null
  durationDays?: number | null
  weight?: number | null
  displaySeconds?: number | null
}

export const buildFilename = (opts: BuildOptions): string => {
  const parts: string[] = []

  if (opts.from) parts.push(`F${toYYYYMMDD(opts.from)}`)

  if (opts.endMode === "to" && opts.to) {
    parts.push(`T${toYYYYMMDD(opts.to)}`)
  } else if (opts.endMode === "duration" && opts.durationDays) {
    parts.push(`D${opts.durationDays}`)
  }

  if (opts.weight && opts.weight !== 1) parts.push(`W${opts.weight}`)

  if (opts.displaySeconds && opts.displaySeconds > 0)
    parts.push(`S${opts.displaySeconds}`)

  const tokens = parts.join("")
  const base = safeBaseName(opts.base.trim()) || "untitled"
  const ext = opts.extension?.trim()

  const stem = tokens ? `${base}_${tokens}` : base
  return ext ? `${stem}.${ext.replace(/^\./, "")}` : stem
}
