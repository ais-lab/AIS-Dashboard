"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useDisplayItems } from "@/apis/gdrive/use-display-items"
import AppIcon from "@assets/icon.png"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { duration } from "@/lib/utils/duration"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/common/icons"
import LoadingPage from "@/components/layouts/loading"
import EventSlideShow from "@/components/modules/dashboard/event-slideshow"
import Slideshow from "@/components/modules/dashboard/slideshow"
import WeatherBadge from "@/components/modules/dashboard/weather-badge"

const formatAgo = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

export default function MainPage() {
  const {
    data: displayItems,
    isLoading: isDisplayItemsLoading,
    error,
    dataUpdatedAt,
    failureCount,
  } = useDisplayItems({
    refetchInterval: duration.seconds(30),
    retry: 2,
  })

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!error) return
    const id = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(id)
  }, [error])
  const lastSuccessAgo = dataUpdatedAt ? formatAgo(now - dataUpdatedAt) : null

  useEffect(() => {
    const TWELVE_HOURS = 12 * 60 * 60 * 1000
    const id = setTimeout(() => window.location.reload(), TWELVE_HOURS)
    return () => clearTimeout(id)
  }, [])

  const events = displayItems?.filter((item) => item.type === "event")
  const hasEvents = events && events.length > 0

  const slideShowItems = displayItems?.filter((item) => item.type !== "event")
  const hasSlideShowItems = slideShowItems && slideShowItems.length > 0

  const hasNothingToDisplay =
    !hasEvents && !hasSlideShowItems && !isDisplayItemsLoading

  if (isDisplayItemsLoading) return <LoadingPage />

  return (
    <div className="mx-auto flex h-screen w-screen flex-col">
      <WeatherBadge latitude={34.8} longitude={135.56} />
      {error && (
        <div className="fixed left-1/2 top-12 z-20 -translate-x-1/2 rounded-md border border-destructive/40 bg-destructive/90 px-4 py-2 text-center text-xs text-destructive-foreground shadow-lg backdrop-blur">
          Can&rsquo;t reach Drive (retry {failureCount})
          {lastSuccessAgo && ` · last success ${lastSuccessAgo} ago`} / Driveに
          接続できません{lastSuccessAgo && ` · 最終取得 ${lastSuccessAgo}前`}
        </div>
      )}
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
      {hasEvents ? (
        <EventSlideShow
          displayItems={events}
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

      <div className="fixed bottom-4 left-4 z-50 flex gap-2 opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100">
        <Link href="/tour/">
          <Button variant="outline" size="sm">
            Tour
          </Button>
        </Link>
        <Link href="/tutorial/">
          <Button variant="outline" size="sm">
            Filename guide
          </Button>
        </Link>
        <Link href="/admin/">
          <Button variant="outline" size="sm">
            Admin
          </Button>
        </Link>
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
