import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "AIS Board",
  author: "trong.duong",
  description: "",
  keywords: [],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "princ3od",
  },
  links: {
    github: "",
    facebook: "",
    messenger: "",
  },
  ogImage:"",
}