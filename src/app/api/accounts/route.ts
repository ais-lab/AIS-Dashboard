import { NextRequest, NextResponse } from "next/server"
import { firestoreCollection } from "@/constants/keys"
import { FieldValue } from "firebase-admin/firestore"

import { Account, RunDuration, runDurationLabels } from "@/types/models"
import { adminFirestore } from "@/lib/firebase/admin"

const prices = {
  "1-month": 4000,
  "3-month": 12000,
  "12-month": 30000,
  "36-month": 55000,
  forever: 100000,
} as Record<RunDuration, number>

export async function POST(request: NextRequest) {
  const { account, duration, nextRun } = await request.json()

  const email = request.headers.get("email")
  const userId = request.headers.get("userId")
  if (!email || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRef = adminFirestore.doc(`${firestoreCollection.users}/${userId}`)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { balance = 0, accounts = {} } = userDoc.data() || {}

  const requestPrice = prices[duration as RunDuration]
  if (balance < requestPrice) {
    return NextResponse.json({ message: "Số dư không đủ" }, { status: 400 })
  }

  const id = `${account}<>${email}`
  const accountRef = adminFirestore.doc(`${firestoreCollection.accounts}/${id}`)

  const isAccountExist = (await accountRef.get()).exists
  if (isAccountExist) {
    return NextResponse.json(
      { message: "Tài khoản đã tồn tại" },
      { status: 400 }
    )
  }

  const expiredAt =
    duration === "forever"
      ? new Date(4999, 1, 1).toISOString()
      : new Date(
          Date.now() + runDurationLabels[duration as RunDuration].timeLength
        ).toISOString()

  const accountBody = {
    status: "active",
    createdAt: new Date().toISOString(),
    nextRun,
    expiredAt,
    duration,
  }
  await accountRef.set(accountBody)
  await userRef.set(
    {
      accounts: {
        [account]: accountBody,
      },
      balance: FieldValue.increment(-requestPrice),
    },
    { merge: true }
  )
  return NextResponse.json(
    {
      message: "Tạo tài khoản thành công",
      user: {
        ...userDoc.data(),
        balance: balance - requestPrice,
        accounts: {
          ...accounts,
          [account]: accountBody,
        },
        id: email,
      },
    },
    { status: 200 }
  )
}

export async function DELETE(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account")
  const email = request.headers.get("email")

  const accountId = `${account}<>${email}`
  const accountRef = adminFirestore.doc(
    `${firestoreCollection.accounts}/${accountId}`
  )
  const accountDoc = await accountRef.get()
  if (!accountDoc.exists) {
    return NextResponse.json(
      { message: "Tài khoản không tồn tại" },
      { status: 400 }
    )
  }

  const { status } = accountDoc.data() as Account

  if (["pending", "running"].includes(status)) {
    return NextResponse.json(
      { message: "Không thể xóa tài khoản đang chạy. Vui lòng đợi tài khoản chạy xong" },
      { status: 400 }
    )
  }

  await accountRef.delete()
  const uerRef = adminFirestore.doc(`${firestoreCollection.users}/${email}`)
  const updatedAccounts = {
    accounts: {
      [`${account}`]: FieldValue.delete(),
    },
  }
  await uerRef.set(updatedAccounts, { merge: true })

  return NextResponse.json(
    { message: "Xóa tài khoản thành công" },
    { status: 200 }
  )
}

export async function PATCH(request: NextRequest) {
  const { account: accountStr, duration } = await request.json()

  const email = request.headers.get("email")
  const userId = request.headers.get("userId")
  if (!email || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRef = adminFirestore.doc(`${firestoreCollection.users}/${userId}`)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { balance = 0, accounts = {} } = userDoc.data() || {}

  const requestPrice = prices[duration as RunDuration]
  if (balance < requestPrice) {
    return NextResponse.json({ message: "Số dư không đủ" }, { status: 400 })
  }

  const id = `${accountStr}<>${email}`
  const accountRef = adminFirestore.doc(`${firestoreCollection.accounts}/${id}`)

  const accountDoc = await accountRef.get()
  if (!accountDoc.exists) {
    return NextResponse.json(
      { message: "Tài khoản không tồn tại" },
      { status: 400 }
    )
  }

  const account = accountDoc.data() as Account

  const currentDateTime = new Date().toISOString()
  const { expiredAt = currentDateTime } = account

  let newExpiredAt = expiredAt < currentDateTime ? currentDateTime : expiredAt

  if (duration === "forever") {
    newExpiredAt = new Date(4999, 1, 1).toISOString()
  } else {
    newExpiredAt = expiredAt < currentDateTime ? currentDateTime : expiredAt
    newExpiredAt = new Date(
      new Date(newExpiredAt).getTime() +
        runDurationLabels[duration as RunDuration].timeLength
    ).toISOString()
  }

  const accountBody = {
    ...account,
    expiredAt: newExpiredAt,
    duration,
  }

  await accountRef.set(accountBody)
  await userRef.set(
    {
      balance: FieldValue.increment(-requestPrice),
      accounts: {
        [accountStr]: accountBody,
      },
    },
    { merge: true }
  )

  return NextResponse.json(
    {
      message: "Gia hạn tài khoản thành công",
      user: {
        ...userDoc.data(),
        balance: balance - requestPrice,
        accounts: {
          ...accounts,
          [accountStr]: accountBody,
        },
        id: email,
      },
    },
    { status: 200 }
  )
}
