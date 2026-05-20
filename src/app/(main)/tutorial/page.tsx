"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import {
  buildFilename,
  parseFilename,
  toYYYYMMDD,
} from "@/lib/utils/filename-rules"
import { getActiveFolderId } from "@/lib/utils/folder-override"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type EndMode = "to" | "duration" | "forever"
type ElementType = "image" | "text" | "event" | "folder" | "custom"

interface ElementMeta {
  label: string
  hint: string
  extensions: string[]
  defaultExt: string
  isFolder?: boolean
  isCustom?: boolean
}

const elementCatalog: Record<ElementType, ElementMeta> = {
  image: {
    label: "Image slide",
    hint: "Shown full-screen in the slideshow with a blurred background fill.",
    extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "avif"],
    defaultExt: "png",
  },
  text: {
    label: "Text / Markdown slide",
    hint: "Rendered as markdown. Supports headings, tables, line breaks, and raw HTML.",
    extensions: ["md", "txt", "markdown"],
    defaultExt: "md",
  },
  event: {
    label: "Countdown event",
    hint: "JSON file with { name, date, address?, description?, note? }. Becomes a countdown card.",
    extensions: ["json"],
    defaultExt: "json",
  },
  folder: {
    label: "Folder (weighted random)",
    hint: "Create a Drive folder with this name. The board picks one child each cycle, weighted by W. Only images and text are read from inside.",
    extensions: [],
    defaultExt: "",
    isFolder: true,
  },
  custom: {
    label: "Custom extension",
    hint: "Anything else — falls back to a text slide unless the MIME type is recognized.",
    extensions: [],
    defaultExt: "",
    isCustom: true,
  },
}

const tokens = [
  {
    token: "F",
    name: "From date",
    syntax: "F<YYYYMMDD>",
    example: "F20260601",
    desc: "Start of the display window. If omitted, the item starts being eligible today.",
  },
  {
    token: "T",
    name: "To date",
    syntax: "T<YYYYMMDD>",
    example: "T20260630",
    desc: "End of the display window (inclusive). If neither T nor D is set, the item never expires.",
  },
  {
    token: "D",
    name: "Duration (days)",
    syntax: "D<n>",
    example: "D14",
    desc: "Number of days after F to display the item. Ignored if T is also present.",
  },
  {
    token: "W",
    name: "Weight",
    syntax: "W<n>",
    example: "W3",
    desc: "Relative weight for folder items shown via weighted random. Higher = more likely. Defaults to 1.",
  },
]

const examples = [
  {
    name: "summer_sale_F20260601T20260831.png",
    meaning:
      "An image shown from June 1 to August 31, 2026. Default weight (1).",
  },
  {
    name: "daily_quote_F20260101D365.txt",
    meaning:
      "A text/markdown slide shown starting January 1, 2026, for the next 365 days.",
  },
  {
    name: "promo_W5.png",
    meaning:
      "No date window — eligible immediately and never expires. Weight 5, so it appears 5× more often inside a folder slideshow.",
  },
  {
    name: "launch_event_F20260901T20260901.json",
    meaning:
      "A countdown event JSON shown only on September 1, 2026. JSON files become countdown cards instead of slideshow items.",
  },
]

const inputDateToDate = (s: string): Date | null => {
  if (!s) return null
  const d = new Date(s + "T00:00:00Z")
  return isNaN(d.getTime()) ? null : d
}

const formatLong = (iso?: string) => {
  if (!iso) return "—"
  const d = new Date(iso + "T00:00:00Z")
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export default function GuidePage() {
  const today = toYYYYMMDD(new Date())
  const todayInput = `${today.slice(0, 4)}-${today.slice(4, 6)}-${today.slice(6, 8)}`

  const [folderId, setFolderId] = useState<string>("")
  useEffect(() => setFolderId(getActiveFolderId()), [])
  const folderUrl = folderId
    ? `https://drive.google.com/drive/folders/${folderId}`
    : ""

  const [base, setBase] = useState("my_slide")
  const [elementType, setElementType] = useState<ElementType>("image")
  const [extension, setExtension] = useState<string>("png")
  const [customExt, setCustomExt] = useState("")
  const [from, setFrom] = useState<string>(todayInput)
  const [endMode, setEndMode] = useState<EndMode>("to")
  const [to, setTo] = useState<string>("")
  const [durationDays, setDurationDays] = useState<string>("7")
  const [weight, setWeight] = useState<string>("1")

  const meta = elementCatalog[elementType]

  const handleElementChange = (next: ElementType) => {
    setElementType(next)
    const m = elementCatalog[next]
    setExtension(m.defaultExt)
    if (!m.isCustom) setCustomExt("")
  }

  const resolvedExtension = meta.isFolder
    ? ""
    : meta.isCustom
      ? customExt
      : extension

  const filename = useMemo(() => {
    return buildFilename({
      base,
      extension: resolvedExtension,
      from: inputDateToDate(from),
      endMode,
      to: endMode === "to" ? inputDateToDate(to) : null,
      durationDays:
        endMode === "duration" ? parseInt(durationDays, 10) || null : null,
      weight: parseInt(weight, 10) || 1,
    })
  }, [base, resolvedExtension, from, endMode, to, durationDays, weight])

  const interpretation = useMemo(() => parseFilename(filename), [filename])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(filename)
      toast.success(meta.isFolder ? "Folder name copied" : "Filename copied")
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Filename guide</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a name with the generator, or scroll down for the full
            reference.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Back to board
            </Button>
          </Link>
        </div>
      </div>

      {folderUrl && (
        <Card className="mb-4 border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Drive folder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload your files here. The board reads this folder every 30
              seconds — changes appear within a minute.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full sm:w-auto">Open folder in Drive</Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(folderUrl)
                    toast.success("Folder URL copied")
                  } catch {
                    toast.error("Copy failed")
                  }
                }}
              >
                Copy URL
              </Button>
            </div>
            <code className="block break-all rounded bg-muted px-3 py-2 font-mono text-xs">
              {folderUrl}
            </code>
            <p className="text-xs text-muted-foreground">
              You need <strong>Editor</strong> access to upload. If you can
              view but not upload, ask the folder owner to add your Google
              account as an editor.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="base">
                {meta.isFolder ? "Folder name" : "Base name"}
              </Label>
              <Input
                id="base"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                placeholder={meta.isFolder ? "my_folder" : "my_slide"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Element type</Label>
              <Select
                value={elementType}
                onValueChange={(v) => handleElementChange(v as ElementType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(elementCatalog) as ElementType[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {elementCatalog[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!meta.isFolder && !meta.isCustom && meta.extensions.length > 1 && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Extension</Label>
                <Select value={extension} onValueChange={setExtension}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.extensions.map((ext) => (
                      <SelectItem key={ext} value={ext}>
                        .{ext}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {meta.isCustom && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="customExt">Custom extension</Label>
                <Input
                  id="customExt"
                  value={customExt}
                  onChange={(e) => setCustomExt(e.target.value)}
                  placeholder="e.g. svg"
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground sm:col-span-2">
              {meta.hint}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="from">From date (optional)</Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to start being shown immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>End</Label>
              <Tabs
                value={endMode}
                onValueChange={(v) => setEndMode(v as EndMode)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="to">To date</TabsTrigger>
                  <TabsTrigger value="duration">Duration</TabsTrigger>
                  <TabsTrigger value="forever">Forever</TabsTrigger>
                </TabsList>
              </Tabs>
              {endMode === "to" && (
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              )}
              {endMode === "duration" && (
                <Input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="days"
                />
              )}
              {endMode === "forever" && (
                <p className="text-xs text-muted-foreground">
                  No expiration token will be added.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {meta.isFolder
                ? "Applied when this folder is itself a child of another folder."
                : "Only relevant inside a folder. Higher = more likely to be picked. Defaults to 1 (no token written)."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-10 border-primary/40">
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-sm">
              {filename}
            </code>
            <Button onClick={copy} size="sm">
              Copy
            </Button>
          </div>
          {meta.isFolder && (
            <p className="text-xs text-muted-foreground">
              Create a new Drive folder with this exact name. Drop images or
              markdown files inside.
            </p>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Type</Badge>
              <span>{meta.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">From</Badge>
              <span>{formatLong(interpretation.from)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">To</Badge>
              <span>
                {interpretation.to === "9999-12-31"
                  ? "Never expires"
                  : formatLong(interpretation.to)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Weight</Badge>
              <span>{interpretation.weight}</span>
            </div>
            {interpretation.conflict && (
              <p className="text-sm text-destructive">
                ⚠ {interpretation.conflict}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="mb-10" />

      <h2 className="mb-2 text-2xl font-semibold">Reference</h2>
      <p className="mb-8 text-muted-foreground">
        The board reads files from a Google Drive folder. To control{" "}
        <em>when</em> and <em>how often</em> a file is shown, embed tokens
        anywhere in its filename. Tokens are case-sensitive.
      </p>

      <h3 className="mb-4 text-lg font-semibold">Tokens</h3>
      <div className="mb-10 space-y-3">
        {tokens.map((t) => (
          <Card key={t.token}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-base">
                <Badge variant="secondary" className="font-mono text-sm">
                  {t.syntax}
                </Badge>
                <span>{t.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{t.desc}</p>
              <p className="text-muted-foreground">
                Example: <code className="font-mono">{t.example}</code>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="mb-4 text-lg font-semibold">Examples</h3>
      <div className="mb-10 space-y-3">
        {examples.map((ex) => (
          <div
            key={ex.name}
            className="rounded-md border border-border bg-muted/30 p-4"
          >
            <code className="block break-all font-mono text-sm">{ex.name}</code>
            <p className="mt-2 text-sm text-muted-foreground">{ex.meaning}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-4 text-lg font-semibold">Notes</h3>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          File type is determined by Drive&rsquo;s MIME type:{" "}
          <code>image/*</code> → image slide, <code>application/json</code> →
          countdown event, folder → nested slideshow (1 level deep), anything
          else → text/markdown slide.
        </li>
        <li>
          If both <code>T</code> and <code>D</code> are present, the file is
          treated as having no valid window and will be skipped.
        </li>
        <li>
          Dates use UTC. The dashboard polls Drive every 30 seconds, so updates
          appear within a minute.
        </li>
      </ul>
    </div>
  )
}
