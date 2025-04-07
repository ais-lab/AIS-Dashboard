import { NextRequest, NextResponse } from "next/server"
import { firestoreCollection } from "@/constants/keys"
import { waitUntil } from "@vercel/functions"
import { FieldValue } from "firebase-admin/firestore"

import { env } from "@/env.mjs"
import { adminFirestore } from "@/lib/firebase/admin"
import { cleanObject } from "@/lib/utils"

export const maxDuration = 60

const addNewOrder = async (data: any) => {
  const { userId, password, ...body } = cleanObject<any>(data, true)

  const orderRef = adminFirestore.collection(firestoreCollection.orders)

  const result = await orderRef.add({
    userId,
    ...body,
    password: password || "",
    createdAt: new Date().toISOString(),
  })

  const userRef = adminFirestore
    .collection(firestoreCollection.users)
    .doc(userId)

  await userRef.set(
    {
      orders: FieldValue.arrayUnion({
        ...body,
        id: result.id,
        userId,
        createdAt: new Date().toISOString(),
      }),
    },
    { merge: true }
  )
}
export async function POST(request: NextRequest) {
  const userId = request.headers.get("userId")
  const body = await request.json()

  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const data = {
    userId,
    ...body,
  }

  const result = await fetch(`${env.NEXT_PUBLIC_WORKER_BASE_URL}/ghepvip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!result.ok) {
    const { error } = await result.json()
    waitUntil(
      addNewOrder({
        ...data,
        status: "failed",
        error,
      })
    )
    return NextResponse.json({ error }, { status: 400 })
  }

  const response = await result.json()

  waitUntil(
    addNewOrder({
      ...data,
      ...response,
      status: "success",
    })
  )

  return NextResponse.json(response, { status: 200 })
}
