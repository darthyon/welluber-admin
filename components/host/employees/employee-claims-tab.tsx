"use client";

import { useMemo, useState } from "react";
import { Receipt, MapPin, Calendar, Storefront, Download } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import type { ClaimStatus, EmployeeClaim } from "@/types/claims";
import { MOCK_EMPLOYEE_CLAIMS } from "@/lib/mock-data";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ClaimStatus, string> = {
  "pre-auth":   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  confirmed:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  cancelled:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span className={cn("text-label font-medium px-1.5 py-0.5 rounded", STATUS_STYLE[status])}>
      {status}
    </span>
  );
}


// ─── Column definitions ───────────────────────────────────────────────────────

const columns: Column<EmployeeClaim>[] = [
  {
    header: "Voucher",
    accessorKey: "voucherCode",
    render: (row) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={row.status} />
        <span className="text-label font-semibold text-primary cursor-pointer hover:underline underline-offset-2">{row.voucherName || row.voucherCode}</span>
      </div>
    ),
  },
  {
    header: "Service",
    accessorKey: "service",
    render: (row) => (
      <p className="text-body font-medium text-subtle">{row.service}</p>
    ),
  },
  {
    header: "Provider",
    accessorKey: "provider",
    render: (row) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <Storefront size={11} className="text-faint shrink-0" />
        <p className="text-body text-subtle font-medium truncate">{row.provider}</p>
      </div>
    ),
  },
  {
    header: "Location",
    accessorKey: "location",
    render: (row) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <MapPin size={11} className="text-faint shrink-0" />
        <p className="text-body text-subtle font-medium truncate">{row.location}</p>
      </div>
    ),
  },
  {
    header: "Date",
    accessorKey: "date",
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <Calendar size={11} className="text-faint shrink-0" />
        <p className="text-label text-muted-foreground font-medium whitespace-nowrap">{row.date}</p>
      </div>
    ),
  },
  {
    header: "Amount",
    accessorKey: "amount",
    align: "right",
    sortable: true,
    render: (row) => (
      <p className="text-body font-semibold font-mono text-foreground">
        RM {row.amount.toFixed(2)}
      </p>
    ),
  },
  {
    header: "Benefit Group",
    accessorKey: "benefitGroup",
    render: (row) => (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-label font-medium">
        {row.benefitGroup}
      </Badge>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EmployeeClaimsTabProps {
  employeeId: string;
}

export function EmployeeClaimsTab({ employeeId: _employeeId }: EmployeeClaimsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");

  const filteredClaims = useMemo(() => {
    return MOCK_EMPLOYEE_CLAIMS.filter((claim) => {
      const matchesSearch =
        searchQuery === "" ||
        claim.voucherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalAmount = filteredClaims.reduce((sum, c) => sum + c.amount, 0);
  const confirmedCount = filteredClaims.filter((c) => c.status === "confirmed").length;
  const preAuthCount = filteredClaims.filter((c) => c.status === "pre-auth").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold text-foreground">Claims</h2>
        <p className="text-body text-muted-foreground mt-2">
          Transaction history, voucher usage, and claim records for this employee.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-primary" />
              <p className="text-label font-medium text-subtle">Total Claims</p>
            </div>
            <p className="text-display font-semibold text-foreground">{filteredClaims.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-label font-medium text-subtle">Confirmed</p>
            </div>
            <p className="text-display font-semibold text-foreground">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-amber-600 dark:text-amber-400" />
              <p className="text-label font-medium text-subtle">Pre-auth</p>
            </div>
            <p className="text-display font-semibold text-foreground tabular-nums">{preAuthCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-foreground" />
              <p className="text-label font-medium text-subtle">Total Amount</p>
            </div>
            <p className="text-display font-semibold text-foreground tabular-nums">RM {totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by voucher, service, or provider..."
        filters={
          <FilterItem
            label="Status"
            options={[
              { label: "All Status", value: "all" },
              { label: "Pre-auth", value: "pre-auth" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ClaimStatus | "all")}
          />
        }
        actions={
          <Button variant="ghost" className="gap-2 text-label" onClick={() => console.log("Export CSV")}>
            <Download size={14} />
            Export CSV
          </Button>
        }
      />

      {/* Table */}
      <SharedDataTable
        data={filteredClaims}
        columns={columns}
        rowsPerPage={10}
        defaultSort={{ key: "date", direction: "desc" }}
      />
    </div>
  );
}
