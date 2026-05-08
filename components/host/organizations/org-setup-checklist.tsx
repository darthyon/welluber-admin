"use client"

import Link from "next/link"
import { CheckCircle, Circle, ArrowRight } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface OrgSetupChecklistProps {
  orgId: string
  status: "active" | "inactive" | "draft" | "deactivated" | "suspended"
  tierCount: number
  employeeCount: number
  policyCount: number
  employeesWithoutPolicy: number
  className?: string
}

interface ChecklistStep {
  key: string
  label: string
  href: string
  completed: boolean
}

export function OrgSetupChecklist({
  orgId,
  status,
  tierCount,
  employeeCount,
  policyCount,
  employeesWithoutPolicy,
  className,
}: OrgSetupChecklistProps) {
  if (status !== "inactive") return null

  const steps: ChecklistStep[] = [
    { key: "details", label: "Organization Details", href: `/organizations/${orgId}?tab=profile`, completed: true },
    { key: "tiers", label: "Tier Configs", href: `/organizations/${orgId}?tab=employees&subTab=tiers`, completed: tierCount > 0 },
    { key: "employees", label: "Employees", href: `/organizations/${orgId}?tab=employees`, completed: employeeCount > 0 },
    { key: "policies", label: "Policies Assigned", href: `/organizations/${orgId}?tab=policies`, completed: policyCount > 0 },
    { key: "activated", label: "Activated", href: `/organizations/${orgId}?tab=settings`, completed: false },
  ]

  const completed = steps.filter((step) => step.completed).length

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body font-semibold text-foreground">Setup Checklist</p>
          <p className="text-label text-muted-foreground">
            {completed}/{steps.length} complete · {Math.max(employeesWithoutPolicy, 0)} employees still need policy assignment.
          </p>
        </div>
        <Link
          href={`/organizations/${orgId}?tab=employees&filter=missing-policy`}
          className="inline-flex h-8 items-center gap-1.5 rounded-4xl border border-border px-3 text-label font-medium text-foreground transition-colors hover:bg-muted"
        >
          Review Coverage
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-label font-medium text-foreground transition-colors hover:bg-muted/40"
          >
            {step.completed ? (
              <CheckCircle size={14} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Circle size={14} weight="duotone" className="text-muted-foreground" />
            )}
            <span>{step.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
