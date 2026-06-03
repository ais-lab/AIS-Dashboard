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
    hint: "Create a Drive folder with this name and drop several images or text files inside. Each time the folder's turn comes up in the main slideshow, the board picks ONE child at random from that folder and shows it — not the whole folder, just one file per turn. Without W tokens every child has equal odds; add W<n> to a child's name to make it that many times more likely to be picked (W2 = 2× the chance, W5 = 5× the chance). Only images and text files inside the folder are eligible. / この名前でDriveフォルダを作成し、複数の画像やテキストファイルを入れてください。メインスライドショーでこのフォルダの順番が来るたびに、中から1つだけがランダムに選ばれて表示されます（フォルダ全体ではなく毎回1ファイル）。Wトークンがない場合は等確率。子ファイル名にW<n>を付けるとその倍率で選ばれやすくなります（W2は2倍、W5は5倍）。中身は画像とテキストファイルのみ対象です。",
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
    desc: "Only matters for files inside a folder. The folder picks one child at random each turn; W<n> makes that file n times more likely to be picked. W3 is picked 3× as often as a default (W1) sibling. Defaults to 1 (token omitted). / フォルダ内のファイルにのみ影響します。フォルダは毎回1つだけ子をランダムに選びます。W<n>はその比率を上げます（W3は既定のW1兄弟の3倍選ばれる）。既定値は1（トークン省略時）。",
  },
  {
    token: "S",
    name: "Display duration / 表示時間（秒）",
    syntax: "S<n>",
    example: "S60",
    desc: "How long this item stays on screen, in seconds. Defaults to 30s for slideshow items, 35s for event banners. Use for posters that need reading time, or quick announcements that should flash by. / この項目の表示時間（秒）。スライドショーは既定30秒、イベントバナーは35秒。読み込み時間が必要なポスターや、短時間表示したいお知らせに使います。",
  },
]

const examples = [
  {
    name: "new_members_F20260401T20260430.png",
    meaning:
      "An image welcoming new lab members, shown only during April 2026. / 2026年4月の1ヶ月間だけ表示される新メンバー歓迎の画像。",
  },
  {
    name: "weekly_seminar_F20260101D365.txt",
    meaning:
      "A text slide for the weekly seminar reminder, shown from January 1, 2026 for 365 days. / 2026年1月1日から365日間表示される週次セミナーのお知らせ。",
  },
  {
    name: "best_paper_award_W3.png",
    meaning:
      "A congratulations banner with no date window — always eligible. Weight 3 makes it appear 3× more often inside a folder. / 期間指定なしの受賞報告。重み3でフォルダ内では3倍の確率で選ばれます。",
  },
  {
    name: "si2025_F20251101T20251210.json",
    meaning:
      "A conference countdown shown from November 1 to December 10, 2025. Renders as a banner with name + date + location + live countdown. / 2025年11月1日〜12月10日に表示される学会のカウントダウン。名称・日付・場所・残り時間のバナーとして表示されます。",
  },
  {
    name: "iros2026_deadline_F20260301T20260315.json",
    meaning:
      "A submission deadline countdown — pressure on the wall during the final two weeks. / 投稿締切のカウントダウン。締切前2週間に表示されます。",
  },
  {
    name: "poster_workshop_F20260301T20260310_S60.png",
    meaning:
      "A workshop poster with lots of text — held on screen for 60 seconds so readers have time. / 文章の多いポスター。60秒間表示して読む時間を確保します。",
  },
]

const inputDateToDate = (s: string): Date | null => {
  if (!s) return null
  const d = new Date(s + "T00:00:00Z")
  return isNaN(d.getTime()) ? null : d
}

interface EventJsonHelperProps {
  name: string
  setName: (v: string) => void
  date: string
  setDate: (v: string) => void
  address: string
  setAddress: (v: string) => void
  description: string
  setDescription: (v: string) => void
  note: string
  setNote: (v: string) => void
  json: string
  onCopy: () => void
  onDownload: () => void
}

const EventJsonHelper = (props: EventJsonHelperProps) => {
  const [open, setOpen] = useState(false)
  const canDownload = !!props.name.trim() && !!props.date

  return (
    <Card className="mb-10">
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left"
        >
          <CardTitle className="text-base">
            Build the JSON file / JSONファイルを作成
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {open ? "Hide / 閉じる" : "Show / 開く"}
          </span>
        </button>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Fill the fields, then copy the JSON or download it as a file. Drop
            the result into your Drive folder using the filename above. /
            項目を入力したらJSONをコピーするか、ファイルとしてダウンロード
            してください。上のファイル名でDriveフォルダに置きます。
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="evName">
                Event name / イベント名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="evName"
                value={props.name}
                onChange={(e) => props.setName(e.target.value)}
                placeholder="SI 2025"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="evDate">
                Date / 日付 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="evDate"
                type="date"
                value={props.date}
                onChange={(e) => props.setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="evAddress">Location / 場所</Label>
              <Input
                id="evAddress"
                value={props.address}
                onChange={(e) => props.setAddress(e.target.value)}
                placeholder="Hiroshima, Japan / 広島県"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="evDescription">Description / 説明</Label>
              <textarea
                id="evDescription"
                value={props.description}
                onChange={(e) => props.setDescription(e.target.value)}
                rows={2}
                className="flex w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Annual conference on systems integration"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="evNote">Note / メモ</Label>
              <Input
                id="evNote"
                value={props.note}
                onChange={(e) => props.setNote(e.target.value)}
                placeholder="Optional / 任意"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 inline-block">Preview / プレビュー</Label>
            <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
              <code>{props.json || "{}"}</code>
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={props.onCopy}
              disabled={!canDownload}
              size="sm"
            >
              Copy JSON / JSONをコピー
            </Button>
            <Button
              variant="outline"
              onClick={props.onDownload}
              disabled={!canDownload}
              size="sm"
            >
              Download .json / .jsonをダウンロード
            </Button>
          </div>

          {!canDownload && (
            <p className="text-xs text-muted-foreground">
              Name and date are required. / 名前と日付は必須です。
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
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
  const [displaySeconds, setDisplaySeconds] = useState<string>("")

  const [evName, setEvName] = useState("")
  const [evDate, setEvDate] = useState("")
  const [evAddress, setEvAddress] = useState("")
  const [evDescription, setEvDescription] = useState("")
  const [evNote, setEvNote] = useState("")

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
      displaySeconds: parseInt(displaySeconds, 10) || null,
    })
  }, [
    base,
    resolvedExtension,
    from,
    endMode,
    to,
    durationDays,
    weight,
    displaySeconds,
  ])

  const interpretation = useMemo(() => parseFilename(filename), [filename])

  const eventJson = useMemo(() => {
    const obj: Record<string, string> = {}
    if (evName.trim()) obj.name = evName.trim()
    if (evDate) obj.date = evDate
    if (evAddress.trim()) obj.address = evAddress.trim()
    if (evDescription.trim()) obj.description = evDescription.trim()
    if (evNote.trim()) obj.note = evNote.trim()
    return JSON.stringify(obj, null, 2)
  }, [evName, evDate, evAddress, evDescription, evNote])

  const downloadJson = () => {
    const blob = new Blob([eventJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.endsWith(".json") ? filename : `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
              <p className="flex min-h-[2.5rem] items-center text-xs text-muted-foreground">
                Leave blank to start being shown immediately. /
                空欄の場合は即時表示されます。
              </p>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>End / 終了</Label>
              <Tabs
                value={endMode}
                onValueChange={(v) => setEndMode(v as EndMode)}
              >
                <TabsList className="grid h-10 w-full grid-cols-3">
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

          <div className="space-y-1.5">
            <Label htmlFor="displaySeconds">
              Display duration (seconds) / 表示時間（秒）
            </Label>
            <Input
              id="displaySeconds"
              type="number"
              min={1}
              value={displaySeconds}
              onChange={(e) => setDisplaySeconds(e.target.value)}
              placeholder={meta.label.includes("event") ? "35" : "30"}
            />
            <p className="text-xs text-muted-foreground">
              How long this item stays on screen before the next slide. Leave
              blank for the default ({meta.label.includes("event") ? "35" : "30"}
              s). /
              次のスライドに切り替わるまでの表示時間。空欄で既定値（
              {meta.label.includes("event") ? "35" : "30"}秒）。
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Display / 表示時間</Badge>
              <span>
                {interpretation.displaySeconds
                  ? `${interpretation.displaySeconds}s`
                  : `default ${meta.label.includes("event") ? "35" : "30"}s / 既定 ${meta.label.includes("event") ? "35" : "30"}秒`}
              </span>
            </div>
            {interpretation.conflict && (
              <p className="text-sm text-destructive">
                ⚠ {interpretation.conflict}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {elementType === "event" && (
        <EventJsonHelper
          name={evName}
          setName={setEvName}
          date={evDate}
          setDate={setEvDate}
          address={evAddress}
          setAddress={setEvAddress}
          description={evDescription}
          setDescription={setEvDescription}
          note={evNote}
          setNote={setEvNote}
          json={eventJson}
          onCopy={async () => {
            try {
              await navigator.clipboard.writeText(eventJson)
              toast.success("JSON copied / JSONをコピーしました")
            } catch {
              toast.error("Copy failed / コピーに失敗しました")
            }
          }}
          onDownload={downloadJson}
        />
      )}

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
