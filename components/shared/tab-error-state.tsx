"use client"

import { WarningCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

interface TabErrorStateProps {
  onRetry?: () => void
}

export function TabErrorState({ onRetry }: TabErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <WarningCircle size={36} weight="duotone" className="text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-body font-medium text-foreground">
          Something went wrong
        </p>
        <p className="text-label text-muted-foreground">
          This section failed to load. Try refreshing the page.
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
