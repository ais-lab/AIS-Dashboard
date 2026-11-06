"use client"

import { useEffect, useRef, useState } from "react"

import { isDevAuth, loadGoogleIdentity, setToken } from "@/lib/auth/google-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const GoogleSignInButton = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [devEmail, setDevEmail] = useState("")

  useEffect(() => {
    if (isDevAuth) return
    loadGoogleIdentity().then(() => {
      if (!ref.current) return
      window.google?.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
      })
      window.google?.accounts.id.prompt()
    })
  }, [])

  if (isDevAuth) {
    return (
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const email = devEmail.trim().toLowerCase()
          if (email) setToken(`dev:${email}`)
        }}
      >
        <Input
          aria-label="Dev sign-in email"
          placeholder="dev sign-in: any email"
          value={devEmail}
          onChange={(e) => setDevEmail(e.target.value)}
          wrapperClassName="flex-1"
        />
        <Button type="submit">Sign in</Button>
      </form>
    )
  }

  return <div ref={ref} className="min-h-10" />
}
