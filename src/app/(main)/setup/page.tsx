"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// One-command kiosk setup for the computer behind the lab monitor, opened on
// that computer itself: pick the OS, copy, paste, run.

const RAW = "https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk"

const WINDOWS_INSTALL = `irm ${RAW}/install.ps1 | iex`
const WINDOWS_REMOVE = `& ([scriptblock]::Create((irm ${RAW}/install.ps1))) -Uninstall`
const UNIX_INSTALL = `curl -fsSL ${RAW}/install.sh | bash`
const UNIX_REMOVE = `curl -fsSL ${RAW}/install.sh | bash -s -- --uninstall`

type OS = "windows" | "mac" | "linux"

const detectOS = (): OS => {
  const ua = navigator.userAgent
  if (/Windows/i.test(ua)) return "windows"
  if (/Mac/i.test(ua)) return "mac"
  return "linux"
}

const Command = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <div className="flex items-stretch gap-2">
      <code className="min-w-0 flex-1 break-all rounded-md bg-muted px-3 py-2.5 font-mono text-sm">
        {value}
      </code>
      <Button
        variant="outline"
        className="shrink-0"
        onClick={copy}
        aria-label="Copy command"
      >
        {copied ? (
          <Check className="mr-1.5 size-4" />
        ) : (
          <Copy className="mr-1.5 size-4" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}

const Step = ({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children?: React.ReactNode
}) => (
  <li className="flex gap-4">
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {n}
    </span>
    <div className="min-w-0 flex-1 space-y-2 pt-0.5">
      <p className="font-medium">{title}</p>
      {children && (
        <div className="space-y-2 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  </li>
)

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
    {children}
  </kbd>
)

export default function SetupPage() {
  const [os, setOs] = useState<OS>("windows")
  useEffect(() => setOs(detectOS()), [])

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Set up the monitor / モニターの設定
        </h1>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back to board
          </Button>
        </Link>
      </div>

      <Tabs value={os} onValueChange={(v) => setOs(v as OS)}>
        <TabsList className="mb-6">
          <TabsTrigger value="windows">Windows</TabsTrigger>
          <TabsTrigger value="mac">Mac</TabsTrigger>
          <TabsTrigger value="linux">Linux</TabsTrigger>
        </TabsList>

        <TabsContent value="windows" className="border-0 bg-transparent">
          <ol className="list-none space-y-6 pl-0">
            <Step n={1} title="Open PowerShell">
              <p>
                Press <Kbd>Start</Kbd>, type PowerShell, press <Kbd>Enter</Kbd>.
              </p>
            </Step>
            <Step n={2} title="Paste this and press Enter">
              <Command value={WINDOWS_INSTALL} />
              <p>Needs Chrome or Edge.</p>
            </Step>
            <Step n={3} title="Turn on automatic login">
              <p>
                Press <Kbd>Win</Kbd> + <Kbd>R</Kbd>, type netplwiz, untick
                &ldquo;Users must enter a user name and password to use this
                computer&rdquo;.
              </p>
              <p>
                No checkbox? Settings → Accounts → Sign-in options, turn off
                &ldquo;Only allow Windows Hello sign-in&rdquo;.
              </p>
            </Step>
          </ol>
        </TabsContent>

        <TabsContent value="mac" className="border-0 bg-transparent">
          <ol className="list-none space-y-6 pl-0">
            <Step n={1} title="Open Terminal">
              <p>
                Press <Kbd>Cmd</Kbd> + <Kbd>Space</Kbd>, type Terminal, press{" "}
                <Kbd>Enter</Kbd>.
              </p>
            </Step>
            <Step n={2} title="Paste this and press Enter">
              <Command value={UNIX_INSTALL} />
              <p>Needs Chrome.</p>
            </Step>
            <Step n={3} title="Turn on automatic login">
              <p>
                System Settings → Users &amp; Groups → Automatically log in.
              </p>
            </Step>
          </ol>
        </TabsContent>

        <TabsContent value="linux" className="border-0 bg-transparent">
          <ol className="list-none space-y-6 pl-0">
            <Step n={1} title="Open a terminal" />
            <Step n={2} title="Paste this and press Enter">
              <Command value={UNIX_INSTALL} />
              <p>Needs Chrome or Chromium.</p>
            </Step>
            <Step n={3} title="Turn on automatic login">
              <p>
                Settings → Users → Automatic Login. On a Raspberry Pi: sudo
                raspi-config → System Options → Auto Login.
              </p>
            </Step>
          </ol>
        </TabsContent>

        <div className="mt-10 space-y-3 border-t pt-6 text-sm text-muted-foreground">
          <p>
            The board opens full screen now and after every login. To close it,
            press {os === "mac" ? <Kbd>Cmd + Q</Kbd> : <Kbd>Alt + F4</Kbd>}.
          </p>
          <p>To remove it:</p>
          <Command value={os === "windows" ? WINDOWS_REMOVE : UNIX_REMOVE} />
        </div>
      </Tabs>
    </div>
  )
}
