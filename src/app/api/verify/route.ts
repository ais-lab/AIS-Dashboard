import { NextRequest, NextResponse } from "next/server"

import { adminAuth } from "@/lib/firebase/admin"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  if (!token) {
    console.log("No token")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(token)
  } catch (error) {
    console.log("Error verifying token", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json(
    { message: "Verified", userId: decoded.email, email: decoded.email },
    { status: 200 }
  )
}
