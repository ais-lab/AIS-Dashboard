import MainApiPath from "@/constants/api-path"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"

import { cleanObject } from "@/lib/utils"

import { WorkerApiClient } from "../http-client"

type GhepVipParams = {
  username: string
  password: string
  imageCount: number
  overallImageUrl: string
  changeNameCardCount?: number | ""
  accountCode?: string
  topHeroImageUrls?: string[]
  winRateImageUrls?: string[]
  evoSkin?: {
    wukong?: string
    valhein?: string
    nakroth?: string
  }
  excludeLowWinRate?: boolean
  brightness?: number
  frameType?: string
  vfx?: object
}

type GhepVipResponse = {
  resultUrl: string
  error?: string
  username: string
  thumbHash: string
}

const ghepVip = async (props: GhepVipParams) => {
  const { excludeLowWinRate, brightness, frameType, vfx, ...rest } = props
  try {
    const response = await WorkerApiClient.post(MainApiPath.ghepvip.default, {
      json: cleanObject({
        ...rest,
        minWinRate: excludeLowWinRate ? 52 : 0,
        brightness: brightness ?? 0,
        frameType: frameType ?? "default",
        vfx: vfx ?? {},
      }),
    }).json<Omit<GhepVipResponse, "username">>()
    return { ...response, username: props.username }
  } catch (error) {
    const json = await (error as any).response?.json()
    const errorMessage = json?.error || "Có lỗi xảy ra"
    throw new Error(errorMessage)
  }
}

type GhepVipOptions = UseMutationOptions<GhepVipResponse, Error, GhepVipParams>

export const useGhepVip = (options?: GhepVipOptions) => {
  return useMutation({
    mutationFn: ghepVip,
    ...options,
  })
}
