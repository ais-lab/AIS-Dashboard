import React, { useEffect, useRef, useState } from "react"
import { useCountDownEvent } from "@/apis/gdrive/use-countdown-event"
import SlotCounter from "react-slot-counter"

import { BaseDisplayItem } from "@/types/models"
import dayjsConfig from "@/config/dayjs"
import { duration } from "@/lib/utils/duration"
import { Icons } from "@/components/common/icons"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

interface Props {
  displayItem: BaseDisplayItem
}

const timeUnitMap: { [key: string]: string } = {
  months: "ヶ月",
  days: "日",
  hours: "時間",
  minutes: "分",
  seconds: "秒",
}

const FullEventCountdown = ({ displayItem }: Props) => {
  const { data: event, isLoading: isEventLoading } = useCountDownEvent({
    displayItem,
    refetchInterval: duration.seconds(40),
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

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 duration-300 animate-in fade-in">
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground">Upcoming / 予定</p>
        <h1 className="max-w-7xl text-7xl">{event?.name || "~"}</h1>
        <p className="flex items-center justify-center gap-2 text-neutral-700">
          <Icons.calendar className="inline-block size-4" />
          {dayjsConfig(event?.date).format("YYYY/MM/DD (dddd)")}
        </p>
      </div>
      <div className="flex items-center justify-center gap-6 text-9xl">
        {countdownEnded ? (
          <div className="text-4xl font-bold">Time is up! / 時間切れ!</div>
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
                  <span className="flex flex-col items-center text-base font-bold text-muted-foreground">
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span>{timeUnitMap[key] || key}</span>
                  </span>
                </div>
                {key !== "seconds" && (
                  <div className="flex h-10 w-10 items-center justify-center text-8xl font-semibold">
                    :
                  </div>
                )}
              </React.Fragment>
            )
          })
        )}
      </div>
      <p className="max-w-6xl text-balance text-center text-sm text-muted-foreground">
        {event?.description || "No description available / 説明はありません"}
      </p>
    </div>
  )
}

export default FullEventCountdown
