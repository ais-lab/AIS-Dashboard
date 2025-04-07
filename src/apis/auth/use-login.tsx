import { userKeys } from "@/constants/query-key-factory"
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query"
import { FirebaseError } from "firebase/app"
import { signInWithEmailAndPassword, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

import { auth, firestore } from "@/lib/firebase"
import { AppUser } from "@/types/models"

type LoginProps = {
  email: string
  password: string
}

const login = async ({ email, password }: LoginProps) => {
  const credentials = await signInWithEmailAndPassword(auth, email, password)
  const userRef = doc(firestore, "users", credentials.user.email!)
  const userDoc = (await getDoc(userRef)).data()
  const { balance = 0, ...user } = userDoc || {}
  return {
    id: credentials.user.email!,
    balance,
    ...user,
  } as AppUser
}

const useLogin = (
  options?: UseMutationOptions<AppUser, FirebaseError, LoginProps>
) => {
  const { onSuccess, onError, ...rest } = options ?? {}

  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context)
      queryClient.setQueryData(userKeys.details(data.id), data)
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context)
    },
    ...rest,
  })
}

export default useLogin
