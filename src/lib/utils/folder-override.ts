import { env } from "@/env.mjs"

const STORAGE_KEY = "aisboard.folderId"
const QUERY_KEY = "folder"

export const readFolderOverride = (): string | null => {
  if (typeof window === "undefined") return null

  const url = new URL(window.location.href)
  const fromQuery = url.searchParams.get(QUERY_KEY)
  if (fromQuery) {
    try {
      window.localStorage.setItem(STORAGE_KEY, fromQuery)
    } catch {}
    return fromQuery
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const setFolderOverride = (folderId: string) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, folderId)
  } catch {}
}

export const clearFolderOverride = () => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export const getActiveFolderId = (): string =>
  readFolderOverride() || env.NEXT_PUBLIC_DRIVE_FOLDER_ID

export const getDefaultFolderId = (): string => env.NEXT_PUBLIC_DRIVE_FOLDER_ID
