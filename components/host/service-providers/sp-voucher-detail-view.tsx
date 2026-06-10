"use client"

import {
  Buildings,
  CalendarBlank,
  CurrencyCircleDollar,
  Stack,
  Ticket,
} from "@phosphor-icons/react"
import { DetailField } from "@/components/shared/detail-field"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  SP_VOUCHER_STATUS_VARIANT,
  SpVoucherDetailHeader,
  SpVoucherDetailSidebar,
  SpVoucherServiceLinesSection,
} from "@/components/host/service-providers/sp-voucher-detail-sections"
import { resolveBranchServiceView } from "@/features/providers/service-taxonomy"
import type { SpVoucher } from "@/types/provider"
import { formatDateTime, getCurrencyLabel } from "@/lib/utils"

interface SpVoucherDetailViewProps {
  voucher: SpVoucher
  serviceCategories: string[]
  branchNames: { id: string; name: string }[]
  onBack: () => void
  onEdit: () => void
}

export function SpVoucherDetailView({
  voucher,
  serviceCategories,
  branchNames,
  onBack,
  onEdit,
}: SpVoucherDetailViewProps) {
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

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      <SpVoucherDetailHeader
        voucher={voucher}
        onBack={onBack}
        onEdit={onEdit}
      />

      <div className="relative flex flex-col items-start gap-8 xl:flex-row">
        <SpVoucherDetailSidebar />

        <div className="flex-1">
          <div className="flex flex-col gap-6">
            <div
              id="voucher-details"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Ticket size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Voucher Details
                  </h3>
                </div>

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
              </div>
            </div>

            <div
              id="commercials"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CurrencyCircleDollar size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Commercials
                  </h3>
                </div>
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

            <SpVoucherServiceLinesSection
              groups={groups}
              customServices={customServices}
            />

            <div
              id="lifecycle"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Stack size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Lifecycle & Validity
                  </h3>
                </div>

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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>
              </div>
            </div>

            <div
              id="branch-assignment"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Buildings size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Branch Assignment
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Which locations accept this voucher.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <DetailField
                    label="Scope"
                    value={
                      voucher.branchScope === "all"
                        ? "All Branches"
                        : "Selected Branches"
                    }
                  />
                  {voucher.branchScope === "specific" ? (
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
                  ) : null}
                </div>
              </div>
            </div>

            <div
              id="booking"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarBlank size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Booking & Display
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-label font-medium text-subtle">
                      Booking Required
                    </p>
                    <StatusBadge
                      status={voucher.bookingRequired ? "Yes" : "No"}
                      variant={voucher.bookingRequired ? "emerald" : "zinc"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-64" />
    </div>
  )
}
