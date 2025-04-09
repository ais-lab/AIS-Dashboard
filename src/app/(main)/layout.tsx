"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { env } from "@/env.mjs"
import { ReactQueryClientProvider } from "@/components/export/ReactQueryClientProvider"

const ReactQueryDevtoolsProduction = dynamic(
  () =>
    import("@tanstack/react-query-devtools/production").then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false }
)

export default function WebAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showDevtools, setShowDevtools] = useState(
    env.NEXT_PUBLIC_ENV === "staging"
  )

  useEffect(() => {
    if (env.NEXT_PUBLIC_ENV !== "staging") return
    // @ts-ignore
    window._toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])
  return (
    <ReactQueryClientProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" /> */}
      {showDevtools && (
        <ReactQueryDevtoolsProduction
          initialIsOpen={false}
          buttonPosition="top-right"
        />
      )}
      {children}
    </ReactQueryClientProvider>
  )
}
