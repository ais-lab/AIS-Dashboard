import GlowingBG from "@assets/svgs/glowing-bg.svg"

import { cn } from "@/lib/utils"

interface Props {
  className?: string
}

const GlowingBackground = ({ className }: Props) => {
  return (
    <GlowingBG
      className={cn(
        "pointer-events-none fixed left-1/2 top-0 z-[-1] h-[30vw] min-h-[400px] w-[30vw] min-w-[400px] -translate-x-1/2 select-none",
        "delay-700 duration-2000 animate-in fade-in slide-in-from-left-1/2 fill-mode-backwards",
        className
      )}
    />
  )
}

export default GlowingBackground
