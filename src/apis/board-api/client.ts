import { env } from "@/env.mjs"
import { getToken, setToken } from "@/lib/auth/google-auth"

// Client for the Apps Script web app in apps-script/Code.gs.

export interface Account {
  email: string
  name: string
  picture: string
  role: "admin" | "member"
  status: "none" | "pending" | "approved" | "rejected"
  owner: boolean
}

export interface BoardItem {
  id: string
  name: string
  mimeType: string
  size: number
  createdAt: string
  uploadedBy: string | null
  canEdit: boolean
  // Countdown events only: the date inside the JSON.
  eventDate?: string | null
  // Only set by the local dev server; real items use the Drive API key.
  thumbnailUrl?: string
}

export interface Member {
  email: string
  name: string
  role: "admin" | "member"
  status: "pending" | "approved" | "rejected"
  note?: string
  requestedAt?: string
  decidedAt?: string
  decidedBy?: string
  owner: boolean
}

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

export const isBoardApiConfigured = (): boolean =>
  !!env.NEXT_PUBLIC_API_URL && !!env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export const callBoardApi = async <T>(
  action: string,
  args: Record<string, unknown> = {}
): Promise<T> => {
  // text/plain keeps this a "simple" request, which Apps Script accepts
  // cross-origin without a CORS preflight.
  const res = await fetch(env.NEXT_PUBLIC_API_URL as string, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, token: getToken(), ...args }),
  })
  if (!res.ok) throw new ApiError("network", `Request failed (${res.status})`)
  const out = await res.json()
  if (!out.ok) {
    if (out.code === "signed_out") setToken(null)
    throw new ApiError(out.code, out.error)
  }
  return out.data as T
}

export const fileToBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export const textToBase64 = (text: string): Promise<string> =>
  fileToBase64(new Blob([text], { type: "text/plain;charset=utf-8" }))
