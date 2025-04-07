import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode
  trailing?: React.ReactNode
  wrapperClassName?: string
  leadingClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leading,
      trailing,
      wrapperClassName,
      leadingClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        {leading && (
          <div
            className={cn(
              "absolute left-3 top-0 flex h-10 items-center",
              leadingClassName
            )}
          >
            {leading}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-1 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-within:ring-destructive",
            leading ? "pl-8" : "",
            trailing ? "pr-8" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 top-0 flex h-10 items-center">
            {trailing}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
