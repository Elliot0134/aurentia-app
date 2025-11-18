import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input dark:border-[#787b80] bg-white dark:bg-[#40444d] px-3 py-2 text-base text-[#2e333d] dark:text-[#f9f6f1] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#333333] dark:placeholder:text-[#94a3b8] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-0 hover:border-[#d1d5db] dark:hover:border-[#8a8d92] focus:border-[#9ca3af] dark:focus:border-[#ff592b] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
