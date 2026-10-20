import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-field border border-input bg-field px-3.5 py-3 text-body-lg text-foreground transition-colors outline-none placeholder:text-foreground-subtle focus-visible:border-mint/50 focus-visible:ring-3 focus-visible:ring-mint/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
