"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DetailSection } from "@/components/shared/detail-section"
import { FormSelect } from "@/components/shared/form-select"
import { Users, Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { MOCK_EMPLOYEES } from "@/lib/mock-data"
import type { EmployeeDirectoryItem } from "@/features/employees/types"
import type { BenefitPolicyWizardCtx } from "../wizard-types"

const MOCK_ORG_OPTIONS = [
  { id: "ORG-20260115-0001", name: "Acme Corporation Sdn Bhd" },
  { id: "ORG-20260301-0002", name: "Global Tech Solutions" },
  { id: "ORG-20260401-0003", name: "Zenith Wellness Sdn Bhd" },
]

interface AssignStepProps {
  ctx: BenefitPolicyWizardCtx
}

export function AssignStep({ ctx }: AssignStepProps) {
  const {
    policyData,
    assignedEmployeeIds,
    setAssignedEmployeeIds,
    assignmentOrgId,
    setAssignmentOrgId,
    showCustomizeAssignment,
    setShowCustomizeAssignment,
    orgId,
    nextStep,
  } = ctx

  const activeOrgId = orgId ?? assignmentOrgId

  const eligibleEmployees: EmployeeDirectoryItem[] = activeOrgId
    ? MOCK_EMPLOYEES.filter((emp) => {
        if (emp.orgId !== activeOrgId) return false
        if (
          policyData.eligibleEmploymentTypes?.length &&
          emp.employmentType &&
          !policyData.eligibleEmploymentTypes.includes(emp.employmentType)
        )
          return false
        const tierIds = policyData.eligibility?.tierIds
        if (tierIds?.length && emp.tier && !tierIds.includes(emp.tier)) return false
        return true
      })
    : []

  const assignCount = assignedEmployeeIds.filter(
    (id) => !MOCK_EMPLOYEES.find((e) => e.id === id)?.benefitPolicies?.length
  ).length
  const reassignCount = assignedEmployeeIds.filter(
    (id) => (MOCK_EMPLOYEES.find((e) => e.id === id)?.benefitPolicies?.length ?? 0) > 0
  ).length

  return (
    <div className="max-w-3xl animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-2">
      <DetailSection
        title="Assign Employees"
        icon={<Users size={18} weight="duotone" />}
        description="Assign all eligible employees now, customize selection, or do it later"
        ghost
      >
        <div className="space-y-5">
          {/* Global mode org picker */}
          {!orgId && (
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Organisation (optional)</label>
              <FormSelect
                value={assignmentOrgId}
                onChange={(v) => {
                  setAssignmentOrgId(v)
                  setAssignedEmployeeIds([])
                }}
                options={[
                  { label: "Select organisation…", value: "" },
                  ...MOCK_ORG_OPTIONS.map((o) => ({ label: o.name, value: o.id })),
                ]}
                triggerClassName="md:w-80"
              />
              <p className="text-micro text-faint">
                Select an organisation to preview and assign eligible employees.
              </p>
            </div>
          )}

          {activeOrgId ? (
            eligibleEmployees.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                <Users size={28} className="text-faint" />
                <p className="text-body font-medium text-muted-foreground">No eligible employees found</p>
                <p className="max-w-xs text-label text-faint">
                  No employees match the current eligibility filters (employment type, tier). You can
                  assign employees later from the employee table.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-4xl"
                    onClick={() => {
                      setShowCustomizeAssignment(false)
                      setAssignedEmployeeIds(eligibleEmployees.map((e) => e.id))
                      nextStep()
                    }}
                  >
                    Assign All Eligible ({eligibleEmployees.length})
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={showCustomizeAssignment ? "default" : "outline"}
                    className="rounded-4xl"
                    onClick={() => setShowCustomizeAssignment(true)}
                  >
                    Customize
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-4xl"
                    onClick={() => {
                      setShowCustomizeAssignment(false)
                      nextStep()
                    }}
                  >
                    Later
                  </Button>
                </div>

                {!showCustomizeAssignment && (
                  <p className="text-label text-faint">
                    Pick Customize to choose a specific employee subset, or continue with Assign All
                    Eligible / Later.
                  </p>
                )}

                {showCustomizeAssignment && assignedEmployeeIds.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5">
                    <Check size={14} weight="bold" className="shrink-0 text-primary" />
                    <p className="text-label font-medium text-primary">
                      {assignCount > 0 &&
                        `${assignCount} employee${assignCount !== 1 ? "s" : ""} will be assigned`}
                      {assignCount > 0 && reassignCount > 0 && " · "}
                      {reassignCount > 0 && `${reassignCount} reassigned from existing policy`}
                    </p>
                  </div>
                )}

                {showCustomizeAssignment && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = eligibleEmployees.map((e) => e.id)
                          const allSelected = allIds.every((id) => assignedEmployeeIds.includes(id))
                          setAssignedEmployeeIds(allSelected ? [] : allIds)
                        }}
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                          eligibleEmployees.every((e) => assignedEmployeeIds.includes(e.id))
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {eligibleEmployees.every((e) => assignedEmployeeIds.includes(e.id)) && (
                          <Check size={10} weight="bold" />
                        )}
                      </button>
                      <span className="text-label font-semibold text-muted-foreground">Employee</span>
                      <span className="ml-auto text-label font-semibold text-muted-foreground">
                        Current Policy
                      </span>
                    </div>
                    <div className="divide-y divide-border/50">
                      {eligibleEmployees.map((emp) => {
                        const isSelected = assignedEmployeeIds.includes(emp.id)
                        const hasPolicy = (emp.benefitPolicies?.length ?? 0) > 0
                        return (
                          <div
                            key={emp.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20",
                              isSelected && "bg-primary/5"
                            )}
                            onClick={() =>
                              setAssignedEmployeeIds((prev) =>
                                isSelected ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                              )
                            }
                          >
                            <button
                              type="button"
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background"
                              )}
                            >
                              {isSelected && <Check size={10} weight="bold" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-body font-medium text-foreground">{emp.name}</p>
                              <p className="text-label font-medium text-faint">
                                {emp.empCode} · {emp.department ?? "—"}
                              </p>
                            </div>
                            <span className="shrink-0 text-label text-faint">{emp.tier ?? "—"}</span>
                            <div className="shrink-0">
                              {hasPolicy ? (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-micro font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                                  {emp.benefitPolicies![0].policyName}
                                </span>
                              ) : (
                                <Badge variant="outline" className="text-micro font-semibold">
                                  None
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
              <Users size={28} className="text-faint" />
              <p className="text-body font-medium text-muted-foreground">
                Select an organisation to preview eligible employees
              </p>
              <p className="text-label text-faint">
                You can assign this policy to employees after creation.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={nextStep}
            className="text-label text-faint transition-colors hover:text-muted-foreground"
          >
            Continue to Review →
          </button>
        </div>
      </DetailSection>
    </div>
  )
}
