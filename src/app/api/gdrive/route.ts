import { NextRequest, NextResponse } from "next/server"

import { googleDrive } from "@/lib/firebase/drive"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const folderId = params.get("folderId")

  if (!folderId) {
    return NextResponse.json(
      { error: "Folder ID is required" },
      { status: 400 }
    )
  }
  const response = await googleDrive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name, mimeType)",
  })
  const files = response.data.files
  if (!files || files.length === 0) {
    return NextResponse.json({ files: [] })
  }

  return NextResponse.json({ files }, { status: 200 })
}
