import MainApiPath from "@/constants/api-path"
import { displayItemKeys } from "@/constants/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { env } from "@/env.mjs"
import { BaseDisplayItem, CountdownEvent } from "@/types/models"

import { MainApiClient } from "../http-client"

interface GetTextItemParams {
  displayItem: BaseDisplayItem
}

const getTextItem = async ({ displayItem }: GetTextItemParams) => {
  const item = await MainApiClient.get(MainApiPath.gdrive.txt(), {
    searchParams: { fileId: displayItem.id },
  }).text()
  return item
}

type UseTextItemtQueryOptions = Omit<
  UseQueryOptions<string, Error>,
  "queryKey" | "queryFn"
> &
  GetTextItemParams

export const useTextItem = (options: UseTextItemtQueryOptions) => {
  const { displayItem, ...rest } = options
  return useQuery({
    queryKey: displayItemKeys.text(displayItem.id),
    queryFn: () => getTextItem({ displayItem }),
    ...rest,
  })
}
