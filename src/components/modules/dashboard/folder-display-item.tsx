import { driveImageUrl } from "@/apis/gdrive/client"
import { BaseDisplayItem } from "@/types/models"
import { Badge } from "@/components/ui/badge"

import TextDisplayItem from "./text-display-item"

interface Props {
  items: BaseDisplayItem[]
  folderName?: string
}

const weightedRandom = (items: BaseDisplayItem[]): any => {
  const cumulativeWeights = items.reduce<number[]>((acc, item, index) => {
    acc.push((item.weight ?? 1) + (acc[index - 1] || 0))
    return acc
  }, [])

  const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1]

  return items[
    cumulativeWeights.findIndex((cumulativeWeight) => cumulativeWeight > random)
  ]
}

const FolderDisplayItem = ({ items, folderName }: Props) => {
  const selectedItem = weightedRandom(items)

  const badge = (
    <Badge className="absolute left-1/2 top-2 -translate-x-1/3 transform text-xs opacity-60">
      Folder: {folderName}
    </Badge>
  )

  if (!selectedItem) return null

  if (selectedItem.type === "text") {
    return (
      <>
        {badge}
        <TextDisplayItem displayItem={selectedItem} />
      </>
    )
  } else if (selectedItem.type === "image") {
    return (
      <>
        {badge}
        <img
          src={driveImageUrl(selectedItem.id)}
          className="ml-4 size-full object-contain"
        />
        <img
          src={driveImageUrl(selectedItem.id)}
          className="absolute inset-0 -z-10 ml-4 size-full object-cover blur-md"
        />
        <div className="absolute inset-0 -z-10 size-full bg-black opacity-60" />
      </>
    )
  }

  return null
}

export default FolderDisplayItem
