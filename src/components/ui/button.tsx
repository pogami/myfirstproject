import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm sm:text-base font-semibold ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 sm:[&_svg]:size-5 [&_svg]:shrink-0 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg min-h-[44px] sm:min-h-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
        green: "bg-green-500 text-white hover:bg-green-600",
        amber: "bg-yellow-400 text-yellow-900",
      },
      size: {
        default: "h-11 sm:h-11 px-4 sm:px-6 py-2 min-h-[44px] sm:min-h-[44px]",
        sm: "h-10 sm:h-10 rounded-full px-3 sm:px-4 min-h-[44px] sm:min-h-[40px]",
        lg: "h-12 sm:h-12 rounded-full px-6 sm:px-10 text-base sm:text-lg min-h-[48px] sm:min-h-[48px]",
        icon: "h-11 w-11 sm:h-11 sm:w-11 min-h-[44px] min-w-[44px] sm:min-h-[44px] sm:min-w-[44px]",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
