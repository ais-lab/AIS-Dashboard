"use client"

import { useState } from "react"
import { Account, BoardItem } from "@/apis/board-api/client"
import {
  useBoardItems,
  useDeleteItem,
  useItemContent,
  useUpdateItem,
} from "@/apis/board-api/hooks"
import { driveImageUrl } from "@/apis/gdrive/client"
import { FileText, Folder, Pencil, Timer, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { isEventOver } from "@/lib/utils/event"
import {
  parseFilename,
  scheduleStatus,
  ScheduleStatus,
  splitFilename,
} from "@/lib/utils/filename-rules"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  EventDraft,
  EventFields,
  eventFromJson,
  eventToJson,
  TextFields,
} from "./content-fields"
import {
  describeSchedule,
  formatDay,
  nameWithSchedule,
  Schedule,
  ScheduleFields,
  scheduleFromName,
} from "./schedule-fields"

type ItemKind = "image" | "text" | "event" | "folder"

const kindOf = (item: BoardItem): ItemKind => {
  if (item.mimeType.includes("folder")) return "folder"
  if (item.mimeType.startsWith("image/")) return "image"
  if (item.mimeType.includes("json")) return "event"
  return "text"
}

const statusLabel: Record<ScheduleStatus, string> = {
  showing: "On screen",
  scheduled: "Scheduled",
  ended: "Ended",
  invalid: "Check dates",
}

const statusOrder: Record<ScheduleStatus, number> = {
  showing: 0,
  scheduled: 1,
  invalid: 2,
  ended: 3,
}

const kindIcon = { text: FileText, event: Timer, folder: Folder }

// Same rules as the board: the name's dates, and for countdowns the event day.
const statusOf = (item: BoardItem): ScheduleStatus =>
  item.eventDate && isEventOver(item.eventDate)
    ? "ended"
    : scheduleStatus(parseFilename(item.name))

const whenText = (item: BoardItem, kind: ItemKind): string | null => {
  if (kind === "folder") return null
  if (kind === "event" && item.eventDate) {
    return `event on ${formatDay(item.eventDate)}`
  }
  const parsed = parseFilename(item.name)
  if (!parsed.hasFromToken && !parsed.hasToToken && !parsed.hasDurationToken) {
    return "always, until removed"
  }
  return describeSchedule(scheduleFromName(item.name))
}

export const ItemList = ({ account }: { account: Account }) => {
  const isAdmin = account.role === "admin"
  const [filter, setFilter] = useState<"mine" | "all">(isAdmin ? "all" : "mine")
  const { data: items, isLoading, error, refetch } = useBoardItems(true)

  const visible = (items ?? [])
    .filter((it) => filter === "all" || it.uploadedBy === account.email)
    .map((it) => ({ item: it, status: statusOf(it) }))
    .sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        b.item.createdAt.localeCompare(a.item.createdAt)
    )

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">On the board</CardTitle>
        <div className="flex rounded-md bg-muted p-1 text-sm">
          {(["mine", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded px-3 py-1",
                filter === f && "bg-background font-medium shadow-sm"
              )}
            >
              {f === "mine" ? "My posts" : "Everything"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-destructive">
            {error.message}{" "}
            <button className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </p>
        )}
        {items && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {filter === "mine"
              ? "You haven't posted anything yet."
              : "The folder is empty."}
          </p>
        )}
        <ul className="list-none divide-y divide-border pl-0">
          {visible.map(({ item, status }) => (
            <ItemRow
              key={item.id}
              item={item}
              status={status}
              showOwner={filter === "all"}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

const ItemRow = ({
  item,
  status,
  showOwner,
}: {
  item: BoardItem
  status: ScheduleStatus
  showOwner: boolean
}) => {
  const [editing, setEditing] = useState(false)
  const remove = useDeleteItem()
  const kind = kindOf(item)
  const { title } = splitFilename(item.name)
  const Icon = kind === "image" ? null : kindIcon[kind]

  const onDelete = async () => {
    if (!window.confirm(`Remove "${title}" from the board?`)) return
    try {
      await remove.mutateAsync({ id: item.id })
      toast.success("Removed from the board")
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {Icon ? (
            <Icon className="size-6 text-muted-foreground" />
          ) : (
            <img
              src={item.thumbnailUrl ?? driveImageUrl(item.id)}
              alt=""
              className="size-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge
              variant={status === "showing" ? "default" : "outline"}
              className={cn(
                status === "invalid" && "border-destructive text-destructive"
              )}
            >
              {statusLabel[status]}
            </Badge>
            {whenText(item, kind) && <span>{whenText(item, kind)}</span>}
            {showOwner && (
              <span>
                ·{" "}
                {item.uploadedBy ??
                  (kind === "folder" ? "Drive folder" : "added in Drive")}
              </span>
            )}
          </div>
        </div>
        {item.canEdit && (
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit"
              onClick={() => setEditing((v) => !v)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove"
              onClick={onDelete}
              isLoading={remove.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
      {editing && (
        <ItemEditor item={item} kind={kind} onDone={() => setEditing(false)} />
      )}
    </li>
  )
}

const ItemEditor = ({
  item,
  kind,
  onDone,
}: {
  item: BoardItem
  kind: ItemKind
  onDone: () => void
}) => {
  const update = useUpdateItem()
  const hasContent = kind === "text" || kind === "event"
  const content = useItemContent(item.id, hasContent)
  const { title: initialTitle, extension } = splitFilename(item.name)
  const [title, setTitle] = useState(initialTitle)
  const [schedule, setSchedule] = useState<Schedule>(() =>
    scheduleFromName(item.name)
  )
  const [text, setText] = useState<string | null>(null)
  const [event, setEvent] = useState<EventDraft | null>(null)

  // Fill the content fields once the current file content has loaded.
  const loaded = content.data?.content
  const textValue = text ?? (kind === "text" ? loaded ?? "" : "")
  const eventValue =
    event ?? (kind === "event" && loaded ? eventFromJson(loaded) : null)

  const save = async () => {
    try {
      await update.mutateAsync({
        id: item.id,
        filename: nameWithSchedule(title, extension, schedule, item.name),
        content:
          kind === "text" && text !== null
            ? text
            : kind === "event" && event !== null
              ? eventToJson(event)
              : undefined,
      })
      toast.success("Saved")
      onDone()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="mt-3 space-y-5 rounded-lg border bg-background p-4">
      {hasContent && content.isLoading && (
        <p className="text-sm text-muted-foreground">Loading content…</p>
      )}
      {kind === "text" && !content.isLoading && (
        <TextFields value={textValue} onChange={setText} />
      )}
      {kind === "event" && eventValue && (
        <EventFields value={eventValue} onChange={setEvent} />
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`title-${item.id}`}>Title</Label>
        <Input
          id={`title-${item.id}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <ScheduleFields value={schedule} onChange={setSchedule} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={save} isLoading={update.isPending}>
          Save
        </Button>
      </div>
    </div>
  )
}
