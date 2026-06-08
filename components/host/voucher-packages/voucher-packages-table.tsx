"use client"

import { SharedDataTable } from "@/components/shared/data-table"
import { formatDateTime, getCurrencyLabel } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"
import { Badge } from "@/components/ui/badge"
import type { SpVoucher, SpVoucherStatus } from "@/types/provider"

export interface VoucherPackageItem extends SpVoucher {
  providerName: string
  redemptionCount: number
  totalRedemptionAmount: number
  branchNames: string[]
}

interface VoucherPackagesTableProps {
  data: VoucherPackageItem[]
  onView?: (voucher: VoucherPackageItem) => void
  onEdit?: (voucher: VoucherPackageItem) => void
  onViewGenerated?: (voucher: VoucherPackageItem) => void
}

const STATUS_VARIANT: Record<SpVoucherStatus, "emerald" | "zinc" | "rose"> = {
  draft: "zinc",
  published: "emerald",
  expired: "rose",
}

export function VoucherPackagesTable({
  data,
  onView,
  onEdit,
  onViewGenerated,
}: VoucherPackagesTableProps) {
  return (
    <SharedDataTable
      data={data}
      freezeFirst
      freezeLast
      columns={[
        {
          header: "Voucher",
          accessorKey: "name",
          sortable: true,
          render: (voucher) => (
            <div className="space-y-1">
              <p className="text-body leading-none font-medium text-foreground">
                {voucher.name}
              </p>
              <p className="tracking-tight w-fit rounded border border-border/50 bg-muted px-1.5 py-0.5 font-mono text-label leading-none text-subtle">
                {voucher.code}
              </p>
            </div>
          ),
        },
        {
          header: "Service Provider",
          accessorKey: "providerName",
          sortable: true,
          render: (voucher) => (
            <span className="text-label font-medium text-foreground">
              {voucher.providerName}
            </span>
          ),
        },
        {
          header: "Branch",
          render: (voucher) => (
            <div className="flex max-w-[200px] flex-wrap gap-1">
              {voucher.branchNames.map((name, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-label font-medium whitespace-nowrap"
                >
                  {name}
                </Badge>
              ))}
            </div>
          ),
        },
        {
          header: "Description",
          accessorKey: "description",
          render: (voucher) => (
            <p className="line-clamp-2 max-w-[300px] text-label leading-relaxed text-muted-foreground">
              {voucher.description || "—"}
              {voucher.bookingRequired && (
                <Badge
                  variant="outline"
                  className="ml-2 text-label font-medium"
                >
                  Booking Required
                </Badge>
              )}
            </p>
          ),
        },
        {
          header: "Usage Period",
          render: (voucher) => (
            <div className="space-y-0.5 text-label">
              <p className="font-medium whitespace-nowrap text-subtle">
                {formatDateTime(voucher.activationPeriod.startDate)}
              </p>
              <p className="whitespace-nowrap text-subtle">
                → {formatDateTime(voucher.activationPeriod.endDate)}
              </p>
            </div>
          ),
        },
        {
          header: "Amount",
          accessorKey: "finalPrice",
          sortable: true,
          render: (voucher) => (
            <div className="space-y-0.5">
              {voucher.initialPrice !== voucher.finalPrice && (
                <p className="text-label text-faint line-through">
                  {getCurrencyLabel(voucher.currency)} {voucher.initialPrice}
                </p>
              )}
              <p className="font-mono text-body font-medium text-foreground">
                {getCurrencyLabel(voucher.currency)} {voucher.finalPrice}
              </p>
            </div>
          ),
        },
        {
          header: "Redemptions",
          render: (voucher) => (
            <div className="space-y-0.5">
              <p className="text-body font-medium text-foreground">
                {voucher.redemptionCount.toLocaleString()}
              </p>
              <p className="font-mono text-label text-muted-foreground">
                {getCurrencyLabel(voucher.currency)}{" "}
                {voucher.totalRedemptionAmount.toLocaleString()}
              </p>
            </div>
          ),
        },
        {
          header: "Status",
          accessorKey: "status",
          sortable: true,
          render: (voucher) => (
            <StatusBadge
              status={voucher.status}
              variant={STATUS_VARIANT[voucher.status]}
              className="w-fit"
            />
          ),
        },
        {
          header: "",
          align: "right",
          render: (voucher) => (
            <div className="flex justify-end pr-1">
              <ActionPopover
                actions={[
                  {
                    label: "View Voucher Package",
                    onClick: () => onView?.(voucher),
                  },
                  {
                    label: "Edit Voucher Package",
                    onClick: () => onEdit?.(voucher),
                  },
                  {
                    label: "View Generated Vouchers",
                    onClick: () => onViewGenerated?.(voucher),
                  },
                  {
                    label: "Suspend Voucher",
                    onClick: () => {},
                  },
                  {
                    label: "Remove Voucher",
                    isDanger: true,
                    onClick: () => {},
                  },
                ]}
              />
            </div>
          ),
        },
      ]}
    />
  )
}
