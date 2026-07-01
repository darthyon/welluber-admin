"use client"

import {
  IdentificationCard,
  TreeStructure,
  ShieldCheck,
} from "@phosphor-icons/react"
import { ActionPopover } from "@/components/shared/action-popover"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { SharedDataTable, Column } from "@/components/shared/data-table"

interface AssignedPolicy {
  id: string
  name: string
  code: string
  version?: string
  type: string
  assignedTo: string // "All Branches" or specific branch names
  status: "draft" | "active" | "deactivated"
  employeeCount: number
  lastUpdated: string
}

interface AssignedPolicyListProps {
  policies: AssignedPolicy[]
  onUnassign: (policyId: string) => void
  onView: (policyId: string) => void
  onEdit: (policyId: string) => void
}

export function AssignedPolicyList({
  policies,
  onUnassign,
  onView,
  onEdit,
}: AssignedPolicyListProps) {
  if (policies.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck size={32} weight="light" />}
        title="No Benefit Policies Assigned To This Organization."
        description="Assign a policy to start providing benefits to employees."
      />
    )
  }

  const columns: Column<AssignedPolicy>[] = [
    {
      header: "Policy Name",
      render: (policy) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
            <IdentificationCard size={20} weight="duotone" />
          </div>
          <div>
            <p className="text-body leading-tight font-medium text-foreground transition-colors group-hover:text-primary">
              {policy.name}
            </p>
            <p className="mt-0.5 font-mono text-label leading-none tracking-tight text-subtle">
              {policy.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Version",
      headerClassName: "text-center",
      render: (policy) => (
        <div className="text-center">
          {policy.version ? (
            <Badge variant="outline" className="font-mono text-label">
              {policy.version}
            </Badge>
          ) : (
            <span className="text-label text-faint">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Scope",
      render: (policy) => (
        <div className="flex items-center gap-2">
          <TreeStructure size={14} className="text-faint" />
          <span className="text-body font-medium text-subtle">
            {policy.assignedTo}
          </span>
        </div>
      ),
    },
    {
      header: "Employees",
      headerClassName: "text-center",
      render: (policy) => (
        <div className="text-center text-body font-medium text-subtle tabular-nums">
          {policy.employeeCount.toLocaleString()}
        </div>
      ),
    },
    {
      header: "Status",
      render: (policy) => (
        <StatusBadge
          status={policy.status}
          variant={
            policy.status === "active"
              ? "emerald"
              : policy.status === "draft"
                ? "amber"
                : "zinc"
          }
        />
      ),
    },
    {
      header: "Last Updated",
      render: (policy) => (
        <span className="text-label font-medium text-subtle">
          {policy.lastUpdated}
        </span>
      ),
    },
    {
      header: "",
      headerClassName: "text-right",
      render: (policy) => (
        <div className="flex justify-end">
          <ActionPopover
            actions={[
              { label: "View Policy", onClick: () => onView(policy.id) },
              { label: "Edit Policy", onClick: () => onEdit(policy.id) },
              {
                label: "Unassign Policy",
                isDanger: true,
                onClick: () => onUnassign(policy.id),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <SharedDataTable
      data={policies}
      columns={columns}
      freezeFirst
      freezeLast
      onRowClick={(policy) => onView(policy.id)}
    />
  )
}
