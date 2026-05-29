"use client"

import { DetailSection } from "@/components/shared/detail-section"
import { Users, Gear, IdentificationCard, TreeStructure, ShieldCheck, NotePencil } from "@phosphor-icons/react"
import { MOCK_EMPLOYEES } from "@/lib/mock-data"
import { MONTHS } from "../wizard-constants"
import { ReadField } from "../wizard-shared-ui"
import type { BenefitPolicyWizardCtx } from "../wizard-types"

interface ReviewStepProps {
  ctx: BenefitPolicyWizardCtx
}

export function ReviewStep({ ctx }: ReviewStepProps) {
  const {
    policyData,
    groups,
    benefits,
    assignedEmployeeIds,
    assignmentOrgId,
    showCustomizeAssignment,
    orgId,
  } = ctx

  const activeOrgId = orgId ?? assignmentOrgId
  const eligibleEmployees = activeOrgId
    ? MOCK_EMPLOYEES.filter((emp) => {
        if (emp.orgId !== activeOrgId) return false
        if (
          policyData.eligibleEmploymentTypes?.length &&
          emp.employmentType &&
          !policyData.eligibleEmploymentTypes.includes(emp.employmentType)
        ) {
          return false
        }
        const tierIds = policyData.eligibility?.tierIds
        if (tierIds?.length && emp.tier && !tierIds.includes(emp.tier)) return false
        return true
      })
    : []

  const isAssignAllSelection =
    eligibleEmployees.length > 0 &&
    assignedEmployeeIds.length === eligibleEmployees.length &&
    eligibleEmployees.every((emp) => assignedEmployeeIds.includes(emp.id))

  const assignmentSummary = !activeOrgId
    ? "Later"
    : showCustomizeAssignment
      ? assignedEmployeeIds.length > 0
        ? `Customized (${assignedEmployeeIds.length} selected)`
        : "Customized (none selected yet)"
      : isAssignAllSelection
        ? `Assign All Eligible (${eligibleEmployees.length})`
        : "Later"

  return (
    <div className="animate-in space-y-6 duration-700 fade-in slide-in-from-bottom-4">
      {/* Assignment summary */}
      <DetailSection
        title="Assignment"
        icon={<Users size={18} weight="duotone" />}
        ghost
      >
        <div className="space-y-4">
          <ReadField label="Employee Assignment" value={assignmentSummary} />
          <ReadField
            label="Eligible Employees"
            value={activeOrgId ? String(eligibleEmployees.length) : "—"}
          />
        </div>
      </DetailSection>

      {/* Review header */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <div>
            <h3 className="tracking-tight text-display font-semibold text-foreground">
              Review &amp; Finalize
            </h3>
            <p className="mt-0.5 text-subtle">Verify your configuration before saving.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Basics */}
        <DetailSection
          title="Basics"
          icon={<IdentificationCard size={18} weight="duotone" />}
          ghost
        >
          <div className="space-y-4">
            <ReadField label="Policy Name" value={policyData.name || undefined} />
            <ReadField label="Description" value={policyData.description || undefined} />
            <ReadField
              label="Employment Types"
              value={policyData.eligibleEmploymentTypes
                ?.map((t) =>
                  t
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")
                )
                .join(", ")}
            />
          </div>
        </DetailSection>

        {/* Pool & Cycle */}
        <DetailSection
          title="Pool & Cycle"
          icon={<Gear size={18} weight="duotone" />}
          ghost
        >
          <div className="space-y-4">
            <ReadField
              label="Dependents"
              value={(policyData.dependentCoverages?.length ?? 0) > 0 ? "Covered" : "Employee Only"}
            />
            <ReadField
              label="Employee Policy Amount"
              value={
                policyData.totalCapAmount
                  ? `RM ${policyData.totalCapAmount.toFixed(2)}`
                  : "Not Set"
              }
            />
            {(policyData.dependentCoverages?.length ?? 0) > 0 && (
              <ReadField
                label="Dependents Pool Type"
                value={
                  policyData.dependentsPoolType === "SharedWithEmployee"
                    ? "Shared with Employee"
                    : policyData.dependentsPoolType
                }
              />
            )}
            <ReadField
              label="Utilisation Mode"
              value={
                policyData.utilisationMode === "Fixed"
                  ? "Fixed Allocation"
                  : "Prorated Allocation"
              }
            />
            {policyData.utilisationMode === "Prorated" && (
              <ReadField label="Prorate Unit" value={policyData.prorateUnit} />
            )}
            <ReadField label="Refresh Cycle" value={policyData.refreshCycle} />
            <ReadField
              label="Start Reference"
              value={
                policyData.refreshStartReference === "financial_year"
                  ? "Financial Year"
                  : "Calendar Year"
              }
            />
            {policyData.refreshStartMonth && (
              <ReadField
                label="Start Month"
                value={MONTHS[policyData.refreshStartMonth - 1]}
              />
            )}
          </div>
        </DetailSection>

        {/* Benefit Groups summary */}
        <DetailSection
          title="Benefit Groups"
          icon={<TreeStructure size={18} weight="duotone" />}
          className="lg:col-span-2"
          ghost
        >
          <div className="space-y-4">
            {groups.length === 0 ? (
              <p className="py-6 text-center text-body font-medium text-faint">
                No benefit groups configured.
              </p>
            ) : (
              groups.map((group) => {
                const groupBenefits = benefits.filter((b) => b.groupId === group.id)
                return (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-transparent p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted text-primary shadow-sm">
                        <TreeStructure size={16} />
                      </div>
                      <div>
                        <p className="text-body font-medium text-foreground">{group.name}</p>
                        <p className="text-label font-semibold text-muted-foreground">
                          {groupBenefits.length} benefits ·{" "}
                          {group.distributionType === "SharedAmount" ? "Shared Pool" : "Individual"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-body font-semibold text-primary">
                        {group.distributionType === "SharedAmount"
                          ? `RM ${group.maxUsagePerCycle?.toFixed(2) || "0.00"}`
                          : `${groupBenefits.length} benefits`}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DetailSection>
      </div>

      {/* Draft info callout */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
        <NotePencil
          size={18}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />
        <div>
          <p className="text-body font-semibold text-amber-700 dark:text-amber-300">
            Saved as Draft
          </p>
          <p className="mt-0.5 text-label text-amber-600 dark:text-amber-400">
            Activate to make this policy visible to organisations.
          </p>
        </div>
      </div>
    </div>
  )
}
