"use client"

import { useEffect, useState } from "react"
import { fileToBase64, textToBase64 } from "@/apis/board-api/client"
import { useUploadItem } from "@/apis/board-api/hooks"
import { FileText, ImageIcon, Timer, UploadCloud } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { splitFilename } from "@/lib/utils/filename-rules"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  emptyEvent,
  EventDraft,
  EventFields,
  eventToJson,
  TextFields,
} from "./content-fields"
import {
  defaultSchedule,
  nameWithSchedule,
  Schedule,
  ScheduleFields,
} from "./schedule-fields"

type Kind = "image" | "text" | "event"

// Apps Script accepts request bodies up to ~50 MB, and base64 adds a third.
const MAX_BYTES = 25 * 1024 * 1024

const kinds: { id: Kind; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "text", label: "Text", icon: FileText },
  { id: "event", label: "Countdown", icon: Timer },
]

export const UploadForm = () => {
  const upload = useUploadItem()
  const [kind, setKind] = useState<Kind>("image")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [event, setEvent] = useState<EventDraft>(emptyEvent)
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule)

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pickFile = (picked: File | undefined) => {
    if (!picked) return
    if (!picked.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    if (picked.size > MAX_BYTES) {
      toast.error("That image is over 25 MB")
      return
    }
    setFile(picked)
    if (!title) setTitle(splitFilename(picked.name).title)
  }

  const effectiveTitle =
    title.trim() || (kind === "event" ? event.name.trim() : "") || "untitled"
  const extension =
    kind === "image"
      ? splitFilename(file?.name ?? "").extension || "png"
      : kind === "text"
        ? "md"
        : "json"
  const filename = nameWithSchedule(effectiveTitle, extension, schedule)

  const missing =
    kind === "image"
      ? !file && "Choose an image"
      : kind === "text"
        ? !text.trim() && "Write the slide text"
        : (!event.name.trim() || !event.date) && "Add the event name and date"

  const reset = () => {
    setFile(null)
    setTitle("")
    setText("")
    setEvent(emptyEvent)
    setSchedule(defaultSchedule())
  }

  const submit = async () => {
    if (missing) return toast.error(missing)
    try {
      const payload =
        kind === "image" && file
          ? { mimeType: file.type, data: await fileToBase64(file) }
          : kind === "text"
            ? { mimeType: "text/markdown", data: await textToBase64(text) }
            : {
                mimeType: "application/json",
                data: await textToBase64(eventToJson(event)),
              }
      await upload.mutateAsync({ filename, ...payload })
      toast.success("Posted. It shows up within a minute.")
      reset()
    } catch (err) {
      toast.error((err as Error).message || "Upload failed")
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Add to the screen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2">
          {kinds.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-colors",
                kind === id
                  ? "border-primary bg-muted"
                  : "border-border hover:bg-muted"
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>

        {kind === "image" && (
          <label
            className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted text-sm text-muted-foreground"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              pickFile(e.dataTransfer.files[0])
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Selected image"
                className="max-h-[260px] w-full object-contain"
              />
            ) : (
              <>
                <UploadCloud className="size-8" />
                Choose or drop an image
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </label>
        )}
        {kind === "text" && <TextFields value={text} onChange={setText} />}
        {kind === "event" && <EventFields value={event} onChange={setEvent} />}

        <div className="space-y-1.5">
          <Label htmlFor="title">
            Title{" "}
            <span className="text-muted-foreground">(not shown on screen)</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <ScheduleFields value={schedule} onChange={setSchedule} />

        <div className="flex justify-end border-t pt-4">
          <Button onClick={submit} isLoading={upload.isPending}>
            Post to the board
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
