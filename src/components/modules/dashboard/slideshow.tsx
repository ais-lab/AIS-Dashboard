import { useEffect, useState } from "react"
import type { EmblaCarouselType } from "embla-carousel"

import { driveImageUrl } from "@/apis/gdrive/client"
import { BaseDisplayItem, FolderItem } from "@/types/models"
import { cn } from "@/lib/utils"
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

const DEFAULT_SECONDS = 30

const Slideshow = ({ displayItems }: Props) => {
  const items = displayItems
  const [api, setApi] = useState<EmblaCarouselType | null>(null)

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
      className="mx-auto h-[calc(100%)] w-full flex-1 overflow-hidden"
      opts={{ loop: true }}
      setApi={(a) => setApi(a ?? null)}
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
