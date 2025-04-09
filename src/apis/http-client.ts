import humps from "humps"
import ky from "ky"

import { env } from "@/env.mjs"
import { duration } from "@/lib/utils/duration"

// const attachToken = async (req: Request) => {
//   const authUser = auth.currentUser
//   if (!authUser) return req
//   const idToken = await authUser.getIdToken()
//   req.headers.set("Authorization", `Bearer ${idToken}`)
// }

const normalizeResponse = async (_: any, __: any, res: Response) => {
  if (!res.ok) return res
  if (res.url.includes("financials")) return res
  const body = humps.camelizeKeys(await res.json())
  return new Response(JSON.stringify(body), { ...res })
}

const MainApi = ky.create({
  retry: 0,
  prefixUrl: `${env.NEXT_PUBLIC_BASE_URL}/api`,
  timeout: duration.seconds(180),
  hooks: {
    // beforeRequest: [attachToken],
    // afterResponse: [normalizeResponse],
  },
})

const WorkerApi = ky.create({
  retry: 0,
  prefixUrl: env.NEXT_PUBLIC_WORKER_BASE_URL,
  timeout: duration.seconds(180),
  hooks: {
    // beforeRequest: [attachToken],
    // afterResponse: [normalizeResponse],
  },
})

export const MainApiClient = MainApi

export const WorkerApiClient = WorkerApi
