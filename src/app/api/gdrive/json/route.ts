import { NextRequest, NextResponse } from "next/server"
import { GaxiosError } from "gaxios"

import { googleDrive } from "@/lib/firebase/drive"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const fileId = params.get("fileId")

  if (!fileId) {
    return NextResponse.json(
      { error: "File ID ('fileId') query parameter is required" },
      { status: 400 }
    )
  }

  try {
    const response = await googleDrive.files.get({
      fileId: fileId,
      alt: "media",
    })

    return NextResponse.json(response.data)
  } catch (error: unknown) {
    console.error("Error fetching file from Google Drive:", error)

    let errorMessage = "Failed to fetch file from Google Drive"
    let statusCode = 500

    if (error instanceof GaxiosError) {
      if (error.response?.status === 404) {
        errorMessage = "File not found on Google Drive"
        statusCode = 404
      } else if (error.response?.status === 403) {
        errorMessage =
          "Permission denied. Check if the Service Account has access to this file."
        statusCode = 403
      } else if (error.response?.status === 401) {
        errorMessage =
          "Authentication failed. Check Service Account credentials or API configuration."
        statusCode = 401
      } else if (error.message?.includes("invalid_grant")) {
        errorMessage =
          "Authentication error (invalid grant). Check Service Account key or permissions."
        statusCode = 401
      } else {
        errorMessage = `Google Drive API error: ${error.message}`
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: statusCode }
    )
  }
}
