"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { WifiSlash } from "@phosphor-icons/react"

export function NetworkStatusBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-600 shadow-lg backdrop-blur-md dark:bg-rose-950/40 dark:text-rose-400"
    >
      <WifiSlash size={16} className="animate-pulse shrink-0" />
      <span>Network connection lost. Operating in offline mode.</span>
    </div>
  )
}
