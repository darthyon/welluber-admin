"use client"

import {
  CheckCircle,
  Flag,
  Clock,
  Receipt,
  SealWarning,
  ArrowCircleUp,
  EnvelopeSimple,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { ActivityFeedItem, ActivityEventType } from "@/lib/mock-data"

interface DashboardRecentActivityProps {
  activities: ActivityFeedItem[]
  className?: string
}

const EVENT_ICON: Record<ActivityEventType, React.ElementType> = {
  claim_confirmed: CheckCircle,
  claim_flagged: Flag,
  claim_pending: Clock,
  voucher_redeemed: Receipt,
  voucher_expired: SealWarning,
  account_topup: ArrowCircleUp,
  admin_invite: EnvelopeSimple,
}

const EVENT_ICON_COLOR: Record<ActivityEventType, string> = {
  claim_confirmed: "text-primary bg-primary/10",
  claim_flagged: "text-primary bg-primary/10",
  claim_pending: "text-primary bg-primary/10",
  voucher_redeemed: "text-primary bg-primary/10",
  voucher_expired: "text-muted-foreground bg-muted/60",
  account_topup: "text-primary bg-primary/10",
  admin_invite: "text-primary bg-primary/10",
}

const STATUS_VARIANT: Record<string, "emerald" | "amber" | "rose" | "zinc" | "primary"> = {
  confirmed: "emerald",
  completed: "emerald",
  pending_review: "amber",
  pending: "amber",
  flagged: "rose",
  cancelled: "zinc",
}

function timeAgo(isoString: string): string {
  const now = new Date("2026-05-29T12:00:00Z")
  const then = new Date(isoString)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const Icon = EVENT_ICON[item.eventType]
  const iconCls = EVENT_ICON_COLOR[item.eventType]
  const statusVariant = item.status ? (STATUS_VARIANT[item.status] ?? "zinc") : undefined

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn("mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md", iconCls)}>
        <Icon size={14} weight="duotone" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body font-medium text-foreground truncate">{item.title}</p>
          {statusVariant && (
            <StatusBadge status={item.status!} variant={statusVariant} className="flex-shrink-0" />
          )}
        </div>
        <p className="text-label font-mono text-muted-foreground mt-0.5 truncate">{item.referenceId}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-label text-muted-foreground/70">{item.actor}</p>
          <div className="flex items-center gap-2">
            {item.amount !== undefined && (
              <p className="text-label font-mono font-medium text-foreground">
                RM {item.amount.toLocaleString("en-MY")}
              </p>
            )}
            <p className="text-label text-muted-foreground/50">{timeAgo(item.timestamp)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardRecentActivity({ activities, className }: DashboardRecentActivityProps) {
  return (
    <div className={cn("bg-card border border-border rounded-lg p-5", className)}>
      <div className="mb-4">
        <p className="text-body font-semibold text-foreground">Recent Activity</p>
        <p className="text-label text-muted-foreground mt-0.5">Latest claims, vouchers, and account events</p>
      </div>

      <div>
        {activities.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
