import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[14px] border border-[rgba(216,191,227,0.22)] bg-white/[0.04] px-4 py-2 text-[15px] text-[#f3eefa] transition-all placeholder:text-[rgba(231,218,237,0.4)] focus-visible:border-[rgba(179,132,201,0.55)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(179,132,201,0.15)] disabled:cursor-not-allowed disabled:opacity-50",
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
