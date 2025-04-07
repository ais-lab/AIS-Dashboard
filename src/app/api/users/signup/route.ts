import { NextRequest, NextResponse } from "next/server"
import { firestoreCollection } from "@/constants/keys"
import { FieldValue } from "firebase-admin/firestore"

import { RefCode } from "@/types/models"
import { adminFirestore } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  const email = request.headers.get("email")
  const userId = request.headers.get("userId")

  try {
    const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(
      ","
    )[0]
    console.log("IP:", ip)
    const ipRef = adminFirestore.doc(`${firestoreCollection.ips}/${ip}`)
    const ipDoc = await ipRef.get()
    if (!ipDoc.exists) {
      await ipRef.set({
        createdAt: new Date().toISOString(),
      })
    } else {
      const { createdAt } = ipDoc.data() as { createdAt: string }
      if (
        new Date().getTime() - new Date(createdAt).getTime() <
        48 * 60 * 60 * 1000
      ) {
        console.log("Detected abuse from IP:", ip, "user:", userId)
        await ipRef.update({
          abuse: FieldValue.increment(1),
        })
        return NextResponse.json(
          {
            message: "",
          },
          { status: 400 }
        )
      } else {
        await ipRef.update({
          createdAt: new Date().toISOString(),
          signups: FieldValue.increment(1),
        })
      }
    }
  } catch (error) {
    console.error(error)
  }

  if (!email || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRef = adminFirestore.doc(`${firestoreCollection.users}/${userId}`)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { balance = 0, createdAt } = userDoc.data() || {}

  const isCreatedInLast10minutes =
    new Date().getTime() - new Date(createdAt).getTime() < 10 * 60 * 1000

  if (balance > 0 || !isCreatedInLast10minutes) {
    return NextResponse.json(
      {
        message:
          "Tài khoản không đủ điều kiện để nhận khuyến mãi tạo tài khoản",
      },
      { status: 400 }
    )
  }

  await userRef.update({
    balance: FieldValue.increment(10000),
  })

  return NextResponse.json({ message: "Nhận khuyến mãi thành công" })
}
