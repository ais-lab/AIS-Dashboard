import { useEffect, useState } from "react"
import type { EmblaCarouselType } from "embla-carousel"

import { BaseDisplayItem } from "@/types/models"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

import EventCountdown from "./event-countdown"

interface Props {
  displayItems: BaseDisplayItem[]
  type?: "fullscreen" | "normal"
}

const DEFAULT_SECONDS = 35

const EventSlideShow = ({ displayItems, type = "fullscreen" }: Props) => {
  const items = displayItems.filter((item) => item.type === "event")
  const [api, setApi] = useState<EmblaCarouselType | null>(null)

  useEffect(() => {
    if (!api || items.length === 0) return
    let timeout: ReturnType<typeof setTimeout> | null = null

    const schedule = () => {
      if (timeout) clearTimeout(timeout)
      const idx = api.selectedScrollSnap()
      const current = items[idx]
      const seconds = current?.displaySeconds ?? DEFAULT_SECONDS
      timeout = setTimeout(() => api.scrollNext(), seconds * 1000)
    }

    schedule()
    api.on("select", schedule)
    return () => {
      api.off("select", schedule)
      if (timeout) clearTimeout(timeout)
    }
  }, [api, items])

  return (
    <Carousel
      className={cn(
        "mx-auto w-full flex-1 overflow-hidden",
        type === "fullscreen" ? "h-screen" : "max-h-[180px]"
      )}
      opts={{ loop: true }}
      setApi={(a) => setApi(a ?? null)}
    >
      <CarouselContent className="h-full">
        {items.map((item, index) => {
          return (
            <CarouselItem key={index} className="relative size-full">
              <EventCountdown key={index} displayItem={item} type={type} />
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}

export default EventSlideShow
