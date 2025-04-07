"use client"

import { useAuth } from "@/contexts/auth-context"

import AuthLayout from "@/components/layouts/auth-layout"
import LoadingPage from "@/components/layouts/loading"

export default function LoginSignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isInitialized, isLoggedIn } = useAuth()

  const loading = !isInitialized || isLoggedIn

  if (loading) return <LoadingPage />

  return <AuthLayout>{children}</AuthLayout>
}
