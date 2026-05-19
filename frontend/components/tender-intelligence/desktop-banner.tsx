"use client"

import { useState, useEffect } from "react"
import { Monitor, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DesktopBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Check if already dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("ti-desktop-banner-dismissed")
    if (dismissed) setDismissed(true)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("ti-desktop-banner-dismissed", "true")
  }

  if (!isMobile || dismissed) return null

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 z-50 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Monitor className="w-4 h-4 shrink-0" />
          <p className="text-xs truncate">
            For the best experience, open on desktop
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-white/80 hover:text-white hover:bg-white/20"
          onClick={handleDismiss}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
