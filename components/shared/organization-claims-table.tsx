"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Storefront,
  Receipt,
  DotsThreeVertical,
  FileText,
  Eye,
  Download,
  Ticket,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { ActionPopover } from "@/components/shared/action-popover";
import { StatusBadge } from "@/components/shared/status-badge";
import type {
  ClaimStatus,
  TransactionType,
  EmployeeUtilisationRow,
  FlatClaimRow,
} from "@/types/claims";

const TXN_LABEL: Record<TransactionType, string> = {
  redemption: "Voucher Redemption",
  reimbursement: "Reimbursement",
  refund: "Refund",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: EmployeeUtilisationRow[];
  onViewVoucher?: (claim: FlatClaimRow) => void;
  onViewDetails?: (claim: FlatClaimRow) => void;
}

export function OrganizationClaimsTable({
  data,
  onViewVoucher,
  onViewDetails,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");
  const [txnFilter, setTxnFilter] = useState<TransactionType | "all">("all");

  const flatData: FlatClaimRow[] = data.flatMap((emp) =>
    emp.claims.map((claim) => ({
      ...claim,
      employeeId: emp.id,
      employeeName: emp.name,
      empCode: emp.empCode,
      branch: emp.branch,
    }))
  );

  const filteredData = flatData.filter((row) => {
    const matchesSearch =
      !searchQuery ||
      [
        row.id,
        row.employeeName,
        row.empCode,
        row.provider,
        row.location,
        row.voucherCode,
        row.voucherName,
      ].some((f) => String(f).toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    const matchesTxn = txnFilter === "all" || row.transactionType === txnFilter;
    return matchesSearch && matchesStatus && matchesTxn;
  });

  const columns: Column<FlatClaimRow>[] = [
    {
      header: "Claim ID",
      accessorKey: "id",
      render: (row) => (
        <code className="text-label font-mono text-muted-foreground">
          {row.id}
        </code>
      ),
    },
    {
      header: "Claim Title",
      render: (row) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-body font-medium text-foreground truncate">
            {TXN_LABEL[row.transactionType]} at {row.provider}
          </p>
          <p className="text-label text-muted-foreground font-medium truncate">
            {row.location}
          </p>
        </div>
      ),
    },
    {
      header: "City",
      accessorKey: "location",
      render: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={11} className="text-faint shrink-0" />
          <p className="text-body text-subtle font-medium truncate">
            {row.location}
          </p>
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
      accessorKey: "employeeName",
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
      header: "Status",
      accessorKey: "status",
      render: (row) => (
        <StatusBadge
          status={row.status}
          variant={
            row.status === "pre-auth"
              ? "amber"
              : row.status === "confirmed"
                ? "emerald"
                : "rose"
          }
        />
      ),
    },
    {
      header: "Voucher",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewVoucher?.(row);
          }}
          className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          <Ticket size={14} weight="bold" />
          <span className="text-label font-semibold hover:underline underline-offset-2">
            {row.voucherName || row.voucherCode}
          </span>
        </button>
      ),
    },
    {
      header: "",
      align: "right",
      render: (row) => (
        <ActionPopover
          align="end"
          actions={[
            {
              label: "View Details",
              icon: <Eye size={14} />,
              onClick: () => onViewDetails?.(row),
            },
            {
              label: "View Voucher",
              icon: <Ticket size={14} />,
              onClick: () => onViewVoucher?.(row),
            },
            {
              label: "Download PDF",
              icon: <Download size={14} />,
              onClick: () => console.log("Download PDF", row.id),
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
        searchPlaceholder="Search claims..."
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
            <FilterItem
              label="Type"
              value={txnFilter}
              onChange={(v) => setTxnFilter(v as TransactionType | "all")}
              options={[
                { label: "All Types", value: "all" },
                { label: "Redemption", value: "redemption" },
                { label: "Reimbursement", value: "reimbursement" },
                { label: "Refund", value: "refund" },
              ]}
            />
          </div>
        }
      />

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border">
          <Receipt
            size={36}
            weight="duotone"
            className="text-faint mb-3"
          />
          <p className="text-muted-foreground font-medium text-body">
            No claims recorded yet.
          </p>
        </div>
      ) : (
        <SharedDataTable
          data={filteredData}
          columns={columns}
          rowsPerPage={10}
          defaultSort={{ key: "date", direction: "desc" }}
        />
      )}
    </div>
  );
}
