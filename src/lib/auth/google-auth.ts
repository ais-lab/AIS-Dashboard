"use client"

import { useSyncExternalStore } from "react"

import { env } from "@/env.mjs"

// Sign in with Google (Google Identity Services). Only the ID token is used:
// it proves the email to the Apps Script API, and no Google scopes are asked.
// With NEXT_PUBLIC_GOOGLE_CLIENT_ID=dev, tokens are "dev:<email>" instead, for
// apps-script/dev/server.mjs.

const STORAGE_KEY = "aisboard.idToken"
export const isDevAuth = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === "dev"

export interface SignedInUser {
  email: string
  name: string
  picture: string
  exp: number
}

export interface AuthState {
  token: string | null
  user: SignedInUser | null
}

const decodeToken = (token: string): SignedInUser | null => {
  if (token.startsWith("dev:")) {
    const email = token.slice(4)
    return { email, name: email.split("@")[0], picture: "", exp: Infinity }
  }
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))
    return {
      email: payload.email,
      name: payload.name ?? "",
      picture: payload.picture ?? "",
      exp: payload.exp,
    }
  } catch {
    return null
  }
}

const signedOut: AuthState = { token: null, user: null }
let state: AuthState | null = null
const listeners = new Set<() => void>()
let expiryTimer: ReturnType<typeof setTimeout> | undefined

const assign = (token: string | null) => {
  const user = token ? decodeToken(token) : null
  // Tokens with under a minute left count as expired.
  const valid = token && user && user.exp * 1000 > Date.now() + 60_000
  state = valid ? { token, user } : signedOut
  clearTimeout(expiryTimer)
  if (valid && Number.isFinite(user.exp)) {
    expiryTimer = setTimeout(
      () => setToken(null),
      user.exp * 1000 - Date.now() - 60_000
    )
  }
}

const getSnapshot = (): AuthState => {
  if (state === null) {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {}
    assign(stored)
  }
  return state as AuthState
}

export const setToken = (token: string | null) => {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
  assign(token)
  listeners.forEach((l) => l())
}

export const getToken = (): string | null => getSnapshot().token

export const signOut = () => {
  setToken(null)
  window.google?.accounts.id.disableAutoSelect()
}

export const useGoogleAuth = (): AuthState =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot,
    () => signedOut
  )

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (
            el: HTMLElement,
            options: Record<string, unknown>
          ) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

let gisLoading: Promise<void> | null = null

export const loadGoogleIdentity = (): Promise<void> => {
  gisLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) =>
          setToken(response.credential),
        auto_select: true,
      })
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
  return gisLoading
}
