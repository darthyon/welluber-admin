"use client"

import Link from "next/link"
import {
  UserCircleMinus,
  FileX,
  CurrencyCircleDollar,
  IdentificationCard,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { OrgTask } from "@/components/org/org-task-centre"
import { routes } from "@/lib/navigation"

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

function ActionRow({ task }: { task: OrgTask }) {
  const Icon = CATEGORY_ICON[task.category]
  const isCritical = task.priority === "critical"
  const isHigh = task.priority === "high"
  const isUrgent = isCritical || isHigh
  const countVariant = isCritical ? "rose" : isHigh ? "amber" : "zinc"

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border/50 py-3 last:border-0",
        isUrgent && "group"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
          isUrgent && "bg-primary/10 text-primary",
          !isUrgent && "bg-muted/60 text-muted-foreground"
        )}
      >
        <Icon size={14} weight="duotone" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-body leading-none font-medium",
              isUrgent ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          {task.count !== undefined && task.count > 0 && (
            <StatusBadge
              status={String(task.count)}
              variant={countVariant}
              className="leading-none"
            />
          )}
          {(!task.count || task.count === 0) && (
            <span className="text-micro font-medium text-muted-foreground/50">
              None
            </span>
          )}
        </div>
        <p className="mt-1 text-label leading-snug text-muted-foreground">
          {task.description}
        </p>
      </div>

      {task.cta && (
        <Link
          href={task.cta.href}
          className={cn(
            "mt-0.5 flex flex-shrink-0 items-center gap-1 text-label font-medium transition-colors",
            isUrgent
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {task.cta.label}
          <ArrowRight
            size={12}
            className="translate-x-0 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  )
}

export function DashboardActionCentre({
  tasks,
  orgSlug,
  className,
}: DashboardActionCentreProps) {
  const urgentCount = tasks.filter(
    (t) => t.priority === "critical" || t.priority === "high"
  ).length

  if (tasks.length === 0) {
    return (
      <div
        className={cn("rounded-lg border border-border bg-card p-5", className)}
      >
        <div className="mb-4">
          <p className="text-body font-semibold text-foreground">
            Action Centre
          </p>
          <p className="mt-0.5 text-label text-muted-foreground">All Clear</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle size={28} weight="duotone" />
          </div>
          <p className="text-center text-label text-muted-foreground">
            No items need your attention right now.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-body font-semibold text-foreground">
            Action Centre
          </p>
          <p className="mt-0.5 text-label text-muted-foreground">
            {urgentCount > 0
              ? `${urgentCount} item${urgentCount > 1 ? "s" : ""} need review`
              : "No urgent items"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <StatusBadge status={`${urgentCount} Urgent`} variant="rose" />
          )}
          <Link
            href={routes.org.activity(orgSlug)}
            className="text-label font-medium text-foreground transition-colors hover:text-primary"
          >
            View All Activity
          </Link>
        </div>
      </div>

      <div>
        {tasks.map((task) => (
          <ActionRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
