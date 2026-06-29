"use client"

import { useQueryState } from "@/hooks/use-tab-persistence"
import { FilterItem } from "@/components/shared/filter-item"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { useOrgWorkforce } from "@/hooks/use-org-workforce"
import type { EntitlementPoolType } from "@/lib/mock-data/factories/entitlement"

const POOL_BADGE: Record<
  EntitlementPoolType,
  { label: string; className: string }
> = {
  SharedWithEmployee: {
    label: "Combined",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  Shared: {
    label: "Shared",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  Individual: {
    label: "Dedicated",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
}

interface EntitlementsSubTabProps {
  orgId: string
}

export function EntitlementsSubTab({ orgId }: EntitlementsSubTabProps) {
  const { entitlements } = useOrgWorkforce(orgId)
  const [search, setSearch] = useQueryState("entSearch", "")
  const [typeFilter, setTypeFilter] = useQueryState("entType", "all")

  const filtered = entitlements.filter(
    (e) =>
      (typeFilter === "all" || e.type === typeFilter) &&
      e.beneficiaryName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold text-foreground">
            Entitlements
          </h2>
          <p className="text-body text-subtle">
            View all beneficiaries and their assigned benefit allocations
          </p>
        </div>
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search beneficiaries..."
        filters={
          <FilterItem
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "All Types", value: "all" },
              { label: "Employee", value: "Employee" },
              { label: "Dependent", value: "Dependent" },
            ]}
          />
        }
      />

      <SharedDataTable
        freezeFirst
        freezeLast
        columns={[
          {
            header: "Beneficiary",
            accessorKey: "beneficiaryName",
            render: (ent) => (
              <div className="flex flex-col">
                <span className="text-body font-medium text-foreground">
                  {ent.beneficiaryName}
                </span>
                <span className="mt-1 w-fit rounded-full border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-label font-medium text-primary">
                  {ent.type}
                </span>
              </div>
            ),
          },
          {
            header: "Branch",
            accessorKey: "branchName",
            render: (ent) => (
              <span className="text-label font-medium text-muted-foreground">
                {ent.branchName}
              </span>
            ),
          },
          {
            header: "Policy",
            accessorKey: "policy",
            render: (ent) => (
              <span className="text-body font-semibold text-primary">
                {ent.policy}
              </span>
            ),
          },
          {
            header: "Pool",
            accessorKey: "poolType",
            render: (ent) => {
              const { label, className } = POOL_BADGE[ent.poolType]
              return (
                <Badge
                  variant="outline"
                  className={`text-label font-medium ${className}`}
                >
                  {label}
                </Badge>
              )
            },
          },
          {
            header: "Claims Usage",
            render: (ent) => {
              const pct =
                ent.allocatedAmount > 0
                  ? Math.round((ent.usedAmount / ent.allocatedAmount) * 100)
                  : 0
              const isHigh = pct > 80
              return (
                <div className="flex w-[160px] flex-col gap-1.5">
                  <div className="flex items-center justify-between text-label">
                    <span className="text-faint">
                      RM {ent.usedAmount.toLocaleString()}
                    </span>
                    <span
                      className={
                        isHigh
                          ? "font-semibold text-rose-600 dark:text-rose-400"
                          : "font-semibold text-primary"
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        isHigh
                          ? "h-full rounded-full bg-rose-500 transition-all duration-700 dark:bg-rose-400"
                          : "h-full rounded-full bg-primary transition-all duration-700"
                      }
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            },
          },
          {
            header: "Status",
            accessorKey: "status",
            render: (ent) => (
              <StatusBadge status={ent.status} variant="emerald" />
            ),
          },
        ]}
        data={filtered}
      />
    </div>
  )
}
