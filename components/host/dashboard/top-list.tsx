"use client"

import { useState } from "react"
import { FormSelect } from "@/components/shared/form-select"

interface TopListItem {
  id: string
  rank: number
  name: string
  metric1: string | number
  metric2: string | number
}

interface TopListProps {
  title: string
  type: "org" | "sp"
  data: TopListItem[]
}

export function TopList({ title, type, data }: TopListProps) {
  const [sortBy, setSortBy] = useState(type === "org" ? "amount" : "amount")
  const m1Label = type === "org" 
    ? (sortBy === "amount" ? "Volume" : sortBy === "checkin" ? "Check-ins" : "Members") 
    : (sortBy === "amount" ? "Claims" : sortBy === "commission" ? "Commission" : "Claims")
  const m2Label = type === "org" ? "Util" : "Rating"

  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-2">
        <h2 className="text-body font-medium text-foreground tracking-tight">{title}</h2>
        <FormSelect
          value={sortBy}
          onChange={(v) => setSortBy(v)}
          options={type === "org" ? [
            { label: "Amount (RM)", value: "amount" },
            { label: "Check-ins", value: "checkin" },
            { label: "Members", value: "members" },
          ] : [
            { label: "Amount (RM)", value: "amount" },
            { label: "Commission", value: "commission" },
            { label: "Rating", value: "rating" },
          ]}
          size="xs"
          triggerClassName="shrink-0 w-auto"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 -mx-5 px-5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-label font-semibold text-faint w-12">Rank</th>
              <th className="pb-2 text-label font-semibold text-faint">Name</th>
              <th className="pb-2 text-label font-semibold text-faint text-right">{m1Label}</th>
              <th className="pb-2 text-label font-semibold text-faint text-right">{m2Label}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="group border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 text-label text-subtle font-mono">
                  {item.rank.toString().padStart(2, '0')}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-label font-medium text-muted-foreground shrink-0">
                      {item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-body font-medium text-foreground truncate max-w-[120px]">{item.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-body text-right text-foreground tabular-nums">{item.metric1}</td>
                <td className="py-2.5 text-label font-medium text-right text-muted-foreground">
                  {type === "org" ? (
                    <span className="inline-flex py-0.5 px-1.5 bg-muted/50 rounded text-subtle text-label">{item.metric2}</span>
                  ) : (
                    <span>★ {item.metric2}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
