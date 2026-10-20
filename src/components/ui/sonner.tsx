import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

import { useTheme } from "@/contexts/ThemeContext"

const Toaster = ({ ...props }: ToasterProps) => {
  const { mode } = useTheme()

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-mint-ink" />
        ),
        info: (
          <InfoIcon className="size-4 text-muted-foreground" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-taupe" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans text-ui shadow-overlay!",
          description: "text-small text-muted-foreground!",
          actionButton:
            "rounded-full! bg-primary! px-3.5! text-small! font-medium! text-primary-foreground!",
          cancelButton: "rounded-full! bg-tag! text-small! text-muted-foreground!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
