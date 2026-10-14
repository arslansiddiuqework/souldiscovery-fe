import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(217,140,180,0.55)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#B74783] text-white shadow-[0_8px_24px_rgba(183,71,131,0.28)] hover:-translate-y-px hover:bg-[#9F376F] hover:shadow-[0_12px_32px_rgba(123,57,98,0.12)] active:bg-[#872B5D]",
        destructive:
          "bg-[#B4233D] text-white hover:brightness-110",
        outline:
          "border border-[#EADCE5] bg-white text-[#49263D] font-semibold hover:bg-[#FFF0F6]",
        secondary:
          "border border-[#EADCE5] bg-white text-[#49263D] font-semibold hover:bg-[#FFF0F6]",
        ghost:
          "text-[#795A70] font-semibold hover:bg-[#FFF0F6] hover:text-[#49263D]",
        link: "text-[#9F376F] font-semibold underline-offset-4 hover:underline",
        success:
          "bg-[#287D58] text-white hover:brightness-110",
        light:
          "bg-white text-[#49263D] border border-[#EADCE5] shadow-[0_8px_28px_rgba(123,57,98,0.07)] hover:bg-[#FFF0F6]",
        glass:
          "border border-[#EADCE5] bg-white/90 text-[#49263D] font-semibold backdrop-blur-xl hover:bg-[#FFF0F6]",
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
