"use client"

import { Suspense, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Buildings,
  CalendarBlank,
  Clock,
  DeviceMobile,
  EnvelopeSimple,
  Gear,
  IdentificationBadge,
  TreeStructure,
  User,
  UserCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { SegmentedTabs } from "@/components/shared/segmented-tabs"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { EmptyState } from "@/components/shared/empty-state"
import {
  ActivityTimeline,
  type ActivityType,
} from "@/components/shared/activity-timeline"
import { RevokeMemberAccessDialog } from "@/components/host/users/revoke-member-access-dialog"
import { useMembers } from "@/hooks/data-hooks"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { MOCK_MEMBER_ACTIVITY } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Member, MemberActivityType } from "@/features/users/types"

const DETAIL_TABS = [
  { id: "details", label: "Member Details", icon: UserCircle },
  { id: "activity", label: "App Activity", icon: Clock },
  { id: "settings", label: "Settings", icon: Gear },
] as const

const VALID_TABS = new Set<string>(DETAIL_TABS.map((t) => t.id))

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

function MemberDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { members, update } = useMembers()
  const [revokeTarget, setRevokeTarget] = useState<Member | null>(null)
  const [tab, setTab] = useQueryState("tab", "details")
  const activeTab = VALID_TABS.has(tab) ? tab : "details"

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

  const isRevoked = member?.status === "Inactive"

  if (!member) {
    return (
      <div className="space-y-6">
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
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <EntityAvatar name={member.name} size="lg" shape="square" />

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
                <IdentificationBadge size={14} className="shrink-0" />
                <span className="font-mono tracking-tight">{member.id}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Tab nav */}
      <SegmentedTabs tabs={DETAIL_TABS} activeTab={activeTab} onChange={setTab} />

      {activeTab === "details" && (
        <div className="animate-in fade-in">
          <DetailSection
            title="Member Details"
            description="Read-only. Workforce details are managed in the Employees module."
            icon={<UserCircle size={18} weight="duotone" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                label="Email"
                value={
                  <span className="font-mono text-label tracking-tight break-all text-subtle">
                    {member.email}
                  </span>
                }
                icon={<EnvelopeSimple size={14} />}
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
      )}

      {activeTab === "activity" && (
        <div className="animate-in fade-in">
          <DetailSection
            title="App Activity"
            description="Logins, voucher transactions, and profile changes made in the app."
            icon={<Clock size={18} weight="duotone" />}
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
      )}

      {activeTab === "settings" && (
        <div className="animate-in fade-in">
          <DetailSection
            title="Danger Zone"
            icon={<Gear size={18} weight="duotone" />}
            description="Confirm how you want to change this member's app access."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-body font-medium text-foreground">
                      {isRevoked
                        ? "Restore App Access"
                        : "Revoke App Access"}
                    </p>
                    <p className="text-label text-muted-foreground">
                      {isRevoked
                        ? "Let this member sign in to the app again."
                        : "Sign the member out on all devices and block the app. Records are kept."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 text-label",
                      isRevoked
                        ? "border-primary/30 text-primary hover:bg-primary/5"
                        : "border-destructive/30 text-destructive hover:bg-destructive/5"
                    )}
                    onClick={() =>
                      isRevoked
                        ? update(member.id, { status: "Active" })
                        : setRevokeTarget(member)
                    }
                  >
                    {isRevoked ? "Restore Access" : "Revoke Access"}
                  </Button>
                </div>
              </div>
            </div>
          </DetailSection>
        </div>
      )}

      <RevokeMemberAccessDialog
        member={revokeTarget}
        onClose={() => setRevokeTarget(null)}
      />
    </div>
  )
}

export default function MemberDetailPage() {
  return (
    <Suspense fallback={null}>
      <MemberDetail />
    </Suspense>
  )
}
