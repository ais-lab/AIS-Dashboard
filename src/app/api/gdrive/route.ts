import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

import { env } from "@/env.mjs"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const folderId = params.get("folderId")

  if (!folderId) {
    return NextResponse.json(
      { error: "Folder ID is required" },
      { status: 400 }
    )
  }

  const auth = new google.auth.GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
    projectId: env.DRIVE_PROJECT_ID,
    credentials: {
      client_id: env.DRIVE_CLIENT_ID,
      client_email: env.DRIVE_CLIENT_EMAIL,
      private_key: env.DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  })

  const drive = google.drive({ version: "v3", auth })
  const response = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, mimeType, webViewLink)",
  })
  const files = response.data.files
  if (!files || files.length === 0) {
    return NextResponse.json({ files: [] })
  }

  return NextResponse.json({ files }, { status: 200 })
}
