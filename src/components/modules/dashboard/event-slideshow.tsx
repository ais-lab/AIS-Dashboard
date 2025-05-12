import { it } from "node:test"
import Autoplay from "embla-carousel-autoplay"

import { env } from "@/env.mjs"
import { BaseDisplayItem } from "@/types/models"
import { cn } from "@/lib/utils"
import { duration } from "@/lib/utils/duration"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

import EventCountdown from "./event-countdown"
import TextDisplayItem from "./text-display-item"

interface Props {
  displayItems: BaseDisplayItem[]
  type?: "fullscreen" | "normal"
}

const EventSlideShow = ({ displayItems, type = "fullscreen" }: Props) => {
  const items = displayItems.filter((item) => item.type === "event")

  return (
    <Carousel
      className={cn(
        "mx-auto w-full flex-1 overflow-hidden",
        type === "fullscreen" ? "h-screen" : "max-h-[220px]"
      )}
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: duration.seconds(30),
        }),
      ]}
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
