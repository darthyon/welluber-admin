"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Shield,
  Buildings,
  Storefront,
  EnvelopeSimple,
  Clock,
  CalendarBlank,
  User,
  ArrowLeft,
  LockKey,
  PencilSimple,
} from "@phosphor-icons/react"
import { MOCK_ADMINS, MOCK_AUDIT_LOGS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/shared/status-badge"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { ActivityTimeline, type ActivityType } from "@/components/shared/activity-timeline"
import { EmptyState } from "@/components/shared/empty-state"
import { ActionPopover } from "@/components/shared/action-popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Administrator } from "@/features/users/types"

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

function getScopeIcon(admin: Administrator) {
  if (!admin.entity) return <Shield size={20} weight="fill" />
  if (admin.entity.type === "Organization") return <Buildings size={20} weight="fill" />
  return <Storefront size={20} weight="fill" />
}

export default function AdminDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const admin = useMemo(() => MOCK_ADMINS.find((a) => a.id === id) ?? null, [id])

  const auditLogs = useMemo(() => {
    if (!admin) return []
    return MOCK_AUDIT_LOGS.filter(
      (l) => l.updatedBy.email.toLowerCase() === admin.email.toLowerCase()
    )
  }, [admin])

  if (!admin) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-subtle">
          <ArrowLeft size={16} /> Administrators
        </Button>
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
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/users/administrators")}
        className="gap-2 text-subtle h-8 px-2"
      >
        <ArrowLeft size={16} />
        <span className="text-label font-medium">Administrators</span>
      </Button>

      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            {/* Avatar slot */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center text-faint">
                <User size={28} weight="light" />
              </div>
              <p className="text-micro text-faint mt-1.5 text-center max-w-[64px] leading-tight">
                Upload after invite
              </p>
            </div>

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
                <EnvelopeSimple size={14} className="shrink-0" />
                <span className="font-mono tracking-tight">{admin.email}</span>
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

          {/* Actions */}
          <ActionPopover
            actions={[
              {
                label: "Edit details",
                icon: <PencilSimple size={14} />,
                onClick: () => console.log("Edit admin", admin.id),
                className: "opacity-50 cursor-not-allowed",
              },
              {
                label: "Manage Access",
                icon: <LockKey size={14} />,
                onClick: () => console.log("Manage access", admin.id),
                className: "opacity-50 cursor-not-allowed",
              },
              {
                label: admin.status === "Active" ? "Deactivate" : "Activate",
                onClick: () => console.log("Toggle status", admin.id),
                className: admin.status === "Active" ? "text-destructive" : "text-primary",
              },
            ]}
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile details */}
        <div className="lg:col-span-1 space-y-4">
          <DetailSection title="Profile" icon={<User size={16} />}>
            <div className="grid grid-cols-1 gap-3">
              <DetailField
                label="Access Scope"
                value={
                  admin.entity?.type === "Organization" ? "Organization" :
                  admin.entity?.type === "ServiceProvider" ? "Service Provider" :
                  "Welluber Platform"
                }
                icon={getScopeIcon(admin)}
              />
              <DetailField
                label="Assigned Entity"
                value={admin.entity?.name ?? "Welluber Team"}
              />
              <DetailField
                label="Role"
                value={
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-label font-medium border",
                    getRoleBadgeClass(admin.role)
                  )}>
                    {getRoleLabel(admin.role)}
                  </span>
                }
              />
              <DetailField
                label="Admin ID"
                value={
                  <span className="font-mono text-label text-subtle tracking-tight">{admin.id}</span>
                }
              />
            </div>
          </DetailSection>

          <DetailSection title="Activity" icon={<Clock size={16} />}>
            <div className="grid grid-cols-1 gap-3">
              <DetailField
                label="Joined Date"
                value={admin.joinedDate}
                icon={<CalendarBlank size={14} />}
              />
              <DetailField
                label="Last Login"
                value={admin.lastLogin}
                icon={<Clock size={14} />}
              />
              <DetailField
                label="Last Active"
                value={admin.lastActive}
                icon={<Clock size={14} />}
              />
            </div>
          </DetailSection>
        </div>

        {/* Audit log */}
        <div className="lg:col-span-2">
          <DetailSection
            title="Audit Log"
            description="Recent actions performed by this administrator."
            icon={<Clock size={16} />}
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
      </div>
    </div>
  )
}
