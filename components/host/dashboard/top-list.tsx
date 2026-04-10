"use client"

import { Star } from "@phosphor-icons/react"
import { useState } from "react"
import { cn } from "@/lib/utils"

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
        <h2 className="text-nav font-semibold text-foreground tracking-tight">{title}</h2>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-2 py-1 bg-muted/50 border border-border hover:bg-muted/80 rounded text-caption font-medium text-foreground outline-none cursor-pointer shrink-0 transition-colors"
        >
          {type === "org" ? (
            <>
              <option value="amount">Amount (RM)</option>
              <option value="checkin">Check-ins</option>
              <option value="members">Members</option>
            </>
          ) : (
            <>
              <option value="amount">Claims (RM)</option>
              <option value="commission">Commission (RM)</option>
              <option value="rating">Rating</option>
            </>
          )}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 -mx-5 px-5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-caption font-semibold text-muted-foreground/60 tracking-tight w-12">Rank</th>
              <th className="pb-2 text-caption font-semibold text-muted-foreground/60 tracking-tight">Name</th>
              <th className="pb-2 text-caption font-semibold text-muted-foreground/60 tracking-tight text-right">{m1Label}</th>
              <th className="pb-2 text-caption font-semibold text-muted-foreground/60 tracking-tight text-right">{m2Label}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="group border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 text-label text-muted-foreground/80 font-mono">
                  {item.rank.toString().padStart(2, '0')}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-micro font-semibold text-muted-foreground shrink-0">
                      {item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-nav font-medium text-foreground truncate max-w-[120px]">{item.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-nav text-right text-foreground">{item.metric1}</td>
                <td className="py-2.5 text-label font-medium text-right text-muted-foreground">
                  {type === "org" ? (
                    <span className="inline-flex py-0.5 px-1.5 bg-muted/50 rounded text-muted-foreground/80 text-caption">{item.metric2}</span>
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
