import MainApiPath from "@/constants/api-path"
import { displayItemKeys } from "@/constants/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { env } from "@/env.mjs"
import { BaseDisplayItem } from "@/types/models"

import { MainApiClient } from "../http-client"

const parseFilenameDates = (
  filename: string
): { from: string | undefined; to: string | undefined } => {
  if (typeof filename !== "string" || !filename) {
    return { from: undefined, to: undefined }
  }

  const fMatch = filename.match(/F(\d{8})/)
  const tMatch = filename.match(/T(\d{8})/)
  const dMatch = filename.match(/D(\d+)/)

  if (tMatch && dMatch) {
    return { from: undefined, to: undefined }
  }

  try {
    let fromDateStr: string

    if (fMatch) {
      const fromYYYYMMDD = fMatch[1]
      const parsedFromDateStr = `${fromYYYYMMDD.substring(0, 4)}-${fromYYYYMMDD.substring(4, 6)}-${fromYYYYMMDD.substring(6, 8)}`

      const fromDateCheck = new Date(parsedFromDateStr + "T00:00:00Z")
      if (
        isNaN(fromDateCheck.getTime()) ||
        fromDateCheck.toISOString().substring(0, 10) !== parsedFromDateStr
      ) {
        throw new Error(`Invalid start date format or value: ${fromYYYYMMDD}`)
      }
      fromDateStr = parsedFromDateStr
    } else {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")
      fromDateStr = `${year}-${month}-${day}`
    }

    let toDateStr: string

    if (tMatch) {
      const toYYYYMMDD = tMatch[1]
      const parsedToDateStr = `${toYYYYMMDD.substring(0, 4)}-${toYYYYMMDD.substring(4, 6)}-${toYYYYMMDD.substring(6, 8)}`

      const toDateCheck = new Date(parsedToDateStr + "T00:00:00Z")
      if (
        isNaN(toDateCheck.getTime()) ||
        toDateCheck.toISOString().substring(0, 10) !== parsedToDateStr
      ) {
        throw new Error(`Invalid end date format or value: ${toYYYYMMDD}`)
      }
      toDateStr = parsedToDateStr
    } else if (dMatch) {
      const durationDays = parseInt(dMatch[1], 10)

      if (isNaN(durationDays) || durationDays <= 0) {
        throw new Error(
          `Invalid or non-positive duration 'D' value: ${dMatch[1]}`
        )
      }

      const fromDate = new Date(fromDateStr + "T00:00:00Z")
      if (isNaN(fromDate.getTime())) {
        throw new Error(
          "Internal error: Invalid base date for duration calculation."
        )
      }
      const toDate = new Date(fromDate)
      toDate.setUTCDate(fromDate.getUTCDate() + durationDays)

      const year = toDate.getUTCFullYear()
      const month = String(toDate.getUTCMonth() + 1).padStart(2, "0")
      const day = String(toDate.getUTCDate()).padStart(2, "0")
      toDateStr = `${year}-${month}-${day}`
    } else {
      toDateStr = "9999-12-31"
    }

    const finalFrom = `${fromDateStr}T00:00:00`
    const finalTo = `${toDateStr}T00:00:00`

    return {
      from: finalFrom,
      to: finalTo,
    }
  } catch (e: unknown) {
    return { from: undefined, to: undefined }
  }
}

const getDisplayType = (mimeType: string) => {
  if (mimeType.includes("image")) {
    return "image"
  } else if (mimeType.includes("application/json")) {
    return "event"
  }
  return "text"
}

const getDisplayItems = async () => {
  const rawItems = await MainApiClient.get(MainApiPath.gdrive.default, {
    searchParams: { folderId: env.NEXT_PUBLIC_DRIVE_FOLDER_ID },
  }).json<{ files: { id: string; name: string; mimeType: string }[] }>()
  let items: BaseDisplayItem[] = []
  for (const file of rawItems.files) {
    const { id, name, mimeType } = file
    const { from, to } = parseFilenameDates(name)
    if (!from || !to) {
      continue
    }
    items.push({
      fileId: id,
      fileName: file.name,
      type: getDisplayType(mimeType),
      from,
      to,
    })
  }
  return items
}

type UseDisplayItemsOptions = Omit<
  UseQueryOptions<BaseDisplayItem[], Error>,
  "queryKey" | "queryFn"
>

export const useDisplayItems = (options?: UseDisplayItemsOptions) => {
  return useQuery({
    queryKey: displayItemKeys.all(),
    queryFn: getDisplayItems,
    ...options,
  })
}
