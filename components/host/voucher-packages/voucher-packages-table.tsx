"use client"

import { SharedDataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"
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
  "emerald" | "amber" | "zinc" | "rose" | "primary"
> = {
  draft: "zinc",
  published: "amber",
  activated: "emerald",
  paused: "rose",
  ended: "zinc",
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
              <p className="text-label font-mono text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded leading-none border border-border/50">
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
                <span
                  key={i}
                  className="rounded-md border border-border bg-muted/80 px-2 py-0.5 text-label font-semibold text-muted-foreground"
                >
                  {name}
                </span>
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
                <span className="ml-2 inline-flex items-center gap-1 text-label font-medium text-primary/70 tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                  Booking Required
                </span>
              )}
            </p>
          ),
        },
        {
          header: "Period",
          render: (voucher) => (
            <div className="text-label text-muted-foreground space-y-0.5">
              <p className="font-medium text-subtle">
                {new Date(voucher.activationPeriod.startDate).toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short", year: "numeric" }
                )}
              </p>
              {voucher.activationPeriod.endDate ? (
                <p>
                  →{" "}
                  {new Date(
                    voucher.activationPeriod.endDate
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              ) : (
                <p className="text-label text-faint italic">Open-ended</p>
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
