"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full px-0.75 transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5.5 data-[size=default]:w-9.5 data-[size=sm]:h-4 data-[size=sm]:w-6.5 data-checked:bg-switch-track-on data-unchecked:bg-switch-track-off data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-2.5 data-checked:translate-x-full data-checked:bg-mint data-unchecked:translate-x-0 data-unchecked:bg-foreground-subtle"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
