"use client"

import { SHOW_SIDEBAR } from "@/constants/keys"
import { useAuth } from "@/contexts/auth-context"
import useUIStore from "@/stores/ui-store"
import { useQueryClient } from "@tanstack/react-query"
import _values from "lodash/values"
import { AppProgressBar as ProgressBar } from "next-nprogress-bar"

import { cn } from "@/lib/utils"
import SideBar from "@/components/common/sidebar"
import LoadingPage from "@/components/layouts/loading"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { showSidebar } = useUIStore((state) => state)
  const { isInitialized, isLoggedIn } = useAuth()

  if (!isInitialized || !isLoggedIn) return <LoadingPage />

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <SideBar />
        <div
          className={cn(
            "ml-0 flex flex-1 flex-col bg-secondary",
            showSidebar ? "md:ml-[220px]" : ""
          )}
        >
          {children}
        </div>
      </div>

      <ProgressBar
        height="2px"
        color="#2baf6a"
        options={{ showSpinner: false }}
        shallowRouting={false}
      />
    </>
  )
}
