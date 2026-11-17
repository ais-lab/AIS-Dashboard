import { useEffect, useState } from "react"
import type { EmblaCarouselType } from "embla-carousel"

import { BaseDisplayItem } from "@/types/models"
import { cn } from "@/lib/utils"
import { advanceOnTimer, useStableItems } from "@/lib/utils/carousel-timer"
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
  const { itemsKey, itemsRef } = useStableItems(items)

  useEffect(
    () => advanceOnTimer(api, itemsRef, DEFAULT_SECONDS),
    [api, itemsKey, itemsRef]
  )

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
