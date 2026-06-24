"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"

export function ContractSection({
  children,
  description,
  icon,
  title,
}: {
  children: React.ReactNode
  description?: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-lead font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-label text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function DataGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  )
}

export function DataPoint({
  helper,
  label,
  value,
}: {
  helper?: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-body leading-tight font-medium text-foreground">
        {value || "—"}
      </div>
      {helper ? (
        <p className="mt-1 text-label leading-snug text-faint">{helper}</p>
      ) : null}
    </div>
  )
}

export function TechnicalBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit rounded border border-border bg-background px-2 py-0.5 font-mono text-label tracking-widest text-faint uppercase">
      {children}
    </span>
  )
}

export function ScopeBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="outline" className="rounded-4xl">
      {children}
    </Badge>
  )
}
