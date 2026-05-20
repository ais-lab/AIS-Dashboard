import { env } from "@/env.mjs"

const DRIVE_API = "https://www.googleapis.com/drive/v3"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
}

export class DriveError extends Error {
  status: number
  reason: "not_found" | "forbidden" | "unauthorized" | "rate_limited" | "other"
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.reason =
      status === 404
        ? "not_found"
        : status === 403
          ? "forbidden"
          : status === 401
            ? "unauthorized"
            : status === 429
              ? "rate_limited"
              : "other"
  }
}

export const listDriveFolder = async (
  folderId: string
): Promise<{ files: DriveFile[] }> => {
  const url = new URL(`${DRIVE_API}/files`)
  url.searchParams.set("q", `'${folderId}' in parents and trashed = false`)
  url.searchParams.set("fields", "files(id, name, mimeType)")
  url.searchParams.set("pageSize", "1000")
  url.searchParams.set("key", env.NEXT_PUBLIC_GOOGLE_API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) throw new DriveError(res.status, `Drive list failed: ${res.status}`)
  return res.json()
}

export const fetchDriveFileText = async (fileId: string): Promise<string> => {
  const url = `${DRIVE_API}/files/${fileId}?alt=media&key=${env.NEXT_PUBLIC_GOOGLE_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Drive file fetch failed: ${res.status}`)
  return res.text()
}

export const fetchDriveFileJson = async <T>(fileId: string): Promise<T> => {
  const url = `${DRIVE_API}/files/${fileId}?alt=media&key=${env.NEXT_PUBLIC_GOOGLE_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Drive file fetch failed: ${res.status}`)
  return res.json()
}

export const driveImageUrl = (fileId: string): string =>
  `${DRIVE_API}/files/${fileId}?alt=media&key=${env.NEXT_PUBLIC_GOOGLE_API_KEY}`
