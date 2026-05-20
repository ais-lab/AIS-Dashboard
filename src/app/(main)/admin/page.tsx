"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { displayItemKeys } from "@/constants/query-key-factory"
import {
  clearFolderOverride,
  getDefaultFolderId,
  readFolderOverride,
  setFolderOverride,
} from "@/lib/utils/folder-override"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const extractFolderId = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  const match = trimmed.match(/folders\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : trimmed
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const buildTimeFolderId = getDefaultFolderId()
  const [override, setOverride] = useState<string | null>(null)
  const [input, setInput] = useState("")

  useEffect(() => {
    setOverride(readFolderOverride())
  }, [])

  const active = override || buildTimeFolderId
  const isOverridden = !!override && override !== buildTimeFolderId

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !input.trim()) return ""
    const id = extractFolderId(input)
    const url = new URL(window.location.origin + window.location.pathname)
    url.pathname = url.pathname.replace(/\/admin\/?$/, "/")
    url.searchParams.set("folder", id)
    return url.toString()
  }, [input])

  const apply = () => {
    const id = extractFolderId(input)
    if (!id) {
      toast.error("Paste a folder ID or Drive folder URL")
      return
    }
    setFolderOverride(id)
    setOverride(id)
    queryClient.invalidateQueries({ queryKey: displayItemKeys.all() })
    toast.success("Override applied — this browser only")
  }

  const reset = () => {
    clearFolderOverride()
    setOverride(null)
    queryClient.invalidateQueries({ queryKey: displayItemKeys.all() })
    toast.success("Reverted to built-in folder")
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure which Drive folder the board reads from.
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back to board
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Current source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isOverridden ? "default" : "outline"}>
              {isOverridden ? "Local override" : "Built-in default"}
            </Badge>
            <code className="break-all rounded bg-muted px-2 py-1 font-mono text-xs">
              {active || "(not set)"}
            </code>
          </div>
          {isOverridden && (
            <p className="text-xs text-muted-foreground">
              Built-in default:{" "}
              <code className="font-mono">{buildTimeFolderId}</code>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Overrides are stored in this browser&rsquo;s localStorage. Other
            kiosks/visitors still see the built-in default unless you share a
            URL with <code>?folder=&lt;id&gt;</code>.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-10 border-primary/40">
        <CardHeader>
          <CardTitle className="text-base">Override (this browser)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="folder">Drive folder ID or URL</Label>
            <Input
              id="folder"
              placeholder="https://drive.google.com/drive/folders/0B…  or  0B…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste the full folder URL or just the ID. We extract the ID
              automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={apply} disabled={!input.trim()}>
              Apply override
            </Button>
            <Button variant="outline" onClick={reset} disabled={!override}>
              Reset to default
            </Button>
            {shareUrl && (
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl)
                    toast.success("Bookmarkable URL copied")
                  } catch {
                    toast.error("Copy failed")
                  }
                }}
              >
                Copy shareable URL
              </Button>
            )}
          </div>
          {shareUrl && (
            <code className="block break-all rounded bg-muted px-3 py-2 font-mono text-xs">
              {shareUrl}
            </code>
          )}
        </CardContent>
      </Card>

      <Separator className="mb-10" />

      <h2 className="mb-3 text-xl font-semibold">Trust model</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The board runs entirely in the browser. To read a folder it uses a
        public API key and the folder&rsquo;s link-share permission. There is
        no server.
      </p>
      <ul className="mb-10 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          <strong>Anyone with the link → Viewer.</strong> The kiosk and any
          curious visitor can list files and read contents. Don&rsquo;t put
          private material in this folder.
        </li>
        <li>
          <strong>Specific people → Editor.</strong> Add the Google accounts of
          content managers in Drive&rsquo;s share dialog. Only they can upload,
          rename, or delete files.
        </li>
        <li>
          <strong>API key restriction.</strong> The Google Cloud API key is
          restricted by HTTP referrer to the Pages domain — it cannot be reused
          on other origins.
        </li>
      </ul>

      <h2 className="mb-3 text-xl font-semibold">Set up a new folder</h2>
      <ol className="mb-10 list-decimal space-y-3 pl-5 text-sm">
        <li>
          In Google Drive, create the folder. Open it and copy the URL —
          everything after <code>/folders/</code> is the folder ID.
        </li>
        <li>
          Click <strong>Share</strong> → <em>General access</em>: set to{" "}
          <strong>Anyone with the link</strong> with role <strong>Viewer</strong>.
        </li>
        <li>
          Still in the share dialog, add the Google accounts that should be
          able to upload/edit. Give them role <strong>Editor</strong>.
        </li>
        <li>
          Paste the folder URL or ID into the override box above to try it on
          this browser, then verify the board picks up the change.
        </li>
        <li>
          Filenames inside the folder follow the rules in the{" "}
          <Link href="/tutorial/" className="underline">
            filename guide
          </Link>
          .
        </li>
      </ol>

      <h2 className="mb-3 text-xl font-semibold">
        Make the change permanent (for everyone)
      </h2>
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        <li>
          On GitHub, go to the repository &rarr; <strong>Settings</strong>{" "}
          &rarr; <strong>Secrets and variables</strong> &rarr;{" "}
          <strong>Actions</strong> &rarr; <strong>Variables</strong>.
        </li>
        <li>
          Edit <code>NEXT_PUBLIC_DRIVE_FOLDER_ID</code> and paste the new
          folder ID. Save.
        </li>
        <li>
          Go to <strong>Actions</strong> &rarr;{" "}
          <em>Deploy to GitHub Pages</em> &rarr;{" "}
          <strong>Run workflow</strong>. Once it finishes, all kiosks (and
          anyone without a local override) will use the new folder.
        </li>
        <li>
          Optional: clear the local override above so this browser also picks
          up the new default.
        </li>
      </ol>
    </div>
  )
}
