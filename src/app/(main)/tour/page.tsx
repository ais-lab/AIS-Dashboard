"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Folder, FolderOpen, Image, Calendar, FileText, Layers } from "lucide-react"

import { parseFilename } from "@/lib/utils/filename-rules"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SampleType = "image" | "text" | "event" | "folder"

interface SampleItem {
  name: string
  type: SampleType
  preview?: {
    gradient?: string
    title?: string
    subtitle?: string
    markdown?: string
    event?: { name: string; date: string; address: string }
  }
  children?: SampleItem[]
}

const SAMPLE_FOLDER: SampleItem[] = [
  {
    name: "welcome_banner.png",
    type: "image",
    preview: {
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      title: "Welcome / ようこそ",
      subtitle: "AIS Lab",
    },
  },
  {
    name: "summer_sale_F20260601T20260831.png",
    type: "image",
    preview: {
      gradient: "from-orange-400 via-amber-300 to-yellow-300",
      title: "Summer Sale / 夏セール",
      subtitle: "June 1 – August 31",
    },
  },
  {
    name: "daily_quote_F20260101D365.txt",
    type: "text",
    preview: {
      markdown:
        "## Stay curious / 好奇心を持ち続けて\n\nThe best way to predict the future is to invent it.",
    },
  },
  {
    name: "featured_promo_W3.png",
    type: "image",
    preview: {
      gradient: "from-rose-500 via-red-500 to-orange-500",
      title: "Featured / 注目",
      subtitle: "Weighted 3× / 重み3",
    },
  },
  {
    name: "winter_sale_F20251201T20260201.png",
    type: "image",
    preview: {
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      title: "Winter Sale / 冬セール",
      subtitle: "Dec 2025 – Feb 2026",
    },
  },
  {
    name: "christmas_F20261220T20261226.png",
    type: "image",
    preview: {
      gradient: "from-emerald-500 via-green-500 to-red-500",
      title: "Christmas / クリスマス",
      subtitle: "Dec 20 – 26",
    },
  },
  {
    name: "launch_party_F20260801T20260801.json",
    type: "event",
    preview: {
      event: {
        name: "Product Launch / 製品ローンチ",
        date: "2026-08-01",
        address: "Osaka HQ / 大阪本社",
      },
    },
  },
  {
    name: "tips/",
    type: "folder",
    children: [
      {
        name: "tip_focus_W2.md",
        type: "text",
        preview: {
          markdown: "### Tip 1 / コツ 1\nMake the easy thing the default.",
        },
      },
      {
        name: "tip_iterate.md",
        type: "text",
        preview: {
          markdown:
            "### Tip 2 / コツ 2\nShip small, ship often. / 小さく早くリリース。",
        },
      },
      {
        name: "tip_listen_W5.md",
        type: "text",
        preview: {
          markdown:
            "### Tip 3 / コツ 3\nThe loudest voice isn't the truth. / 大きな声 ≠ 真実。",
        },
      },
    ],
  },
]

const fmtSimDate = (ms: number): string => {
  const d = new Date(ms)
  return d.toISOString().slice(0, 10)
}

const isItemActive = (item: SampleItem, simIso: string): boolean => {
  const parsed = parseFilename(item.name)
  if (!parsed.from || !parsed.to) return false
  return parsed.from <= simIso && parsed.to >= simIso
}

const weightedPick = <T extends { name: string }>(items: T[]): T | null => {
  if (items.length === 0) return null
  const weights = items.map((i) => parseFilename(i.name).weight)
  const total = weights.reduce((s, w) => s + w, 0)
  const r = Math.random() * total
  let acc = 0
  for (let i = 0; i < items.length; i++) {
    acc += weights[i]
    if (r < acc) return items[i]
  }
  return items[items.length - 1]
}

const TypeIcon = ({
  type,
  className,
}: {
  type: SampleType
  className?: string
}) => {
  const Icon =
    type === "image"
      ? Image
      : type === "text"
        ? FileText
        : type === "event"
          ? Calendar
          : Folder
  return <Icon className={className} />
}

const PreviewSlide = ({ item }: { item: SampleItem }) => {
  if (item.type === "image" && item.preview?.gradient) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-8 text-white",
          item.preview.gradient
        )}
      >
        <div className="text-4xl font-bold drop-shadow-md">
          {item.preview.title}
        </div>
        {item.preview.subtitle && (
          <div className="mt-2 text-sm opacity-90">{item.preview.subtitle}</div>
        )}
      </div>
    )
  }
  if (item.type === "text" && item.preview?.markdown) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-25 p-8">
        <div className="max-w-md whitespace-pre-line text-center text-lg leading-relaxed">
          {item.preview.markdown}
        </div>
      </div>
    )
  }
  if (item.type === "event" && item.preview?.event) {
    const ev = item.preview.event
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-neutral-900 p-8 text-white">
        <div className="text-xs uppercase tracking-wider opacity-70">
          Upcoming / 予定
        </div>
        <div className="text-3xl font-bold">{ev.name}</div>
        <div className="text-sm opacity-90">{ev.date}</div>
        <div className="text-xs opacity-70">{ev.address}</div>
      </div>
    )
  }
  return null
}

const TokenExplainer = ({ name }: { name: string }) => {
  const parsed = parseFilename(name)
  const fMatch = name.match(/F(\d{8})/)
  const tMatch = name.match(/T(\d{8})/)
  const dMatch = name.match(/D(\d+)/)
  const wMatch = name.match(/W(\d+)/)

  const chips: { token: string; meaning: string }[] = []
  if (fMatch) chips.push({ token: fMatch[0], meaning: `from ${parsed.from}` })
  if (tMatch) chips.push({ token: tMatch[0], meaning: `to ${parsed.to}` })
  if (dMatch) chips.push({ token: dMatch[0], meaning: `for ${dMatch[1]} days` })
  if (wMatch) chips.push({ token: wMatch[0], meaning: `weight ${parsed.weight}` })

  return (
    <div className="space-y-2">
      <code className="block break-all font-mono text-xs">{name}</code>
      {chips.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No tokens — always eligible, weight 1. / トークンなし — 常に表示候補、
          重み1。
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <Badge
              key={c.token}
              variant="secondary"
              className="font-mono text-[10px]"
            >
              {c.token} → {c.meaning}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

const flattenTopLevel = (items: SampleItem[]): SampleItem[] =>
  items.filter((i) => i.type !== "folder")

export default function TourPage() {
  const todayMs = useMemo(() => Date.now(), [])
  const minMs = todayMs - 1000 * 60 * 60 * 24 * 365
  const maxMs = todayMs + 1000 * 60 * 60 * 24 * 365
  const [simMs, setSimMs] = useState<number>(todayMs)
  const simIso = fmtSimDate(simMs)

  const eligibleTopLevel = useMemo(() => {
    return SAMPLE_FOLDER.filter((item) => {
      if (item.type === "folder") {
        return item.children?.some((c) => {
          const cn = parseFilename(c.name)
          if (!cn.from || !cn.to) return false
          return cn.from <= simIso && cn.to >= simIso
        })
      }
      const p = parseFilename(item.name)
      if (!p.from || !p.to) return false
      return p.from <= simIso && p.to >= simIso
    })
  }, [simIso])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [folderPick, setFolderPick] = useState<SampleItem | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setCurrentIdx(0)
  }, [eligibleTopLevel.length])

  useEffect(() => {
    if (isPaused || eligibleTopLevel.length === 0) return
    const id = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % eligibleTopLevel.length)
    }, 4000)
    return () => clearInterval(id)
  }, [isPaused, eligibleTopLevel.length])

  const currentTopItem = eligibleTopLevel[currentIdx]

  useEffect(() => {
    if (currentTopItem?.type === "folder" && currentTopItem.children) {
      const eligibleChildren = currentTopItem.children.filter((c) =>
        isItemActive(c, simIso)
      )
      setFolderPick(weightedPick(eligibleChildren))
    } else {
      setFolderPick(null)
    }
  }, [currentTopItem, simIso])

  const displayed = folderPick ?? currentTopItem

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Tour / ツアー</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch how filename rules drive the board. Drag the date slider to
            see items appear and disappear. /
            ファイル名のルールがどのようにボードを動かすかご覧ください。
            日付スライダーをドラッグするとアイテムが出入りします。
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tutorial/">
            <Button variant="outline" size="sm">
              Rules / ルール
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Back / 戻る
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Simulated date / シミュレート日付</span>
            <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
              {simIso}
            </code>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="range"
            min={minMs}
            max={maxMs}
            value={simMs}
            step={1000 * 60 * 60 * 24}
            onChange={(e) => setSimMs(parseInt(e.target.value, 10))}
            className="w-full accent-foreground"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{fmtSimDate(minMs)}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSimMs(todayMs)}
                className="h-7 text-xs"
              >
                Today / 今日
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused((p) => !p)}
                className="h-7 text-xs"
              >
                {isPaused ? "Resume / 再生" : "Pause / 一時停止"}
              </Button>
            </div>
            <span>{fmtSimDate(maxMs)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="size-4" />
              Drive folder / Driveフォルダ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-0.5 text-sm">
              {SAMPLE_FOLDER.map((item) => {
                const active =
                  item.type === "folder"
                    ? eligibleTopLevel.includes(item)
                    : isItemActive(item, simIso)
                const isCurrent =
                  currentTopItem === item ||
                  (item.children && item.children.includes(folderPick as any))

                return (
                  <li key={item.name}>
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1.5 transition-all",
                        !active && "opacity-40",
                        isCurrent &&
                          "bg-primary/10 ring-1 ring-primary/40 ring-offset-0"
                      )}
                    >
                      <TypeIcon
                        type={item.type}
                        className={cn(
                          "size-4 shrink-0",
                          isCurrent && "text-primary"
                        )}
                      />
                      <code
                        className={cn(
                          "min-w-0 flex-1 truncate font-mono text-xs",
                          isCurrent && "font-semibold"
                        )}
                      >
                        {item.name}
                      </code>
                      {!active && (
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          out of window / 期間外
                        </Badge>
                      )}
                      {isCurrent && !folderPick && (
                        <Badge className="shrink-0 text-[10px]">
                          on screen / 表示中
                        </Badge>
                      )}
                    </div>
                    {item.children && (
                      <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-3">
                        {item.children.map((child) => {
                          const childActive = isItemActive(child, simIso)
                          const childIsCurrent = folderPick === child
                          return (
                            <li
                              key={child.name}
                              className={cn(
                                "flex items-center gap-2 rounded px-2 py-1 transition-all",
                                !childActive && "opacity-40",
                                childIsCurrent &&
                                  "bg-primary/10 ring-1 ring-primary/40"
                              )}
                            >
                              <TypeIcon
                                type={child.type}
                                className={cn(
                                  "size-3.5 shrink-0",
                                  childIsCurrent && "text-primary"
                                )}
                              />
                              <code
                                className={cn(
                                  "min-w-0 flex-1 truncate font-mono text-[11px]",
                                  childIsCurrent && "font-semibold"
                                )}
                              >
                                {child.name}
                              </code>
                              {childIsCurrent && (
                                <Badge className="shrink-0 text-[10px]">
                                  picked / 選択
                                </Badge>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-primary" /> on screen /
                表示中
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-foreground/30" />
                eligible / 表示候補
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-foreground/10" /> out
                of window / 期間外
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-video w-full bg-neutral-100">
              {displayed ? (
                <div
                  key={displayed.name}
                  className="size-full animate-in fade-in zoom-in-95 duration-500"
                >
                  <PreviewSlide item={displayed} />
                </div>
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Layers className="size-8 opacity-40" />
                  <p className="text-sm">
                    Nothing eligible on this date. / この日付に表示できる
                    アイテムはありません。
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                What you&rsquo;re seeing / 表示中のファイル
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {displayed ? (
                <>
                  <TokenExplainer name={displayed.name} />
                  {folderPick && currentTopItem?.type === "folder" && (
                    <p className="text-xs text-muted-foreground">
                      Picked from <code>{currentTopItem.name}</code> using
                      weighted random across {currentTopItem.children?.length}{" "}
                      children. /{" "}
                      <code>{currentTopItem.name}</code>
                      の中から重み付きランダムで選択されました。
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Drag the slider to a date when an item is in its window. /
                  期間内のアイテムがある日付にスライダーを動かしてください。
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Try this / 試してみよう
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1.5 pl-5 text-xs text-muted-foreground">
                <li>
                  Slide to <strong>January 2026</strong> — Winter Sale becomes
                  active. / 2026年1月に動かすと冬セールが有効になります。
                </li>
                <li>
                  Slide to <strong>December 22, 2026</strong> — Christmas
                  appears, Summer Sale is gone. / 2026年12月22日に動かすと
                  クリスマスが表示され、夏セールは消えます。
                </li>
                <li>
                  Watch the <code>tips/</code> folder — refreshing the slide
                  re-rolls the weighted pick (W5 wins most). /{" "}
                  <code>tips/</code>フォルダではスライド更新ごとに重み付き
                  抽選が再実行されます（W5が最頻）。
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
