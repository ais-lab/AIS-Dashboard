import { displayItemKeys } from "@/constants/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { BaseDisplayItem, CountdownEvent } from "@/types/models"

import { fetchDriveFileJson } from "./client"

interface GetCountDownEventParams {
  displayItem: BaseDisplayItem
}

const getCountDownEvent = ({ displayItem }: GetCountDownEventParams) =>
  fetchDriveFileJson<CountdownEvent>(displayItem.id)

type CountdownEventQueryOptions = Omit<
  UseQueryOptions<CountdownEvent, Error>,
  "queryKey" | "queryFn"
> &
  GetCountDownEventParams

export const useCountDownEvent = (options: CountdownEventQueryOptions) => {
  const { displayItem, ...rest } = options
  return useQuery({
    queryKey: displayItemKeys.event(displayItem.id),
    queryFn: () => getCountDownEvent({ displayItem }),
    ...rest,
  })
}
