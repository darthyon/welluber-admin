"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  ClockCounterClockwise,
  ArrowCircleUp,
  PlusCircle,
  Trash,
  CheckCircle,
  XCircle,
  Gear,
  SignIn,
} from "@phosphor-icons/react"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge"
import {
  MOCK_ORG_PORTAL_ACTIVITY,
  type OrgPortalActivityItem,
} from "@/lib/mock-data"
import type { AuditLogType } from "@/features/audit-log/types"

const TYPE_ICON: Record<AuditLogType, React.ReactNode> = {
  Create: <PlusCircle size={16} weight="duotone" />,
  Update: <ArrowCircleUp size={16} weight="duotone" />,
  Delete: <Trash size={16} weight="duotone" />,
  Approval: <CheckCircle size={16} weight="duotone" />,
  Rejection: <XCircle size={16} weight="duotone" />,
  SettingChange: <Gear size={16} weight="duotone" />,
  Login: <SignIn size={16} weight="duotone" />,
  Payout: <ArrowCircleUp size={16} weight="duotone" />,
}

const TYPE_VARIANT: Record<AuditLogType, StatusColor> = {
  Create: "emerald",
  Update: "primary",
  Delete: "rose",
  Approval: "emerald",
  Rejection: "rose",
  SettingChange: "amber",
  Login: "zinc",
  Payout: "primary",
}

const TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Create", value: "Create" },
  { label: "Update", value: "Update" },
  { label: "Setting Change", value: "SettingChange" },
  { label: "Approval", value: "Approval" },
]

export default function OrgActivityPage() {
  const params = useParams()
  // orgSlug available for future API filtering
  void params.orgSlug

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<"all" | "action">("all")

  const filtered = useMemo(() => {
    return MOCK_ORG_PORTAL_ACTIVITY.filter((entry) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        entry.title.toLowerCase().includes(q) ||
        entry.desc.toLowerCase().includes(q) ||
        entry.updatedBy.name.toLowerCase().includes(q)
      const matchType = typeFilter === "all" || entry.type === typeFilter
      const matchesTab = activeTab === "all" || entry.requiresAction === true
      return matchSearch && matchType && matchesTab
    })
  }, [activeTab, search, typeFilter])

  const actionsRequiredCount = MOCK_ORG_PORTAL_ACTIVITY.filter(
    (entry) => entry.requiresAction
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title font-semibold text-foreground">Activity</h1>
        <p className="mt-0.5 text-body text-muted-foreground">
          History of changes across your organisation
        </p>
      </div>

      <div className="flex w-fit items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={
            activeTab === "all"
              ? "rounded-md bg-background px-3 py-1.5 text-label font-medium text-foreground shadow-sm"
              : "rounded-md px-3 py-1.5 text-label font-medium text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          All Activity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("action")}
          className={
            activeTab === "action"
              ? "rounded-md bg-background px-3 py-1.5 text-label font-medium text-foreground shadow-sm"
              : "rounded-md px-3 py-1.5 text-label font-medium text-muted-foreground transition-colors hover:text-foreground"
          }
        >
          Actions Required
          <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.5 text-micro font-medium text-primary">
            {actionsRequiredCount}
          </span>
        </button>
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search activity..."
        filters={
          <FilterItem
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
          />
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={32} weight="duotone" />}
          title={
            activeTab === "all" ? "No Activity Found" : "No Actions Required"
          }
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry: OrgPortalActivityItem) => (
            <div
              key={entry.id}
              className="flex items-start gap-4 rounded-lg border border-border/60 bg-card px-4 py-3"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                {TYPE_ICON[entry.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-body leading-tight font-semibold text-foreground">
                      {entry.title}
                    </p>
                    <StatusBadge
                      status={
                        entry.type === "SettingChange"
                          ? "Setting Change"
                          : entry.type
                      }
                      variant={TYPE_VARIANT[entry.type]}
                      className="w-fit"
                    />
                  </div>
                  <span className="shrink-0 text-label text-faint tabular-nums">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 text-body text-subtle">{entry.desc}</p>
                <p className="mt-1 text-label text-faint">
                  by {entry.updatedBy.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
