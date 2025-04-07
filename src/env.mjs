import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_ENV: z.enum(["staging", "production"]),
    NEXT_PUBLIC_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
    ADMIN_PROJECT_ID: z.string().optional(),
    ADMIN_PRIVATE_KEY: z.string().optional(),
    ADMIN_CLIENT_EMAIL: z.string().optional(),
    NEXT_PUBLIC_WORKER_BASE_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "staging",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    ADMIN_PROJECT_ID: process.env.ADMIN_PROJECT_ID || '',
    ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY || '',
    ADMIN_CLIENT_EMAIL: process.env.ADMIN_CLIENT_EMAIL || '',
    NEXT_PUBLIC_WORKER_BASE_URL: process.env.NEXT_PUBLIC_WORKER_BASE_URL || '',
  },
})
