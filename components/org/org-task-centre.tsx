"use client"

import {
  UserCircleMinus,
  FileX,
  Warning,
  CurrencyCircleDollar,
  IdentificationCard,
  UserCircleDashed,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgTask {
  id: string
  category: "employees" | "claims" | "budget" | "policy" | "admin"
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  count?: number
  cta?: { label: string; href: string }
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: {
    variant: "rose" as StatusColor,
    label: "Critical",
  },
  high: {
    variant: "amber" as StatusColor,
    label: "Action required",
  },
  medium: {
    variant: "primary" as StatusColor,
    label: "Recommended",
  },
  low: {
    variant: "zinc" as StatusColor,
    label: "Info",
  },
}

const CATEGORY_ICON: Record<OrgTask["category"], React.ReactNode> = {
  employees: <UserCircleMinus size={18} weight="duotone" />,
  claims: <FileX size={18} weight="duotone" />,
  budget: <CurrencyCircleDollar size={18} weight="duotone" />,
  policy: <IdentificationCard size={18} weight="duotone" />,
  admin: <UserCircleDashed size={18} weight="duotone" />,
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: OrgTask }) {
  const cfg = PRIORITY_CONFIG[task.priority]

  return (
    <div className="flex items-start gap-4 px-4 py-3.5 border-b border-border/50 last:border-0 group">
      {/* Category icon */}
      <div className="mt-0.5 shrink-0 text-muted-foreground">{CATEGORY_ICON[task.category]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-body font-semibold text-foreground leading-tight">{task.title}</p>
          {task.count !== undefined && (
            <StatusBadge status={String(task.count)} variant={cfg.variant} className="shrink-0 tabular-nums" />
          )}
        </div>
        <p className="text-body text-subtle mt-0.5">{task.description}</p>
      </div>

      {/* CTA */}
      {task.cta && (
        <Link
          href={task.cta.href}
          className="shrink-0 flex items-center gap-1 text-label font-medium text-primary hover:text-primary/80 transition-colors mt-0.5"
        >
          {task.cta.label}
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function AllClear() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <CheckCircle size={20} weight="duotone" />
      </div>
      <p className="text-body font-semibold text-foreground">All Clear</p>
      <p className="text-label text-muted-foreground">No open tasks — everything is up to date.</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  tasks: OrgTask[]
}

export function OrgTaskCentre({ tasks }: Props) {
  const urgent = tasks.filter((t) => t.priority === "critical" || t.priority === "high")
  const recommended = tasks.filter((t) => t.priority === "medium" || t.priority === "low")
  const total = tasks.length

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Warning size={16} weight="duotone" className="text-muted-foreground" />
          <h2 className="text-body font-semibold text-foreground">Task Centre</h2>
          {total > 0 && (
            <span className="bg-primary text-primary-foreground text-label font-semibold px-1.5 py-0.5 rounded-full text-xs tabular-nums min-w-[20px] text-center">
              {total}
            </span>
          )}
        </div>
        {total > 0 && (
          <p className="text-label text-muted-foreground">
            {urgent.length} require{urgent.length === 1 ? "s" : ""} action
          </p>
        )}
      </div>

      {/* Body */}
      {total === 0 ? (
        <AllClear />
      ) : (
        <div>
          {/* Requires action */}
          {urgent.length > 0 && (
            <div>
              <div className="px-5 py-2 bg-muted/30 border-b border-border/50">
                <p className="text-label font-semibold text-muted-foreground">
                  Requires Action
                </p>
              </div>
              {urgent.map((t) => <TaskRow key={t.id} task={t} />)}
            </div>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <div>
              <div className={cn("px-5 py-2 bg-muted/30 border-b border-border/50", urgent.length > 0 && "border-t")}>
                <p className="text-label font-semibold text-muted-foreground">
                  Recommended
                </p>
              </div>
              {recommended.map((t) => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
