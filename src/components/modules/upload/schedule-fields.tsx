import dayjsConfig from "@/config/dayjs"
import { cn } from "@/lib/utils"
import {
  buildFilename,
  FOREVER,
  fromIsoDate,
  parseFilename,
  todayIso,
} from "@/lib/utils/filename-rules"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// The UI talks in dates; the file name tokens are generated from them.

export interface Schedule {
  from: string
  until: string | null
}

export const defaultSchedule = (): Schedule => ({
  from: todayIso(),
  until: null,
})

export const scheduleFromName = (name: string): Schedule => {
  const parsed = parseFilename(name)
  return {
    from: parsed.from ?? todayIso(),
    until: !parsed.to || parsed.to === FOREVER ? null : parsed.to,
  }
}

export const nameWithSchedule = (
  title: string,
  extension: string,
  schedule: Schedule,
  // When renaming, the old name: keeps the W and S tokens the form doesn't show.
  previousName?: string
): string => {
  const previous = previousName ? parseFilename(previousName) : null
  return buildFilename({
    base: title,
    extension,
    from: fromIsoDate(schedule.from),
    endMode: schedule.until ? "to" : "forever",
    to: schedule.until ? fromIsoDate(schedule.until) : null,
    weight: previous?.weight,
    displaySeconds: previous?.displaySeconds,
  })
}

export const formatDay = (iso: string): string =>
  dayjsConfig(iso).format("MMM D, YYYY")

export const describeSchedule = (s: Schedule): string =>
  s.until
    ? `${formatDay(s.from)} to ${formatDay(s.until)}`
    : `from ${formatDay(s.from)}, until removed`

const presets = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
]

const addDays = (iso: string, days: number): string =>
  dayjsConfig(iso).add(days, "day").format("YYYY-MM-DD")

export const ScheduleFields = ({
  value,
  onChange,
}: {
  value: Schedule
  onChange: (next: Schedule) => void
}) => {
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border hover:bg-muted"
    )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="show-from">Show from</Label>
          <Input
            id="show-from"
            type="date"
            value={value.from}
            onChange={(e) =>
              e.target.value && onChange({ ...value, from: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="show-until">Until (last day)</Label>
          <Input
            id="show-until"
            type="date"
            min={value.from}
            value={value.until ?? ""}
            onChange={(e) =>
              onChange({ ...value, until: e.target.value || null })
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={chip(value.until === null)}
          onClick={() => onChange({ ...value, until: null })}
        >
          No end date
        </button>
        {presets.map((p) => {
          const until = addDays(value.from, p.days - 1)
          return (
            <button
              key={p.label}
              type="button"
              className={chip(value.until === until)}
              onClick={() => onChange({ ...value, until })}
            >
              {p.label}
            </button>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Shows {describeSchedule(value)}
      </p>
    </div>
  )
}
