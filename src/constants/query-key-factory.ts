import { text } from "stream/consumers"

export const userKeys = {
  currentUser: ["currentUser"],
  user: ["user"],
  details: (id: string) => [...userKeys.user, id],
} as const

export const refCodeKeys = {
  refCode: ["refCode"],
  details: (id: string) => [...refCodeKeys.refCode, id],
} as const

export const fileKeys = {
  file: ["file"],
  details: (url: string) => [...fileKeys.file, url],
  blob: (url: string) => [...fileKeys.details(url), "blob"],
} as const

export const priceKeys = {
  price: ["price"],
  details: (id: string) => [...priceKeys.price, id],
} as const

export const displayItemKeys = {
  displayItems: ["displayItems"],
  all: () => [...displayItemKeys.displayItems],
  event: (fileId: string) => [...displayItemKeys.displayItems, "event", fileId],
  text: (fileId: string) => [...displayItemKeys.displayItems, "text", fileId],
} as const
