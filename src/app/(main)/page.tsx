"use client"

import React from "react"
import { useDisplayItems } from "@/apis/gdrive/use-display-items"
import AppIcon from "@assets/icon.png"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { duration } from "@/lib/utils/duration"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/common/icons"
import LoadingPage from "@/components/layouts/loading"
import EventCountdown from "@/components/modules/dashboard/event-countdown"
import Slideshow from "@/components/modules/dashboard/slideshow"

export default function MainPage() {
  const { data: displayItems, isLoading: isDisplayItemsLoading } =
    useDisplayItems({
      refetchInterval: duration.seconds(25),
    })

  const firstEvent = displayItems?.find((item) => item.type === "event")

  const slideShowItems = displayItems?.filter((item) => item.type !== "event")
  const hasSlideShowItems = slideShowItems && slideShowItems.length > 0

  const hasNothingToDisplay =
    !firstEvent && !hasSlideShowItems && !isDisplayItemsLoading

  if (isDisplayItemsLoading) return <LoadingPage />

  return (
    <div className="mx-auto flex h-screen w-screen flex-col">
      {hasNothingToDisplay && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 pb-8">
          <img
            className="w-40 rounded-md invert"
            src={AppIcon.src}
            alt="Logo"
          />
          <Label className="text-center text-6xl">Welcome to AIS Lab</Label>
        </div>
      )}
      {firstEvent ? (
        <EventCountdown
          displayItem={firstEvent}
          type={hasSlideShowItems ? "normal" : "fullscreen"}
        />
      ) : (
        <></>
      )}
      {hasSlideShowItems && (
        <div className="flex-1 overflow-hidden">
          <Slideshow displayItems={slideShowItems} />
        </div>
      )}
      <div className="fixed bottom-0 left-0 flex w-screen flex-col items-center justify-end gap-1 py-2">
        <img
          className={cn(
            "w-[72px] rounded-md",
            !hasSlideShowItems && "invert",
            hasNothingToDisplay && "hidden"
          )}
          src={AppIcon.src}
          alt="Logo"
        />
        <Label
          className={cn(
            "text-center text-xs",
            hasSlideShowItems && "text-white opacity-95",
            hasNothingToDisplay && "text-base"
          )}
        >
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
