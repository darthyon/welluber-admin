"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import {
  ShieldCheck,
  CaretLeft,
  CaretRight,
  IdentificationCard,
  Users,
  User,
  UsersFour,
  Gear,
  TreeStructure,
  Plus,
  Trash,
  NotePencil,
  CheckCircle,
  XCircle,
  CaretDown,
  Receipt,
  Check,
  Warning,
  CalendarBlank,
  Calendar,
  ArrowCounterClockwise,
  ChartLineUp,
  type IconProps,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FieldHelp } from "@/components/shared/field-help"
import { DetailSection } from "@/components/shared/detail-section"
import { FormSelect } from "@/components/shared/form-select"
import { Switch } from "@/components/shared/switch"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { PolicyLaunchConfirmModal } from "@/components/host/policies/policy-launch-confirm-modal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  BenefitPolicy,
  BenefitGroup,
  Benefit,
  PolicyStatus,
  DistributionType,
  DependentsPoolType,
  ProrateUnit,
  RefreshCycle,
  DependentCoverageType,
  UtilisationMode,
  BenefitGroupCoverageScope,
} from "@/types/policy"
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { MOCK_EMPLOYEES, MOCK_ORGS } from "@/lib/mock-data"
import type { EmployeeDirectoryItem } from "@/features/employees/types"
import { MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import { BenefitServiceSelector } from "@/components/host/policies/benefit-service-selector"
import { BenefitGroupSnapshot } from "@/components/host/policies/benefit-group-snapshot"
import { MonthPickerField } from "@/components/shared/month-picker-field"
import {
  validateBenefit,
  validateCoPayment,
  validateGroupInsert,
} from "@/lib/policy/validation"
import { usePolicyDraft } from "@/hooks/use-policy-draft"

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TABS = [
  { id: 1, title: "Overview" },
  { id: 2, title: "Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Claims Usage", viewOnly: true },
]

const CREATE_STEPS = [
  { id: 1, title: "Basics" },
  { id: 2, title: "Pool Config" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Assign Employees" },
  { id: 5, title: "Review" },
]

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
]

const PRORATE_UNITS: ProrateUnit[] = ["Daily", "Weekly", "Monthly", "Quarterly"]
const REFRESH_CYCLES: RefreshCycle[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
]

const DEPENDENTS_POOL_OPTIONS: {
  value: DependentsPoolType
  title: string
  description: string
  icon: React.ElementType<IconProps>
}[] = [
  {
    value: "Individual",
    title: "Individual",
    description: "Each dependent has their own benefit pool.",
    icon: User,
  },
  {
    value: "Shared",
    title: "Shared",
    description: "All dependents share the same pool.",
    icon: UsersFour,
  },
  {
    value: "SharedWithEmployee",
    title: "Shared with Employee",
    description: "Dependents share the employee's pool.",
    icon: Users,
  },
]

function getAvailableRefreshCycles(
  utilisationMode: "Fixed" | "Prorated",
  prorateUnit?: ProrateUnit
): RefreshCycle[] {
  if (utilisationMode === "Fixed") {
    return ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]
  }
  if (!prorateUnit) return REFRESH_CYCLES
  const unitIdx = PRORATE_UNITS.indexOf(prorateUnit)
  return REFRESH_CYCLES.slice(unitIdx + 1)
}

const STATUS_CONFIG: Record<
  PolicyStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    icon: NotePencil,
  },
  active: {
    label: "Active",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    icon: CheckCircle,
  },
  deactivated: {
    label: "Deactivated",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    icon: XCircle,
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-semibold text-subtle">{label}</p>
      <p className="text-body font-medium text-foreground">
        {value || (
          <span className="text-faint italic dark:text-muted-foreground">
            —
          </span>
        )}
      </p>
    </div>
  )
}

function StatusPicker({
  value,
  onChange,
  disabled,
}: {
  value: PolicyStatus
  onChange: (v: PolicyStatus) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[value]
  const Icon = cfg.icon

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-label font-semibold transition-all",
          cfg.bg,
          cfg.color,
          !disabled && "cursor-pointer hover:opacity-80"
        )}
      >
        <Icon size={13} weight="fill" />
        {cfg.label}
        {!disabled && <CaretDown size={11} weight="bold" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-lg border border-border bg-popover shadow-lg shadow-black/20"
          >
            {(Object.keys(STATUS_CONFIG) as PolicyStatus[]).map((s) => {
              const c = STATUS_CONFIG[s]
              const SI = c.icon
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-body font-semibold transition-colors hover:bg-muted",
                    c.color,
                    s === value && "bg-muted"
                  )}
                >
                  <SI size={14} weight="fill" />
                  {c.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BenefitPolicyWizardProps {
  onCancel: () => void
  onSuccess: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
    assignedEmployeeIds?: string[]
  }) => void
  onSaveDraft?: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onEdit?: () => void
  mode?: "create" | "edit" | "view"
  orgId?: string
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
}

export function BenefitPolicyWizard({
  onCancel,
  onSuccess,
  onSaveDraft,
  onEdit,
  mode = "create",
  orgId,
  initialData,
}: BenefitPolicyWizardProps) {
  const isViewMode = mode === "view"

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [depModalGroupId, setDepModalGroupId] = useState<string | null>(null)

  const [policyData, setPolicyData] = useState<Partial<BenefitPolicy>>(
    initialData?.policy || {
      name: "",
      description: "",
      eligibleEmploymentTypes: [
        "full-time",
        "part-time",
        "contract",
        "internship",
      ],
      dependentCoverages: [],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "financial_year",
      refreshStartMonth: 1,
      status: "draft",
    }
  )

  const [groups, setGroups] = useState<BenefitGroup[]>(
    (initialData?.groups || []).map((g) => ({
      ...g,
      coverageScope:
        g.coverageScope ?? ("Employee" as BenefitGroupCoverageScope),
    }))
  )
  const [benefits, setBenefits] = useState<Benefit[]>(
    initialData?.benefits || []
  )

  // Employee assignment step state
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([])
  const [assignmentOrgId, setAssignmentOrgId] = useState<string>(orgId ?? "")

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [showPostCreateModal, setShowPostCreateModal] = useState(false)
  const [showLaunchConfirmModal, setShowLaunchConfirmModal] = useState(false)
  const [showCustomizeAssignment, setShowCustomizeAssignment] = useState(false)
  const policyIdRef = useRef(0)
  const groupIdRef = useRef(0)
  const benefitIdRef = useRef(0)

  const draftState = useMemo(
    () => ({
      policyData,
      groups,
      benefits,
      assignedEmployeeIds,
      assignmentOrgId,
      currentStep,
    }),
    [
      policyData,
      groups,
      benefits,
      assignedEmployeeIds,
      assignmentOrgId,
      currentStep,
    ]
  )

  const {
    hasDraft,
    savedAt: draftSavedAt,
    restored: draftRestored,
    restore: restoreDraft,
    clear: clearDraft,
  } = usePolicyDraft(
    policyData.organizationId || orgId,
    draftState,
    mode === "create"
  )

  // ── Validation helpers ────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!policyData.name?.trim()) errors.name = "Policy name is required"
      else if (policyData.name.length > 100) errors.name = "Max 100 characters"
      if (
        !policyData.eligibleEmploymentTypes ||
        policyData.eligibleEmploymentTypes.length === 0
      ) {
        errors.eligibleEmploymentTypes = "Select at least one employment type"
      }
    }

    if (step === 2) {
      if (
        policyData.utilisationMode === "Prorated" &&
        !policyData.prorateUnit
      ) {
        errors.prorateUnit = "Pick a prorate unit (Monthly is most common)"
      }

      const hasDependents = (policyData.dependentCoverages?.length ?? 0) > 0

      if (hasDependents && !policyData.dependentsPoolType) {
        errors.dependentsPoolType = "Select a pool type for dependents"
      }

      if (
        policyData.refreshStartReference === "calendar_year" &&
        (!policyData.refreshStartMonth ||
          policyData.refreshStartMonth < 1 ||
          policyData.refreshStartMonth > 12)
      ) {
        errors.refreshStartMonth = "Select a start month"
      }

      if (policyData.utilisationMode === "Prorated" && policyData.prorateUnit) {
        const available = getAvailableRefreshCycles(
          "Prorated",
          policyData.prorateUnit
        )
        if (
          policyData.refreshCycle &&
          !available.includes(policyData.refreshCycle)
        ) {
          errors.refreshCycle = `${policyData.refreshCycle} is not valid for ${policyData.prorateUnit} prorate. Valid: ${available.join(", ")}`
        }
      }
    }

    if (step === 3) {
      if (groups.length === 0) errors.groups = "Add at least one benefit group"
      groups.forEach((group, idx) => {
        const groupIssue = validateGroupInsert(
          policyData.id || "temp",
          group.name,
          groups,
          group.id
        )
        if (groupIssue) {
          errors[`group_name_${group.id}`] = groupIssue.message
        }

        if (group.distributionType === "SharedAmount") {
          const coversEmployee = group.coverageScope !== "Dependent"
          const coversDependent = group.coverageScope !== "Employee"
          const dependentsConfigured =
            (policyData.dependentCoverages?.length ?? 0) > 0

          if (
            coversEmployee &&
            (!group.maxUsagePerCycle || group.maxUsagePerCycle <= 0)
          ) {
            errors[`group_cap_${group.id}`] =
              "Shared pools need a cap (e.g. RM 1000)"
          }
          if (
            coversDependent &&
            dependentsConfigured &&
            (!group.dependentGroupCap || group.dependentGroupCap <= 0)
          ) {
            errors[`group_dep_cap_${group.id}`] =
              "Shared pools need a dependent cap (e.g. RM 1000)"
          }

          const copayIssue = validateCoPayment(undefined, group.coPayment)
          if (copayIssue) errors[`group_copay_${group.id}`] = copayIssue.message

          const depCopayIssue = validateCoPayment(
            undefined,
            group.dependentCoPayment
          )
          if (depCopayIssue)
            errors[`group_dep_copay_${group.id}`] = depCopayIssue.message
        }

        const groupBenefits = benefits.filter((b) => b.groupId === group.id)
        if (groupBenefits.length === 0) {
          errors[`group_${idx}`] =
            `Select at least one benefit for ${group.name || "this group"}`
        }
        groupBenefits.forEach((benefit) => {
          const issues = validateBenefit(benefit, benefits)
          issues.forEach((issue) => {
            if (issue.field === "amount") {
              errors[`benefit_${group.id}_${benefit.serviceId}`] = issue.message
            }
            if (issue.field === "coPayment.value") {
              errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message
            }
            if (issue.field === "dependentCoPayment.value") {
              errors[`dep_copay_${group.id}_${benefit.serviceId}`] =
                issue.message
            }
            if (issue.field === "serviceId") {
              errors[`group_${idx}`] = issue.message
            }
          })
        })
      })
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleEmploymentType = (id: string) => {
    setPolicyData((prev) => {
      const current = prev.eligibleEmploymentTypes || []
      return {
        ...prev,
        eligibleEmploymentTypes: current.includes(id)
          ? current.filter((x) => x !== id)
          : [...current, id],
      }
    })
  }

  const addGroup = useCallback(() => {
    groupIdRef.current += 1
    const newGroup: BenefitGroup = {
      id: `grp-new-${groupIdRef.current}`,
      policyId: policyData.id || "temp",
      name: "New Benefit Group",
      coverageScope: "Employee",
      distributionType: "IndividualBenefitAmount",
      coPayment: { required: false, type: "Percentage", value: 0 },
    }
    setGroups((prev) => [...prev, newGroup])
  }, [policyData.id])

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId))
    setBenefits(benefits.filter((b) => b.groupId !== groupId))
  }

  const updateGroup = (
    groupId: string,
    field: keyof BenefitGroup,
    value:
      | string
      | number
      | boolean
      | DistributionType
      | UtilisationMode
      | ProrateUnit
      | RefreshCycle
      | BenefitGroupCoverageScope
      | undefined
  ) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
    )
  }

  const updateGroupCoPayment = (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        const coPayment = g.coPayment ?? {
          required: false,
          type: "Percentage" as const,
          value: 0,
        }
        return { ...g, coPayment: { ...coPayment, [field]: value } }
      })
    )
  }

  const updateDependentCoPayment = (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g
        const coPayment = g.dependentCoPayment ?? {
          required: false,
          type: "Percentage" as const,
          value: 0,
        }
        return { ...g, dependentCoPayment: { ...coPayment, [field]: value } }
      })
    )
  }
  const toggleService = (groupId: string, serviceId: MainServiceId) => {
    const exists = benefits.find(
      (b) => b.groupId === groupId && b.serviceId === serviceId
    )
    if (exists) {
      setBenefits(
        benefits.filter(
          (b) => !(b.groupId === groupId && b.serviceId === serviceId)
        )
      )
    } else {
      benefitIdRef.current += 1
      setBenefits([
        ...benefits,
        {
          id: `ben-new-${benefitIdRef.current}`,
          groupId,
          serviceId,
          amount: 0,
          coPayment: { required: false, type: "Percentage", value: 0 },
        },
      ])
    }
  }

  const updateBenefit = (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[]
  ) => {
    setBenefits(
      benefits.map((b) => {
        if (b.id !== benefitId) return b
        if (field.includes(".")) {
          const [parent, child] = field.split(".")
          if (parent === "coPayment") {
            return {
              ...b,
              coPayment: { ...b.coPayment, [child]: value },
            } as Benefit
          }
          if (parent === "dependentCoPayment") {
            const dependentCoPayment = b.dependentCoPayment ?? {
              required: false,
              type: "Percentage" as const,
              value: 0,
            }
            return {
              ...b,
              dependentCoPayment: { ...dependentCoPayment, [child]: value },
            } as Benefit
          }
          return b
        }
        return { ...b, [field]: value }
      })
    )
  }

  const setGroupCoverageScope = useCallback(
    (groupId: string, scope: BenefitGroupCoverageScope) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, coverageScope: scope } : g))
      )
      setBenefits((prev) =>
        prev.map((b) => {
          if (b.groupId !== groupId) return b
          if (scope === "Both") {
            const employeeAmount =
              typeof b.employeeAmount === "number" ? b.employeeAmount : 0
            const dependantAmount =
              typeof b.dependantAmount === "number" ? b.dependantAmount : 0
            return {
              ...b,
              employeeAmount,
              dependantAmount,
              amount: employeeAmount + dependantAmount,
              dependentCoPayment: b.dependentCoPayment ?? {
                required: false,
                type: "Percentage",
                value: 0,
              },
            }
          }
          if (scope === "Employee") {
            const nextAmount =
              typeof b.employeeAmount === "number" ? b.employeeAmount : b.amount
            return {
              ...b,
              amount: nextAmount,
              employeeAmount: undefined,
              dependantAmount: undefined,
              dependantTypes: undefined,
              dependentCoPayment: undefined,
            }
          }
          // Dependent
          const nextAmount =
            typeof b.dependantAmount === "number" ? b.dependantAmount : b.amount
          return {
            ...b,
            amount: nextAmount,
            dependantAmount: nextAmount,
            employeeAmount: undefined,
            dependantTypes: undefined,
            dependentCoPayment: b.dependentCoPayment ?? {
              required: false,
              type: "Percentage",
              value: 0,
            },
          }
        })
      )
    },
    []
  )

  const nextStep = async () => {
    if (isSubmitting) return
    if (!validateStep(currentStep)) return
    if (mode === "create" && currentStep === 1 && !policyData.id) {
      setIsSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 650))
      policyIdRef.current += 1
      const id = `POL-new-${String(policyIdRef.current).padStart(4, "0")}`
      const shellPolicy: Partial<BenefitPolicy> = {
        ...policyData,
        id,
        status: policyData.status ?? "draft",
      }
      setPolicyData(shellPolicy)
      onSaveDraft?.({ policy: shellPolicy, groups, benefits })
      setIsSubmitting(false)
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const goToStep = (stepId: number) => {
    if (isSubmitting) return
    // Allow going back freely; going forward requires current step validation
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) return
    }
    setCurrentStep(stepId)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setIsSuccess(true)
    clearDraft()
    setTimeout(
      () =>
        onSuccess({
          policy: policyData,
          groups,
          benefits,
          assignedEmployeeIds,
        }),
      1800
    )
  }

  const handleSaveDraft = () => {
    if (!validateStep(currentStep)) return
    if (mode === "create") {
      setShowPostCreateModal(true)
    } else {
      onSaveDraft?.({ policy: policyData, groups, benefits })
    }
  }

  const handleActivateFromModal = async () => {
    setShowPostCreateModal(false)
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setIsSuccess(true)
    clearDraft()
    setTimeout(
      () =>
        onSuccess({
          policy: { ...policyData, status: "active" },
          groups,
          benefits,
        }),
      1800
    )
  }

  const handleLaunchClick = () => {
    if (!validateStep(currentStep)) return
    setShowLaunchConfirmModal(true)
  }

  const handleRestoreDraft = () => {
    const restored = restoreDraft()
    if (!restored) return
    setPolicyData(restored.policyData)
    setGroups(restored.groups)
    setBenefits(restored.benefits)
    setAssignedEmployeeIds(restored.assignedEmployeeIds)
    setAssignmentOrgId(restored.assignmentOrgId)
    setCurrentStep(restored.currentStep)
  }

  const handleViewFromModal = () => {
    setShowPostCreateModal(false)
    onSaveDraft?.({ policy: policyData, groups, benefits })
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div className="py-12">
        <SuccessCelebration
          title={
            mode === "edit" ? "Policy Updated!" : "Benefit Policy Created!"
          }
          message="The policy details have been saved and applied."
        />
      </div>
    )
  }

  // ─ Step rendering helpers ─────────────────────────────────────────────────

  const renderBasicsStep = () => {
    return (
      <div className="max-w-3xl animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-2">
        <DetailSection
          title="Policy Basics"
          icon={<IdentificationCard size={18} weight="duotone" />}
          description="Name your policy and define who is eligible"
          ghost
        >
          <div className="space-y-5 md:max-w-xl">
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Policy Name{" "}
                <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Wellness Premium 2026"
                className={cn(
                  "w-full rounded-lg border bg-background px-4 py-3 text-body font-semibold text-foreground transition-all outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
                  validationErrors.name
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-border"
                )}
                value={policyData.name || ""}
                onChange={(e) =>
                  setPolicyData({ ...policyData, name: e.target.value })
                }
                disabled={isViewMode}
              />
              {validationErrors.name && (
                <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                  {validationErrors.name}
                </p>
              )}
              <p className="text-micro text-faint">
                Max 100 characters. Must be unique in your account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Description
              </label>
              <textarea
                placeholder="Describe the purpose of this benefit policy..."
                rows={3}
                className="min-h-[80px] w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-body font-medium text-muted-foreground transition-all outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                value={policyData.description || ""}
                onChange={(e) =>
                  setPolicyData({ ...policyData, description: e.target.value })
                }
                disabled={isViewMode}
              />
              <p className="text-micro text-faint">
                Optional. Max 300 characters.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-label font-medium text-subtle">
                Employment Types{" "}
                <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              {validationErrors.eligibleEmploymentTypes && (
                <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                  {validationErrors.eligibleEmploymentTypes}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const allSelected = EMPLOYMENT_TYPES.every((t) =>
                    policyData.eligibleEmploymentTypes?.includes(t.id)
                  )
                  return (
                    <button
                      type="button"
                      disabled={isViewMode}
                      onClick={() =>
                        setPolicyData({
                          ...policyData,
                          eligibleEmploymentTypes: allSelected
                            ? policyData.eligibleEmploymentTypes
                            : EMPLOYMENT_TYPES.map((t) => t.id),
                        })
                      }
                      className={cn(
                        "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                        allSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {allSelected && (
                        <Check
                          size={12}
                          weight="bold"
                          className="mr-1.5 inline"
                        />
                      )}
                      All
                    </button>
                  )
                })()}
                {EMPLOYMENT_TYPES.map((type) => {
                  const selected =
                    policyData.eligibleEmploymentTypes?.includes(type.id) ||
                    false
                  return (
                    <button
                      key={type.id}
                      disabled={isViewMode}
                      onClick={() => toggleEmploymentType(type.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {selected && (
                        <Check
                          size={12}
                          weight="bold"
                          className="mr-1.5 inline"
                        />
                      )}
                      {type.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tier eligibility */}
            {(() => {
              const activeOrgId = orgId ?? policyData.organizationId
              if (!activeOrgId) return null
              const org = MOCK_ORGS.find((item) => item.id === activeOrgId)
              const tierOptions = (org?.tierConfigs ?? []).map((tier) => ({
                value: tier.id,
                label: tier.code ? `${tier.code} - ${tier.name}` : tier.name,
              }))
              if (tierOptions.length === 0) return null
              return (
                <div className="space-y-3">
                  <label className="text-label font-medium text-subtle">
                    Eligible Tiers
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tierOptions.map((tier) => {
                      const selected =
                        policyData.eligibility?.tierIds?.includes(tier.value) ??
                        false
                      return (
                        <button
                          key={tier.value}
                          type="button"
                          disabled={isViewMode}
                          onClick={() => {
                            const current =
                              policyData.eligibility?.tierIds ?? []
                            const updated = selected
                              ? current.filter((id) => id !== tier.value)
                              : [...current, tier.value]
                            setPolicyData({
                              ...policyData,
                              eligibility: {
                                ...policyData.eligibility,
                                tierIds: updated,
                              },
                            })
                          }}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-label font-medium transition-all",
                            selected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {tier.label}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-micro text-faint">
                    Leave all unchecked to apply to all tiers.
                  </p>
                </div>
              )
            })()}
          </div>
        </DetailSection>
      </div>
    )
  }

  const renderPoolStep = () => {
    const availableCycles = getAvailableRefreshCycles(
      policyData.utilisationMode ?? "Fixed",
      policyData.prorateUnit
    )

    if (isViewMode) {
      const refreshLabels: Record<string, string> = {
        financial_year: "Financial Year",
        calendar_year: "Calendar Year",
      }
      return (
        <div className="animate-in space-y-8 duration-300 fade-in">
          <DetailSection
            title="Benefit Pool Strategy"
            icon={<Gear size={18} weight="duotone" />}
            description="Fund allocation configuration"
            ghost
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ReadField
                label="Pool Type"
                value={
                  policyData.benefitPoolType === "Shared"
                    ? "Shared Pool"
                    : "Individual"
                }
              />
              <ReadField
                label="Dependents"
                value={
                  (policyData.dependentCoverages?.length ?? 0) > 0
                    ? "Covered"
                    : "Employee Only"
                }
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
                <ReadField
                  label="Prorate Unit"
                  value={policyData.prorateUnit}
                />
              )}
            </div>
          </DetailSection>
          <DetailSection
            title="Cycle & Lifecycle"
            icon={<Gear size={18} weight="duotone" />}
            description="Refresh intervals"
            ghost
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ReadField
                label="Refresh Cycle"
                value={policyData.refreshCycle}
              />
              <ReadField
                label="Refresh Start Reference"
                value={
                  refreshLabels[policyData.refreshStartReference || ""] ||
                  policyData.refreshStartReference
                }
              />
              {policyData.refreshStartMonth && (
                <ReadField
                  label="Start Month"
                  value={
                    [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ][policyData.refreshStartMonth - 1]
                  }
                />
              )}
            </div>
          </DetailSection>
        </div>
      )
    }

    return (
      <div className="max-w-3xl space-y-8">
        <DetailSection
          title="Benefit Pool Strategy"
          icon={<Gear size={18} weight="duotone" />}
          description="Choose how funds are allocated"
          ghost
        >
          <div className="space-y-6 md:max-w-xl">
            {/* ── Employee Policy Amount ── */}
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Employee Policy Amount <FieldHelp termKey="spendingCap" />
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 3000"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                value={policyData.totalCapAmount ?? ""}
                onChange={(e) =>
                  setPolicyData({
                    ...policyData,
                    totalCapAmount:
                      e.target.value === ""
                        ? undefined
                        : parseFloat(e.target.value),
                  })
                }
                disabled={isViewMode}
              />
              <p className="text-micro text-faint">
                Optional. Maximum total an employee can claim under this policy
                per cycle.
              </p>
            </div>

            {/* ── Cover Dependents ── */}
            <div className="space-y-3">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Cover Dependents <FieldHelp termKey="dependentsPooling" />
              </label>
              <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={(policyData.dependentCoverages?.length ?? 0) > 0}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      dependentCoverages: e.target.checked
                        ? policyData.dependentCoverages?.length
                          ? policyData.dependentCoverages
                          : [
                              { type: "spouse" },
                              { type: "child" },
                              { type: "mother" },
                              { type: "father" },
                              { type: "sibling" },
                              { type: "inlaw" },
                            ]
                        : [],
                      dependentsPoolType: e.target.checked
                        ? (policyData.dependentsPoolType ??
                          "SharedWithEmployee")
                        : undefined,
                    })
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  disabled={isViewMode}
                />
                Include dependents in this policy
              </label>
              {(policyData.dependentCoverages?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const DEPENDENT_TYPES = [
                      { value: "spouse" as const, label: "Spouse" },
                      { value: "child" as const, label: "Child" },
                      { value: "mother" as const, label: "Mother" },
                      { value: "father" as const, label: "Father" },
                      { value: "sibling" as const, label: "Sibling" },
                      { value: "inlaw" as const, label: "In-law" },
                    ]
                    const allSelected = DEPENDENT_TYPES.every((t) =>
                      policyData.dependentCoverages?.some(
                        (c) => c.type === t.value
                      )
                    )
                    return (
                      <>
                        <button
                          type="button"
                          disabled={isViewMode}
                          onClick={() =>
                            setPolicyData({
                              ...policyData,
                              dependentCoverages: allSelected
                                ? []
                                : DEPENDENT_TYPES.map((t) => ({
                                    type: t.value,
                                  })),
                              dependentsPoolType: allSelected
                                ? undefined
                                : (policyData.dependentsPoolType ??
                                  "SharedWithEmployee"),
                            })
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-label font-medium transition-all",
                            allSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {allSelected && (
                            <Check
                              size={11}
                              weight="bold"
                              className="mr-1.5 inline"
                            />
                          )}
                          All
                        </button>
                        {DEPENDENT_TYPES.map((opt) => {
                          const isSelected =
                            policyData.dependentCoverages?.some(
                              (c) => c.type === opt.value
                            ) ?? false
                          const selected = isSelected
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isViewMode}
                              onClick={() => {
                                const next = isSelected
                                  ? (
                                      policyData.dependentCoverages ?? []
                                    ).filter((c) => c.type !== opt.value)
                                  : [
                                      ...(policyData.dependentCoverages ?? []),
                                      { type: opt.value },
                                    ]
                                setPolicyData({
                                  ...policyData,
                                  dependentCoverages: next,
                                  dependentsPoolType:
                                    next.length > 0
                                      ? (policyData.dependentsPoolType ??
                                        "SharedWithEmployee")
                                      : undefined,
                                })
                              }}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-label font-medium transition-all",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
                              )}
                            >
                              {selected && (
                                <Check
                                  size={11}
                                  weight="bold"
                                  className="mr-1.5 inline"
                                />
                              )}
                              {opt.label}
                            </button>
                          )
                        })}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* ── Dependents Pool Type ── */}
            {(policyData.dependentCoverages?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                  Dependents Pool Type{" "}
                  <span className="text-rose-600 dark:text-rose-400">*</span>
                  <FieldHelp termKey="dependentsPooling" />
                </label>
                {validationErrors.dependentsPoolType && (
                  <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                    {validationErrors.dependentsPoolType}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:max-w-2xl">
                  {DEPENDENTS_POOL_OPTIONS.map((opt) => (
                    <ChoiceCard
                      key={opt.value}
                      title={opt.title}
                      description={opt.description}
                      icon={opt.icon}
                      selected={policyData.dependentsPoolType === opt.value}
                      onSelect={() =>
                        setPolicyData({
                          ...policyData,
                          dependentsPoolType: opt.value,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Dependent Amount (Shared pool) ── */}
            {(policyData.dependentCoverages?.length ?? 0) > 0 &&
              policyData.dependentsPoolType === "Shared" && (
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle">
                    Dependent Pool Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1500"
                    className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                    value={policyData.dependentCapAmount ?? ""}
                    onChange={(e) =>
                      setPolicyData({
                        ...policyData,
                        dependentCapAmount:
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                      })
                    }
                    disabled={isViewMode}
                  />
                  <p className="text-micro text-faint">
                    Total shared pool for all dependents per cycle.
                  </p>
                </div>
              )}

            {/* ── Dependent Amounts (Individual pool) ── */}
            {(policyData.dependentCoverages?.length ?? 0) > 0 &&
              policyData.dependentsPoolType === "Individual" && (
                <div className="space-y-3">
                  <label className="text-label font-medium text-subtle">
                    Dependent Amounts{" "}
                    <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                    {(policyData.dependentCoverages ?? []).map((coverage) => (
                      <div key={coverage.type} className="space-y-1.5">
                        <label className="block text-label font-medium text-subtle">
                          {coverage.type === "spouse"
                            ? "Spouse"
                            : coverage.type === "child"
                              ? "Child"
                              : coverage.type === "mother"
                                ? "Mother"
                                : coverage.type === "father"
                                  ? "Father"
                                  : coverage.type === "sibling"
                                    ? "Sibling"
                                    : "In-law"}
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 1500"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                          value={coverage.capAmount ?? ""}
                          onChange={(e) =>
                            setPolicyData((prev) => ({
                              ...prev,
                              dependentCoverages: (
                                prev.dependentCoverages ?? []
                              ).map((c) =>
                                c.type === coverage.type
                                  ? {
                                      ...c,
                                      capAmount:
                                        e.target.value === ""
                                          ? undefined
                                          : parseFloat(e.target.value),
                                    }
                                  : c
                              ),
                            }))
                          }
                          disabled={isViewMode}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* ── Utilisation Mode ── */}
            <div className="space-y-3">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Utilisation Mode <FieldHelp termKey="utilisationMode" />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-xl">
                <ChoiceCard
                  title="Fixed Allocation"
                  description="Full benefit pool is granted upon assignment."
                  icon={Gear}
                  selected={policyData.utilisationMode === "Fixed"}
                  onSelect={() =>
                    setPolicyData({
                      ...policyData,
                      utilisationMode: "Fixed",
                      prorateUnit: undefined,
                    })
                  }
                />
                <ChoiceCard
                  title="Prorated Allocation"
                  description="Benefit amounts are prorated based on time."
                  icon={Gear}
                  selected={policyData.utilisationMode === "Prorated"}
                  onSelect={() =>
                    setPolicyData({
                      ...policyData,
                      utilisationMode: "Prorated",
                      prorateUnit: policyData.prorateUnit ?? "Monthly",
                    })
                  }
                />
              </div>
            </div>

            {policyData.utilisationMode === "Prorated" && (
              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                  Prorate Unit{" "}
                  <span className="text-rose-600 dark:text-rose-400">*</span>
                  <FieldHelp termKey="prorateUnit" />
                </label>
                <FormSelect
                  value={policyData.prorateUnit || ""}
                  onChange={(v) => {
                    const newUnit = v as ProrateUnit
                    const newAvailable = newUnit
                      ? getAvailableRefreshCycles("Prorated", newUnit)
                      : REFRESH_CYCLES
                    const currentCycle = policyData.refreshCycle
                    const adjustedCycle =
                      currentCycle && newAvailable.includes(currentCycle)
                        ? currentCycle
                        : newAvailable[0]
                    setPolicyData({
                      ...policyData,
                      prorateUnit: newUnit || undefined,
                      refreshCycle: adjustedCycle,
                    })
                  }}
                  options={PRORATE_UNITS.map((u) => ({ label: u, value: u }))}
                  placeholder="Select prorate unit..."
                  error={!!validationErrors.prorateUnit}
                />
                {validationErrors.prorateUnit && (
                  <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                    {validationErrors.prorateUnit}
                  </p>
                )}
              </div>
            )}
          </div>
        </DetailSection>

        <DetailSection
          title="Cycle & Lifecycle"
          icon={<Gear size={18} weight="duotone" />}
          description="Refresh intervals and start reference"
          ghost
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Refresh Cycle <FieldHelp termKey="refreshCycle" />
              </label>
              <FormSelect
                value={policyData.refreshCycle}
                onChange={(v) =>
                  setPolicyData({
                    ...policyData,
                    refreshCycle: v as RefreshCycle,
                  })
                }
                options={availableCycles.map((c) => ({ label: c, value: c }))}
                error={!!validationErrors.refreshCycle}
              />
              {validationErrors.refreshCycle && (
                <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                  {validationErrors.refreshCycle}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="inline-flex items-center gap-1.5 text-label font-medium text-subtle">
                Refresh Start Reference <FieldHelp termKey="refreshCycle" />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ChoiceCard
                  title="Financial Year"
                  description="Cycle aligns to the organisation's financial year."
                  icon={CalendarBlank}
                  selected={
                    policyData.refreshStartReference === "financial_year"
                  }
                  onSelect={() =>
                    setPolicyData({
                      ...policyData,
                      refreshStartReference: "financial_year",
                      refreshStartMonth: undefined,
                    })
                  }
                />
                <ChoiceCard
                  title="Calendar Year"
                  description="Cycle aligns to the standard Jan–Dec calendar year."
                  icon={Calendar}
                  selected={
                    policyData.refreshStartReference === "calendar_year"
                  }
                  onSelect={() =>
                    setPolicyData({
                      ...policyData,
                      refreshStartReference: "calendar_year",
                    })
                  }
                />
              </div>
              {policyData.refreshStartReference === "calendar_year" && (
                <div className="space-y-2">
                  <p className="text-label font-medium text-subtle">
                    Start Month
                  </p>
                  {validationErrors.refreshStartMonth && (
                    <p className="text-label font-medium text-rose-600 dark:text-rose-400">
                      {validationErrors.refreshStartMonth}
                    </p>
                  )}
                  <MonthPickerField
                    value={policyData.refreshStartMonth}
                    onChange={(m) =>
                      setPolicyData({ ...policyData, refreshStartMonth: m })
                    }
                    error={!!validationErrors.refreshStartMonth}
                  />
                </div>
              )}
            </div>
          </div>
        </DetailSection>
      </div>
    )
  }

  const renderGroupsStep = () => {
    const groupErrors = validationErrors

    return (
      <DetailSection
        title="Benefit Groups"
        icon={<TreeStructure size={18} weight="duotone" />}
        description="Organize benefits into logical groups with budget controls"
        ghost
        action={
          !isViewMode ? (
            <Button
              onClick={addGroup}
              size="sm"
              className="flex h-8 items-center gap-2 rounded-full px-4 text-label"
            >
              <Plus size={14} weight="bold" />
              Add Group
            </Button>
          ) : undefined
        }
      >
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
            <TreeStructure
              size={36}
              weight="duotone"
              className="mx-auto mb-3 text-faint"
            />
            <p className="text-body font-medium text-muted-foreground">
              {isViewMode
                ? "No benefit groups configured."
                : "No benefit groups yet."}
            </p>
            {!isViewMode && (
              <Button
                variant="ghost"
                onClick={addGroup}
                className="mt-2 text-body font-semibold text-primary"
              >
                Create your first group
              </Button>
            )}
            {groupErrors.groups && (
              <p className="mt-2 text-label font-medium text-rose-600 dark:text-rose-400">
                {groupErrors.groups}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group, gIdx) => {
              const groupBenefits = benefits.filter(
                (b) => b.groupId === group.id
              )
              return (
                <div
                  key={group.id}
                  className="animate-in overflow-hidden rounded-lg border border-border bg-card/40 duration-300 zoom-in-95 fade-in"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TreeStructure size={18} weight="duotone" />
                      </div>
                      {isViewMode ? (
                        <div className="min-w-0">
                          <p className="truncate text-body font-semibold text-foreground">
                            {group.name}
                          </p>
                          {group.description && (
                            <p className="truncate text-label text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                          <input
                            className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                            value={group.name}
                            onChange={(e) =>
                              updateGroup(group.id, "name", e.target.value)
                            }
                            placeholder="Group Name"
                          />
                          {groupErrors[`group_name_${group.id}`] && (
                            <p className="text-micro text-destructive">
                              {groupErrors[`group_name_${group.id}`]}
                            </p>
                          )}
                          <input
                            className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-label text-muted-foreground outline-none focus:ring-2 focus:ring-primary/10"
                            value={group.description || ""}
                            onChange={(e) =>
                              updateGroup(
                                group.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Brief description..."
                          />
                        </div>
                      )}
                    </div>
                    {!isViewMode && (
                      <button
                        onClick={() => removeGroup(group.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="space-y-5 p-4">
                    {isViewMode && (
                      <BenefitGroupSnapshot
                        policy={policyData}
                        group={group}
                        benefits={groupBenefits}
                      />
                    )}

                    {/* Coverage scope */}
                    {!isViewMode && (
                      <div className="space-y-2">
                        <p className="text-label font-medium text-muted-foreground">
                          Covers
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {(
                            [
                              "Employee",
                              "Dependent",
                              "Both",
                            ] as BenefitGroupCoverageScope[]
                          ).map((scope) => {
                            const selected =
                              (group.coverageScope ?? "Employee") === scope
                            return (
                              <button
                                key={scope}
                                type="button"
                                onClick={() =>
                                  setGroupCoverageScope(group.id, scope)
                                }
                                className={cn(
                                  "rounded-4xl border px-3 py-1.5 text-label font-medium transition-colors",
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                                )}
                              >
                                {scope}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Employee / Dependent two-column grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Employee column */}
                      {group.coverageScope !== "Dependent" && (
                        <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
                          <p className="flex items-center gap-1.5 text-label font-semibold text-foreground">
                            <User
                              size={14}
                              weight="duotone"
                              className="text-primary"
                            />
                            Employee
                          </p>
                          <div className="space-y-1.5">
                            <p className="text-label font-medium text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                Group Cap <FieldHelp termKey="groupCap" />
                              </span>
                            </p>
                            <input
                              type="number"
                              className={cn(
                                "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-label outline-none focus:ring-2 focus:ring-primary/10",
                                groupErrors[`group_cap_${group.id}`]
                                  ? "border-destructive"
                                  : "border-border"
                              )}
                              value={group.maxUsagePerCycle || ""}
                              onChange={(e) =>
                                updateGroup(
                                  group.id,
                                  "maxUsagePerCycle",
                                  e.target.value === ""
                                    ? undefined
                                    : parseFloat(e.target.value)
                                )
                              }
                              placeholder="0.00"
                            />
                            {groupErrors[`group_cap_${group.id}`] && (
                              <p className="text-micro text-destructive">
                                {groupErrors[`group_cap_${group.id}`]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
                              Co-payment <FieldHelp termKey="coPayment" />
                            </label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={group.coPayment?.required ?? false}
                                onCheckedChange={(checked) =>
                                  updateGroupCoPayment(
                                    group.id,
                                    "required",
                                    checked
                                  )
                                }
                              />
                              {group.coPayment?.required && (
                                <div className="flex items-center gap-1.5">
                                  <FormSelect
                                    value={
                                      group.coPayment?.type ?? "Percentage"
                                    }
                                    onChange={(v) =>
                                      updateGroupCoPayment(group.id, "type", v)
                                    }
                                    options={[
                                      { label: "%", value: "Percentage" },
                                      { label: "RM", value: "Fixed" },
                                    ]}
                                    triggerClassName="h-10 min-w-[76px]"
                                  />
                                  <input
                                    type="number"
                                    className="h-10 w-24 rounded-lg border border-border bg-background px-3 py-2 text-right font-mono text-label outline-none"
                                    value={group.coPayment?.value || ""}
                                    onChange={(e) =>
                                      updateGroupCoPayment(
                                        group.id,
                                        "value",
                                        e.target.value === ""
                                          ? 0
                                          : parseFloat(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                            {groupErrors[`group_copay_${group.id}`] && (
                              <p className="text-micro text-destructive">
                                {groupErrors[`group_copay_${group.id}`]}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dependent column */}
                      {group.coverageScope !== "Employee" &&
                        ((policyData.dependentCoverages?.length ?? 0) > 0 ? (
                          <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
                            <p className="flex items-center gap-1.5 text-label font-semibold text-foreground">
                              <UsersFour
                                size={14}
                                weight="duotone"
                                className="text-primary"
                              />
                              Dependent
                            </p>
                            <div className="space-y-1.5">
                              <p className="text-label font-medium text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  Group Cap <FieldHelp termKey="groupCap" />
                                </span>
                                <span className="ml-1 font-normal text-faint">
                                  (optional)
                                </span>
                              </p>
                              <input
                                type="number"
                                className={cn(
                                  "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-label outline-none focus:ring-2 focus:ring-primary/10",
                                  groupErrors[`group_dep_cap_${group.id}`]
                                    ? "border-destructive"
                                    : "border-border"
                                )}
                                value={group.dependentGroupCap || ""}
                                onChange={(e) =>
                                  updateGroup(
                                    group.id,
                                    "dependentGroupCap",
                                    e.target.value === ""
                                      ? undefined
                                      : parseFloat(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                              />
                              {groupErrors[`group_dep_cap_${group.id}`] && (
                                <p className="text-micro text-destructive">
                                  {groupErrors[`group_dep_cap_${group.id}`]}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
                                Co-payment <FieldHelp termKey="coPayment" />
                              </label>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={
                                    group.dependentCoPayment?.required ?? false
                                  }
                                  onCheckedChange={(checked) =>
                                    updateDependentCoPayment(
                                      group.id,
                                      "required",
                                      checked
                                    )
                                  }
                                />
                                {group.dependentCoPayment?.required && (
                                  <div className="flex items-center gap-1.5">
                                    <FormSelect
                                      value={
                                        group.dependentCoPayment?.type ??
                                        "Percentage"
                                      }
                                      onChange={(v) =>
                                        updateDependentCoPayment(
                                          group.id,
                                          "type",
                                          v
                                        )
                                      }
                                      options={[
                                        { label: "%", value: "Percentage" },
                                        { label: "RM", value: "Fixed" },
                                      ]}
                                      triggerClassName="h-10 min-w-[76px]"
                                    />
                                    <input
                                      type="number"
                                      className={cn(
                                        "h-10 w-24 rounded-lg border bg-background px-3 py-2 text-right font-mono text-label outline-none",
                                        groupErrors[
                                          `group_dep_copay_${group.id}`
                                        ]
                                          ? "border-destructive"
                                          : "border-border"
                                      )}
                                      value={
                                        group.dependentCoPayment?.value || ""
                                      }
                                      onChange={(e) =>
                                        updateDependentCoPayment(
                                          group.id,
                                          "value",
                                          e.target.value === ""
                                            ? 0
                                            : parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {groupErrors[`group_dep_copay_${group.id}`] && (
                              <p className="text-micro text-destructive">
                                {groupErrors[`group_dep_copay_${group.id}`]}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/5 p-4 text-center">
                            <UsersFour
                              size={28}
                              weight="duotone"
                              className="text-border"
                            />
                            <p className="text-label font-medium text-faint">
                              No dependent coverage
                            </p>
                            <button
                              type="button"
                              onClick={() => setDepModalGroupId(group.id)}
                              className="text-label font-medium text-primary hover:underline"
                            >
                              Add dependent coverage →
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Dependent coverage mini modal */}
                    {depModalGroupId === group.id &&
                      (() => {
                        const DEP_TYPES: {
                          value: DependentCoverageType
                          label: string
                        }[] = [
                          { value: "spouse", label: "Spouse" },
                          { value: "child", label: "Child" },
                          { value: "mother", label: "Mother" },
                          { value: "father", label: "Father" },
                          { value: "sibling", label: "Sibling" },
                          { value: "inlaw", label: "In-law" },
                        ]
                        const current = policyData.dependentCoverages ?? []
                        const allSelected = DEP_TYPES.every((t) =>
                          current.some((c) => c.type === t.value)
                        )
                        return (
                          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                            <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
                              <div className="space-y-1 p-6 pb-4">
                                <p className="text-body font-semibold text-foreground">
                                  Add Dependent Coverage
                                </p>
                                <p className="text-label text-subtle">
                                  Select which dependents this group covers.
                                </p>
                              </div>
                              <div className="px-6 pb-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPolicyData({
                                        ...policyData,
                                        dependentCoverages: allSelected
                                          ? []
                                          : DEP_TYPES.map((t) => ({
                                              type: t.value,
                                              capAmount: undefined,
                                            })),
                                        dependentsPoolType: allSelected
                                          ? undefined
                                          : (policyData.dependentsPoolType ??
                                            "SharedWithEmployee"),
                                      })
                                    }
                                    className={cn(
                                      "rounded-full border px-3 py-1.5 text-label font-medium transition-all",
                                      allSelected
                                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                        : "border-border bg-background text-muted-foreground hover:border-primary/30"
                                    )}
                                  >
                                    {allSelected && (
                                      <Check
                                        size={11}
                                        weight="bold"
                                        className="mr-1.5 inline"
                                      />
                                    )}
                                    All
                                  </button>
                                  {DEP_TYPES.map((opt) => {
                                    const isSelected = current.some(
                                      (c) => c.type === opt.value
                                    )
                                    return (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                          const next = isSelected
                                            ? current.filter(
                                                (c) => c.type !== opt.value
                                              )
                                            : [
                                                ...current,
                                                {
                                                  type: opt.value,
                                                  capAmount: undefined,
                                                },
                                              ]
                                          setPolicyData({
                                            ...policyData,
                                            dependentCoverages: next,
                                            dependentsPoolType:
                                              next.length > 0
                                                ? (policyData.dependentsPoolType ??
                                                  "SharedWithEmployee")
                                                : undefined,
                                          })
                                        }}
                                        className={cn(
                                          "rounded-full border px-3 py-1.5 text-label font-medium transition-all",
                                          isSelected
                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                                        )}
                                      >
                                        {isSelected && (
                                          <Check
                                            size={11}
                                            weight="bold"
                                            className="mr-1.5 inline"
                                          />
                                        )}
                                        {opt.label}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() => setDepModalGroupId(null)}
                                  className="px-4 py-2 text-label font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={
                                    (policyData.dependentCoverages?.length ??
                                      0) === 0
                                  }
                                  onClick={() => setDepModalGroupId(null)}
                                  className="rounded-lg bg-primary px-4 py-2 text-label font-medium text-primary-foreground disabled:opacity-40"
                                >
                                  Confirm
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                    {/* Utilisation mode override */}
                    <div className="space-y-3 border-t border-border/60 pt-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-label font-medium text-muted-foreground">
                          Utilisation Mode
                        </p>
                        {!isViewMode &&
                        (group.utilisationMode ||
                          group.prorateUnit ||
                          group.refreshCycle) ? (
                          <button
                            type="button"
                            onClick={() => {
                              updateGroup(
                                group.id,
                                "utilisationMode",
                                undefined
                              )
                              updateGroup(group.id, "prorateUnit", undefined)
                              updateGroup(group.id, "refreshCycle", undefined)
                            }}
                            className="flex items-center gap-1 text-micro text-faint transition-colors hover:text-muted-foreground"
                          >
                            <ArrowCounterClockwise size={11} />
                            Reset to policy default
                          </button>
                        ) : null}
                      </div>

                      <div className="rounded-lg border border-border bg-muted/10 p-3">
                        <p className="text-micro text-faint">
                          Policy Default Allocation
                        </p>
                        <p className="mt-0.5 text-label font-medium text-foreground">
                          {policyData.utilisationMode === "Prorated"
                            ? `Prorated · ${policyData.prorateUnit ?? "Monthly"}`
                            : "Fixed Allocation"}
                          {" · "}
                          {policyData.refreshCycle ?? "Yearly"} refresh
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <ChoiceCard
                          title="Fixed Allocation"
                          description="Full allocation granted immediately."
                          icon={Gear}
                          selected={
                            (group.utilisationMode ??
                              policyData.utilisationMode) === "Fixed"
                          }
                          onSelect={() => {
                            updateGroup(group.id, "utilisationMode", "Fixed")
                            updateGroup(group.id, "prorateUnit", undefined)
                          }}
                        />
                        <ChoiceCard
                          title="Prorated Allocation"
                          description="Amounts prorated based on time."
                          icon={ChartLineUp}
                          selected={
                            (group.utilisationMode ??
                              policyData.utilisationMode) === "Prorated"
                          }
                          onSelect={() => {
                            updateGroup(group.id, "utilisationMode", "Prorated")
                            if (!group.prorateUnit)
                              updateGroup(group.id, "prorateUnit", "Monthly")
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {(group.utilisationMode ??
                          policyData.utilisationMode) === "Prorated" && (
                          <div className="animate-in space-y-1.5 duration-200 fade-in slide-in-from-top-1">
                            <p className="text-label font-medium text-muted-foreground">
                              Prorate Unit
                            </p>
                            <FormSelect
                              value={
                                group.prorateUnit ??
                                policyData.prorateUnit ??
                                "Monthly"
                              }
                              onChange={(v) => {
                                const nextUnit = (v || undefined) as
                                  | ProrateUnit
                                  | undefined
                                updateGroup(group.id, "prorateUnit", nextUnit)
                                const available = getAvailableRefreshCycles(
                                  "Prorated",
                                  (nextUnit ??
                                    policyData.prorateUnit ??
                                    "Monthly") as ProrateUnit
                                )
                                const current =
                                  group.refreshCycle ?? policyData.refreshCycle
                                if (
                                  current &&
                                  !available.includes(current as RefreshCycle)
                                ) {
                                  updateGroup(
                                    group.id,
                                    "refreshCycle",
                                    available[0]
                                  )
                                }
                              }}
                              options={[
                                { label: "Inherit (Policy)", value: "" },
                                ...PRORATE_UNITS.map((u) => ({
                                  label: u,
                                  value: u,
                                })),
                              ]}
                              triggerClassName="max-w-[240px]"
                              disabled={isViewMode}
                            />
                          </div>
                        )}

                        <div className="animate-in space-y-1.5 duration-200 fade-in slide-in-from-top-1">
                          <p className="text-label font-medium text-muted-foreground">
                            Refresh Cycle
                          </p>
                          <FormSelect
                            value={group.refreshCycle ?? ""}
                            onChange={(v) =>
                              updateGroup(
                                group.id,
                                "refreshCycle",
                                v === "" ? undefined : (v as RefreshCycle)
                              )
                            }
                            options={[
                              {
                                label: `Inherit (Policy · ${policyData.refreshCycle ?? "Yearly"})`,
                                value: "",
                              },
                              ...getAvailableRefreshCycles(
                                (group.utilisationMode ??
                                  policyData.utilisationMode ??
                                  "Fixed") as "Fixed" | "Prorated",
                                (group.utilisationMode ??
                                  policyData.utilisationMode) === "Prorated"
                                  ? ((group.prorateUnit ??
                                      policyData.prorateUnit ??
                                      "Monthly") as ProrateUnit)
                                  : undefined
                              ).map((c) => ({ label: c, value: c })),
                            ]}
                            triggerClassName="max-w-[240px]"
                            disabled={isViewMode}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Benefits selector */}
                    <div className="space-y-3 border-t border-border/60 pt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-label font-semibold text-foreground">
                          Services
                        </p>
                        {groupErrors[`group_${gIdx}`] && (
                          <p className="text-label font-medium text-destructive">
                            {groupErrors[`group_${gIdx}`]}
                          </p>
                        )}
                      </div>
                      <BenefitServiceSelector
                        groupId={group.id}
                        groupBenefits={groupBenefits}
                        isViewMode={isViewMode}
                        groupErrors={groupErrors}
                        coverageScope={group.coverageScope ?? "Employee"}
                        policyEmployeeCap={policyData.totalCapAmount}
                        policyDependentCap={policyData.dependentCapAmount}
                        onToggleService={(serviceId) =>
                          toggleService(group.id, serviceId)
                        }
                        onUpdateBenefit={updateBenefit}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DetailSection>
    )
  }

  const renderEmployeeAssignmentStep = () => {
    const activeOrgId = orgId ?? assignmentOrgId

    // Derive eligible employees from mock data
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
          if (tierIds?.length && emp.tier && !tierIds.includes(emp.tier))
            return false
          return true
        })
      : []

    const assignCount = assignedEmployeeIds.filter(
      (id) => !MOCK_EMPLOYEES.find((e) => e.id === id)?.benefitPolicies?.length
    ).length
    const reassignCount = assignedEmployeeIds.filter(
      (id) =>
        (MOCK_EMPLOYEES.find((e) => e.id === id)?.benefitPolicies?.length ??
          0) > 0
    ).length

    // Minimal org options for global picker
    const MOCK_ORG_OPTIONS = [
      { id: "ORG-20260115-0001", name: "Acme Corporation Sdn Bhd" },
      { id: "ORG-20260301-0002", name: "Global Tech Solutions" },
      { id: "ORG-20260401-0003", name: "Zenith Wellness Sdn Bhd" },
    ]

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
                <label className="text-label font-medium text-subtle">
                  Organisation (optional)
                </label>
                <FormSelect
                  value={assignmentOrgId}
                  onChange={(v) => {
                    setAssignmentOrgId(v)
                    setAssignedEmployeeIds([])
                  }}
                  options={[
                    { label: "Select organisation…", value: "" },
                    ...MOCK_ORG_OPTIONS.map((o) => ({
                      label: o.name,
                      value: o.id,
                    })),
                  ]}
                  triggerClassName="md:w-80"
                />
                <p className="text-micro text-faint">
                  Select an organisation to preview and assign eligible
                  employees.
                </p>
              </div>
            )}

            {activeOrgId ? (
              eligibleEmployees.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
                  <Users size={28} className="text-faint" />
                  <p className="text-body font-medium text-muted-foreground">
                    No eligible employees found
                  </p>
                  <p className="max-w-xs text-label text-faint">
                    No employees match the current eligibility filters
                    (employment type, tier). You can assign employees later from
                    the employee table.
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
                        setAssignedEmployeeIds(
                          eligibleEmployees.map((employee) => employee.id)
                        )
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
                      Pick Customize to choose a specific employee subset, or
                      continue with Assign All Eligible / Later.
                    </p>
                  )}

                  {showCustomizeAssignment &&
                    assignedEmployeeIds.length > 0 && (
                      <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5">
                        <Check
                          size={14}
                          weight="bold"
                          className="shrink-0 text-primary"
                        />
                        <p className="text-label font-medium text-primary">
                          {assignCount > 0 &&
                            `${assignCount} employee${assignCount !== 1 ? "s" : ""} will be assigned`}
                          {assignCount > 0 && reassignCount > 0 && " · "}
                          {reassignCount > 0 &&
                            `${reassignCount} reassigned from existing policy`}
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
                            const allSelected = allIds.every((id) =>
                              assignedEmployeeIds.includes(id)
                            )
                            setAssignedEmployeeIds(allSelected ? [] : allIds)
                          }}
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                            eligibleEmployees.every((e) =>
                              assignedEmployeeIds.includes(e.id)
                            )
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          )}
                        >
                          {eligibleEmployees.every((e) =>
                            assignedEmployeeIds.includes(e.id)
                          ) && <Check size={10} weight="bold" />}
                        </button>
                        <span className="text-label font-semibold text-muted-foreground">
                          Employee
                        </span>
                        <span className="ml-auto text-label font-semibold text-muted-foreground">
                          Current Policy
                        </span>
                      </div>
                      <div className="divide-y divide-border/50">
                        {eligibleEmployees.map((emp) => {
                          const isSelected = assignedEmployeeIds.includes(
                            emp.id
                          )
                          const hasPolicy =
                            (emp.benefitPolicies?.length ?? 0) > 0
                          return (
                            <div
                              key={emp.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20",
                                isSelected && "bg-primary/5"
                              )}
                              onClick={() =>
                                setAssignedEmployeeIds((prev) =>
                                  isSelected
                                    ? prev.filter((id) => id !== emp.id)
                                    : [...prev, emp.id]
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
                                {isSelected && (
                                  <Check size={10} weight="bold" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-body font-medium text-foreground">
                                  {emp.name}
                                </p>
                                <p className="text-label font-medium text-faint">
                                  {emp.empCode} · {emp.department ?? "—"}
                                </p>
                              </div>
                              <span className="shrink-0 text-label text-faint">
                                {emp.tier ?? "—"}
                              </span>
                              <div className="shrink-0">
                                {hasPolicy ? (
                                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-micro font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                                    {emp.benefitPolicies![0].policyName}
                                  </span>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-micro font-semibold"
                                  >
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

  const renderReviewStep = () => (
    <div className="animate-in space-y-6 duration-700 fade-in slide-in-from-bottom-4">
      {(() => {
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
          <DetailSection
            title="Assignment"
            icon={<Users size={18} weight="duotone" />}
            ghost
          >
            <div className="space-y-4">
              <ReadField
                label="Employee Assignment"
                value={assignmentSummary}
              />
              <ReadField
                label="Eligible Employees"
                value={activeOrgId ? String(eligibleEmployees.length) : "—"}
              />
            </div>
          </DetailSection>
        )
      })()}

      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <div>
            <h3 className="tracking-tight text-display font-semibold text-foreground">
              Review & Finalize
            </h3>
            <p className="mt-0.5 text-subtle">
              Verify your configuration before saving.
            </p>
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
            <ReadField
              label="Policy Name"
              value={policyData.name || undefined}
            />
            <ReadField
              label="Description"
              value={policyData.description || undefined}
            />
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
              value={
                (policyData.dependentCoverages?.length ?? 0) > 0
                  ? "Covered"
                  : "Employee Only"
              }
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
                value={
                  [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ][policyData.refreshStartMonth - 1]
                }
              />
            )}
          </div>
        </DetailSection>

        {/* Groups Summary */}
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
                const groupBenefits = benefits.filter(
                  (b) => b.groupId === group.id
                )
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
                        <p className="text-body font-medium text-foreground">
                          {group.name}
                        </p>
                        <p className="text-label font-semibold text-muted-foreground">
                          {groupBenefits.length} benefits ·{" "}
                          {group.distributionType === "SharedAmount"
                            ? "Shared Pool"
                            : "Individual"}
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

      {/* Info callout */}
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

  // ── Main Render ────────────────────────────────────────────────────────────

  // ── Status section renderer (used in content area for edit/view) ──────────
  const renderStatusSection = () => (
    <div className="mt-10 border-t border-border pt-6">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-body font-medium text-foreground">
            Policy Status
          </h4>
          <p className="mt-0.5 text-label text-faint">
            Control the visibility and lifecycle state of this policy.
          </p>
        </div>
        <StatusPicker
          value={(policyData.status as PolicyStatus) || "draft"}
          onChange={(s) => setPolicyData({ ...policyData, status: s })}
          disabled={isViewMode}
        />
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Sticky header + nav */}
      <div className="sticky top-0 z-10 border-none bg-background/80 px-6 shadow-none backdrop-blur-md transition-all">
        {/* Title + actions row */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 shadow-none transition-all hover:bg-muted/50"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <h2 className="text-heading font-semibold text-balance text-foreground">
              {isViewMode
                ? "View Benefit Policy"
                : mode === "edit"
                  ? "Edit Benefit Policy"
                  : "Add Benefit Policy"}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isViewMode ? (
              onEdit && (
                <Button
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-full bg-primary px-6 text-primary-foreground shadow-none"
                >
                  <NotePencil size={16} weight="bold" />
                  Edit Policy
                </Button>
              )
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  className="rounded-full px-4 py-2 text-body font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Save as Draft
                </button>
                {mode === "create" && currentStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="rounded-full px-6"
                  >
                    Back
                  </Button>
                )}
                {mode === "create" && currentStep < 5 ? (
                  <Button
                    onClick={nextStep}
                    className="rounded-full bg-primary px-8 text-primary-foreground shadow-none"
                  >
                    Next Step
                    <CaretRight size={16} weight="bold" className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={
                      mode === "create" ? handleLaunchClick : handleSubmit
                    }
                    disabled={isSubmitting}
                    className="min-w-[140px] rounded-full bg-primary px-8 text-primary-foreground shadow-none"
                  >
                    {isSubmitting
                      ? "Finalizing..."
                      : mode === "edit"
                        ? "Save Changes"
                        : "Launch Policy"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active policy edit banner */}
        {mode === "edit" &&
          policyData.status === "active" &&
          policyData.organizationId && (
            <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
              <Warning
                size={16}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />
              <p className="text-label font-medium text-amber-700 dark:text-amber-300">
                Changes apply to future assignments only. Existing employee
                assignments are unaffected.
              </p>
            </div>
          )}

        {/* Underline tabs — view & edit; hide tab 4 in edit */}
        {(isViewMode || mode === "edit") && (
          <div className="flex">
            {CONTENT_TABS.filter((t) => !t.viewOnly || isViewMode).map(
              (tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentStep(tab.id)}
                  className={cn(
                    "-mb-px border-b-2 px-5 py-3 text-body font-semibold transition-all",
                    currentStep === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {tab.title}
                </button>
              )
            )}
          </div>
        )}

        {/* Numbered stepper — create only */}
        {mode === "create" && (
          <div className="flex items-center gap-2 pb-5">
            {CREATE_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "group flex shrink-0 cursor-pointer items-center gap-2 transition-all",
                  currentStep === step.id
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-100"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-label font-semibold shadow-sm transition-all",
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/50"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check size={14} weight="bold" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-body font-semibold whitespace-nowrap transition-colors",
                    currentStep === step.id
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {step.title}
                </span>
                {idx < CREATE_STEPS.length - 1 && (
                  <div className="mx-1 h-[2px] w-8 rounded-full bg-muted" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 pt-8 pb-12">
        {mode === "create" && hasDraft && !draftRestored && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="text-label font-medium text-amber-700 dark:text-amber-300">
              Draft available
              {draftSavedAt
                ? ` · saved ${new Date(draftSavedAt).toLocaleString()}`
                : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearDraft}
                className="rounded-4xl px-4"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleRestoreDraft}
                className="rounded-4xl px-4"
              >
                Resume
              </Button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {currentStep === 1 && (
              <>
                {renderBasicsStep()}
                {(isViewMode || mode === "edit") && renderStatusSection()}
              </>
            )}
            {currentStep === 2 && renderPoolStep()}
            {currentStep === 3 && renderGroupsStep()}
            {currentStep === 4 &&
              mode === "create" &&
              renderEmployeeAssignmentStep()}
            {currentStep === 5 && mode === "create" && renderReviewStep()}
            {currentStep === 4 && isViewMode && (
              <DetailSection
                title="Claims Usage"
                icon={<Receipt size={18} weight="duotone" />}
                description="Benefit usage and claim history for all employees on this policy"
                ghost
              >
                <UtilisationClaimsTable data={MOCK_EMPLOYEE_UTILISATION} />
              </DetailSection>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {showLaunchConfirmModal && (
        <PolicyLaunchConfirmModal
          policy={policyData}
          assignedEmployeeIds={assignedEmployeeIds}
          groups={groups}
          benefits={benefits}
          onConfirm={() => {
            setShowLaunchConfirmModal(false)
            void handleSubmit()
          }}
          onCancel={() => setShowLaunchConfirmModal(false)}
        />
      )}

      {/* Post-creation activation modal (SCR-POL-03) */}
      <AnimatePresence>
        {showPostCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl"
            >
              <div className="p-8 pb-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
                    <ShieldCheck size={20} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold text-foreground">
                      Policy Created
                    </h3>
                    <p className="text-label text-muted-foreground">
                      {policyData.name}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label font-medium",
                      STATUS_CONFIG.draft.bg,
                      STATUS_CONFIG.draft.color
                    )}
                  >
                    <NotePencil size={12} weight="fill" />
                    Draft
                  </span>
                  <span className="text-label text-faint">
                    {groups.length} group{groups.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-8 pb-2">
                <Button
                  onClick={handleActivateFromModal}
                  className="h-12 w-full rounded-lg font-semibold shadow-lg shadow-primary/20"
                >
                  Activate policy →
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleViewFromModal}
                  className="h-11 w-full rounded-lg font-semibold hover:bg-muted"
                >
                  View policy
                </Button>
                <button
                  onClick={handleViewFromModal}
                  className="w-full py-2 text-center text-label font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Skip — let org admin handle tiers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
