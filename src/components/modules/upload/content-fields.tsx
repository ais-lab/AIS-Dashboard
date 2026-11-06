import { CountdownEvent } from "@/types/models"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Fields for the two kinds of content written in the browser rather than
// uploaded: a Markdown text slide and a countdown event.

export interface EventDraft {
  name: string
  // <input type="datetime-local"> value, e.g. "2026-12-10T10:00"
  date: string
  address: string
  description: string
}

export const emptyEvent: EventDraft = {
  name: "",
  date: "",
  address: "",
  description: "",
}

// Saved without a time zone suffix so the board reads it as local time.
export const eventToJson = (e: EventDraft): string => {
  const event: CountdownEvent = { name: e.name.trim(), date: `${e.date}:00` }
  if (e.address.trim()) event.address = e.address.trim()
  if (e.description.trim()) event.description = e.description.trim()
  return JSON.stringify(event, null, 2)
}

export const eventFromJson = (json: string): EventDraft => {
  try {
    const e = JSON.parse(json) as CountdownEvent
    return {
      name: e.name ?? "",
      date: String(e.date ?? "")
        .replace(" ", "T")
        .slice(0, 16),
      address: e.address ?? "",
      description: e.description ?? "",
    }
  } catch {
    return emptyEvent
  }
}

export const TextFields = ({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) => (
  <div className="space-y-1.5">
    <Label htmlFor="slide-text">Slide text</Label>
    <Textarea
      id="slide-text"
      rows={7}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={"# Lab meeting moved\nThursday 3pm, room 402"}
    />
    <p className="text-xs text-muted-foreground">
      Markdown works: # for a heading, **bold**, - for a list.
    </p>
  </div>
)

export const EventFields = ({
  value,
  onChange,
}: {
  value: EventDraft
  onChange: (next: EventDraft) => void
}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor="event-name">Event name</Label>
      <Input
        id="event-name"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="SI 2026"
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="event-date">Date and time</Label>
      <Input
        id="event-date"
        type="datetime-local"
        value={value.date}
        onChange={(e) => onChange({ ...value, date: e.target.value })}
      />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="event-place">Place (optional)</Label>
      <Input
        id="event-place"
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        placeholder="Hiroshima, Japan"
      />
    </div>
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor="event-description">Description (optional)</Label>
      <Input
        id="event-description"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground sm:col-span-2">
      Shows a countdown at the top of the screen and disappears by itself after
      the event day.
    </p>
  </div>
)
