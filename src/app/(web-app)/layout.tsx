"use client"

import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { ReactQueryClientProvider } from "@/components/export/ReactQueryClientProvider"
import AuthContextProvider from "@/components/modules/auth/auth-context-provider"

import "react-photo-view/dist/react-photo-view.css"

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryClientProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
      <TooltipProvider>
        <AuthContextProvider>{children}</AuthContextProvider>
      </TooltipProvider>
    </ReactQueryClientProvider>
  )
}
