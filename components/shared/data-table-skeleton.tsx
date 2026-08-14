"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface DataTableSkeletonProps {
  rowCount?: number
  columnCount?: number
  showHeader?: boolean
}

export function DataTableSkeleton({
  rowCount = 5,
  columnCount = 5,
  showHeader = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      {showHeader && (
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-border/60">
        <div className="flex items-center gap-4 bg-muted/40 px-4 py-3 border-b border-border/60">
          {Array.from({ length: columnCount }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1 rounded" />
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: rowCount }).map((_, r) => (
            <div key={`row-${r}`} className="flex items-center gap-4 px-4 py-3.5">
              {Array.from({ length: columnCount }).map((_, c) => (
                <Skeleton
                  key={`cell-${r}-${c}`}
                  className="h-4 flex-1 rounded opacity-80"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
