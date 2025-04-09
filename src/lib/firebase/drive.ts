import { google } from "googleapis"

import { env } from "@/env.mjs"

export const googleapiAuth = new google.auth.GoogleAuth({
  scopes: "https://www.googleapis.com/auth/drive.readonly",
  projectId: env.DRIVE_PROJECT_ID,
  credentials: {
    client_id: env.DRIVE_CLIENT_ID,
    client_email: env.DRIVE_CLIENT_EMAIL,
    private_key: env.DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
})

export const googleDrive = google.drive({ version: "v3", auth: googleapiAuth })
