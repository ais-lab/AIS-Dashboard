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