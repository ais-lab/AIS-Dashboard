"use client"

import { Button } from "@/components/ui/button"

const PageError = ({ reset }: { reset: () => void }) => (
  <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-5xl font-bold">Something went wrong / エラー</h1>
    <p className="max-w-lg text-muted-foreground">
      The board hit an error while loading. It will try again on the next
      refresh. /
      ボードの読み込み中にエラーが発生しました。次の更新で再試行します。
    </p>
    <Button onClick={reset}>Try again / 再試行</Button>
  </div>
)

export default PageError
