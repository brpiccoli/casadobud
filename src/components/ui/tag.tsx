import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.25 text-micro whitespace-nowrap uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-tag text-muted-foreground",
        accent: "bg-mint/12 text-mint-ink",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Tag({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return <span data-slot="tag" className={cn(tagVariants({ tone }), className)} {...props} />
}

export { Tag }
