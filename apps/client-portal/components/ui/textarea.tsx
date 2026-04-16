import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-[#d9e2e8] bg-white/82 px-3 py-2 text-base text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-colors outline-none placeholder:text-slate-400 focus-visible:border-[#1bb8cf] focus-visible:ring-3 focus-visible:ring-[#1bb8cf]/20 disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
