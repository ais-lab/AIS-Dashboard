"use client"

import { useEffect, useState } from "react"
import { random } from "lodash"
import SlotCounter from "react-slot-counter"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/common/icons"
import LoadingPage from "@/components/layouts/loading"

export default function MainPage({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    if (isLoading) return
    const targetDate = new Date("2025-08-01 04:00:00")
    const calculateTimeLeft = () => {
      const now = new Date()
      const distance = targetDate.getTime() - now.getTime()
      const totalSeconds = Math.floor(distance / 1000)
      const months = Math.floor(totalSeconds / (3600 * 24 * 30))
      const days = Math.floor((totalSeconds % (3600 * 24 * 30)) / (3600 * 24))
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = Math.floor(totalSeconds % 60)
      setTimeLeft({ months, days, hours, minutes, seconds })
    }
    calculateTimeLeft()
    const interval = setInterval(() => {
      const now = new Date()
      const distance = targetDate.getTime() - now.getTime()
      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      calculateTimeLeft()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isLoading])

  useEffect(() => {
    setTimeout(
      () => {
        setIsLoading(false)
      },
      random(500, 1500)
    )
  }, [])

  if (isLoading) return <LoadingPage />

  return (
    <div className="mx-auto h-screen w-screen text-9xl">
      <div className="flex size-full flex-col items-center justify-center gap-6">
        <h1 className="text-6xl">Conference IEEE</h1>
        <div></div>
        <div className="flex items-center justify-center gap-6">
          {Object.entries(timeLeft).map(([key, value]) => {
            if (key === "months" && value === 0) return null
            return (
              <>
                <div
                  key={key}
                  className="bento-bg flex flex-col items-center border-border text-center font-bold"
                >
                  <SlotCounter
                    value={value.toString().padStart(2, "0")}
                    startValue={0}
                    duration={0.5}
                    useMonospaceWidth
                    sequentialAnimationMode
                    startValueOnce
                  />
                  <span className="text-base font-bold text-muted-foreground">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </div>
                {key !== "seconds" && (
                  <div className="flex h-10 w-10 items-center justify-center text-8xl font-semibold">
                    :
                  </div>
                )}
              </>
            )
          })}
        </div>
      </div>
      <Button
        className="fixed bottom-4 right-4 z-50 opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
        onClick={async () => {
          console.log("fullscreen")
          console.log(document.fullscreenElement)
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen()
          } else if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }}
      >
        <Icons.fullScreen className="mr-2 size-4" />
        Fullscreen
      </Button>
    </div>
  )
}
