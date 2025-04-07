"use client"

import AuthLayout from "@/components/layouts/auth-layout"

export default function ExternalAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
