import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none hover:shadow-sm transistion-all",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-neutral-800 disabled:bg-neutral-550 disabled:text-neutral-300 disabled:opacity-[80%]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#AC1017]  disabled:bg-neutral-550 disabled:text-neutral-300",
        outline:
          "border border-input bg-background hover:bg-neutral-50 hover:text-foreground disabled:bg-neutral-50 disabled:text-muted-foreground disabled:border-neutral-100",
        secondary:
          "bg-secondary hover:bg-secondary/80 disabled:text-neutral-300",
        ghost: "hover:bg-neutral-50",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-none",
        destructiveOutline:
          "border border-destructive bg-background hover:bg-neutral-700 text-destructive",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-5 rounded text-xs",
        sm: "h-9 rounded px-3",
        lg: "h-12 rounded px-6 text-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        <>
          {isLoading && (
            <Loader2
              className={cn("h-4 w-4 animate-spin", children && "mr-2")}
            />
          )}
          {children}
        </>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
