import MainApiPath from "@/constants/api-path"
import { displayItemKeys } from "@/constants/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { env } from "@/env.mjs"
import { BaseDisplayItem, CountdownEvent } from "@/types/models"

import { MainApiClient } from "../http-client"

interface GetCountDownEventParams {
  displayItem: BaseDisplayItem
}

const getCountDownEvent = async ({ displayItem }: GetCountDownEventParams) => {
  const item = await MainApiClient.get(MainApiPath.gdrive.json(), {
    searchParams: { fileId: displayItem.fileId },
  }).json<CountdownEvent>()
  return item
}

type CountdownEventQueryOptions = Omit<
  UseQueryOptions<CountdownEvent, Error>,
  "queryKey" | "queryFn"
> &
  GetCountDownEventParams

export const useCountDownEvent = (options: CountdownEventQueryOptions) => {
  const { displayItem, ...rest } = options
  return useQuery({
    queryKey: displayItemKeys.event(displayItem.fileId),
    queryFn: () => getCountDownEvent({ displayItem }),
    ...rest,
  })
}
