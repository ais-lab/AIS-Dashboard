import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { FirebaseError } from "firebase/app"
import { sendPasswordResetEmail } from "firebase/auth"

import { auth } from "@/lib/firebase"

type SendResetPasswordEmailProps = {
  email: string
}

const sendResetPasswordEmail = async ({
  email,
}: SendResetPasswordEmailProps) => {
  await sendPasswordResetEmail(auth, email)
}

const useResetPassword = (
  options?: Omit<
    UseMutationOptions<void, FirebaseError, SendResetPasswordEmailProps>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: sendResetPasswordEmail,
    ...options,
  })
}

export default useResetPassword
