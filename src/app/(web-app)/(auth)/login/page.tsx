import { Metadata } from "next"

import LoginForm from "@/components/modules/auth/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập",
}

export default function LoginPage() {
  return <LoginForm />
}
