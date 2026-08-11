"use client"

import { Suspense, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Buildings,
  Storefront,
  IdentificationBadge,
  Clock,
  User,
  Gear,
  ClockCounterClockwise,
} from "@phosphor-icons/react"
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data"
import { useAdmins } from "@/hooks/data-hooks"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { AdministratorDetailsTab } from "@/components/host/users/administrator-details-tab"
import { AdministratorSettingsTab } from "@/components/host/users/administrator-settings-tab"
import { StatusBadge } from "@/components/shared/status-badge"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { SegmentedTabs } from "@/components/shared/segmented-tabs"
import { DetailSection } from "@/components/shared/detail-section"
import { ActivityTimeline, type ActivityType } from "@/components/shared/activity-timeline"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Administrator } from "@/features/users/types"

const DETAIL_TABS = [
  { id: "details", label: "Administrator Details", icon: User },
  { id: "audit", label: "Audit Log", icon: ClockCounterClockwise },
  { id: "settings", label: "Settings", icon: Gear },
] as const

const VALID_TABS = new Set<string>(DETAIL_TABS.map((t) => t.id))

function getRoleBadgeClass(role: Administrator["role"]) {
  switch (role) {
    case "HostAdmin": return "bg-primary/10 text-primary border-primary/20"
    case "OrgAdmin": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    case "SPAdmin": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    default: return "bg-muted text-muted-foreground border-border"
  }
}

function getRoleLabel(role: Administrator["role"]) {
  switch (role) {
    case "HostAdmin": return "Host Admin"
    case "OrgAdmin": return "Org Admin"
    case "SPAdmin": return "SP Admin"
    default: return role
  }
}

function AdminDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { admins } = useAdmins()
  const [tab, setTab] = useQueryState("tab", "details")
  const activeTab = VALID_TABS.has(tab) ? tab : "details"

  const admin = useMemo(
    () => admins.find((a) => a.id === id) ?? null,
    [admins, id]
  )

  const auditLogs = useMemo(() => {
    if (!admin) return []
    return MOCK_AUDIT_LOGS.filter(
      (l) => l.updatedBy.email.toLowerCase() === admin.email.toLowerCase()
    )
  }, [admin])

  if (!admin) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<User size={32} weight="light" />}
          title="Administrator not found"
          description="This admin may have been removed or the ID is invalid."
          action={
            <Button variant="ghost" onClick={() => router.push("/users/administrators")}>
              Back to Administrators
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <EntityAvatar name={admin.name} size="lg" shape="square" />

            {/* Identity */}
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-title font-semibold text-foreground">{admin.name}</h1>
                <StatusBadge
                  status={admin.status}
                  variant={admin.status === "Active" ? "emerald" : "rose"}
                />
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-label font-medium border",
                  getRoleBadgeClass(admin.role)
                )}>
                  {getRoleLabel(admin.role)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-body text-subtle">
                <IdentificationBadge size={14} className="shrink-0" />
                <span className="font-mono tracking-tight">{admin.id}</span>
              </div>
              {admin.entity && (
                <div className="flex items-center gap-1.5 text-label text-subtle font-medium">
                  {admin.entity.type === "Organization"
                    ? <Buildings size={14} className="text-faint" />
                    : <Storefront size={14} className="text-faint" />}
                  <span>{admin.entity.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <SegmentedTabs tabs={DETAIL_TABS} activeTab={activeTab} onChange={setTab} />

      {activeTab === "details" && <AdministratorDetailsTab admin={admin} />}

      {activeTab === "audit" && (
        <div className="animate-in fade-in">
          <DetailSection
            title="Audit Log"
            description="Recent actions performed by this administrator."
            icon={<Clock size={18} weight="duotone" />}
          >
            {auditLogs.length === 0 ? (
              <EmptyState
                icon={<Clock size={28} weight="light" />}
                title="No activity yet"
                description="Actions performed by this administrator will appear here."
              />
            ) : (
              <ActivityTimeline
                items={auditLogs.map((log) => ({
                  id: log.id,
                  title: log.title,
                  description: log.desc,
                  timestamp: log.timestamp,
                  user: log.updatedBy.name,
                  type: log.type as ActivityType,
                }))}
              />
            )}
          </DetailSection>
        </div>
      )}

      {activeTab === "settings" && <AdministratorSettingsTab admin={admin} />}
    </div>
  )
}

export default function AdminDetailPage() {
  return (
    <Suspense fallback={null}>
      <AdminDetail />
    </Suspense>
  )
}
