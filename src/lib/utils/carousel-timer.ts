import { MutableRefObject, useRef } from "react"
import type { EmblaCarouselType } from "embla-carousel"

import { BaseDisplayItem } from "@/types/models"

// The board refetches Drive every 30 seconds and hands the carousels a new
// array each time, even when nothing changed. Timers keyed on that array
// restarted on every refetch, so a slide or countdown shown for 30 seconds or
// more never moved on. Keying them on the items' ids and times instead keeps
// a refetch from resetting them.

export const useStableItems = (items: BaseDisplayItem[]) => {
  const itemsRef = useRef(items)
  itemsRef.current = items
  const itemsKey = items
    .map((item) => `${item.id}:${item.displaySeconds ?? ""}`)
    .join("|")
  return { itemsKey, itemsRef }
}

// Moves the carousel on after each item's display time. Returns the cleanup.
export const advanceOnTimer = (
  api: EmblaCarouselType | null,
  itemsRef: MutableRefObject<BaseDisplayItem[]>,
  defaultSeconds: number
): (() => void) | undefined => {
  if (!api || itemsRef.current.length === 0) return
  let timeout: ReturnType<typeof setTimeout> | null = null

  const schedule = () => {
    if (timeout) clearTimeout(timeout)
    const current = itemsRef.current[api.selectedScrollSnap()]
    const seconds = current?.displaySeconds ?? defaultSeconds
    timeout = setTimeout(() => api.scrollNext(), seconds * 1000)
  }

  schedule()
  api.on("select", schedule)
  return () => {
    api.off("select", schedule)
    if (timeout) clearTimeout(timeout)
  }
}
