"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { cn, formatDate } from "@/lib/utils"
import {
  CalendarBlank,
  IdentificationCard,
  Users,
  UsersFour,
} from "@phosphor-icons/react"
import type { Benefit, BenefitGroup } from "@/types/policy"
import { BenefitGroupsContractSection } from "./policy-benefit-groups-contract-section"
import {
  DEPENDENT_LABELS,
  formatRM,
  getAgeRange,
  getDepartmentLabels,
  getDependentCapAmount,
  getDependentCapPerType,
  getDependentPoolLabel,
  getDependentPoolNote,
  getEmploymentLabels,
  getExcludedEmploymentLabels,
  getOrgName,
  getPoolExplanation,
  getRefreshStart,
  getStatusVariant,
  getTierLabels,
  titleCaseValue,
  type PolicyWithDisplayFields,
} from "./policy-datapoint-helpers"
import {
  ContractSection,
  DataGrid,
  DataPoint,
  TechnicalBadge,
} from "./policy-datapoint-ui"

interface PolicyDatapointContractProps {
  policy: PolicyWithDisplayFields
  groups: BenefitGroup[]
  benefits: Benefit[]
  className?: string
}

export function PolicyDatapointContract({
  policy,
  groups,
  benefits,
  className,
}: PolicyDatapointContractProps) {
  const hasDependents = (policy.dependentCoverages?.length ?? 0) > 0
  const dependentCapAmount = getDependentCapAmount(policy)
  const employmentLabels = getEmploymentLabels(policy)
  const excludedEmploymentLabels = getExcludedEmploymentLabels(policy)
  const tierLabels = getTierLabels(policy)
  const departmentLabels = getDepartmentLabels(policy)
  const groupCount = policy.groupCount ?? groups.length

  return (
    <div className={cn("space-y-5", className)}>
      <ContractSection
        title="Policy Identity"
        description="Reference details for the platform admin"
        icon={<IdentificationCard size={18} weight="duotone" />}
      >
        <DataGrid>
          <DataPoint label="Policy Name" value={policy.name || "Not Set"} />
          <DataPoint
            label="Status"
            value={
              policy.status ? (
                <StatusBadge
                  status={policy.status}
                  variant={getStatusVariant(policy.status)}
                  dot
                />
              ) : (
                "Not Set"
              )
            }
          />
          <DataPoint
            label="Version"
            value={
              policy.version ? (
                <TechnicalBadge>{policy.version}</TechnicalBadge>
              ) : (
                "Not Set"
              )
            }
          />
          <DataPoint
            label="Refresh Cycle"
            value={policy.refreshCycle ?? "Not Set"}
          />
          <DataPoint
            label="Policy Code"
            value={
              policy.code ? (
                <TechnicalBadge>{policy.code}</TechnicalBadge>
              ) : (
                "Not Set"
              )
            }
          />
          <DataPoint label="Organisation" value={getOrgName(policy)} />
          <DataPoint
            label="Created Date"
            value={formatDate(policy.createdAt)}
          />
          <DataPoint
            label="Benefit Group Count"
            value={`${groupCount} ${groupCount === 1 ? "Group" : "Groups"}`}
          />
        </DataGrid>
      </ContractSection>

      <ContractSection
        title="Employee Pool"
        description="Employee allocation, cadence, and policy ceiling"
        icon={<Users size={18} weight="duotone" />}
      >
        <DataGrid>
          <DataPoint
            label="Pool Type"
            value={titleCaseValue(policy.benefitPoolType)}
            helper={getPoolExplanation(policy.benefitPoolType)}
          />
          <DataPoint
            label="Utilisation Mode"
            value={
              policy.utilisationMode === "Prorated"
                ? "Prorated Allocation"
                : "Fixed Allocation"
            }
            helper={
              policy.utilisationMode === "Prorated"
                ? `Prorate Unit: ${policy.prorateUnit ?? "Not Set"}`
                : undefined
            }
          />
          <DataPoint
            label="Refresh Cycle"
            value={policy.refreshCycle ?? "Not Set"}
          />
          <DataPoint label="Refresh Start" value={getRefreshStart(policy)} />
          <DataPoint
            label="Employee Cap (Policy)"
            value={
              typeof policy.totalCapAmount === "number"
                ? `${formatRM(policy.totalCapAmount)} / Cycle`
                : "Not Set"
            }
            helper={
              typeof policy.totalCapAmount === "number"
                ? "Optional employee-level ceiling is configured."
                : "Optional employee-level ceiling is not configured."
            }
          />
        </DataGrid>
      </ContractSection>

      <ContractSection
        title="Dependent Coverage"
        description="Covered dependent types and dependent pool rules"
        icon={<UsersFour size={18} weight="duotone" />}
      >
        <DataGrid>
          <DataPoint
            label="Covered Types"
            value={
              hasDependents
                ? policy.dependentCoverages
                    ?.map(
                      (coverage) =>
                        DEPENDENT_LABELS[coverage.type] ??
                        titleCaseValue(coverage.type)
                    )
                    .join(", ")
                : "Employee Only"
            }
          />
          <DataPoint
            label="Dependents Pool Type"
            value={
              hasDependents
                ? getDependentPoolLabel(policy.dependentsPoolType)
                : "Not Applicable"
            }
            helper={getDependentPoolNote(
              policy.dependentsPoolType,
              hasDependents
            )}
          />
          <DataPoint
            label="Shared Pool Note"
            value={getDependentPoolNote(
              policy.dependentsPoolType,
              hasDependents
            )}
          />
          <DataPoint
            label="Dependent Cap Amount"
            value={dependentCapAmount.value}
            helper={dependentCapAmount.helper}
          />
          <DataPoint
            label="Dependent Cap Per Type"
            value={getDependentCapPerType(policy)}
          />
        </DataGrid>
      </ContractSection>

      <ContractSection
        title="Eligibility"
        description="Automatic assignment filters and unrestricted states"
        icon={<CalendarBlank size={18} weight="duotone" />}
      >
        <DataGrid>
          <DataPoint
            label="Employment Types"
            value={
              employmentLabels.length
                ? employmentLabels.join(", ")
                : "Not Restricted"
            }
          />
          <DataPoint
            label="Excluded Employment Types"
            value={
              excludedEmploymentLabels.length
                ? `${excludedEmploymentLabels.join(", ")} Excluded`
                : "None"
            }
          />
          <DataPoint label="Age Range" value={getAgeRange(policy)} />
          <DataPoint
            label="Gender"
            value={titleCaseValue(policy.eligibility?.gender ?? "All")}
          />
          <DataPoint
            label="Tier Filter"
            value={
              tierLabels.length
                ? tierLabels.join(", ")
                : "Not Restricted (All Tiers)"
            }
          />
          <DataPoint
            label="Department Filter"
            value={
              departmentLabels.length
                ? departmentLabels.join(", ")
                : "Not Restricted (All Departments)"
            }
          />
        </DataGrid>
      </ContractSection>

      <BenefitGroupsContractSection
        policy={policy}
        groups={groups}
        benefits={benefits}
      />
    </div>
  )
}
