"use client"

import { ListBullets, Stack, Ticket } from "@phosphor-icons/react"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { SegmentedTabs } from "@/components/shared/segmented-tabs"
import { DetailField } from "@/components/shared/detail-field"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  SP_VOUCHER_STATUS_VARIANT,
  SpVoucherDetailHeader,
  SpVoucherServiceLinesSection,
} from "@/components/host/service-providers/sp-voucher-detail-sections"
import { resolveBranchServiceView } from "@/features/providers/service-taxonomy"
import type { SpBranchBookingSettings, SpVoucher } from "@/types/provider"
import { formatDateTime, getCurrencyLabel } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const BOOKING_CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  email: "Email",
  phone: "Phone Number",
  booking_website: "Booking Website",
} as const

const VOUCHER_DETAIL_TABS = [
  { id: "details", label: "Details", icon: Ticket },
  { id: "voucher-configuration", label: "Voucher Configuration", icon: Stack },
  { id: "manage-services", label: "Manage Services", icon: ListBullets },
] as const

const VALID_TABS = new Set<string>(VOUCHER_DETAIL_TABS.map((t) => t.id))

interface SpVoucherDetailViewProps {
  voucher: SpVoucher
  serviceCategories: string[]
  branchNames: { id: string; name: string; booking: SpBranchBookingSettings }[]
  onBack: () => void
  onEdit: () => void
}

function BookingInfoList({
  branches,
}: {
  branches: { id: string; name: string; booking: SpBranchBookingSettings }[]
}) {
  return (
    <div className="divide-y divide-border pt-1">
      {branches.map((branch) => (
        <div key={branch.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
          <p className="text-body font-semibold text-foreground">{branch.name}</p>
          {(branch.booking.channels?.length ?? 0) === 0 ? (
            <p className="text-label text-destructive">
              No booking channels configured.
            </p>
          ) : (
            <div className="space-y-2">
              {branch.booking.channels.map((channel) => {
                const value =
                  channel === "whatsapp"
                    ? branch.booking.whatsapp?.phoneNumber
                    : channel === "email"
                      ? branch.booking.email?.email
                      : channel === "phone"
                        ? branch.booking.phone?.phoneNumber
                        : branch.booking.link?.url
                return (
                  <div key={channel} className="flex items-center justify-between gap-4">
                    <span className="text-label text-muted-foreground">
                      {BOOKING_CHANNEL_LABELS[channel]}
                    </span>
                    <span className="font-mono text-label font-medium text-foreground">
                      {value || "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function SpVoucherDetailView({
  voucher,
  serviceCategories,
  branchNames,
  onBack,
  onEdit,
}: SpVoucherDetailViewProps) {
  const [tab, setTab] = useQueryState("vtab", "details")
  const activeTab = VALID_TABS.has(tab || "") ? (tab as string) : "details"

  const { groups, customServices } = resolveBranchServiceView(
    serviceCategories,
    voucher.serviceLines
  )
  const assignedBranches =
    voucher.branchScope === "all"
      ? ["All Branches"]
      : (voucher.branchIds
          .map((id) => branchNames.find((branch) => branch.id === id)?.name)
          .filter(Boolean) as string[])

  const applicableBranches =
    voucher.branchScope === "all"
      ? branchNames
      : branchNames.filter((b) => (voucher.branchIds ?? []).includes(b.id))

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      <SpVoucherDetailHeader
        voucher={voucher}
        onBack={onBack}
        onEdit={onEdit}
      />

      <SegmentedTabs
        tabs={VOUCHER_DETAIL_TABS}
        activeTab={activeTab}
        onChange={setTab}
      />

      <div className="min-w-0">
        {/* ── Details ─────────────────────────────────────────────── */}
        {activeTab === "details" && (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="space-y-6 p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailField label="Voucher Name" value={voucher.name} />
                  <DetailField
                    label="Package ID"
                    value={
                      <span className="rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-body text-muted-foreground">
                        {voucher.code}
                      </span>
                    }
                  />
                </div>

                <DetailField
                  label="Description"
                  value={voucher.description || undefined}
                />
                {voucher.summary ? (
                  <DetailField label="Summary" value={voucher.summary} />
                ) : null}

                <div className="space-y-1.5">
                  <p className="text-label font-medium text-subtle">Status</p>
                  <StatusBadge
                    status={voucher.status}
                    variant={SP_VOUCHER_STATUS_VARIANT[voucher.status]}
                  />
                </div>

                <div className="h-px bg-border/40" />

                {/* Branch Assignment */}
                <div className="space-y-3">
                  <p className="text-label font-medium text-foreground">
                    Branch Assignment
                  </p>
                  <DetailField
                    label="Scope"
                    value={
                      voucher.branchScope === "all"
                        ? "All Branches"
                        : "Selected Branches"
                    }
                  />
                  {voucher.branchScope === "specific" && (
                    <div className="space-y-2">
                      <p className="text-label font-medium text-subtle">
                        Assigned Branches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {assignedBranches.length > 0 ? (
                          assignedBranches.map((name) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className="px-3 py-1 text-label font-medium"
                            >
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-body text-subtle italic">
                            No branches assigned.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-border/40" />

                {/* Booking Required */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-label font-medium text-subtle">
                      Booking Required
                    </p>
                    <StatusBadge
                      status={voucher.bookingRequired ? "Yes" : "No"}
                      variant={voucher.bookingRequired ? "emerald" : "zinc"}
                    />
                  </div>
                  {voucher.bookingRequired && applicableBranches.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-label font-medium text-primary underline-offset-2 hover:underline"
                        >
                          View Booking Info
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Branch Booking Info</DialogTitle>
                        </DialogHeader>
                        <BookingInfoList branches={applicableBranches} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Voucher Configuration ────────────────────────────────── */}
        {activeTab === "voucher-configuration" && (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="space-y-6 p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailField
                    label="No. of Vouchers"
                    value={voucher.voucherCount ?? "—"}
                  />
                  <DetailField
                    label="Max Distribution Per User"
                    value={voucher.maxUsagePerUser ?? "—"}
                  />
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <p className="text-body font-semibold text-foreground">
                    Listing Period
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailField
                      label="Start Date & Time"
                      value={formatDateTime(voucher.activationPeriod.startDate)}
                    />
                    <DetailField
                      label="End Date & Time"
                      value={formatDateTime(voucher.activationPeriod.endDate)}
                    />
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <p className="text-body font-semibold text-foreground">
                    Expiry
                  </p>
                  <DetailField
                    label="Expires"
                    value={
                      voucher.expiryMode === "date"
                        ? formatDateTime(voucher.expiryDate)
                        : voucher.expiryDays
                          ? `${voucher.expiryDays} days after purchase`
                          : "—"
                    }
                  />
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <p className="text-body font-semibold text-foreground">
                    Pricing
                  </p>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <DetailField
                      label="Currency"
                      value={getCurrencyLabel(voucher.currency)}
                    />
                    <DetailField
                      label="Initial Price"
                      value={
                        <span className="font-mono">
                          {getCurrencyLabel(voucher.currency)}{" "}
                          {voucher.initialPrice.toFixed(2)}
                        </span>
                      }
                    />
                    <DetailField
                      label="Final Price"
                      value={
                        <span className="font-mono font-semibold text-primary">
                          {getCurrencyLabel(voucher.currency)}{" "}
                          {voucher.finalPrice.toFixed(2)}
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Manage Services ──────────────────────────────────────── */}
        {activeTab === "manage-services" && (
          <SpVoucherServiceLinesSection
            groups={groups}
            customServices={customServices}
          />
        )}
      </div>
    </div>
  )
}
