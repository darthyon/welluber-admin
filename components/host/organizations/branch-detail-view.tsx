"use client"

import { useState } from "react"
import {
  Buildings,
  Gear,
  MapPin,
  Wallet,
  Users,
  Plus,
  Clock,
  ClockCounterClockwise,
  PencilSimpleLine,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { SegmentedTabs } from "@/components/shared/segmented-tabs"
import { ActionPopover } from "@/components/shared/action-popover"
import { InviteAdminModal } from "./invite-admin-modal"
import { StatusBadge } from "@/components/shared/status-badge"
import { BackButton } from "@/components/shared/back-button"
import { EntityHeader } from "@/components/shared/entity-header"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { ManualTopUpModal } from "./manual-topup-modal"
import { TopUpHistoryModal } from "./topup-history-modal"
import { EntityAvatar } from "@/components/shared/entity-avatar"

interface BranchDetailViewProps {
  branchId: string
  onBack: () => void
  onEdit: () => void
}

const BRANCH_DETAIL_TABS = [
  { id: "details", label: "Details", icon: Buildings },
  { id: "configuration", label: "Configuration", icon: Gear },
] as const

const VALID_TABS = new Set<string>(BRANCH_DETAIL_TABS.map((tab) => tab.id))

export function BranchDetailView({
  branchId,
  onBack,
  onEdit,
}: BranchDetailViewProps) {
  const [accountType] = useState<"new" | "existing">("new")
  const [tab, setTab] = useQueryState("orgBranchTab", "details")
  const activeTab = VALID_TABS.has(tab || "") ? tab : "details"

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const branchData = {
    name: branchId === "br_1" ? "ACME HQ (Kuala Lumpur)" : "ACME Subang Jaya",
    type: branchId === "br_1" ? "Headquarters (HQ)" : "Branch Office",
    status: "Active",
    address: {
      line: "Level 12, Menara South",
      city: "Kuala Lumpur",
      state: "Wilayah Persekutuan",
      country: "Malaysia",
      postalCode: "50450",
      timezone: "GMT +8:00",
      coordinates: {
        lat: "3.1390",
        lng: "101.7036",
      },
    },
  }

  const handleResetPassword = (email: string) => {
    const toast = document.createElement("div")
    toast.className =
      "fixed bottom-4 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-body px-4 py-2 rounded-lg shadow-2xl z-[300] border border-border/60 animate-in slide-in-from-bottom-2 duration-300"
    toast.innerText = `Reset password email sent to ${email}`
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.classList.add("animate-out", "fade-out", "zoom-out-95")
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 4000)
  }

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        targetId={branchId}
        title="Invite Branch Admin"
      />

      <div className="flex flex-col gap-4">
        <BackButton onClick={onBack} label="Back to Branches" />

        <EntityHeader
          title={branchData.name}
          subtitle={branchData.type}
          status={branchData.status}
          statusVariant="emerald"
          icon={<Buildings size={24} weight="fill" />}
          actions={
            <Button
              variant="secondary"
              size="lg"
              className="gap-2 rounded-full text-body font-medium transition-all"
              onClick={onEdit}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Branch
            </Button>
          }
        />
      </div>

      <SegmentedTabs
        tabs={BRANCH_DETAIL_TABS}
        activeTab={activeTab}
        onChange={setTab}
      />

      {activeTab === "details" && (
        <>
          <DetailSection
            title="Branch Identity"
            icon={<Buildings size={18} weight="duotone" />}
            description="Basic branch identifiers and operational status"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              <DetailField label="Official Name" value={branchData.name} />
              <DetailField label="Branch Type" value={branchData.type} />
              <div className="space-y-1.5">
                <p className="text-label font-medium text-subtle">
                  Operational Status
                </p>
                <StatusBadge status={branchData.status} variant="emerald" />
              </div>
              <DetailField
                label="Timezone"
                value={branchData.address.timezone}
              />
            </div>
          </DetailSection>

          <DetailSection
            title="Location Mapping"
            icon={<MapPin size={18} weight="duotone" />}
            description="Geographical data and coordinate pinning"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="group/map relative aspect-[16/10] min-h-[300px] overflow-hidden rounded-lg border border-border bg-muted/30 shadow-sm lg:aspect-auto lg:h-full">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-1000 group-hover/map:grayscale-0"
                  style={{
                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}')`,
                  }}
                />
                <div className="absolute inset-0 bg-primary/5 transition-colors duration-700 group-hover/map:bg-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20 p-1.5">
                      <div className="h-full w-full rounded-full bg-primary shadow-lg ring-4 shadow-primary/40 ring-background" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-sm" />
                  </div>
                  <span className="rounded-full border border-primary/20 bg-background/90 px-2 py-0.5 text-label font-medium text-primary backdrop-blur-sm">
                    Pinned
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <DetailField
                    label="Street Address"
                    value={branchData.address.line}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField label="City" value={branchData.address.city} />
                    <DetailField
                      label="Postal Code"
                      value={branchData.address.postalCode}
                    />
                  </div>
                  <DetailField label="State" value={branchData.address.state} />
                  <div className="group/tz relative">
                    <DetailField
                      label="Country"
                      value={branchData.address.country}
                    />
                    <div className="absolute top-0 right-0 flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-label font-medium text-primary/60 opacity-0 transition-all duration-300 select-none group-hover/tz:opacity-100">
                      <Clock size={10} weight="bold" />
                      <span>{branchData.address.timezone}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 border-t border-border/60 pt-6">
                  <DetailField
                    label="Latitude"
                    value={
                      <span className="font-mono text-body text-foreground">
                        {branchData.address.coordinates.lat}
                      </span>
                    }
                  />
                  <DetailField
                    label="Longitude"
                    value={
                      <span className="font-mono text-body text-foreground">
                        {branchData.address.coordinates.lng}
                      </span>
                    }
                  />
                </div>
              </div>
            </div>
          </DetailSection>
        </>
      )}

      {activeTab === "configuration" && (
        <>
          <DetailSection
            title="Account Details"
            icon={<Wallet size={18} weight="duotone" />}
            description="Active configuration of the branch's financial resource pool"
          >
            <div className="group/account relative overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-6 transition-all hover:border-primary/30">
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-transform duration-700 group-hover/account:scale-110" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-md shadow-black/5">
                      <Wallet size={24} weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-lead font-semibold tracking-tight text-foreground">
                        KL HQ Account
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-label text-muted-foreground">
                          Active Configuration
                        </span>
                        <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-label font-medium text-muted-foreground">
                          {accountType === "new" ? "New" : "Existing"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-label font-semibold text-faint">
                      Account Balance
                    </p>
                    <p className="text-display font-semibold tracking-tight text-foreground tabular-nums">
                      RM 45,000.00
                    </p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="h-8 gap-1.5 rounded-full border-border/60 px-3 text-label font-semibold shadow-sm transition-all hover:bg-muted"
                      >
                        <ClockCounterClockwise size={14} weight="bold" />
                        History
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsTopUpModalOpen(true)}
                        className="h-8 gap-1.5 rounded-full bg-primary px-3 text-label font-semibold shadow-lg shadow-primary/10 transition-all hover:bg-primary/90"
                      >
                        <Plus size={14} weight="bold" />
                        Top-Up
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 border-t border-border/40 pt-6 lg:grid-cols-3">
                  <DetailField
                    label="Account ID"
                    value={
                      <span className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-label tracking-tight text-subtle">
                        ACC-20260115-0001
                      </span>
                    }
                  />
                  <DetailField
                    label="Credit Remaining"
                    value={
                      <span className="text-body font-semibold text-subtle">
                        RM 5,000
                      </span>
                    }
                  />
                  <DetailField
                    label="Total Credit Limit"
                    value={
                      <span className="text-body font-medium text-primary">
                        RM 10,000
                      </span>
                    }
                  />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            title="Branch Governance"
            icon={<Users size={18} weight="duotone" />}
            description="Admins with local management access"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 rounded-full text-label font-medium transition-all"
              >
                <Plus size={14} weight="bold" />
                Send Invite
              </Button>
            }
          >
            <div className="space-y-3">
              {[
                {
                  name: "John Doe",
                  email: "john.d@acme.com",
                  role: "Branch Admin",
                },
                {
                  name: "Ahmad Faizal",
                  email: "ahmad.f@acme.com",
                  role: "Operations",
                },
              ].map((admin, i) => (
                <div
                  key={i}
                  className="group relative flex items-center justify-between overflow-hidden rounded-lg border border-border/60 bg-card p-3 transition-all hover:border-primary/20"
                >
                  <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/[0.02]" />
                  <div className="relative z-10 flex items-center gap-3">
                    <EntityAvatar name={admin.name} size="sm" />
                    <div>
                      <p className="text-body leading-tight font-medium text-foreground">
                        {admin.name}
                      </p>
                      <p className="mt-0.5 text-label font-medium text-muted-foreground">
                        {admin.role}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    <StatusBadge status="Admin" variant="emerald" />
                    <ActionPopover
                      actions={[
                        { label: "View Details", onClick: () => {} },
                        {
                          label: "Reset Password",
                          onClick: () => handleResetPassword(admin.email),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </>
      )}

      <ManualTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        orgName="Acme Corporation Sdn Bhd"
        branchName={branchData.name}
        accountId="ACC-20260115-0001"
      />

      <TopUpHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        branchId={branchId}
        branchName={branchData.name}
      />
    </div>
  )
}
