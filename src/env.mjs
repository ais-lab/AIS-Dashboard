import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_ENV: z.enum(["staging", "production"]),
    NEXT_PUBLIC_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    DRIVE_PROJECT_ID: z.string().optional(),
    DRIVE_PRIVATE_KEY: z.string().optional(),
    DRIVE_CLIENT_EMAIL: z.string().optional(),
    DRIVE_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_DRIVE_FOLDER_ID: z.string(),
    NEXT_PUBLIC_WORKER_BASE_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "staging",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DRIVE_PROJECT_ID: process.env.DRIVE_PROJECT_ID || "",
    DRIVE_PRIVATE_KEY: process.env.DRIVE_PRIVATE_KEY || "",
    DRIVE_CLIENT_EMAIL: process.env.DRIVE_CLIENT_EMAIL || "",
    DRIVE_CLIENT_ID: process.env.DRIVE_CLIENT_ID || "",
    NEXT_PUBLIC_DRIVE_FOLDER_ID: process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || "",
    NEXT_PUBLIC_WORKER_BASE_URL: process.env.NEXT_PUBLIC_WORKER_BASE_URL || "",
  },
})
