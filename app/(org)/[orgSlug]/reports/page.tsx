"use client"

import { ChartBar } from "@phosphor-icons/react"

export default function OrgReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-0.5 text-body">
          Financial and benefit reports for your organisation.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] text-center rounded-lg border border-dashed border-border bg-muted/30">
        <ChartBar size={40} weight="light" className="text-muted-foreground mb-3" />
        <p className="text-heading font-semibold text-foreground">Coming Soon</p>
        <p className="text-body text-subtle mt-1 max-w-sm">
          Reporting dashboards are currently in development.
        </p>
      </div>
    </div>
  )
}
