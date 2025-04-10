import Autoplay from "embla-carousel-autoplay"

import { env } from "@/env.mjs"
import { BaseDisplayItem } from "@/types/models"
import { duration } from "@/lib/utils/duration"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

interface Props {
  displayItems: BaseDisplayItem[]
}

const Slideshow = ({ displayItems }: Props) => {
  const images = displayItems.filter((item) => item.type === "image")
  return (
    <Carousel
      className="mx-auto h-[calc(100%)] w-full flex-1 overflow-hidden"
      opts={{
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: duration.seconds(15),
        }),
      ]}
    >
      <CarouselContent className="h-full">
        {images.map((item, index) => (
          <CarouselItem key={index} className="relative size-full pl-0">
            <img
              src={`${env.NEXT_PUBLIC_BASE_URL}/api/gdrive/img?fileId=${item.fileId}`}
              className="size-full object-contain"
            />
            <img
              src={`${env.NEXT_PUBLIC_BASE_URL}/api/gdrive/img?fileId=${item.fileId}`}
              className="absolute inset-0 -z-10 size-full object-cover blur-md"
            />
            <div className="absolute inset-0 -z-10 size-full bg-black opacity-60" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default Slideshow
