import MainApiPath from "@/constants/api-path"
import { userKeys } from "@/constants/query-key-factory"
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query"
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { AppUser } from "@/types/models"
import { auth, firestore } from "@/lib/firebase"

import { MainApiClient } from "../http-client"

type SignUpProps = {
  email: string
  password: string
  refcode?: string
  refcodeUrl?: string
}

const signUp = async ({
  email,
  password,
  refcode,
  refcodeUrl,
}: SignUpProps) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )
  const firebaseUser = userCredential.user

  const paymentCode = `${firebaseUser.uid.slice(-4).toUpperCase()}${Math.floor(
    Math.random() * 90 + 10
  )}`

  await firebaseUser.getIdToken(true)

  try {
    const newUserRef = doc(firestore, "users", firebaseUser.email!)
    await setDoc(
      newUserRef,
      {
        email: firebaseUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentCode,
      },
      { merge: true }
    )
    try {
      await MainApiClient.post(MainApiPath.users.signup(), {
        ...(refcodeUrl && { prefixUrl: refcodeUrl }),
      })
    } catch (error) {
      // Swallow error
    }

    if (refcode) {
      await MainApiClient.post(MainApiPath.users.refcode(), {
        prefixUrl: refcodeUrl,
        json: {
          refcode,
        },
      })
    }

    return {
      id: firebaseUser.email!,
      email: firebaseUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      balance: 0,
      accounts: {},
      transactions: [],
      paymentCode,
      orders: [],
    } as AppUser
  } catch (e) {
    await firebaseUser.delete()
    throw new Error("Failed to create user")
  }
}

type UseSignUpOptions = UseMutationOptions<
  AppUser,
  Error | FirebaseError,
  SignUpProps
>

const useSignUp = (options?: UseSignUpOptions) => {
  const { onSuccess, onError, ...rest } = options ?? {}
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signUp,
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context)
      // queryClient.in(userKeys.details(data.id), data)
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context)
    },
    ...rest,
  })
}

export default useSignUp
