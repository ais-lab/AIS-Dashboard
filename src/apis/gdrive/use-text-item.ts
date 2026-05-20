import { displayItemKeys } from "@/constants/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { BaseDisplayItem } from "@/types/models"

import { fetchDriveFileText } from "./client"

interface GetTextItemParams {
  displayItem: BaseDisplayItem
}

const getTextItem = ({ displayItem }: GetTextItemParams) =>
  fetchDriveFileText(displayItem.id)

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
