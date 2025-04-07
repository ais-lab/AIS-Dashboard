import { NextRequest, NextResponse } from "next/server"
import { firestoreCollection } from "@/constants/keys"
import { FieldValue } from "firebase-admin/firestore"

import { RefCode } from "@/types/models"
import { adminFirestore } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  const { refcode } = await request.json()

  const email = request.headers.get("email")
  const userId = request.headers.get("userId")

  if (!email || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRef = adminFirestore.doc(`${firestoreCollection.users}/${userId}`)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { refCode = "" } = userDoc.data() || {}

  if (refCode) {
    return NextResponse.json(
      { message: "Bạn đã nhập mã giới thiệu" },
      { status: 400 }
    )
  }

  const refCodeRef = adminFirestore.doc(
    `${firestoreCollection.refcodes}/${refcode}`
  )
  const refCodeDoc = await refCodeRef.get()

  if (!refCodeDoc.exists) {
    return NextResponse.json(
      { message: "Mã giới thiệu không tồn tại" },
      { status: 400 }
    )
  }

  const refCodeData = refCodeDoc.data() as RefCode

  await userRef.update({
    refCode: refcode,
    balance: FieldValue.increment(refCodeData.reward),
  })

  await refCodeRef.update({
    usedBy: FieldValue.arrayUnion(userId),
  })

  return NextResponse.json({ message: "Nhập mã giới thiệu thành công" })
}
