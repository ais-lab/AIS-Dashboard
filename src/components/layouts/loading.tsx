import { Icons } from "@/components/common/icons"

export default function LoadingPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Icons.appIcon className="animate-pulse size-20 lg:size-28 rounded-md" />
    </div>
  )
}

