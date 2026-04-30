"use client";

import { useState, useMemo } from "react";
import {
  Ticket,
  Calendar,
  User,
  Storefront,
  Buildings,
  MapPin,
  Eye,
  Download,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { ActionPopover } from "@/components/shared/action-popover";
import type { EmployeeUtilisationRow, ClaimStatus } from "@/types/claims";

// ─── Derived redemption row ───────────────────────────────────────────────────

interface RedemptionRow {
  id: string;
  voucherCode: string;
  voucherName: string;
  date: string;
  employeeName: string;
  empCode: string;
  redeemedBy: string;
  redeemedByType: string;
  amount: number;
  provider: string;
  branch: string;
  city: string;
  status: ClaimStatus;
}

function deriveRedemptions(data: EmployeeUtilisationRow[]): RedemptionRow[] {
  const rows: RedemptionRow[] = [];
  data.forEach((emp) => {
    emp.claims.forEach((claim) => {
      rows.push({
        id: claim.id,
        voucherCode: claim.voucherCode,
        voucherName: claim.voucherName || claim.voucherCode,
        date: claim.date,
        employeeName: emp.name,
        empCode: emp.empCode,
        redeemedBy: emp.name,
        redeemedByType: "Employee",
        amount: claim.amount,
        provider: claim.provider,
        branch: emp.branch,
        city: claim.location,
        status: claim.status,
      });
    });
  });
  return rows;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ClaimStatus, string> = {
  "pre-auth":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  confirmed:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  cancelled:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        "text-label font-medium px-1.5 py-0.5 rounded",
        STATUS_STYLE[status]
      )}
    >
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: EmployeeUtilisationRow[];
  onViewVoucher?: (redemption: RedemptionRow) => void;
}

export function VouchersTable({ data, onViewVoucher }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");

  const redemptions = useMemo(() => deriveRedemptions(data), [data]);

  const filtered = redemptions.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      [
        r.voucherCode,
        r.voucherName,
        r.employeeName,
        r.empCode,
        r.provider,
        r.city,
        r.redeemedBy,
      ].some((f) => String(f).toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<RedemptionRow>[] = [
    {
      header: "Voucher",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <p className="text-body font-semibold text-primary cursor-pointer hover:underline underline-offset-2">
            {row.voucherName}
          </p>
          <code className="text-label font-mono text-muted-foreground">
            {row.voucherCode}
          </code>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-faint shrink-0" />
          <p className="text-label text-muted-foreground font-medium whitespace-nowrap">
            {row.date}
          </p>
        </div>
      ),
    },
    {
      header: "Employee",
      render: (row) => (
        <div>
          <p className="text-body font-medium text-foreground">
            {row.employeeName}
          </p>
          <p className="text-label text-muted-foreground font-medium mt-0.5">
            {row.empCode}
          </p>
        </div>
      ),
    },
    {
      header: "Redeemed By",
      render: (row) => (
        <div>
          <p className="text-body font-medium text-foreground">
            {row.redeemedBy}
          </p>
          <p className="text-label text-muted-foreground font-medium mt-0.5">
            {row.redeemedByType}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      align: "right",
      render: (row) => (
        <p className="text-body font-semibold font-mono text-foreground">
          RM {row.amount.toFixed(2)}
        </p>
      ),
    },
    {
      header: "Service Provider",
      render: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <Storefront size={11} className="text-faint shrink-0" />
          <p className="text-body text-subtle font-medium truncate">
            {row.provider}
          </p>
        </div>
      ),
    },
    {
      header: "Branch",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Buildings size={11} className="text-faint shrink-0" />
            <p className="text-body font-medium text-foreground truncate">
              {row.branch}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-label text-muted-foreground font-medium">
            <MapPin size={11} className="shrink-0" />
            {row.city}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "",
      align: "right",
      render: (row) => (
        <ActionPopover
          align="end"
          actions={[
            {
              label: "View",
              icon: <Eye size={14} />,
              onClick: () => onViewVoucher?.(row),
            },
            {
              label: "Download",
              icon: <Download size={14} />,
              onClick: () => console.log("Download voucher", row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vouchers..."
        filters={
          <FilterItem
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ClaimStatus | "all")}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Pre-auth", value: "pre-auth" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        }
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border">
          <Ticket
            size={36}
            weight="duotone"
            className="text-faint mb-3"
          />
          <p className="text-muted-foreground font-medium text-body">
            No vouchers found.
          </p>
        </div>
      ) : (
        <SharedDataTable
          data={filtered}
          columns={columns}
          rowsPerPage={10}
          defaultSort={{ key: "date", direction: "desc" }}
        />
      )}
    </div>
  );
}
