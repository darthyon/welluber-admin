"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  ActionPopover,
  type ActionItem,
} from "@/components/shared/action-popover"
import { Plus, TreeStructure, ArrowsDownUp } from "@phosphor-icons/react"
import type { BenefitPolicy } from "@/types/policy"
import type { PolicyListItem } from "@/features/policies/types"

interface VersionsTabProps {
  policy: BenefitPolicy
  versions: PolicyListItem[]
  overrideCounts?: Record<string, number>
  onCreateVersion: () => void
  onViewVersion: (id: string) => void
  onEditVersion: (id: string) => void
  onRemoveVersion: (id: string) => void
}

export function VersionsTab({
  policy,
  versions,
  overrideCounts = {},
  onCreateVersion,
  onViewVersion,
  onEditVersion,
  onRemoveVersion,
}: VersionsTabProps) {
  const canCreateVersion = policy.status === "active" && !policy.parentPolicyId

  const versionRows = useMemo(
    () => versions.map((v, i) => ({ ...v, _versionLabel: `1.${i + 1}` })),
    [versions]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">
            {versions.length > 0 ? `Versions (${versions.length})` : "Versions"}
          </h3>
          <p className="mt-1 text-body text-muted-foreground">
            Override benefit amounts for specific employee groups and individuals.
          </p>
        </div>
        {canCreateVersion && (
          <Button
            onClick={onCreateVersion}
            className="h-9 rounded-full px-5 text-body font-medium shadow-sm"
          >
            <Plus size={15} weight="bold" className="mr-1.5" />
            Create Version
          </Button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-500 dark:border-violet-500/20 dark:bg-violet-500/10">
            <TreeStructure size={28} weight="duotone" />
          </div>
          <p className="text-body font-semibold text-foreground">No versions yet</p>
          <p className="mt-1 max-w-sm text-label text-faint">
            Create a version to tailor benefit amounts for a specific tier,
            department, or individual employee without changing the base policy.
          </p>
          {canCreateVersion && (
            <Button onClick={onCreateVersion} size="sm" className="mt-6 text-label font-medium">
              <Plus size={14} weight="bold" className="mr-1.5" />
              Create Version
            </Button>
          )}
          {!canCreateVersion && policy.parentPolicyId && (
            <p className="mt-4 text-label text-faint italic">
              Versions can only be created from parent policies.
            </p>
          )}
        </div>
      ) : (
        <SharedDataTable
          data={versionRows}
          columns={[
            {
              header: "Version",
              align: "center",
              render: (row) => (
                <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                  {(row as (typeof versionRows)[number])._versionLabel}
                </span>
              ),
            },
            {
              header: "Version Name",
              accessorKey: "name",
              render: (row) => (
                <div>
                  <p className="text-body font-semibold text-foreground">{row.name}</p>
                  {row.code && (
                    <p className="mt-0.5 font-mono text-label text-faint">{row.code}</p>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              render: (row) => (
                <StatusBadge
                  status={row.status}
                  variant={
                    row.status === "active"
                      ? "emerald"
                      : row.status === "draft"
                        ? "amber"
                        : "rose"
                  }
                  dot
                />
              ),
            },
            {
              header: "Employees",
              align: "center",
              render: (row) => {
                const count = row.targetEmployeeIds?.length ?? 0
                return (
                  <span className="text-body font-medium text-subtle tabular-nums">
                    {count > 0 ? count : "—"}
                  </span>
                )
              },
            },
            {
              header: "Overrides",
              align: "center",
              render: (row) => {
                const oc = overrideCounts[row.id] ?? 0
                return oc > 0 ? (
                  <Badge variant="secondary" className="inline-flex items-center gap-1">
                    <ArrowsDownUp size={10} weight="bold" />
                    {oc}
                  </Badge>
                ) : (
                  <span className="text-label text-faint">—</span>
                )
              },
            },
            {
              header: "Actions",
              headerClassName: "text-right",
              align: "right",
              render: (row) => {
                const actions: ActionItem[] = [
                  {
                    label: "View version details",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      onViewVersion(row.id)
                    },
                  },
                  {
                    label: "Edit version",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      onEditVersion(row.id)
                    },
                  },
                  {
                    label: "Remove version",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      onRemoveVersion(row.id)
                    },
                    isDanger: true,
                  },
                ]
                return (
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <ActionPopover actions={actions} />
                  </div>
                )
              },
            },
          ]}
          onRowClick={(row) => onViewVersion(row.id)}
          rowsPerPage={10}
          ghost
        />
      )}
    </div>
  )
}
