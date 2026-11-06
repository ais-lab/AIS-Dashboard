import { displayItemKeys } from "@/constants/query-key-factory"
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"

import { BaseDisplayItem, FolderItem } from "@/types/models"
import { duration } from "@/lib/utils/duration"
import { isEventOver } from "@/lib/utils/event"
import { parseFilename, todayIso } from "@/lib/utils/filename-rules"
import { getActiveFolderId } from "@/lib/utils/folder-override"

import { listDriveFolder } from "./client"
import { getCountDownEvent } from "./use-countdown-event"

const getDisplayType = (mimeType: string) => {
  if (mimeType.includes("image")) return "image"
  if (mimeType.includes("application/json")) return "event"
  if (mimeType.includes("application/vnd.google-apps.folder")) return "folder"
  return "text"
}

const getDisplayItems = async (level = 0, folderId = "") => {
  if (level > 1) return []

  const rawItems = await listDriveFolder(folderId || getActiveFolderId())
  const items: BaseDisplayItem[] = []
  const nowIso = todayIso()

  for (const file of rawItems.files) {
    const { id, name, mimeType } = file
    const parsed = parseFilename(name)
    if (!parsed.from || !parsed.to) continue
    if (parsed.from > parsed.to) continue
    if (parsed.from > nowIso || parsed.to < nowIso) continue

    const itemType = getDisplayType(mimeType)
    if (level !== 0 && !["image", "text"].includes(itemType)) continue

    const from = `${parsed.from}T00:00:00`
    const to = `${parsed.to}T00:00:00`

    if (itemType === "folder") {
      const subItems = await getDisplayItems(level + 1, id)
      items.push({
        id,
        name,
        type: itemType,
        from,
        to,
        displaySeconds: parsed.displaySeconds,
        items: subItems,
      } as FolderItem)
    } else {
      items.push({
        id,
        name,
        type: itemType,
        from,
        to,
        weight: parsed.weight,
        displaySeconds: parsed.displaySeconds,
      })
    }
  }
  return items
}

// The event date lives inside the JSON, so past events can only be dropped after
// fetching it. The fetch goes through the same cache key the countdown card reads.
const dropPastEvents = async (
  items: BaseDisplayItem[],
  queryClient: QueryClient
) => {
  const kept = await Promise.all(
    items.map(async (item) => {
      if (item.type !== "event") return item
      try {
        const event = await queryClient.fetchQuery({
          queryKey: displayItemKeys.event(item.id),
          queryFn: () => getCountDownEvent({ displayItem: item }),
          staleTime: duration.seconds(30),
        })
        return isEventOver(event.date) ? null : item
      } catch {
        return item
      }
    })
  )
  return kept.filter((item): item is BaseDisplayItem => item !== null)
}

type UseDisplayItemsOptions = Omit<
  UseQueryOptions<BaseDisplayItem[] | FolderItem[], Error>,
  "queryKey" | "queryFn"
>

export const useDisplayItems = (options?: UseDisplayItemsOptions) => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: displayItemKeys.all(),
    queryFn: async () => dropPastEvents(await getDisplayItems(), queryClient),
    ...options,
  })
}
