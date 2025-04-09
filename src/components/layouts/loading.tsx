import AppIcon from "@assets/icon.png"

export default function LoadingPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <img
        className="w-64 animate-pulse rounded-md invert"
        src={AppIcon.src}
        alt="Logo"
      />
    </div>
  )
}
