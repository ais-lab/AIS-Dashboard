import { NextRequest, NextResponse } from "next/server"
import { firestoreCollection } from "@/constants/keys"
import { FieldValue } from "firebase-admin/firestore"

import { AppUser, RefCode } from "@/types/models"
import { adminFirestore } from "@/lib/firebase/admin"

interface SepayTransaction {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string | null
  content: string
  transferType: string
  transferAmount: number
  accumulated: number
  subAccount: string | null
  referenceCode: string
  description: string
}

const getSaleFactor = (amount: number) => {
  if (amount >= 5000000) return 1.5
  if (amount >= 3000000) return 1.4
  if (amount >= 200000) return 1.2
  if (amount >= 50000) return 1.1
  return 1
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("Authorization")
  if (
    !authorization ||
    !authorization.includes("@gheplienquan<>sepay<>thanhtoan@")
  ) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  const sepayTrans = (await request.json()) as SepayTransaction

  const paymentContent = sepayTrans.content
  const transferAmount = sepayTrans.transferAmount
  const saleFactor = getSaleFactor(transferAmount)
  const ammount = Math.floor(transferAmount * saleFactor)

  const paymentCode = paymentContent
    .match(/GS\w{6}/)?.[0]
    ?.toUpperCase()
    .slice(2)

  console.log("paymentCode", paymentCode)

  if (!paymentCode) {
    return NextResponse.json(
      { success: true, message: "No payment code" },
      { status: 200 }
    )
  }

  const userDocs = await adminFirestore
    .collection(firestoreCollection.users)
    .where("paymentCode", "==", paymentCode)
    .get()

  if (userDocs.empty) {
    return NextResponse.json(
      { success: true, message: "No user found" },
      { status: 200 }
    )
  }

  const userDoc = userDocs.docs[0]

  const user = {
    id: userDoc.id,
    ...userDoc.data(),
  } as AppUser

  const isTransactionExist =
    user.transactions && user.transactions.some((t) => t.id === sepayTrans.id)

  if (isTransactionExist) {
    return NextResponse.json({ sucess: true }, { status: 200 })
  }

  const transactionDate = new Date(
    new Date(sepayTrans.transactionDate).getTime() - 7 * 60 * 60 * 1000
  )

  const userRef = adminFirestore.doc(`${firestoreCollection.users}/${user.id}`)

  await userRef.set(
    {
      balance: FieldValue.increment(ammount),
      transactions: FieldValue.arrayUnion({
        id: sepayTrans.id,
        amount: transferAmount,
        note: saleFactor,
        createdAt: transactionDate.toISOString(),
        description: sepayTrans.description,
        status: "success",
      }),
    },
    { merge: true }
  )

  const { refCode } = user

  console.log("refCode", refCode)

  if (refCode) {
    const refCodeRef = adminFirestore.doc(
      `${firestoreCollection.refcodes}/${refCode}`
    )

    const refCodeFS = await refCodeRef.get()

    const refCodeData = refCodeFS.data() as RefCode

    if (refCodeFS.exists) {
      await refCodeRef.set(
        {
          balance: FieldValue.increment(transferAmount * refCodeData.comission),
          transactions: FieldValue.arrayUnion({
            id: sepayTrans.id,
            amount: transferAmount,
            createdAt: transactionDate.toISOString(),
            userId: user.id,
          }),
        },
        { merge: true }
      )
    }
  }

  return NextResponse.json(
    { success: true, message: "Transaction success" },
    { status: 200 }
  )
}
