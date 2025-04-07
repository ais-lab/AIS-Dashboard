import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const bearerToken = request.headers.get("Authorization")
  if (!bearerToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const token = bearerToken.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const verifyRes = await fetch(
    new URL(`/api/verify?token=${token}`, request.url),
    {
      method: "GET",
    }
  )

  if (!verifyRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const verifyResJson = await verifyRes.json()
  const headers = new Headers(request.headers)
  headers.set("userId", verifyResJson.userId)
  headers.set("email", verifyResJson.email)
  return NextResponse.next({ headers })
}

export const config = {
  matcher: [
    "/api/accounts",
    "/api/users/refcode",
    "/api/ghepvip",
    "/api/users/signup",
  ],
}
