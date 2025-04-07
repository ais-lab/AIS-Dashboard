import { cn } from "@/lib/utils"

import { Label } from "../ui/label"

interface Props {
  title: string
  children: React.ReactNode
  className?: string
}

const SheetField = ({ title, children, className }: Props) => {
  return (
    <div className={cn("space-y-0.5 text-sm", className)}>
      <Label className="text-muted-foreground">{title}</Label>
      {typeof children === "string" ? <p>{children}</p> : children}
    </div>
  )
}

export default SheetField
