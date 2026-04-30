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

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CLAIMS: EmployeeClaim[] = [
  { id: "c1", voucherCode: "VCH-2024-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Gymnasium Facilities", provider: "Celebrity Fitness KLCC", location: "Kuala Lumpur", date: "12 Mar 2024", amount: 180, status: "confirmed", benefitGroup: "Gym Membership" },
  { id: "c2", voucherCode: "VCH-2024-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Clinical Therapy", provider: "Mind & Soul Clinic", location: "Mont Kiara", date: "20 Mar 2024", amount: 320, status: "confirmed", benefitGroup: "Mental Health" },
  { id: "c3", voucherCode: "VCH-2024-0198", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Group Fitness", provider: "Ritual Yoga Studio", location: "Bangsar", date: "01 Apr 2024", amount: 95, status: "pre-auth", benefitGroup: "Gym Membership" },
  { id: "c4", voucherCode: "VCH-2024-0211", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Dietary Counseling", provider: "NutriCare Clinic", location: "Damansara", date: "05 Apr 2024", amount: 605, status: "confirmed", benefitGroup: "Mental Health" },
  { id: "c5", voucherCode: "VCH-2024-0033", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Grab Food Voucher", provider: "Grab Malaysia", location: "Online", date: "03 Jan 2024", amount: 200, status: "confirmed", benefitGroup: "Food & Beverage" },
  { id: "c6", voucherCode: "VCH-2024-0102", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Flight Subsidy", provider: "AirAsia", location: "KLIA2", date: "15 Feb 2024", amount: 450, status: "confirmed", benefitGroup: "Travel" },
  { id: "c7", voucherCode: "VCH-2024-0189", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Hotel Stay", provider: "Marriott Putrajaya", location: "Putrajaya", date: "20 Mar 2024", amount: 200, status: "pre-auth", benefitGroup: "Travel" },
];

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
    return MOCK_CLAIMS.filter((claim) => {
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
              <Receipt size={16} className="text-emerald-500" />
              <p className="text-label font-medium text-subtle">Confirmed</p>
            </div>
            <p className="text-display font-semibold text-foreground">{confirmedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-amber-500" />
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
