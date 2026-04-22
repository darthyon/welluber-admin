"use client";

import { MapPin, Calendar, Storefront, Receipt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import type { Claim, EmployeeUtilisationRow, FlatClaimRow } from "@/types/claims";

export type { Claim, EmployeeUtilisationRow, FlatClaimRow };

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Claim["status"], string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  Pending:  "bg-amber-500/10  text-amber-600  dark:text-amber-400 border border-amber-500/20",
  Rejected: "bg-rose-500/10   text-rose-600   dark:text-rose-400 border border-rose-500/20",
};

function StatusBadge({ status }: { status: Claim["status"] }) {
  return (
    <span className={cn("text-micro font-semibold px-1.5 py-0.5 rounded", STATUS_STYLE[status])}>
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: EmployeeUtilisationRow[];
}

export function OrganizationClaimsTable({ data }: Props) {
  const flatData: FlatClaimRow[] = data.flatMap(emp =>
    emp.claims.map(claim => ({
      ...claim,
      employeeId: emp.id,
      employeeName: emp.name,
      empCode: emp.empCode,
      branch: emp.branch,
    }))
  );

  const columns: Column<FlatClaimRow>[] = [
    {
      header: "Employee",
      accessorKey: "employeeName",
      render: (row) => (
        <div>
          <p className="text-nav font-semibold text-foreground">{row.employeeName}</p>
          <p className="text-caption text-muted-foreground font-medium mt-0.5">{row.empCode}</p>
        </div>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branch",
      render: (row) => (
        <p className="text-label font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border w-fit">
          {row.branch}
        </p>
      ),
    },
    {
      header: "Voucher",
      accessorKey: "voucherCode",
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          <code className="text-caption font-mono text-muted-foreground">{row.voucherCode}</code>
        </div>
      ),
    },
    {
      header: "Service",
      accessorKey: "service",
      render: (row) => (
        <p className="text-nav font-medium text-foreground/80">{row.service}</p>
      ),
    },
    {
      header: "Provider",
      accessorKey: "provider",
      render: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <Storefront size={11} className="text-muted-foreground/60 shrink-0" />
          <p className="text-nav text-foreground/70 font-medium truncate">{row.provider}</p>
        </div>
      ),
    },
    {
      header: "Location",
      accessorKey: "location",
      render: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={11} className="text-muted-foreground/60 shrink-0" />
          <p className="text-nav text-foreground/70 font-medium truncate">{row.location}</p>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-muted-foreground/60 shrink-0" />
          <p className="text-caption text-muted-foreground font-medium whitespace-nowrap">{row.date}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      align: "right",
      render: (row) => (
        <p className="text-nav font-semibold font-mono text-foreground">
          RM {row.amount.toFixed(2)}
        </p>
      ),
    },
  ];

  if (flatData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border">
        <Receipt size={36} weight="duotone" className="text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium text-nav">No claims recorded yet.</p>
      </div>
    );
  }

  return (
    <SharedDataTable
      data={flatData}
      columns={columns}
      rowsPerPage={10}
      defaultSort={{ key: "date", direction: "desc" }}
    />
  );
}
