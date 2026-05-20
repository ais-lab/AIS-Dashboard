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
    label: "Image slide / 画像スライド",
    hint: "Shown full-screen with a blurred background fill. / 背景ぼかし付きでフルスクリーン表示されます。",
    extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "avif"],
    defaultExt: "png",
  },
  text: {
    label: "Text / Markdown slide / テキスト・Markdownスライド",
    hint: "Rendered as markdown. Headings, tables, line breaks, and raw HTML are supported. / Markdownとして表示されます。見出し・表・改行・HTMLに対応。",
    extensions: ["md", "txt", "markdown"],
    defaultExt: "md",
  },
  event: {
    label: "Countdown event / カウントダウンイベント",
    hint: "JSON file describing a conference, lab event, deadline, etc. Renders as a banner with the event name, date, location, and a live countdown. When the date passes it shows \"Time is up! / 時間切れ!\" until its T window closes. / 学会・研究室イベント・締切などを表すJSON。イベント名・日付・場所・カウントダウンを含むバナーとして表示され、当日を過ぎるとT期間が終わるまで「時間切れ」表示になります。",
    extensions: ["json"],
    defaultExt: "json",
  },
  folder: {
    label: "Folder (weighted random) / フォルダ（重み付きランダム）",
    hint: "Create a Drive folder with this name. The board picks one child each cycle, weighted by W. Only images and text are read from inside. / この名前でDriveフォルダを作成します。Wの重みに応じて中から1つが選ばれます。中身は画像とテキストのみ読み込まれます。",
    extensions: [],
    defaultExt: "",
    isFolder: true,
  },
  custom: {
    label: "Custom extension / カスタム拡張子",
    hint: "Anything else — falls back to a text slide unless the MIME type is recognized. / その他。MIMEタイプが認識されない場合はテキストスライドとして扱われます。",
    extensions: [],
    defaultExt: "",
    isCustom: true,
  },
}

const tokens = [
  {
    token: "F",
    name: "From date / 開始日",
    syntax: "F<YYYYMMDD>",
    example: "F20260601",
    desc: "Start of the display window. If omitted, the item starts being eligible today. / 表示期間の開始日。省略時は本日から表示対象になります。",
  },
  {
    token: "T",
    name: "To date / 終了日",
    syntax: "T<YYYYMMDD>",
    example: "T20260630",
    desc: "End of the display window (inclusive). If neither T nor D is set, the item never expires. / 表示期間の終了日（当日を含む）。TもDも無い場合は無期限です。",
  },
  {
    token: "D",
    name: "Duration / 期間（日数）",
    syntax: "D<n>",
    example: "D14",
    desc: "Number of days after F to display the item. Ignored if T is also present. / Fから何日間表示するか。Tがある場合は無視されます。",
  },
  {
    token: "W",
    name: "Weight / 重み",
    syntax: "W<n>",
    example: "W3",
    desc: "Relative weight for folder items in weighted random. Higher = more likely. Defaults to 1. / フォルダ内の重み付き抽選の比率。大きいほど選ばれやすい。既定値は1。",
  },
]

const examples = [
  {
    name: "summer_sale_F20260601T20260831.png",
    meaning:
      "An image shown from June 1 to August 31, 2026. Default weight (1). / 2026年6月1日〜8月31日に表示される画像。重みは既定（1）。",
  },
  {
    name: "daily_quote_F20260101D365.txt",
    meaning:
      "A text slide shown from January 1, 2026 for 365 days. / 2026年1月1日から365日間表示されるテキストスライド。",
  },
  {
    name: "promo_W5.png",
    meaning:
      "No date window — eligible immediately and never expires. Weight 5, so it appears 5× more often inside a folder. / 期間指定なし。無期限で表示。重み5でフォルダ内では5倍の確率で選ばれます。",
  },
  {
    name: "si2025_F20251101T20251210.json",
    meaning:
      "A conference countdown shown from November 1 to December 10, 2025. Renders as a banner with name + date + location + live countdown. / 2025年11月1日〜12月10日に表示される学会のカウントダウン。名称・日付・場所・残り時間のバナーとして表示されます。",
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
  const en = d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
  const ja = d.toLocaleDateString("ja-JP", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
  return `${en} / ${ja}`
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
      toast.success(
        meta.isFolder
          ? "Folder name copied / フォルダ名をコピーしました"
          : "Filename copied / ファイル名をコピーしました"
      )
    } catch {
      toast.error("Copy failed / コピーに失敗しました")
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Filename guide / ファイル名ガイド
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a name with the generator, or scroll down for the full
            reference. / ジェネレーターで名前を作成、または下にスクロールしてリファレンスをご覧ください。
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/tour/">
            <Button variant="outline" size="sm">
              Tour / ツアー
            </Button>
          </Link>
          <Link href="/admin/">
            <Button variant="outline" size="sm">
              Admin / 管理
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Back / 戻る
            </Button>
          </Link>
        </div>
      </div>

      {folderUrl && (
        <Card className="mb-4 border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">
              Drive folder / Driveフォルダ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload your files here. The board reads this folder every 30
              seconds — changes appear within a minute. /
              ここにファイルをアップロードしてください。ボードは30秒ごとに読み込みます — 1分以内に反映されます。
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full sm:w-auto">
                  Open folder in Drive / Driveでフォルダを開く
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(folderUrl)
                    toast.success("Folder URL copied / URLをコピーしました")
                  } catch {
                    toast.error("Copy failed / コピーに失敗しました")
                  }
                }}
              >
                Copy URL / URLをコピー
              </Button>
            </div>
            <code className="block break-all rounded bg-muted px-3 py-2 font-mono text-xs">
              {folderUrl}
            </code>
            <p className="text-xs text-muted-foreground">
              You need <strong>Editor</strong> access to upload. If you can
              view but not upload, ask the folder owner to add your Google
              account as an editor. /
              アップロードには<strong>編集者</strong>権限が必要です。閲覧のみで
              アップロードできない場合は、フォルダ所有者にGoogleアカウントを
              編集者として追加してもらってください。
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">
            Generator / ジェネレーター
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="base">
                {meta.isFolder
                  ? "Folder name / フォルダ名"
                  : "Base name / ベース名"}
              </Label>
              <Input
                id="base"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                placeholder={meta.isFolder ? "my_folder" : "my_slide"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Element type / 要素タイプ</Label>
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
                <Label>Extension / 拡張子</Label>
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
                <Label htmlFor="customExt">
                  Custom extension / カスタム拡張子
                </Label>
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
              <Label htmlFor="from">
                From date (optional) / 開始日（任意）
              </Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to start being shown immediately. /
                空欄の場合は即時表示されます。
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>End / 終了</Label>
              <Tabs
                value={endMode}
                onValueChange={(v) => setEndMode(v as EndMode)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="to">To date / 終了日</TabsTrigger>
                  <TabsTrigger value="duration">Duration / 期間</TabsTrigger>
                  <TabsTrigger value="forever">Forever / 無期限</TabsTrigger>
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
                  placeholder="days / 日数"
                />
              )}
              {endMode === "forever" && (
                <p className="text-xs text-muted-foreground">
                  No expiration token will be added. /
                  終了トークンは付与されません。
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight / 重み</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {meta.isFolder
                ? "Applied when this folder is itself a child of another folder. / このフォルダが別のフォルダの子になった場合に適用されます。"
                : "Only relevant inside a folder. Higher = more likely to be picked. Defaults to 1 (no token written). / フォルダ内でのみ有効。大きいほど選ばれやすい。既定値は1（トークンは書き込まれません）。"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-10 border-primary/40">
        <CardHeader>
          <CardTitle className="text-base">Result / 結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-sm">
              {filename}
            </code>
            <Button onClick={copy} size="sm">
              Copy / コピー
            </Button>
          </div>
          {meta.isFolder && (
            <p className="text-xs text-muted-foreground">
              Create a new Drive folder with this exact name. Drop images or
              markdown files inside. /
              この名前でDriveに新しいフォルダを作成し、画像やMarkdownを入れてください。
            </p>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Type / 種類</Badge>
              <span>{meta.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">From / 開始</Badge>
              <span>{formatLong(interpretation.from)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">To / 終了</Badge>
              <span>
                {interpretation.to === "9999-12-31"
                  ? "Never expires / 無期限"
                  : formatLong(interpretation.to)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Weight / 重み</Badge>
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

      <h2 className="mb-2 text-2xl font-semibold">
        Reference / リファレンス
      </h2>
      <p className="mb-8 text-muted-foreground">
        The board reads files from a Google Drive folder. To control{" "}
        <em>when</em> and <em>how often</em> a file is shown, embed tokens
        anywhere in its filename. Tokens are case-sensitive. /
        ボードはGoogle Driveフォルダからファイルを読み込みます。表示する
        <em>タイミング</em>と<em>頻度</em>はファイル名に埋め込んだトークンで
        制御します。大文字小文字を区別します。
      </p>

      <h3 className="mb-4 text-lg font-semibold">Tokens / トークン</h3>
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
                Example / 例: <code className="font-mono">{t.example}</code>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="mb-4 text-lg font-semibold">Examples / 例</h3>
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

      <h3 className="mb-4 text-lg font-semibold">
        Countdown event JSON shape / カウントダウンイベントのJSON形式
      </h3>
      <pre className="mb-10 overflow-x-auto rounded-md border border-border bg-muted/30 p-4 text-xs">
        <code>{`{
  "name": "SI 2025",
  "date": "2025-12-10",
  "address": "Hiroshima, Japan",
  "description": "Annual conference on systems integration",
  "note": "optional extra line"
}`}</code>
      </pre>
      <ul className="mb-10 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          <code>name</code> and <code>date</code> are required;{" "}
          <code>address</code>, <code>description</code>, <code>note</code>{" "}
          are optional. /{" "}
          <code>name</code>と<code>date</code>は必須、それ以外は任意です。
        </li>
        <li>
          The countdown ticks every second while the file is in its display
          window. After <code>date</code> passes, it shows &ldquo;Time is up! / 時間
          切れ!&rdquo; until the <code>T</code> token expires. /
          表示期間中は秒単位でカウントダウンされ、<code>date</code>を過ぎると
          <code>T</code>期間が終わるまで「時間切れ」になります。
        </li>
        <li>
          If there&rsquo;s no other slideshow content, the event takes the
          whole screen; otherwise it sits as a 180px banner at the top. /
          他にスライドショーコンテンツがない場合はフルスクリーン表示、ある場合は
          上部に180pxのバナーとして表示されます。
        </li>
      </ul>

      <h3 className="mb-4 text-lg font-semibold">Notes / 注意事項</h3>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          File type is determined by Drive&rsquo;s MIME type:{" "}
          <code>image/*</code> → image slide, <code>application/json</code> →
          countdown event, folder → nested slideshow (1 level deep), anything
          else → text/markdown slide. /
          ファイル種別はDriveのMIMEタイプで判定されます: <code>image/*</code> →
          画像スライド、<code>application/json</code> → カウントダウン、フォルダ
          → ネストスライドショー（1階層のみ）、それ以外 → テキスト・Markdown。
        </li>
        <li>
          If both <code>T</code> and <code>D</code> are present, the file is
          treated as having no valid window and will be skipped. /{" "}
          <code>T</code>と<code>D</code>の両方があるファイルは表示期間が無効と
          みなされ、スキップされます。
        </li>
        <li>
          Dates use UTC. The dashboard polls Drive every 30 seconds, so updates
          appear within a minute. /
          日付はUTC基準。ボードは30秒ごとにDriveを確認し、1分以内に更新が
          反映されます。
        </li>
      </ul>
    </div>
  )
}
