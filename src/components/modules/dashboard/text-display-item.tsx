import { useTextItem } from "@/apis/gdrive/use-text-item"

import { BaseDisplayItem } from "@/types/models"
import { duration } from "@/lib/utils/duration"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

interface Props {
  displayItem: BaseDisplayItem
}

const TextDisplayItem = ({ displayItem }: Props) => {
  const { data: text, isLoading: isTextLoading } = useTextItem({
    displayItem,
    refetchInterval: duration.seconds(45),
  })

  if (isTextLoading)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <IosLoadingSpinner />
      </div>
    )

  return (
    <div className="flex h-full w-screen -translate-y-4 scale-95 transform items-center justify-center rounded border-2 border-dashed border-border bg-neutral-25 pl-0">
      <h1>{text}</h1>
    </div>
  )
}

export default TextDisplayItem
