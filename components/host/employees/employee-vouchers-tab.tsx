"use client";

import { useState, useMemo } from "react";
import {
  Ticket,
  Calendar,
  Storefront,
  Buildings,
  MapPin,
  Eye,
  Download,
  User,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { ActionPopover } from "@/components/shared/action-popover";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import type { ClaimStatus } from "@/types/claims";
import type { VoucherRedemption } from "@/features/employees/types";
import { MOCK_EMPLOYEE_VOUCHERS } from "@/lib/mock-data";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ClaimStatus, string> = {
  "pre-auth":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  confirmed:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  cancelled:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  pending_review:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  flagged:
    "bg-destructive/10 text-destructive border border-destructive/20",
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        "text-label font-medium px-2 py-0.5 rounded-4xl",
        STATUS_STYLE[status]
      )}
    >
      {status}
    </span>
  );
}

// ─── Card View ────────────────────────────────────────────────────────────────

function VoucherCard({ voucher }: { voucher: VoucherRedemption }) {
  return (
    <div className="group glass-card rounded-lg p-5 relative flex flex-col h-full overflow-hidden">
      {/* Decorative Accent */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg border border-border/40 flex items-center justify-center bg-muted/30 text-primary font-semibold text-label group-hover:scale-105 transition-all duration-500 shadow-sm overflow-hidden">
              <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                <Ticket size={18} weight="bold" />
              </div>
            </div>
            {voucher.status === "confirmed" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary border-2 border-background rounded-full shadow-sm" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-body text-foreground group-hover:text-primary transition-colors truncate tracking-tight max-w-[180px]">
                {voucher.voucherName}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={voucher.status} />
              <code className="text-micro text-faint font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">
                {voucher.voucherCode}
              </code>
            </div>
          </div>
        </div>

        <ActionPopover
          align="end"
          actions={[
            {
              label: "View",
              icon: <Eye size={14} />,
              onClick: () => {},
            },
            {
              label: "Download",
              icon: <Download size={14} />,
              onClick: () => {},
            },
          ]}
        />
      </div>

      <div className="flex-1 space-y-5 relative z-10">
        {/* Category & Benefit Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-label font-semibold text-faint">
              Category
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
              {voucher.category}
            </span>
            <span className="text-label font-medium text-subtle bg-muted px-2 py-0.5 rounded border border-border/40">
              {voucher.benefitType}
            </span>
          </div>
        </div>

        {/* Redeemed By */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-faint">
            <User size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Redeemed By
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-foreground">
              {voucher.redeemedBy}
            </span>
            <span className="text-label font-medium text-faint bg-muted px-1.5 py-0.5 rounded border border-border/40">
              {voucher.redeemedByType}
            </span>
          </div>
        </div>

        {/* Provider */}
        <div className="bg-muted/30 rounded-lg px-4 py-3 border border-border/60">
          <div className="flex items-center gap-1.5 text-faint mb-2">
            <Storefront size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Service Provider
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-body font-medium text-foreground truncate">
              {voucher.provider}
            </p>
            <div className="flex items-center gap-1 text-label text-muted-foreground font-medium">
              <MapPin size={14} className="shrink-0" />
              {voucher.city}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-faint">
            <Calendar size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Date
            </span>
          </div>
          <span className="text-label font-semibold text-subtle block">
            {voucher.date}
          </span>
        </div>
        <div className="space-y-1.5 text-right">
          <div className="flex items-center justify-end gap-1.5 text-faint">
            <span className="text-label font-semibold text-faint">
              Amount
            </span>
          </div>
          <span className="text-label font-semibold font-mono text-foreground block">
            RM {voucher.amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

const columns: Column<VoucherRedemption>[] = [
  {
    header: "Voucher",
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <p className="text-body font-medium text-primary cursor-pointer hover:underline underline-offset-2">
          {row.voucherName}
        </p>
        <code className="text-label font-mono text-subtle tracking-tight">
          {row.voucherCode}
        </code>
      </div>
    ),
  },
  {
    header: "Category",
    render: (row) => (
      <div className="flex flex-col gap-1">
        <span className="text-label font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 w-fit">
          {row.category}
        </span>
        <span className="text-label font-medium text-subtle">
          {row.benefitType}
        </span>
      </div>
    ),
  },
  {
    header: "Date",
    accessorKey: "date",
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-faint shrink-0" />
        <p className="text-label text-subtle font-medium whitespace-nowrap">
          {row.date}
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
        <p className="text-label text-subtle font-medium mt-0.5">
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
        <Storefront size={14} className="text-faint shrink-0" />
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
          <Buildings size={14} className="text-faint shrink-0" />
          <p className="text-body font-medium text-foreground truncate">
            {row.branch}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-label text-subtle font-medium">
          <MapPin size={14} className="shrink-0" />
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
            onClick: () => {},
          },
          {
            label: "Download",
            icon: <Download size={14} />,
            onClick: () => {},
          },
        ]}
      />
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EmployeeVouchersTabProps {
  employeeId: string;
}

export function EmployeeVouchersTab({ employeeId }: EmployeeVouchersTabProps) {
  void employeeId;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filtered = useMemo(() => {
    return MOCK_EMPLOYEE_VOUCHERS.filter((v) => {
      const matchesSearch =
        !searchQuery ||
        [
          v.voucherCode,
          v.voucherName,
          v.category,
          v.benefitType,
          v.provider,
          v.city,
          v.redeemedBy,
        ].some((f) =>
          String(f).toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold text-foreground">Vouchers</h2>
        <p className="text-body text-muted-foreground mt-2">
          Voucher redemption records for this employee.
        </p>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search vouchers..."
        filters={
          <div className="flex items-center gap-6">
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
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
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
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((voucher) => (
            <VoucherCard key={voucher.id} voucher={voucher} />
          ))}
        </div>
      ) : (
        <SharedDataTable
          data={filtered}
          columns={columns}
          rowsPerPage={10}
          freezeFirst
          freezeLast
          defaultSort={{ key: "date", direction: "desc" }}
        />
      )}
    </div>
  );
}
