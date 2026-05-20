import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_ENV: z.enum(["staging", "production"]),
    NEXT_PUBLIC_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_DRIVE_FOLDER_ID: z.string(),
    NEXT_PUBLIC_GOOGLE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_BASE_PATH: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "staging",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
    NEXT_PUBLIC_DRIVE_FOLDER_ID: process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || "",
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "",
  },
})
