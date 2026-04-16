import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-[#d9e2e8] bg-white/82 px-3 py-2 text-base text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-400 focus-visible:border-[#1bb8cf] focus-visible:ring-3 focus-visible:ring-[#1bb8cf]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
