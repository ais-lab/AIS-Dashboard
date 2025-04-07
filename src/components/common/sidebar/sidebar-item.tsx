import Link from "next/link"

import { cn } from "@/lib/utils"

interface Props {
  icon: React.ReactNode
  label: string
  path: string
  isActive?: boolean
  newTab?: boolean
}

const SidebarItem = ({ icon, label, path, isActive, newTab }: Props) => {
  return (
    <Link
      prefetch={false}
      href={path}
      target={newTab ? "_blank" : "_self"}
      className={cn(
        "group flex h-fit min-h-14 w-full items-center justify-start gap-2 px-4 py-2 text-left font-semibold text-muted-foreground transition-colors hover:bg-neutral-75 hover:text-primary",
        isActive && "bg-neutral-75 text-primary"
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
      <span
        className={cn(
          "text-sm text-foreground group-hover:text-primary",
          isActive && "text-primary"
        )}
      >
        {label}
      </span>
    </Link>
  )
}

export default SidebarItem
