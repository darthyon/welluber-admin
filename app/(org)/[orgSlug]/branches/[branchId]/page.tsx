"use client"

import { useParams, useRouter } from "next/navigation"
import {
  Buildings,
  MapPin,
  Users,
  Wallet,
  SealCheck,
  IdentificationCard,
} from "@phosphor-icons/react"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { StatusBadge } from "@/components/shared/status-badge"
import { BackButton } from "@/components/shared/back-button"
import { routes } from "@/lib/navigation"

type Branch = {
  id: string
  name: string
  type: string
  accountModel: string
  accountName?: string
  accountId?: string
  address: { city: string; state: string; street?: string }
  employeesCount: number
  status: string
  cashBalance: number
  creditBalance: number
  claimsCount: number
}

const ACME_BRANCHES: Branch[] = [
  {
    id: "br_1",
    name: "ACME HQ",
    type: "HQ",
    accountModel: "New",
    accountName: "KL HQ Account",
    accountId: "ACC-20260115-0001",
    address: { city: "Kuala Lumpur", state: "Wilayah Persekutuan", street: "No. 1, Jalan Ampang" },
    employeesCount: 1240,
    status: "Active",
    cashBalance: 45000,
    creditBalance: 10000,
    claimsCount: 12,
  },
  {
    id: "br_2",
    name: "ACME Subang Jaya",
    type: "Branch Office",
    accountModel: "Existing",
    accountName: "Acme Shared Account",
    accountId: "ACC-20260115-0002",
    address: { city: "Subang Jaya", state: "Selangor", street: "No. 5, Jalan SS 15/8" },
    employeesCount: 450,
    status: "Active",
    cashBalance: 12500,
    creditBalance: 5000,
    claimsCount: 5,
  },
]

export default function BranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const branchId = params.branchId as string

  const branch = ACME_BRANCHES.find((b) => b.id === branchId)

  if (!branch) {
    return (
      <div className="space-y-4">
        <BackButton label="Branches" onClick={() => router.push(routes.org.branches(orgSlug))} />
        <p className="text-muted-foreground">Branch not found.</p>
      </div>
    )
  }

  const totalBalance = branch.cashBalance + branch.creditBalance

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <BackButton label="Branches" onClick={() => router.push(routes.org.branches(orgSlug))} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{branch.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-label font-mono text-faint">{branch.type}</span>
            <StatusBadge
              status={branch.status}
              variant={branch.status === "Active" ? "emerald" : "zinc"}
            />
          </div>
        </div>
      </div>

      {/* Branch Info */}
      <DetailSection title="Branch Details" icon={<Buildings size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Branch Name"
            value={branch.name}
            icon={<Buildings size={14} weight="duotone" />}
          />
          <DetailField
            label="Type"
            value={branch.type}
            icon={<IdentificationCard size={14} weight="duotone" />}
          />
          <DetailField
            label="City"
            value={branch.address.city}
            icon={<MapPin size={14} weight="duotone" />}
          />
          <DetailField
            label="State"
            value={branch.address.state}
          />
          {branch.address.street && (
            <DetailField
              label="Address"
              value={branch.address.street}
            />
          )}
          <DetailField
            label="Employees"
            value={branch.employeesCount.toLocaleString()}
            icon={<Users size={14} weight="duotone" />}
          />
        </div>
      </DetailSection>

      {/* Account */}
      <DetailSection title="Account" icon={<Wallet size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Account Model"
            value={branch.accountModel}
          />
          {branch.accountName && (
            <DetailField
              label="Account Name"
              value={branch.accountName}
            />
          )}
          {branch.accountId && (
            <DetailField
              label="Account ID"
              value={branch.accountId}
              icon={<IdentificationCard size={14} weight="duotone" />}
            />
          )}
          <DetailField
            label="Cash Balance"
            value={`RM ${branch.cashBalance.toLocaleString()}`}
            icon={<Wallet size={14} weight="duotone" />}
          />
          <DetailField
            label="Credit Balance"
            value={`RM ${branch.creditBalance.toLocaleString()}`}
          />
          <DetailField
            label="Total Balance"
            value={`RM ${totalBalance.toLocaleString()}`}
          />
        </div>
      </DetailSection>

      {/* Claims summary */}
      <DetailSection title="Claims" icon={<SealCheck size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Claims This Month"
            value={branch.claimsCount.toString()}
            icon={<SealCheck size={14} weight="duotone" />}
          />
        </div>
      </DetailSection>
    </div>
  )
}
