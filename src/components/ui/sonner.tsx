"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useTheme as useCustomTheme } from "@/contexts/theme-context"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Try custom theme first, fallback to next-themes
  const customTheme = useCustomTheme?.()
  const nextTheme = useNextTheme?.()
  const theme = customTheme?.theme || nextTheme?.theme || "system"

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      richColors
      closeButton
      expand={true}
      gap={0}
      duration={10000}
      toastOptions={{
        duration: 10000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          closeButton: "group-[.toast]:bg-background group-[.toast]:border group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
