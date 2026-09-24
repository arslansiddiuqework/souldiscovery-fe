import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(179,132,201,0.45)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-[#1c1033] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px] hover:-translate-y-px hover:shadow-[rgba(255,255,255,0.75)_0px_1px_0px_0px_inset,rgba(179,132,201,0.5)_0px_14px_36px_0px]",
        destructive:
          "bg-[#F87171] text-white hover:brightness-110",
        outline:
          "border border-[rgba(216,191,227,0.22)] bg-white/[0.05] text-[#f3eefa] font-semibold hover:bg-white/[0.08]",
        secondary:
          "border border-[rgba(216,191,227,0.18)] bg-white/[0.04] text-[#f3eefa] font-semibold hover:bg-white/[0.07]",
        ghost:
          "text-[rgba(231,218,237,0.82)] font-semibold hover:bg-white/[0.06] hover:text-[#f3eefa]",
        link: "text-[#d8bfe3] font-semibold underline-offset-4 hover:underline",
        success:
          "bg-[#4ADE80] text-[#052e16] hover:brightness-110",
        light:
          "bg-white text-[#1c1033] shadow-[rgba(255,255,255,0.7)_0px_1px_0px_0px_inset,rgba(179,132,201,0.35)_0px_10px_30px_0px]",
        glass:
          "border border-[rgba(216,191,227,0.22)] bg-white/[0.05] text-[#f3eefa] font-semibold backdrop-blur-xl hover:bg-white/[0.08]",
      },
      size: {
        default: "h-[46px] px-5 py-2.5",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-[58px] px-8 text-[18px]",
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
