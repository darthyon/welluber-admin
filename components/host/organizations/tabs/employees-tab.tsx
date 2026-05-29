"use client"

import { useQueryState } from "@/hooks/use-tab-persistence"
import { VerticalTabs } from "@/components/shared/vertical-tabs"
import { BulkUploadWizard } from "@/components/host/organizations/bulk-upload-wizard"
import { DirectorySubTab } from "./employees/directory-sub-tab"
import { DependentsSubTab } from "./employees/dependents-sub-tab"
import { EntitlementsSubTab } from "./employees/entitlements-sub-tab"
import { ClaimsSubTab } from "./employees/claims-sub-tab"
import { EMPLOYEE_SUB_TABS, type AssignedPolicy } from "@/components/host/organizations/constants"
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
  const [activeSubTab, setActiveSubTab] = useQueryState("subTab", "directory")

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
    <div className="animate-in flex flex-col gap-8 transition-all duration-300 fade-in lg:flex-row">
      <aside className="w-full flex-shrink-0 lg:w-64">
        <VerticalTabs
          tabs={EMPLOYEE_SUB_TABS}
          activeTab={activeSubTab || "directory"}
          onChange={setActiveSubTab}
        />
      </aside>

      <div className="min-w-0 flex-1">
        {activeSubTab === "directory" && (
          <DirectorySubTab
            orgId={orgId}
            onBulkUpload={() => onBulkUploadChange("true")}
          />
        )}
        {activeSubTab === "dependents" && (
          <DependentsSubTab
            orgId={orgId}
            onNavigateToDirectory={() => setActiveSubTab("directory")}
          />
        )}
        {activeSubTab === "entitlements" && (
          <EntitlementsSubTab orgId={orgId} />
        )}
        {activeSubTab === "claims" && (
          <ClaimsSubTab orgId={orgId} />
        )}
      </div>
    </div>
  )
}
