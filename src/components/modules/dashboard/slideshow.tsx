import { useEffect } from "react"
import Autoplay from "embla-carousel-autoplay"

import { driveImageUrl } from "@/apis/gdrive/client"
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

  useEffect(() => {
    const urls = items
      .filter((i) => i.type === "image")
      .map((i) => driveImageUrl(i.id))
    const cache: HTMLImageElement[] = []
    for (const url of urls) {
      const img = new Image()
      img.src = url
      cache.push(img)
    }
    return () => {
      cache.length = 0
    }
  }, [items])

  return (
    <Carousel
      className="mx-auto h-[calc(100%)] w-full flex-1 overflow-hidden"
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
                  src={driveImageUrl(item.id)}
                  className="size-full object-contain"
                />
                <img
                  src={driveImageUrl(item.id)}
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
