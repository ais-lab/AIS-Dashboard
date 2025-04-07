import { Metadata } from "next"

import SignUpForm from "@/components/modules/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Đăng ký",
}

export default function SignUpPage() {
  return <SignUpForm />
}
