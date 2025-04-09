"use client"

import React from "react"
import { useDisplayItems } from "@/apis/gdrive/use-display-items"

import { siteConfig } from "@/config/site"
import { duration } from "@/lib/utils/duration"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/common/icons"
import LoadingPage from "@/components/layouts/loading"
import FullEventCountdown from "@/components/modules/dashboard/full-event-countdown"

export default function MainPage() {
  const { data: displayItems, isLoading: isDisplayItemsLoading } =
    useDisplayItems({
      refetchInterval: duration.seconds(30),
    })

  const firstEvent = displayItems?.find((item) => item.type === "event")

  if (isDisplayItemsLoading) return <LoadingPage />

  return (
    <div className="mx-auto flex h-screen w-screen flex-col">
      {firstEvent && <FullEventCountdown displayItem={firstEvent} />}
      <div className="flex items-end justify-center py-8">
        <Label className="text-center text-sm text-muted-foreground">
          {siteConfig.name} © {new Date().getFullYear()}
        </Label>
      </div>
      <Button
        className="fixed bottom-4 right-4 z-50 opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
        onClick={async () => {
          try {
            if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen()
            } else if (document.exitFullscreen) {
              await document.exitFullscreen()
            }
          } catch (err) {
            console.error("Fullscreen request/exit failed:", err)
          }
        }}
      >
        <Icons.fullScreen className="mr-2 size-4" />
        Fullscreen
      </Button>
    </div>
  )
}
