"use client"

import { useState, useMemo } from "react"
import {
  Receipt,
  MapPin,
  Calendar,
  Ticket,
  Eye,
  Download,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { ActionPopover } from "@/components/shared/action-popover"
import { StatusBadge } from "@/components/shared/status-badge"
import type { ClaimStatus, TransactionType } from "@/types/claims"

// ─── Extended Types ───────────────────────────────────────────────────────────

interface GlobalClaimRow {
  id: string
  voucherCode: string
  voucherName?: string
  transactionType: TransactionType
  service: string
  provider: string
  location: string
  date: string
  amount: number
  status: ClaimStatus
  employeeId: string
  employeeName: string
  empCode: string
  organisation: string
}

const TXN_LABEL: Record<TransactionType, string> = {
  redemption: "Voucher Redemption",
  reimbursement: "Reimbursement",
  refund: "Refund",
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CLAIMS: GlobalClaimRow[] = [
  {
    id: "CLM-2026-0001",
    voucherCode: "VCH-2024-0081",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Yoga Class",
    provider: "Zenith Yoga Studio",
    location: "Kuala Lumpur",
    date: "09 Apr 2024",
    amount: 120.0,
    status: "confirmed",
    employeeId: "emp_1",
    employeeName: "Robert Fox",
    empCode: "ACM-001",
    organisation: "Acme Corporation Sdn Bhd",
  },
  {
    id: "CLM-2026-0002",
    voucherCode: "VCH-2024-0114",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "redemption",
    service: "Individual Therapy",
    provider: "AgileMind Therapy Centre",
    location: "Petaling Jaya",
    date: "08 Apr 2024",
    amount: 200.0,
    status: "confirmed",
    employeeId: "emp_2",
    employeeName: "Jenny Wilson",
    empCode: "ACM-042",
    organisation: "Acme Corporation Sdn Bhd",
  },
  {
    id: "CLM-2026-0003",
    voucherCode: "VCH-2024-0198",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "redemption",
    service: "Swedish Massage",
    provider: "Serenity Spa & Aesthetics",
    location: "Kuala Lumpur",
    date: "07 Apr 2024",
    amount: 180.0,
    status: "pre-auth",
    employeeId: "emp_3",
    employeeName: "Dianne Russell",
    empCode: "ACM-156",
    organisation: "Acme Corporation Sdn Bhd",
  },
  {
    id: "CLM-2026-0004",
    voucherCode: "VCH-2024-0211",
    voucherName: "Wellness Allocation Voucher",
    transactionType: "reimbursement",
    service: "Dental Checkup",
    provider: "SmileCare Dental",
    location: "Subang Jaya",
    date: "06 Apr 2024",
    amount: 250.0,
    status: "pre-auth",
    employeeId: "emp_1",
    employeeName: "Robert Fox",
    empCode: "ACM-001",
    organisation: "Global Tech Solutions",
  },
  {
    id: "CLM-2026-0005",
    voucherCode: "VCH-2024-0033",
    voucherName: "Lifestyle Pocket Voucher",
    transactionType: "refund",
    service: "Gym Access",
    provider: "FitLife Gym",
    location: "Penang",
    date: "05 Apr 2024",
    amount: 89.0,
    status: "cancelled",
    employeeId: "emp_4",
    employeeName: "Marvin McKinney",
    empCode: "ACM-089",
    organisation: "Nexus Innovations",
  },
  {
    id: "CLM-2026-0006",
    voucherCode: "VCH-2024-0057",
    voucherName: "Rejuvenation Fund Voucher",
    transactionType: "redemption",
    service: "Facial Treatment",
    provider: "Serenity Spa & Aesthetics",
    location: "Kuala Lumpur",
    date: "04 Apr 2024",
    amount: 320.0,
    status: "confirmed",
    employeeId: "emp_2",
    employeeName: "Jenny Wilson",
    empCode: "ACM-042",
    organisation: "Global Tech Solutions",
  },
  {
    id: "CLM-2026-0007",
    voucherCode: "VCH-2024-0089",
    voucherName: "Mental Health Support Voucher",
    transactionType: "redemption",
    service: "Meditation Session",
    provider: "Zenith Yoga Studio",
    location: "Kuala Lumpur",
    date: "03 Apr 2024",
    amount: 75.0,
    status: "confirmed",
    employeeId: "emp_3",
    employeeName: "Dianne Russell",
    empCode: "ACM-156",
    organisation: "Nexus Innovations",
  },
  {
    id: "CLM-2026-0008",
    voucherCode: "VCH-2024-0132",
    voucherName: "Corporate Perks Voucher",
    transactionType: "reimbursement",
    service: "Eye Examination",
    provider: "VisionFirst Optometry",
    location: "Petaling Jaya",
    date: "02 Apr 2024",
    amount: 150.0,
    status: "pre-auth",
    employeeId: "emp_1",
    employeeName: "Robert Fox",
    empCode: "ACM-001",
    organisation: "Acme Corporation Sdn Bhd",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all")
  const [txnFilter, setTxnFilter] = useState<TransactionType | "all">("all")
  const [orgFilter, setOrgFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")

  const orgOptions = useMemo(() => {
    const orgs = Array.from(new Set(MOCK_CLAIMS.map((c) => c.organisation)))
    return [{ label: "All Organisations", value: "all" }, ...orgs.map((o) => ({ label: o, value: o }))]
  }, [])

  const providerOptions = useMemo(() => {
    const providers = Array.from(new Set(MOCK_CLAIMS.map((c) => c.provider)))
    return [
      { label: "All Providers", value: "all" },
      ...providers.map((p) => ({ label: p, value: p })),
    ]
  }, [])

  const filteredData = useMemo(() => {
    return MOCK_CLAIMS.filter((row) => {
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
          row.organisation,
          row.service,
        ].some((f) => String(f).toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === "all" || row.status === statusFilter
      const matchesTxn = txnFilter === "all" || row.transactionType === txnFilter
      const matchesOrg = orgFilter === "all" || row.organisation === orgFilter
      const matchesProvider = providerFilter === "all" || row.provider === providerFilter
      return matchesSearch && matchesStatus && matchesTxn && matchesOrg && matchesProvider
    })
  }, [searchQuery, statusFilter, txnFilter, orgFilter, providerFilter])

  const columns: Column<GlobalClaimRow>[] = [
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
      header: "Organisation",
      accessorKey: "organisation",
      render: (row) => (
        <span className="text-label font-medium text-foreground truncate max-w-[180px] block">
          {row.organisation}
        </span>
      ),
    },
    {
      header: "Service Provider",
      accessorKey: "provider",
      render: (row) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={11} className="text-faint shrink-0" />
          <p className="text-body text-subtle font-medium truncate">
            {row.provider}
          </p>
        </div>
      ),
    },
    {
      header: "Service",
      accessorKey: "service",
      render: (row) => (
        <p className="text-label font-medium text-foreground">{row.service}</p>
      ),
    },
    {
      header: "Voucher",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-primary">
          <Ticket size={14} weight="bold" />
          <span className="text-label font-semibold">
            {row.voucherName || row.voucherCode}
          </span>
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
      header: "",
      align: "right",
      render: (row) => (
        <ActionPopover
          align="end"
          actions={[
            {
              label: "View Details",
              icon: <Eye size={14} />,
              onClick: () => console.log("View claim", row.id),
            },
            {
              label: "View Voucher",
              icon: <Ticket size={14} />,
              onClick: () => console.log("View voucher", row.voucherCode),
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
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading font-semibold text-foreground">Claims</h1>
          <p className="text-body text-subtle">
            Global claims ledger across all organisations and service providers.
          </p>
        </div>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search claims, employees, providers..."
        filters={
          <div className="flex items-center gap-4 flex-wrap">
            <FilterItem
              label="Organisation"
              value={orgFilter}
              onChange={setOrgFilter}
              options={orgOptions}
            />
            <FilterItem
              label="Provider"
              value={providerFilter}
              onChange={setProviderFilter}
              options={providerOptions}
            />
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
          <Receipt size={36} weight="duotone" className="text-faint mb-3" />
          <p className="text-muted-foreground font-medium text-body">
            No claims found.
          </p>
          <p className="text-label text-faint mt-1">
            Try adjusting your filters or search query.
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
  )
}
