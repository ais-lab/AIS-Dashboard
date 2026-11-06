"use client"

import { QueryProvider } from "@/components/common/query-provider"

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryProvider>{children}</QueryProvider>
}
