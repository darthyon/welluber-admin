"use client"

import { DetailSection } from "@/components/shared/detail-section"
import { PolicyDatapointContract } from "@/components/host/policies/policy-datapoint-contract"
import { Users, ShieldCheck, NotePencil } from "@phosphor-icons/react"
import { MOCK_EMPLOYEES } from "@/lib/mock-data"
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
        if (tierIds?.length && emp.tier && !tierIds.includes(emp.tier))
          return false
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
            <h3 className="tracking-tight text-title font-semibold text-foreground">
              Review &amp; Finalize
            </h3>
            <p className="mt-0.5 text-subtle">
              Verify your configuration before saving.
            </p>
          </div>
        </div>
      </div>

      <PolicyDatapointContract
        policy={{
          ...policyData,
          organizationId: policyData.organizationId ?? activeOrgId,
        }}
        groups={groups}
        benefits={benefits}
      />

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
