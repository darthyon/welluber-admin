"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretDown, Check, Users } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SuccessModal } from "@/components/shared/success-modal"
import { SharedDataTable, type Column } from "@/components/shared/data-table"
import { FormActionBar } from "@/components/shared/form-step-wizard"
import { toast } from "sonner"
import { PolicyReviewCards } from "@/components/host/policies/policy-wizard-content"
import { TargetingFilterBar } from "@/components/host/policies/targeting-filter-bar"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import { MOCK_ORGS, MOCK_EMPLOYEES } from "@/lib/mock-data"
import type { EmployeeDirectoryItem } from "@/features/employees/types"

type Draft = { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }

const normEmpType = (value?: string) => (value ?? "").replace(/-/g, "_")

function getTierOptions(orgId: string | undefined) {
  if (!orgId) return [] as { value: string; label: string }[]
  const org = MOCK_ORGS.find((item) => item.id === orgId)
  return (org?.tierConfigs ?? []).map((tier) => ({ value: tier.id, label: tier.code ? `${tier.code} - ${tier.name}` : tier.name }))
}

function getDepartmentOptions(orgId: string | undefined) {
  if (!orgId) return [] as { value: string; label: string }[]
  const org = MOCK_ORGS.find((item) => item.id === orgId)
  return (org?.departmentConfigs ?? []).map((department) => ({ value: department.id, label: department.code ? `${department.code} - ${department.name}` : department.name }))
}

function getTargetedEmployees(draft: Draft | null) {
  if (!draft) return []
  const orgId = draft.policy.organizationId
  const employmentTypes = (draft.policy.eligibleEmploymentTypes ?? []).map(normEmpType)
  const tierIds = draft.policy.eligibility?.tierIds ?? []
  const departmentIds = draft.policy.eligibility?.departmentIds ?? []
  return MOCK_EMPLOYEES.filter((employee) => {
    if (orgId && employee.orgId !== orgId) return false
    if (employmentTypes.length > 0 && !employmentTypes.includes(normEmpType(employee.employmentType))) return false
    if (tierIds.length > 0 && (!employee.tierId || !tierIds.includes(employee.tierId))) return false
    if (departmentIds.length > 0 && (!employee.departmentId || !departmentIds.includes(employee.departmentId))) return false
    return true
  })
}

const employeeColumns: Column<EmployeeDirectoryItem>[] = [
  {
    header: "Employee",
    accessorKey: "name",
    render: (employee) => (
      <div>
        <p className="text-body font-medium text-foreground">{employee.name}</p>
        <p className="mt-0.5 text-label font-mono text-subtle">{employee.empCode}</p>
      </div>
    ),
  },
  {
    header: "Employment Type",
    render: (employee) => <span className="text-body text-subtle capitalize">{(employee.employmentType ?? "-").replace(/_/g, " ")}</span>,
  },
  {
    header: "Tier",
    render: (employee) => employee.tier ? <Badge variant="secondary">{employee.tier}</Badge> : <span className="text-body text-faint">-</span>,
  },
  {
    header: "Department",
    render: (employee) => <span className="text-body text-subtle">{employee.department ?? "-"}</span>,
  },
]

interface PolicyEditReviewFlowProps {
  policyId: string
  organizationId?: string
}

export function PolicyEditReviewFlow({ policyId, organizationId }: PolicyEditReviewFlowProps) {
  const router = useRouter()
  const editHref = organizationId
    ? `/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(policyId)}/edit`
    : `/policies/${encodeURIComponent(policyId)}/edit`
  const doneHref = organizationId
    ? `/organizations/${encodeURIComponent(organizationId)}?tab=policies`
    : "/policies"
  const draftKey = `policy-draft-edit-${policyId}`
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (typeof window === "undefined") return null
    const stored = sessionStorage.getItem(draftKey)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [updatedPolicyName, setUpdatedPolicyName] = useState("")

  useEffect(() => {
    if (!draft) router.replace(editHref)
  }, [draft, editHref, router])

  const tierOptions = getTierOptions(draft?.policy.organizationId)
  const departmentOptions = getDepartmentOptions(draft?.policy.organizationId)
  const targetedEmployees = getTargetedEmployees(draft)

  const updateDraft = (next: Draft) => {
    setDraft(next)
    if (typeof window !== "undefined") sessionStorage.setItem(draftKey, JSON.stringify(next))
  }

  const toggleEmpType = (id: string) => {
    if (!draft) return
    const current = draft.policy.eligibleEmploymentTypes ?? []
    updateDraft({ ...draft, policy: { ...draft.policy, eligibleEmploymentTypes: current.includes(id) ? current.filter((value) => value !== id) : [...current, id] } })
  }

  const toggleTier = (id: string) => {
    if (!draft) return
    const current = draft.policy.eligibility?.tierIds ?? []
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, tierIds: current.includes(id) ? current.filter((value) => value !== id) : [...current, id] } } })
  }

  const toggleDepartment = (id: string) => {
    if (!draft) return
    const current = draft.policy.eligibility?.departmentIds ?? []
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, departmentIds: current.includes(id) ? current.filter((value) => value !== id) : [...current, id] } } })
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    toast.success("Draft saved")
  }

  const handleConfirm = async () => {
    if (!draft) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setUpdatedPolicyName(draft.policy.name || "Policy")
    if (typeof window !== "undefined") sessionStorage.removeItem(draftKey)
    toast.success("Policy updated successfully")
    setShowSuccess(true)
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="ml-3 text-body font-medium text-muted-foreground">Loading draft...</span>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Review And Confirm Changes</h1>
          <p className="mt-1 text-body text-subtle">Verify which employees will be affected by these changes.</p>
        </div>

        <section className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Users size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Targeted Employees</h3>
              <p className="mt-0.5 text-label text-muted-foreground">{targetedEmployees.length} employee{targetedEmployees.length !== 1 ? "s" : ""} matching</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <TargetingFilterBar
              selectedEmpTypes={draft.policy.eligibleEmploymentTypes ?? []}
              selectedTierIds={draft.policy.eligibility?.tierIds ?? []}
              selectedDeptIds={draft.policy.eligibility?.departmentIds ?? []}
              tierOptions={tierOptions}
              departmentOptions={departmentOptions}
              effectiveDate={draft.policy.effectiveDate ?? "immediate"}
              scheduledDate={draft.policy.effectiveCustomDate}
              onToggleEmpType={toggleEmpType}
              onToggleTier={toggleTier}
              onToggleDept={toggleDepartment}
              onEffectiveDateChange={({ effectiveDate, scheduledDate }) => {
                updateDraft({ ...draft, policy: { ...draft.policy, effectiveDate, effectiveCustomDate: effectiveDate === "scheduled" ? scheduledDate : undefined } })
              }}
            />
          </div>

          <div className="border-t border-border/60 pt-5">
            <SharedDataTable data={targetedEmployees} columns={employeeColumns} rowsPerPage={10} ghost />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card shadow-sm">
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                <Check size={14} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-body font-semibold text-foreground">Review</p>
                <p className="text-label text-muted-foreground">Verify your configuration before saving</p>
              </div>
              <CaretDown size={14} weight="bold" className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <PolicyReviewCards policy={draft.policy} groups={draft.groups} benefits={draft.benefits} />
            </CollapsibleContent>
          </Collapsible>
        </section>

        <FormActionBar
          currentStep={1}
          totalSteps={1}
          mode="edit"
          onCancel={() => router.push(editHref)}
          onBack={() => router.push(editHref)}
          onSave={() => void handleConfirm()}
          primaryLabel="Confirm"
          primaryIcon="check"
          cancelLabel="Back To Edit"
          isSubmitting={isSubmitting}
          secondaryAction={{ label: "Save As Draft", onClick: () => void handleSaveDraft() }}
          contentClassName="max-w-[1280px]"
        />
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Policy Updated"
        message={`${updatedPolicyName} has been updated successfully.`}
        primaryAction={{ label: organizationId ? "Back To Organisation" : "View Policies", onClick: () => { setShowSuccess(false); router.push(doneHref) } }}
        secondaryAction={{ label: "Done", onClick: () => { setShowSuccess(false); router.push(doneHref) } }}
      />
    </div>
  )
}
