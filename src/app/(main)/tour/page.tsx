"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, FileText, Folder, FolderOpen, Image, Layers, MapPin } from "lucide-react"

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
    title?: string
    subtitle?: string
    markdown?: string
    event?: { name: string; date: string; address: string }
  }
  children?: SampleItem[]
}

const SAMPLE_FOLDER: SampleItem[] = [
  {
    name: "lab_welcome.png",
    type: "image",
    preview: {
      title: "Welcome to AIS Lab / AIS研究室へようこそ",
      subtitle: "Ritsumeikan University / 立命館大学",
    },
  },
  {
    name: "new_members_F20260401T20260430_S60.png",
    type: "image",
    preview: {
      title: "New Members 2026 / 新メンバー 2026",
      subtitle: "April orientation — dwells 60s / 4月、60秒表示",
    },
  },
  {
    name: "weekly_seminar_F20260101D365.txt",
    type: "text",
    preview: {
      markdown:
        "## Weekly Seminar / 週次セミナー\n\nEvery Friday 15:00 — Room 401\n\n毎週金曜 15:00 — 401号室",
    },
  },
  {
    name: "best_paper_award_W3_S10.png",
    type: "image",
    preview: {
      title: "Best Paper Award / 優秀論文賞",
      subtitle: "Quick celebration — 10s / 短時間表示 10秒",
    },
  },
  {
    name: "spring_retreat_F20260301T20260331.png",
    type: "image",
    preview: {
      title: "Spring Retreat / 春合宿",
      subtitle: "Karuizawa, March 2026 / 軽井沢 2026年3月",
    },
  },
  {
    name: "thesis_defense_F20261220T20261226.png",
    type: "image",
    preview: {
      title: "Thesis Defense Week / 修論審査週間",
      subtitle: "Master & PhD candidates / 修士・博士課程",
    },
  },
  {
    name: "si2025_F20251101T20251210.json",
    type: "event",
    preview: {
      event: {
        name: "SI 2025",
        date: "2025-12-10",
        address: "Hiroshima, Japan / 広島県",
      },
    },
  },
  {
    name: "iros2026_deadline_F20260301T20260315.json",
    type: "event",
    preview: {
      event: {
        name: "IROS 2026 Submission Deadline / 投稿締切",
        date: "2026-03-15",
        address: "Online submission / オンライン投稿",
      },
    },
  },
  {
    name: "open_house_F20260601T20260615.json",
    type: "event",
    preview: {
      event: {
        name: "Lab Open House / オープンラボ",
        date: "2026-06-15",
        address: "Building 5, Ritsumeikan / 立命館5号館",
      },
    },
  },
  {
    name: "weekly_seminar_event_F20260101T20261231.json",
    type: "event",
    preview: {
      event: {
        name: "Weekly Lab Seminar / 週次セミナー",
        date: "2026-12-18",
        address: "Room 401, Building 5 / 401号室",
      },
    },
  },
  {
    name: "reading_group/",
    type: "folder",
    children: [
      {
        name: "paper_a_W2.md",
        type: "text",
        preview: {
          markdown:
            "### This week / 今週\nAttention Is All You Need\n*Vaswani et al., 2017*",
        },
      },
      {
        name: "paper_b.md",
        type: "text",
        preview: {
          markdown:
            "### This week / 今週\nDeep Residual Learning\n*He et al., 2015*",
        },
      },
      {
        name: "paper_c_W5.md",
        type: "text",
        preview: {
          markdown:
            "### This week / 今週\nMastering the Game of Go without Human Knowledge\n*Silver et al., 2017*",
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

const computeTimeLeft = (targetDate: string, fromMs: number) => {
  const target = new Date(targetDate + "T00:00:00Z").getTime()
  const distance = target - fromMs
  if (distance <= 0) {
    return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSeconds = Math.floor(distance / 1000)
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return { ended: false, days, hours, minutes, seconds }
}

const pad = (n: number) => n.toString().padStart(2, "0")

const formatEventDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z")
  const en = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    timeZone: "UTC",
  })
  const ja = d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  })
  return { en, ja }
}

const CountdownUnit = ({
  value,
  label,
}: {
  value: number
  label: string
}) => (
  <div className="flex flex-col items-center">
    <span>{pad(value)}</span>
    <span className="text-[9px] font-normal uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  </div>
)

const PreviewSlide = ({
  item,
  simMs,
}: {
  item: SampleItem
  simMs: number
}) => {
  if (item.type === "image") {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-muted p-8 text-center">
        <Image className="size-10 text-muted-foreground/40" />
        <div className="text-2xl font-semibold text-foreground">
          {item.preview?.title}
        </div>
        {item.preview?.subtitle && (
          <div className="text-sm text-muted-foreground">
            {item.preview.subtitle}
          </div>
        )}
        <code className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-muted-foreground/60">
          {item.name}
        </code>
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
    const t = computeTimeLeft(ev.date, simMs)
    const date = formatEventDate(ev.date)
    return (
      <div className="flex h-full w-full items-center justify-between gap-6 bg-background px-8 py-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Upcoming / 予定
          </div>
          <div className="truncate text-2xl font-bold leading-tight">
            {ev.name}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="size-3" />
            <span>
              {date.en} / {date.ja}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="size-3" />
            <span>{ev.address}</span>
          </div>
        </div>
        <div className="shrink-0">
          {t.ended ? (
            <div className="text-xl font-bold text-foreground">
              Time is up! / 時間切れ!
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono text-3xl font-bold tabular-nums">
              <CountdownUnit value={t.days} label="Days / 日" />
              <span className="opacity-40">:</span>
              <CountdownUnit value={t.hours} label="Hrs / 時" />
              <span className="opacity-40">:</span>
              <CountdownUnit value={t.minutes} label="Min / 分" />
              <span className="opacity-40">:</span>
              <CountdownUnit value={t.seconds} label="Sec / 秒" />
            </div>
          )}
        </div>
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
  const sMatch = name.match(/S(\d+)/)

  const chips: { token: string; meaning: string }[] = []
  if (fMatch) chips.push({ token: fMatch[0], meaning: `from ${parsed.from}` })
  if (tMatch) chips.push({ token: tMatch[0], meaning: `to ${parsed.to}` })
  if (dMatch) chips.push({ token: dMatch[0], meaning: `for ${dMatch[1]} days` })
  if (wMatch) chips.push({ token: wMatch[0], meaning: `weight ${parsed.weight}` })
  if (sMatch)
    chips.push({
      token: sMatch[0],
      meaning: `dwells ${parsed.displaySeconds}s on screen`,
    })

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

  // All unique F/T boundaries from sample data, so the user can see at a
  // glance where transitions happen.
  const sliderMarkers = useMemo(() => {
    const collect = (item: SampleItem, set: Set<string>) => {
      const p = parseFilename(item.name)
      if (p.from) set.add(p.from)
      if (p.to && p.to !== "9999-12-31") set.add(p.to)
      item.children?.forEach((c) => collect(c, set))
    }
    const set = new Set<string>()
    SAMPLE_FOLDER.forEach((i) => collect(i, set))
    return Array.from(set).sort()
  }, [])

  const isEligible = (item: SampleItem): boolean => {
    if (item.type === "folder") {
      return !!item.children?.some((c) => {
        const cn = parseFilename(c.name)
        if (!cn.from || !cn.to) return false
        return cn.from <= simIso && cn.to >= simIso
      })
    }
    const p = parseFilename(item.name)
    if (!p.from || !p.to) return false
    return p.from <= simIso && p.to >= simIso
  }

  const eligibleEvents = useMemo(
    () => SAMPLE_FOLDER.filter((i) => i.type === "event" && isEligible(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [simIso]
  )
  const eligibleSlides = useMemo(
    () => SAMPLE_FOLDER.filter((i) => i.type !== "event" && isEligible(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [simIso]
  )

  const hasEvents = eligibleEvents.length > 0
  const hasSlides = eligibleSlides.length > 0
  const splitMode = hasEvents && hasSlides

  const computeDemoMs = (item: SampleItem | undefined): number => {
    if (!item) return 1500
    const parsedSec = parseFilename(item.name).displaySeconds
    if (!parsedSec) return 1500
    return Math.min(2500, Math.max(500, parsedSec * 40))
  }

  const [isPaused, setIsPaused] = useState(false)

  // Slideshow track
  const [slideIdx, setSlideIdx] = useState(0)
  useEffect(() => setSlideIdx(0), [eligibleSlides.length])
  const currentSlide = eligibleSlides[slideIdx]
  const slideDemoMs = computeDemoMs(currentSlide)

  useEffect(() => {
    if (isPaused || !hasSlides) return
    const id = setTimeout(() => {
      setSlideIdx((i) => (i + 1) % eligibleSlides.length)
    }, slideDemoMs)
    return () => clearTimeout(id)
  }, [isPaused, hasSlides, eligibleSlides.length, slideDemoMs, slideIdx])

  const [slideProgress, setSlideProgress] = useState(0)
  useEffect(() => {
    if (isPaused || !hasSlides) return
    setSlideProgress(0)
    const start = performance.now()
    const id = setInterval(() => {
      setSlideProgress(Math.min(1, (performance.now() - start) / slideDemoMs))
    }, 50)
    return () => clearInterval(id)
  }, [slideIdx, slideDemoMs, isPaused, hasSlides])

  // Event track (runs independently)
  const [eventIdx, setEventIdx] = useState(0)
  useEffect(() => setEventIdx(0), [eligibleEvents.length])
  const currentEvent = eligibleEvents[eventIdx]
  const eventDemoMs = computeDemoMs(currentEvent)

  useEffect(() => {
    if (isPaused || !hasEvents || eligibleEvents.length < 2) return
    const id = setTimeout(() => {
      setEventIdx((i) => (i + 1) % eligibleEvents.length)
    }, eventDemoMs)
    return () => clearTimeout(id)
  }, [isPaused, hasEvents, eligibleEvents.length, eventDemoMs, eventIdx])

  // Folder picking — bound to the slideshow track
  const [folderPick, setFolderPick] = useState<SampleItem | null>(null)
  useEffect(() => {
    if (currentSlide?.type === "folder" && currentSlide.children) {
      const eligibleChildren = currentSlide.children.filter((c) =>
        isItemActive(c, simIso)
      )
      setFolderPick(weightedPick(eligibleChildren))
    } else {
      setFolderPick(null)
    }
  }, [currentSlide, simIso])

  const displayedSlide = folderPick ?? currentSlide

  // Real-seconds label for the slideshow side
  const slideRealSeconds = currentSlide
    ? parseFilename(currentSlide.name).displaySeconds
    : undefined
  const slideRealSecondsLabel = slideRealSeconds ?? 30
  const slideRemainingMs = Math.max(0, slideDemoMs - slideDemoMs * slideProgress)

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
          <div className="relative">
            <input
              type="range"
              min={minMs}
              max={maxMs}
              value={simMs}
              step={1000 * 60 * 60 * 24}
              onChange={(e) => setSimMs(parseInt(e.target.value, 10))}
              className="relative z-10 w-full accent-foreground"
            />
            <div className="pointer-events-none absolute inset-x-1.5 -bottom-1 h-2">
              {sliderMarkers.map((iso) => {
                const dayMs = new Date(iso + "T00:00:00Z").getTime()
                if (dayMs < minMs || dayMs > maxMs) return null
                const pct = ((dayMs - minMs) / (maxMs - minMs)) * 100
                return (
                  <div
                    key={iso}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${pct}%` }}
                    title={iso}
                  >
                    <div className="size-1.5 rounded-full bg-primary/70 ring-2 ring-background" />
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Dots mark F/T boundaries in the sample folder — every point an
            item enters or exits its window. Hover a dot to see the date. /
            ドットはサンプルフォルダのF/T境界（アイテムの表示開始・終了日）です。
            ホバーで日付が出ます。
          </p>
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
                  item.type === "folder" ? isEligible(item) : isItemActive(item, simIso)
                const isCurrentSlide =
                  currentSlide === item ||
                  (item.children && item.children.includes(folderPick as any))
                const isCurrentEvent = currentEvent === item
                const isCurrent = isCurrentSlide || isCurrentEvent

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
                      {isCurrentEvent && (
                        <Badge className="shrink-0 text-[10px]">
                          event / イベント
                        </Badge>
                      )}
                      {isCurrentSlide && !folderPick && (
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
            <div className="relative aspect-video w-full bg-neutral-100">
              {hasEvents || hasSlides ? (
                <div className="flex size-full flex-col">
                  {hasEvents && (
                    <div
                      key={`ev-${currentEvent?.name}`}
                      className={cn(
                        "w-full overflow-hidden border-b border-border animate-in fade-in zoom-in-95 duration-500",
                        splitMode ? "h-1/3" : "h-full"
                      )}
                    >
                      {currentEvent && (
                        <PreviewSlide item={currentEvent} simMs={simMs} />
                      )}
                    </div>
                  )}
                  {hasSlides && (
                    <div
                      key={`sl-${displayedSlide?.name}`}
                      className={cn(
                        "relative w-full overflow-hidden animate-in fade-in zoom-in-95 duration-500",
                        splitMode ? "h-2/3" : "h-full"
                      )}
                    >
                      {displayedSlide && (
                        <PreviewSlide item={displayedSlide} simMs={simMs} />
                      )}
                    </div>
                  )}
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
              {hasSlides && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/10">
                  <div
                    className="h-full bg-primary transition-[width] duration-75 ease-linear"
                    style={{ width: `${slideProgress * 100}%` }}
                  />
                </div>
              )}
            </div>
            {(hasSlides || hasEvents) && (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border bg-background/60 px-3 py-1.5 text-[11px] text-muted-foreground">
                {splitMode && (
                  <span className="text-foreground/80">
                    Both an event banner and the slideshow are on screen —
                    they rotate independently. /
                    イベントバナーとスライドショーは同時に表示され、
                    それぞれ独立して切り替わります。
                  </span>
                )}
                {hasSlides && (
                  <>
                    <span>
                      Slide for / スライド表示時間{" "}
                      <strong>{slideRealSecondsLabel}s</strong>
                      {!slideRealSeconds && " (default / 既定)"}
                    </span>
                    <span className="tabular-nums">
                      Next in / 次まで{" "}
                      {(slideRemainingMs / 1000).toFixed(1)}s (demo / デモ)
                    </span>
                  </>
                )}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                What you&rsquo;re seeing / 表示中のファイル
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {hasEvents && currentEvent && (
                <div className="space-y-2">
                  {splitMode && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Event banner / イベントバナー
                    </p>
                  )}
                  <TokenExplainer name={currentEvent.name} />
                </div>
              )}
              {hasSlides && displayedSlide && (
                <div className="space-y-2">
                  {splitMode && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Slideshow / スライドショー
                    </p>
                  )}
                  <TokenExplainer name={displayedSlide.name} />
                  {folderPick && currentSlide?.type === "folder" && (
                    <p className="text-xs text-muted-foreground">
                      Picked from <code>{currentSlide.name}</code> using
                      weighted random across {currentSlide.children?.length}{" "}
                      children. /{" "}
                      <code>{currentSlide.name}</code>
                      の中から重み付きランダムで選択されました。
                    </p>
                  )}
                </div>
              )}
              {!hasEvents && !hasSlides && (
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
                  Slide to <strong>December 2025</strong> — SI 2025 conference
                  banner appears with a live countdown to Dec 10. /
                  2025年12月に動かすとSI 2025のカウントダウンが表示されます。
                </li>
                <li>
                  Slide past <strong>Dec 10, 2025</strong> — countdown switches
                  to &ldquo;Time is up! / 時間切れ!&rdquo; until the file drops out of
                  its window. / 2025年12月10日を過ぎると「時間切れ」表示に
                  なります。
                </li>
                <li>
                  Slide to <strong>March 2026</strong> — the IROS 2026
                  submission deadline countdown takes over the screen. /
                  2026年3月に動かすとIROS 2026の投稿締切カウントダウンが
                  表示されます。
                </li>
                <li>
                  Watch the <code>reading_group/</code> folder — each rotation
                  re-rolls the weighted paper pick (W5 wins most often). /{" "}
                  <code>reading_group/</code>
                  フォルダではローテーションごとに重み付き抽選が再実行されます
                  （W5が最頻）。
                </li>
                <li>
                  Notice the dwell time changes with <code>S</code>: the new
                  members poster (S60) lingers longer; the award flash (S10)
                  flips by quickly. Demo time is scaled down so the tour stays
                  watchable. /{" "}
                  <code>S</code>トークンによって表示時間が変わります：新メンバー
                  ポスター（S60）は長く、受賞報告（S10）は短く表示されます。
                  デモは縮尺を圧縮しています。
                </li>
                <li>
                  When an event and a slideshow item are both active (e.g. at
                  today&rsquo;s date), the board splits — event banner on top,
                  slideshow below. They rotate independently, just like the
                  real screen. /
                  イベントとスライドショーの両方が有効な日付（例: 今日）
                  では、上部にイベントバナー、下部にスライドショーが
                  分割表示されます。実機と同じく独立して切り替わります。
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
