"use client"

import Link from "next/link"
import {
  UserCircleMinus,
  FileX,
  Warning,
  ClockCountdown,
  CurrencyCircleDollar,
  IdentificationCard,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { OrgTask } from "@/components/org/org-task-centre"

interface DashboardActionCentreProps {
  tasks: OrgTask[]
  orgSlug: string
  className?: string
}

const CATEGORY_ICON: Record<OrgTask["category"], React.ElementType> = {
  employees: UserCircleMinus,
  claims: FileX,
  budget: CurrencyCircleDollar,
  policy: IdentificationCard,
  admin: IdentificationCard,
}

const PRIORITY_DOT: Record<OrgTask["priority"], string> = {
  critical: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-muted-foreground/40",
  low: "bg-muted-foreground/20",
}

function ActionRow({ task }: { task: OrgTask }) {
  const Icon = CATEGORY_ICON[task.category]
  const isCritical = task.priority === "critical"
  const isHigh = task.priority === "high"
  const isUrgent = isCritical || isHigh

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3 border-b border-border/50 last:border-0",
        isUrgent && "group"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
          isCritical && "bg-rose-500/10 text-rose-500",
          isHigh && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          !isUrgent && "bg-muted/60 text-muted-foreground"
        )}
      >
        <Icon size={14} weight="duotone" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-body font-medium leading-none", isUrgent ? "text-foreground" : "text-muted-foreground")}>
            {task.title}
          </p>
          {task.count !== undefined && task.count > 0 && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                isCritical && "bg-rose-500/10 text-rose-500",
                isHigh && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                !isUrgent && "bg-muted text-muted-foreground"
              )}
            >
              {task.count}
            </span>
          )}
          {(!task.count || task.count === 0) && (
            <span className="text-[10px] text-muted-foreground/50 font-medium">None</span>
          )}
        </div>
        <p className="text-label text-muted-foreground mt-1 leading-snug">{task.description}</p>
      </div>

      {task.cta && (
        <Link
          href={task.cta.href}
          className={cn(
            "flex-shrink-0 flex items-center gap-1 text-label font-medium transition-colors mt-0.5",
            isUrgent
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {task.cta.label}
          <ArrowRight size={12} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  )
}

export function DashboardActionCentre({ tasks, className }: DashboardActionCentreProps) {
  const urgentCount = tasks.filter((t) => t.priority === "critical" || t.priority === "high").length

  if (tasks.length === 0) {
    return (
      <div className={cn("bg-card border border-border rounded-lg p-5", className)}>
        <div className="mb-4">
          <p className="text-body font-semibold text-foreground">Action Centre</p>
          <p className="text-label text-muted-foreground mt-0.5">All Clear</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <CheckCircle size={28} weight="duotone" className="text-emerald-500" />
          <p className="text-label text-muted-foreground text-center">No items need your attention right now.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-card border border-border rounded-lg p-5", className)}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-body font-semibold text-foreground">Action Centre</p>
          <p className="text-label text-muted-foreground mt-0.5">
            {urgentCount > 0 ? `${urgentCount} item${urgentCount > 1 ? "s" : ""} need review` : "No urgent items"}
          </p>
        </div>
        {urgentCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-500">
            {urgentCount} urgent
          </span>
        )}
      </div>

      <div>
        {tasks.map((task) => (
          <ActionRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
