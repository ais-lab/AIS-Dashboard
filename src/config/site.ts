import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "AIS Board",
  author: "AIS Lab",
  description: "",
  keywords: [],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "ais-lab",
  },
  links: {
    github: "https://github.com/ais-lab/AIS-Dashboard",
    facebook: "",
    messenger: "",
  },
  ogImage: "",
}