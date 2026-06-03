"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Buildings,
  IdentificationCard,
  Envelope,
  Users,
  UserPlus,
  TreeStructure,
} from "@phosphor-icons/react"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { StatusBadge } from "@/components/shared/status-badge"
import { OrgStructureConfig } from "@/components/host/organizations/org-structure-config"
import { InviteOrgAdminModal } from "@/components/org/invite-org-admin-modal"
import { Button } from "@/components/ui/button"
import { MOCK_ORGS } from "@/lib/mock-data"
import type { OrganizationAdmin } from "@/features/organizations/types"

const ORG_BY_SLUG: Record<string, string> = {
  "acme-corporation": "ORG-20260115-0001",
}

const MOCK_ORG_ADMINS: OrganizationAdmin[] = [
  {
    id: "ADM-001",
    orgId: "ORG-20260115-0001",
    name: "Yon Yusuf",
    email: "yon@acme.com",
    role: "org_admin",
    status: "active",
    invitedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "ADM-002",
    orgId: "ORG-20260115-0001",
    name: "Amira Rahman",
    email: "amira@acme.com",
    role: "org_admin",
    status: "active",
    invitedAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "ADM-003",
    orgId: "ORG-20260115-0001",
    name: "Khairul Anwar",
    email: "khairul@acme.com",
    role: "org_admin",
    status: "pending_activation",
    invitedAt: "2026-04-10T09:30:00Z",
  },
]

const ADMIN_STATUS_VARIANT: Record<string, "emerald" | "amber" | "zinc"> = {
  active: "emerald",
  pending_activation: "amber",
  deactivated: "zinc",
}

const ADMIN_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending_activation: "Pending",
  deactivated: "Deactivated",
}

export default function OrgSettingsPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const [inviteOpen, setInviteOpen] = useState(false)

  const orgId = ORG_BY_SLUG[orgSlug] ?? "ORG-20260115-0001"
  const org = MOCK_ORGS.find((o) => o.id === orgId) ?? MOCK_ORGS[0]!
  const admins = MOCK_ORG_ADMINS.filter((a) => a.orgId === orgId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-0.5 text-body">Organisation profile and admin management</p>
      </div>

      {/* Org Profile */}
      <DetailSection title="Organisation Profile" icon={<Buildings size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Organisation Name"
            value={org.name}
            icon={<Buildings size={14} weight="duotone" />}
          />
          <DetailField
            label="Registration No."
            value={org.registrationNumber}
            icon={<IdentificationCard size={14} weight="duotone" />}
          />
          <DetailField
            label="TIN Number"
            value={org.tinNumber}
          />
          <DetailField
            label="Industry"
            value={org.industry}
          />
          {org.subIndustry && (
            <DetailField
              label="Sub-Industry"
              value={org.subIndustry}
            />
          )}
          <DetailField
            label="State"
            value={org.state}
          />
          <DetailField
            label="Country"
            value={org.country}
          />
        </div>
      </DetailSection>

      {/* Bank Details */}
      <DetailSection title="Bank Details" icon={<IdentificationCard size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Bank"
            value={org.bankAccountDetails.bankName}
          />
          <DetailField
            label="Account Name"
            value={org.bankAccountDetails.accountName}
          />
          <DetailField
            label="Account Number"
            value={org.bankAccountDetails.accountNumber}
          />
        </div>
      </DetailSection>

      {/* Admin Management */}
      <DetailSection
        title="Admin Management"
        icon={<Users size={16} weight="duotone" />}
        action={
          <Button
            size="sm"
            variant="outline"
            className="text-label font-medium flex items-center gap-1.5"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus size={14} />
            Invite Admin
          </Button>
        }
      >
        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
            >
              <div className="space-y-0.5">
                <p className="text-body font-semibold text-foreground">{admin.name}</p>
                <div className="flex items-center gap-1.5 text-label text-faint">
                  <Envelope size={12} />
                  {admin.email}
                </div>
              </div>
              <StatusBadge
                status={ADMIN_STATUS_LABEL[admin.status] ?? admin.status}
                variant={ADMIN_STATUS_VARIANT[admin.status] ?? "zinc"}
              />
            </div>
          ))}
        </div>
      </DetailSection>

      {/* Org Structure */}
      <DetailSection title="Organisation Structure" icon={<TreeStructure size={16} weight="duotone" />}>
        <OrgStructureConfig
          orgId={orgId}
          initialTiers={org.tierConfigs ?? []}
          initialDepts={org.departmentConfigs ?? []}
        />
      </DetailSection>

      <InviteOrgAdminModal
        orgId={orgId}
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}
