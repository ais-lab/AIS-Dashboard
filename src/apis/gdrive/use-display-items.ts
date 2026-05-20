import { displayItemKeys } from "@/constants/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { BaseDisplayItem, FolderItem } from "@/types/models"
import { parseFilename } from "@/lib/utils/filename-rules"
import { getActiveFolderId } from "@/lib/utils/folder-override"

import { listDriveFolder } from "./client"

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
  const nowIso = new Date().toISOString().slice(0, 10)

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
      })
    }
  }
  return items
}

type UseDisplayItemsOptions = Omit<
  UseQueryOptions<BaseDisplayItem[] | FolderItem[], Error>,
  "queryKey" | "queryFn"
>

export const useDisplayItems = (options?: UseDisplayItemsOptions) => {
  return useQuery({
    queryKey: displayItemKeys.all(),
    queryFn: () => getDisplayItems(),
    ...options,
  })
}
