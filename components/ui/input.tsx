import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[14px] border border-[#DFC7D6] bg-white px-4 py-2 text-[15px] text-[#49263D] transition-all placeholder:text-[#927C8B] focus-visible:border-[#B74783] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(217,140,180,0.35)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
