import Link from "next/link"
import { footerRoutes } from "@/constants/routes"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  showLine?: boolean
}

const LandingFooter = ({ className, showLine = true }: Props) => {
  return (
    <footer className={cn("w-screen space-y-4 px-8 py-6", className)}>
      {showLine && <div className="border-t-[0.5px] border-white opacity-30" />}
      <div className="text-netral-550 flex flex-col items-start justify-between gap-4 text-sm sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default LandingFooter
