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
import type { AuditLogEntry, AuditLogType } from "@/features/audit-log/types"

// Org-scoped activity — only events relevant to this org
const ACME_ACTIVITY: AuditLogEntry[] = [
  {
    id: "ACT-001",
    title: "Benefit Policy Assigned",
    type: "Update",
    desc: "Acme Employee Wellness Policy FY2026 assigned to All Branches.",
    timestamp: "2026-04-06 14:20",
    updatedBy: { name: "Yon Yusuf", email: "yon@acme.com" },
    entity: { id: "POL-20260115-0001", name: "Acme Employee Wellness Policy FY2026", type: "Policy" },
  },
  {
    id: "ACT-002",
    title: "Admin Invited",
    type: "Create",
    desc: "Khairul Anwar invited as Org Admin. Pending activation.",
    timestamp: "2026-04-10 09:30",
    updatedBy: { name: "Yon Yusuf", email: "yon@acme.com" },
  },
  {
    id: "ACT-003",
    title: "Employee Status Updated",
    type: "Update",
    desc: "Robert Fox status changed from Unlinked to Linked.",
    timestamp: "2026-04-08 11:15",
    updatedBy: { name: "Amira Rahman", email: "amira@acme.com" },
  },
  {
    id: "ACT-004",
    title: "Branch Created",
    type: "Create",
    desc: "ACME Subang Jaya branch added to organisation structure.",
    timestamp: "2026-03-15 10:00",
    updatedBy: { name: "Yon Yusuf", email: "yon@acme.com" },
  },
  {
    id: "ACT-005",
    title: "Org Structure Updated",
    type: "SettingChange",
    desc: "New tier 'Associate' added to organisation tier configuration.",
    timestamp: "2026-03-20 14:45",
    updatedBy: { name: "Yon Yusuf", email: "yon@acme.com" },
  },
  {
    id: "ACT-006",
    title: "Benefit Policy Assigned",
    type: "Update",
    desc: "Acme Leadership Benefits Policy FY2026 assigned to Subang Jaya branch.",
    timestamp: "2026-04-02 10:30",
    updatedBy: { name: "Amira Rahman", email: "amira@acme.com" },
    entity: { id: "POL-20260115-0002", name: "Acme Leadership Benefits Policy FY2026", type: "Policy" },
  },
  {
    id: "ACT-007",
    title: "Employee Deactivated",
    type: "Update",
    desc: "Marvin McKinney account deactivated — resigned.",
    timestamp: "2026-04-12 16:00",
    updatedBy: { name: "Amira Rahman", email: "amira@acme.com" },
  },
  {
    id: "ACT-008",
    title: "Admin Activated",
    type: "Approval",
    desc: "Amira Rahman completed account setup and is now active.",
    timestamp: "2026-02-03 09:00",
    updatedBy: { name: "System", email: "system@welluber.com" },
  },
]

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

  const filtered = useMemo(() => {
    return ACME_ACTIVITY.filter((entry) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        entry.title.toLowerCase().includes(q) ||
        entry.desc.toLowerCase().includes(q) ||
        entry.updatedBy.name.toLowerCase().includes(q)
      const matchType = typeFilter === "all" || entry.type === typeFilter
      return matchSearch && matchType
    })
  }, [search, typeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title font-semibold text-foreground">Activity Log</h1>
        <p className="text-muted-foreground mt-0.5 text-body">History of changes across your organisation</p>
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
          title="No activity found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-4 rounded-lg border border-border/60 bg-card px-4 py-3"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                {TYPE_ICON[entry.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-body font-semibold text-foreground leading-tight">{entry.title}</p>
                    <StatusBadge
                      status={entry.type === "SettingChange" ? "Setting Change" : entry.type}
                      variant={TYPE_VARIANT[entry.type]}
                      className="w-fit"
                    />
                  </div>
                  <span className="text-label text-faint shrink-0 tabular-nums">{entry.timestamp}</span>
                </div>
                <p className="text-body text-subtle mt-0.5">{entry.desc}</p>
                <p className="text-label text-faint mt-1">by {entry.updatedBy.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
