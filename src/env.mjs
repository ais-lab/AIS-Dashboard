import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_DRIVE_FOLDER_ID: z.string(),
    NEXT_PUBLIC_GOOGLE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_BASE_PATH: z.string().optional(),
    // Both optional: without them the board still works, but /upload and the
    // members panel in /admin stay off. See Admin setup in README.md.
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_DRIVE_FOLDER_ID: process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || "",
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  },
})
