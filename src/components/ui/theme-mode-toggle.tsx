"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import SunIcon from "@/components/icons/SunIcon"
import MoonIcon from "@/components/icons/MoonIcon"

export function ThemeModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="w-[72px] h-9" aria-hidden="true" />
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggleTheme()
        }
      }}
      className="relative w-[44px] h-6 rounded-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={isDark ? "Zu hellem Modus wechseln" : "Zu dunklem Modus wechseln"}
      role="switch"
      aria-checked={isDark}
    >
      {/* Background Images */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-100"
        )}
        style={{ backgroundImage: "url('/images/theme-toggle-light.png')" }}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-opacity duration-300",
          isDark ? "opacity-100" : "opacity-0"
        )}
        style={{ backgroundImage: "url('/images/theme-toggle-dark.png')" }}
        aria-hidden="true"
      />

      {/* Icons Container */}
      <div className="relative h-full flex items-center justify-between p-0.5">
        {/* Sun Icon - Left side */}
        <div className={cn(
          "flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
          isDark
            ? "w-3 h-2.5 bg-transparent"
            : "w-6 h-5 bg-bw"
        )}>
          <SunIcon
            className={cn(
              "transition-all duration-300 ease-in-out",
              isDark
                ? "w-2.5 h-2.5 opacity-20"
                : "w-6 h-6 opacity-100"
            )}
          />
        </div>

        {/* Moon Icon - Right side */}
        <div className={cn(
          "flex items-center justify-center rounded-full transition-all duration-300 ease-in-out",
          isDark
            ? "w-6 h-5 bg-bw-opacity-60"
            : "w-3 h-2.5 bg-transparent"
        )}>
          <MoonIcon
            className={cn(
              "transition-all duration-300 ease-in-out",
              isDark
                ? "w-5 h-5 opacity-100"
                : "w-2.5 h-2.5 opacity-20"
            )}
          />
        </div>
      </div>
    </button>
  )
}
