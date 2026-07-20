"use client"

import { BulkUploadWizard } from "@/components/host/organizations/bulk-upload-wizard"
import { DirectorySubTab } from "./employees/directory-sub-tab"
import type { AssignedPolicy } from "@/components/host/organizations/constants"
import type { OrgTierConfig } from "@/features/organizations/types"

interface EmployeesTabProps {
  orgId: string
  orgTierConfigs: OrgTierConfig[]
  assignedPolicies: AssignedPolicy[]
  isBulkUploading: string | null
  onBulkUploadChange: (val: string | null) => void
}

export function EmployeesTab({
  orgId,
  orgTierConfigs,
  assignedPolicies,
  isBulkUploading,
  onBulkUploadChange,
}: EmployeesTabProps) {
  if (isBulkUploading === "true") {
    return (
      <BulkUploadWizard
        onBack={() => onBulkUploadChange(null)}
        onSuccess={() => onBulkUploadChange(null)}
        orgTierConfigs={orgTierConfigs}
        availablePolicies={assignedPolicies.map((p) => ({
          name: p.name,
          version: p.version,
          tiers: orgTierConfigs.map((tc) => tc.code || tc.name),
        }))}
      />
    )
  }

  return (
    <div className="flex animate-in flex-col gap-6 transition-all duration-300 fade-in">
      <DirectorySubTab
        orgId={orgId}
        onBulkUpload={() => onBulkUploadChange("true")}
      />
    </div>
  )
}
