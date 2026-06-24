"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import type { PolicyListItem } from "@/features/policies/types"
import type { EmployeeDirectoryItem } from "@/features/employees/types"
import {
  TABS,
  EMPLOYMENT_TYPE_LABELS,
  formatDependentLabel,
  formatRefreshChip,
  formatUtilisationChip,
  formatCoverageChip,
  formatAmountChip,
} from "./detail-tabs/policy-detail-helpers"
import { getOrgName } from "./policy-datapoint-helpers"
export type { TabId } from "./detail-tabs/policy-detail-helpers"
import type { TabId } from "./detail-tabs/policy-detail-helpers"
import { PolicyDetailHeader } from "./policy-detail-header"
import { OverviewTab } from "./detail-tabs/overview-tab"
import { VersionOverviewTab } from "./detail-tabs/version-overview-tab"
import { VersionsTab } from "./detail-tabs/versions-tab"
import { BenefitGroupsTab } from "./detail-tabs/benefit-groups-tab"
import { AssignedEmployeesTab } from "./detail-tabs/assigned-employees-tab"
import { AuditLogTab } from "./detail-tabs/audit-log-tab"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyDetailViewProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  versions?: PolicyListItem[]
  versionOverrideCounts?: Record<string, number>
  parentPolicyName?: string
  parentBenefits?: Benefit[]
  employees?: EmployeeDirectoryItem[]
  initialTab?: TabId
  /**
   * Visual density for the header/tabs.
   * - `standalone`: full-page policy detail (global Policies).
   * - `embedded`: compact header for org-scoped policy viewing.
   */
  headerVariant?: "standalone" | "embedded"
  onEdit: () => void
  onClone: () => void
  onDeactivate: () => void
  onDelete: () => void
  onEditVersion?: (id: string) => void
  onRemoveVersion?: (id: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PolicyDetailView({
  policy,
  groups,
  benefits,
  versions = [],
  versionOverrideCounts = {},
  parentPolicyName,
  parentBenefits,
  employees,
  initialTab,
  headerVariant = "standalone",
  onEdit,
  onClone,
  onDeactivate,
  onDelete,
  onEditVersion,
  onRemoveVersion,
}: PolicyDetailViewProps) {
  void onClone
  void onDeactivate
  void onDelete
  const router = useRouter()
  const isVersion = Boolean(policy.parentPolicyId)
  const availableTabs = useMemo(
    () => (isVersion ? TABS.filter((tab) => tab.id !== "versions") : TABS),
    [isVersion]
  )
  const [selectedTab, setSelectedTab] = useState<TabId>(
    initialTab ?? "overview"
  )
  const activeTab = availableTabs.some((tab) => tab.id === selectedTab)
    ? selectedTab
    : "overview"

  const statusVariant =
    policy.status === "active"
      ? "emerald"
      : policy.status === "draft"
        ? "amber"
        : "rose"
  const canEdit = policy.status !== "deactivated"

  const refreshChip = formatRefreshChip(policy)
  const utilisationChip = formatUtilisationChip(policy)
  const coverageChip = formatCoverageChip(policy)
  const amountChip = formatAmountChip(policy)

  const employmentList = (policy.eligibleEmploymentTypes ?? []).map(
    (t) => EMPLOYMENT_TYPE_LABELS[t] ?? t
  )
  const dependentsLabel = formatDependentLabel(policy)
  const hasDependents = (policy.dependentCoverages?.length ?? 0) > 0

  return (
    <div className="flex h-full flex-col bg-transparent">
      <PolicyDetailHeader
        activeTab={activeTab}
        amountChip={amountChip}
        availableTabs={availableTabs}
        canEdit={canEdit}
        coverageChip={coverageChip}
        dependentsLabel={dependentsLabel}
        employmentList={employmentList}
        hasDependents={hasDependents}
        headerVariant={headerVariant}
        isVersion={isVersion}
        onEdit={onEdit}
        onGoToParent={() =>
          router.push(
            `/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`
          )
        }
        onSelectTab={setSelectedTab}
        parentLabel={parentPolicyName || policy.parentPolicyId}
        policyCode={policy.code}
        policyCreatedAt={policy.createdAt}
        policyGroupCount={groups.length}
        policyName={policy.name}
        policyOrgName={getOrgName(policy)}
        policyStatus={policy.status}
        policyVersion={policy.version}
        refreshChip={refreshChip}
        statusVariant={statusVariant}
        utilisationChip={utilisationChip}
      />

      {/* Content */}
      <div
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto",
          headerVariant === "standalone" ? "p-6 lg:p-8" : "pt-4"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "overview" &&
              (isVersion ? (
                <VersionOverviewTab
                  policy={policy}
                  groups={groups}
                  benefits={benefits}
                  parentBenefits={parentBenefits}
                  parentPolicyName={parentPolicyName}
                />
              ) : (
                <OverviewTab
                  policy={policy}
                  groups={groups}
                  benefits={benefits}
                  onEdit={onEdit}
                />
              ))}
            {activeTab === "benefit-groups" && (
              <BenefitGroupsTab
                policy={policy}
                groups={groups}
                benefits={benefits}
              />
            )}
            {!isVersion && activeTab === "versions" && (
              <VersionsTab
                policy={policy}
                versions={versions}
                overrideCounts={versionOverrideCounts}
                onCreateVersion={() =>
                  router.push(`/policies/${policy.id}/versions/new`)
                }
                onViewVersion={(id) =>
                  router.push(`/policies?policyId=${id}&mode=view&wizard=open`)
                }
                onEditVersion={
                  onEditVersion ?? ((id) => router.push(`/policies/${id}/edit`))
                }
                onRemoveVersion={onRemoveVersion ?? (() => {})}
              />
            )}
            {activeTab === "employees" && (
              <AssignedEmployeesTab policy={policy} employees={employees} />
            )}
            {activeTab === "audit" && <AuditLogTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
