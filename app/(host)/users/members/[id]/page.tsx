"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Buildings,
  CalendarBlank,
  Clock,
  DeviceMobile,
  EnvelopeSimple,
  TreeStructure,
  User,
  UserCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ActivityTimeline,
  type ActivityType,
} from "@/components/shared/activity-timeline"
import { useMembers } from "@/hooks/data-hooks"
import { MOCK_MEMBER_ACTIVITY } from "@/lib/mock-data"
import type { Member, MemberActivityType } from "@/features/users/types"

function statusVariant(status: Member["status"]) {
  if (status === "Active") return "emerald" as const
  if (status === "Pending") return "amber" as const
  return "rose" as const
}

/** Member app events mapped onto the shared timeline's colour vocabulary. */
const ACTIVITY_TYPE_MAP: Record<MemberActivityType, ActivityType> = {
  Signup: "Create",
  Login: "System",
  VoucherPurchased: "Payout",
  VoucherRedeemed: "Approval",
  ProfileUpdated: "Update",
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { members } = useMembers()
  const member = useMemo(
    () => members.find((m) => m.id === id) ?? null,
    [members, id]
  )

  const activity = useMemo(
    () =>
      MOCK_MEMBER_ACTIVITY.filter((entry) => entry.memberId === id).map(
        (entry) => ({
          id: entry.id,
          title: entry.title,
          description: entry.description,
          timestamp: entry.timestamp,
          type: ACTIVITY_TYPE_MAP[entry.type],
        })
      ),
    [id]
  )

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/users/members")}
      className="h-8 gap-2 px-2 text-subtle"
    >
      <ArrowLeft size={16} />
      <span className="text-label font-medium">Members</span>
    </Button>
  )

  if (!member) {
    return (
      <div className="space-y-6">
        {backButton}
        <EmptyState
          icon={<User size={32} weight="light" />}
          title="Member not found"
          description="This member may have been removed or the ID is invalid."
          action={
            <Button
              variant="ghost"
              onClick={() => router.push("/users/members")}
            >
              Back to Members
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
      {backButton}

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <EntityAvatar name={member.name} size="xl" />

          <div className="space-y-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-title font-semibold text-foreground">
                {member.name}
              </h1>
              <StatusBadge
                status={member.status}
                variant={statusVariant(member.status)}
              />
              <Badge
                variant="secondary"
                className="text-label font-medium whitespace-nowrap"
              >
                {member.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-body text-subtle">
              <EnvelopeSimple size={14} className="shrink-0" />
              <span className="font-mono tracking-tight">{member.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-label font-medium text-subtle">
              <span className="flex items-center gap-1.5">
                <Buildings size={14} className="text-faint" />
                {member.organization.name}
              </span>
              <span className="flex items-center gap-1.5">
                <TreeStructure size={14} className="text-faint" />
                {member.branch?.name || "No branch assigned"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DetailSection
            title="Member Details"
            description="Read-only. Workforce details are managed in the Employees module."
            icon={<UserCircle size={16} />}
          >
            <div className="grid grid-cols-1 gap-3">
              <DetailField
                label="Member Type"
                value={
                  <span className="flex flex-wrap items-center gap-2">
                    <span>{member.type}</span>
                    <StatusBadge
                      status={member.status}
                      variant={statusVariant(member.status)}
                    />
                  </span>
                }
              />
              <DetailField
                label="Organisation"
                value={member.organization.name}
                icon={<Buildings size={14} />}
              />
              <DetailField
                label="Branch"
                value={member.branch?.name ?? "—"}
                icon={<TreeStructure size={14} />}
              />
              <DetailField
                label="Device"
                value={
                  member.device
                    ? `${member.device.model} · ${member.device.os}`
                    : "No device signed in"
                }
                icon={<DeviceMobile size={14} />}
              />
              <DetailField
                label="Joined Date"
                value={member.joinedDate}
                icon={<CalendarBlank size={14} />}
              />
              <DetailField
                label="Last Active"
                value={member.lastActive}
                icon={<Clock size={14} />}
              />
              <DetailField
                label="UUID"
                value={
                  <span className="font-mono text-label tracking-tight break-all text-subtle">
                    {member.uuid}
                  </span>
                }
              />
            </div>
          </DetailSection>
        </div>

        <div className="lg:col-span-2">
          <DetailSection
            title="App Activity"
            description="Logins, voucher transactions, and profile changes made in the app."
            icon={<Clock size={16} />}
          >
            {activity.length === 0 ? (
              <EmptyState
                icon={<Clock size={28} weight="light" />}
                title="No activity yet"
                description="App activity for this member will appear here."
              />
            ) : (
              <ActivityTimeline items={activity} />
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
