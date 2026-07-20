"use client"

import {
  Buildings,
  IdentificationCard,
  MapPin,
  Bank,
  Article,
} from "@phosphor-icons/react"
import { OrgSetupChecklist } from "@/components/host/organizations/org-setup-checklist"
import { OrgSetupGuide } from "@/components/host/organizations/org-setup-guide"
import { ORG_FTU_ORG_ID } from "@/components/host/organizations/constants"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { ORG_TYPE_LABELS, type AssignedPolicy } from "@/components/host/organizations/constants"
import type { Organization, OrgTierConfig } from "@/features/organizations/types"
import type { OrganizationStatus } from "@/features/organizations/types"

interface ProfileTabProps {
  orgId: string
  orgStatus: OrganizationStatus
  orgTierConfigs: OrgTierConfig[]
  assignedPolicies: AssignedPolicy[]
  orgForSetup: Organization
  mockOrg: Organization | undefined
}

export function ProfileTab({
  orgId,
  orgStatus,
  orgTierConfigs,
  assignedPolicies,
  orgForSetup,
  mockOrg,
}: ProfileTabProps) {
  const formattedFinancialYearStart = mockOrg?.financialYearStart
    ? new Date(mockOrg.financialYearStart).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
      })
    : "—"

  return (
    <div className="animate-in space-y-6 fade-in">
      <OrgSetupChecklist
        orgId={orgId}
        status={orgStatus}
        tierCount={orgTierConfigs.length}
        employeeCount={orgForSetup.employeeCount}
        policyCount={assignedPolicies.length}
        employeesWithoutPolicy={orgForSetup.employeesWithoutPolicy ?? 0}
      />
      {orgStatus !== "inactive" && orgId === ORG_FTU_ORG_ID && (
        <OrgSetupGuide organization={orgForSetup} />
      )}

      <DetailSection
        title="Organisation Profile"
        icon={<Buildings size={18} weight="duotone" />}
        description="Basic information about the organisation"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Name" value={mockOrg?.name ?? "—"} />
          <DetailField label="Industry" value={mockOrg?.industry ?? "—"} />
          <DetailField label="Sub-industry" value={mockOrg?.subIndustry ?? "—"} />
          <DetailField label="Financial Year Start" value={formattedFinancialYearStart} />
        </div>
      </DetailSection>

      <DetailSection
        title="Registration & Compliance"
        icon={<IdentificationCard size={18} weight="duotone" />}
        description="Statutory identifiers and entity classification"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Registration No." value={mockOrg?.registrationNumber ?? "—"} />
          <DetailField label="TIN No." value={mockOrg?.tinNumber ?? "—"} />
          <DetailField
            label="Organisation Type"
            value={
              ORG_TYPE_LABELS[mockOrg?.type ?? ""] ?? mockOrg?.type ?? "—"
            }
          />
        </div>
      </DetailSection>

      <DetailSection
        title="Business Address"
        icon={<MapPin size={18} weight="duotone" />}
        description="Official registered office address"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          <DetailField
            label="Address Line"
            value="Level 15, Menara Southpoint, Mid Valley City"
          />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Country" value="Malaysia" />
            <DetailField label="Postal Code" value="59200" />
            <DetailField label="City" value="Kuala Lumpur" />
            <DetailField label="State" value="W.P. Kuala Lumpur" />
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title="Payment Details"
        icon={<Bank size={18} weight="duotone" />}
        description="Settlement bank account"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Bank Name" value={mockOrg?.bankAccountDetails.bankName ?? "—"} />
          <DetailField label="Account Number" value={mockOrg?.bankAccountDetails.accountNumber ?? "—"} />
          <DetailField label="Account Name" value={mockOrg?.bankAccountDetails.accountName ?? "—"} />
        </div>
      </DetailSection>

      <DetailSection
        title="Documents"
        icon={<Article size={18} weight="duotone" />}
        description="Legal and registration documents for this organisation"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              name: "SSM_Registration_2024.pdf",
              size: "1.2 MB",
              type: "SSM Certificate",
            },
            {
              name: "Form_49_Directors.pdf",
              size: "850 KB",
              type: "Form Section 14",
            },
          ].map((doc, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 transition-all hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-faint transition-colors group-hover:text-primary">
                <Article size={20} weight="duotone" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-body font-medium text-foreground">
                  {doc.name}
                </p>
                <p className="text-label font-medium text-subtle">
                  {doc.type} • {doc.size}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  )
}
