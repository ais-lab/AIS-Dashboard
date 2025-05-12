import Autoplay from "embla-carousel-autoplay"

import { env } from "@/env.mjs"
import { BaseDisplayItem, FolderItem } from "@/types/models"
import { cn } from "@/lib/utils"
import { duration } from "@/lib/utils/duration"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

import FolderDisplayItem from "./folder-display-item"
import TextDisplayItem from "./text-display-item"

interface Props {
  displayItems: BaseDisplayItem[]
}

const Slideshow = ({ displayItems }: Props) => {
  const items = displayItems

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
        {items.map((item, index) => {
          if (item.type === "image") {
            const isPreviousItemText =
              index > 0 && items[index - 1].type !== "image"

            return (
              <CarouselItem
                key={index}
                className={cn(
                  "relative size-full pl-0",
                  isPreviousItemText ? "ml-4" : "ml-0"
                )}
              >
                <img
                  src={`${env.NEXT_PUBLIC_BASE_URL}/api/gdrive/img?fileId=${item.id}`}
                  className="size-full object-contain"
                />
                <img
                  src={`${env.NEXT_PUBLIC_BASE_URL}/api/gdrive/img?fileId=${item.id}`}
                  className="absolute inset-0 -z-10 size-full object-cover blur-md"
                />
                <div className="absolute inset-0 -z-10 size-full bg-black opacity-60" />
              </CarouselItem>
            )
          } else if (item.type === "text") {
            return (
              <CarouselItem key={index} className="relative size-full">
                <TextDisplayItem displayItem={item} />
              </CarouselItem>
            )
          } else if (item.type === "folder") {
            return (
              <CarouselItem key={index} className="relative size-full">
                <FolderDisplayItem
                  items={(item as FolderItem).items}
                  folderName={item.name}
                />
              </CarouselItem>
            )
          }
        })}
      </CarouselContent>
    </Carousel>
  )
}

export default Slideshow
