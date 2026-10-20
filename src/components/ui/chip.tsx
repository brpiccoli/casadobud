import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex shrink-0 items-center rounded-full border whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      size: {
        default: "h-8.5 gap-1.75 px-3.75 text-ui-sm",
        sm: "h-8 gap-1.5 px-3.25 text-small",
      },
      selected: {
        true: "border-mint/50 bg-mint/8 text-mint-ink",
        false:
          "border-border bg-chip text-muted-foreground hover:border-border-strong hover:text-foreground aria-expanded:border-border-strong aria-expanded:text-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      selected: false,
    },
  }
)

function Chip({
  className,
  size,
  selected = false,
  asChild = false,
  type = "button",
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof chipVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="chip"
      data-selected={selected ? "true" : undefined}
      type={asChild ? undefined : type}
      className={cn(chipVariants({ size, selected }), className)}
      {...props}
    />
  )
}

export { Chip }
