"use client"

import { useQueryState } from "@/hooks/use-tab-persistence"
import { SegmentedTabs } from "@/components/shared/segmented-tabs"
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
  const validSubTabs = new Set<string>(EMPLOYEE_SUB_TABS.map((t) => t.id))
  const currentSubTab = validSubTabs.has(activeSubTab || "") ? (activeSubTab as string) : "directory"

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
    <div className="animate-in flex flex-col gap-6 transition-all duration-300 fade-in">
      <SegmentedTabs
        tabs={EMPLOYEE_SUB_TABS}
        activeTab={currentSubTab}
        onChange={setActiveSubTab}
        className="self-start"
      />

      <div className="min-w-0">
        {currentSubTab === "directory" && (
          <DirectorySubTab
            orgId={orgId}
            onBulkUpload={() => onBulkUploadChange("true")}
          />
        )}
        {currentSubTab === "dependents" && (
          <DependentsSubTab
            orgId={orgId}
            onNavigateToDirectory={() => setActiveSubTab("directory")}
          />
        )}
        {currentSubTab === "entitlements" && (
          <EntitlementsSubTab orgId={orgId} />
        )}
        {currentSubTab === "claims" && (
          <ClaimsSubTab orgId={orgId} />
        )}
      </div>
    </div>
  )
}
