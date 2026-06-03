"use client"

import { SharedDataTable } from "@/components/shared/data-table"
import { formatDate } from "@/lib/utils"
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

const STATUS_VARIANT: Record<
  SpVoucherStatus,
  "emerald" | "zinc" | "rose"
> = {
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
              <p className="text-body font-medium text-foreground leading-none">
                {voucher.name}
              </p>
              <p className="text-label font-mono text-subtle tracking-tight bg-muted w-fit px-1.5 py-0.5 rounded leading-none border border-border/50">
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
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {voucher.branchNames.map((name, i) => (
                <Badge key={i} variant="outline" className="text-label font-medium whitespace-nowrap">
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
            <p className="text-label text-muted-foreground leading-relaxed line-clamp-2 max-w-[300px]">
              {voucher.description || "—"}
              {voucher.bookingRequired && (
                <Badge variant="outline" className="ml-2 text-label font-medium">
                  Booking Required
                </Badge>
              )}
            </p>
          ),
        },
        {
          header: "Period",
          render: (voucher) => (
            <div className="text-label space-y-0.5">
              <p className="font-medium text-subtle whitespace-nowrap">
                {formatDate(voucher.activationPeriod.startDate)}
              </p>
              {voucher.activationPeriod.endDate ? (
                <p className="text-subtle whitespace-nowrap">
                  → {formatDate(voucher.activationPeriod.endDate)}
                </p>
              ) : (
                <p className="text-faint italic">Open-ended</p>
              )}
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
                  RM {voucher.initialPrice}
                </p>
              )}
              <p className="text-body font-medium text-foreground font-mono">
                RM {voucher.finalPrice}
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
              <p className="text-label text-muted-foreground font-mono">
                RM {voucher.totalRedemptionAmount.toLocaleString()}
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
