import { useTextItem } from "@/apis/gdrive/use-text-item"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkBreaks from "remark-breaks"

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
    <div className="flex h-full w-screen -translate-y-4 scale-95 transform flex-col items-center justify-center rounded border-2 border-dashed border-border bg-neutral-25 pl-0">
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkBreaks]}
        components={{
          h1({ children }) {
            return <h1>{children}</h1>
          },
          h2({ children }) {
            return <h2>{children}</h2>
          },
          h3({ children }) {
            return <h3>{children}</h3>
          },
          h4({ children }) {
            return <h4>{children}</h4>
          },
          p({ children }) {
            return <h1 className="leading-[68px]">{children}</h1>
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="my-0 border-collapse border border-black px-3 py-0 last:mb-2 dark:border-white">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="break-words border border-black bg-neutral-500 px-3 py-1 text-white dark:border-white">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="break-words border border-black px-3 py-1 dark:border-white">
                {children}
              </td>
            )
          },
          hr() {
            return <hr className="mb-4 mt-0 opacity-[0.9]" />
          },
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}

export default TextDisplayItem
