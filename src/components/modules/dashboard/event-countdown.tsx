import React, { useEffect, useRef, useState } from "react"
import { useCountDownEvent } from "@/apis/gdrive/use-countdown-event"
import SlotCounter from "react-slot-counter"

import { BaseDisplayItem } from "@/types/models"
import dayjsConfig from "@/config/dayjs"
import { cn } from "@/lib/utils"
import { duration } from "@/lib/utils/duration"
import { AnimatedHeight } from "@/components/common/animated-height"
import { Icons } from "@/components/common/icons"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

interface Props {
  displayItem: BaseDisplayItem
  type?: "fullscreen" | "normal"
}

const timeUnitMap: { [key: string]: string } = {
  months: "ヶ月",
  days: "日",
  hours: "時間",
  minutes: "分",
  seconds: "秒",
}

const EventCountdown = ({ displayItem, type = "fullscreen" }: Props) => {
  const { data: event, isLoading: isEventLoading } = useCountDownEvent({
    displayItem,
    refetchInterval: duration.seconds(45),
  })
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!event) return
    const targetDate = new Date(event.date)

    const calculateTimeLeft = () => {
      const now = new Date()
      const distance = targetDate.getTime() - now.getTime()

      if (distance < 0) {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }

      const totalSeconds = Math.floor(distance / 1000)
      let months = 0
      let days = Math.floor(totalSeconds / (3600 * 24))
      if (days > 99) {
        months = Math.floor(totalSeconds / (3600 * 24 * 30))
        days = Math.floor((totalSeconds % (3600 * 24 * 30)) / (3600 * 24))
      }
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = Math.floor(totalSeconds % 60)
      setTimeLeft({ months, days, hours, minutes, seconds })
    }

    const initialDistance = targetDate.getTime() - new Date().getTime()
    calculateTimeLeft()

    if (initialDistance >= 0) {
      intervalRef.current = setInterval(calculateTimeLeft, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [event])

  const countdownEnded =
    Object.values(timeLeft).every((v) => v === 0) && timeLeft.seconds === 0

  if (isEventLoading || !event)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <IosLoadingSpinner />
      </div>
    )

  const isFullscreen = type === "fullscreen"

  return (
    <AnimatedHeight>
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center pb-2 transition-all duration-300 animate-in fade-in",
          isFullscreen
            ? "h-screen gap-6 pb-12"
            : "h-[220px] flex-row justify-evenly gap-6 px-10"
        )}
      >
        <div
          className={cn(
            "text-center",
            isFullscreen ? "space-y-2" : "space-y-0.5"
          )}
        >
          <p
            className={cn(
              "text-muted-foreground",
              isFullscreen ? "text-base" : "text-sm"
            )}
          >
            Upcoming / 予定
          </p>
          <h1
            className={cn(
              "line-clamp-3 max-w-7xl",
              isFullscreen ? "text-7xl" : "text-4xl"
            )}
          >
            {event?.name || "~"}
          </h1>
          <p
            className={cn(
              "flex items-center justify-center gap-2 text-neutral-700",
              isFullscreen ? "text-base" : "text-sm"
            )}
          >
            <Icons.calendar className="inline-block size-4" />
            {dayjsConfig(event?.date).format("YYYY/MM/DD (ddd)")} /{" "}
            {dayjsConfig(event?.date)
              .locale("ja")
              .format("YYYY年MM月DD日（ddd)")}
          </p>
          <p
            className={cn(
              "flex items-center justify-center gap-1 text-neutral-700",
              isFullscreen ? "text-base" : "text-sm"
            )}
          >
            <Icons.mapPin className="inline-block size-4" />
            {event.address || "No address available / 住所はありません"}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center justify-center gap-6",
            isFullscreen ? "text-9xl" : "text-6xl"
          )}
        >
          {countdownEnded ? (
            <div className="font-bold">Time is up! / 時間切れ!</div>
          ) : (
            Object.entries(timeLeft).map(([key, value]) => {
              if (key === "months" && value === 0) return null

              return (
                <React.Fragment key={key}>
                  <div className="bento-bg flex flex-col items-center border-border text-center font-bold">
                    <SlotCounter
                      value={value.toString().padStart(2, "0")}
                      startValue={undefined}
                      duration={0.5}
                      useMonospaceWidth
                      sequentialAnimationMode
                      startValueOnce
                    />
                    <span
                      className={cn(
                        "flex flex-col items-center font-bold text-muted-foreground",
                        isFullscreen ? "text-base" : "text-xs"
                      )}
                    >
                      <span>
                        {key.charAt(0).toUpperCase() + key.slice(1)} /{" "}
                        {timeUnitMap[key] || key}
                      </span>
                    </span>
                  </div>
                  {key !== "seconds" && (
                    <div
                      className={cn(
                        "flex items-center justify-center font-semibold",
                        isFullscreen ? "size-10 text-8xl" : "text-4xl"
                      )}
                    >
                      :
                    </div>
                  )}
                </React.Fragment>
              )
            })
          )}
        </div>

        {isFullscreen && (
          <p className="max-w-6xl text-balance text-center text-xs text-muted-foreground">
            {event?.description ||
              "No description available / 説明はありません"}
          </p>
        )}
      </div>
    </AnimatedHeight>
  )
}

export default EventCountdown
