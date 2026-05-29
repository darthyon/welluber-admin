"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import {
  type BenefitPolicy,
  type BenefitGroup,
  type Benefit,
  type DistributionType,
  type ProrateUnit,
  type RefreshCycle,
  type UtilisationMode,
  type BenefitGroupCoverageScope,
} from "@/types/policy"
import { usePolicyDraft } from "@/hooks/use-policy-draft"
import {
  validateBenefit,
  validateCoPayment,
  validateGroupInsert,
} from "@/lib/policy/validation"
import { getAvailableRefreshCycles } from "@/components/host/policies/wizard-constants"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import type { GroupFieldValue } from "@/components/host/policies/wizard-types"

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BenefitPolicyWizardOptions {
  mode: "create" | "edit" | "view"
  orgId?: string
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
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
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface BenefitPolicyWizardState {
  // Core state
  currentStep: number
  isSubmitting: boolean
  isSuccess: boolean
  showPostCreateModal: boolean
  showLaunchConfirmModal: boolean
  // Policy data
  policyData: Partial<BenefitPolicy>
  setPolicyData: React.Dispatch<React.SetStateAction<Partial<BenefitPolicy>>>
  groups: BenefitGroup[]
  benefits: Benefit[]
  validationErrors: Record<string, string>
  // Modal state
  depModalGroupId: string | null
  setDepModalGroupId: React.Dispatch<React.SetStateAction<string | null>>
  // Assignment state
  assignedEmployeeIds: string[]
  setAssignedEmployeeIds: React.Dispatch<React.SetStateAction<string[]>>
  assignmentOrgId: string
  setAssignmentOrgId: React.Dispatch<React.SetStateAction<string>>
  showCustomizeAssignment: boolean
  setShowCustomizeAssignment: React.Dispatch<React.SetStateAction<boolean>>
  // ID refs
  groupIdRef: React.RefObject<number>
  benefitIdRef: React.RefObject<number>
  // Draft
  hasDraft: boolean
  draftSavedAt: string | undefined
  draftRestored: boolean
  // Navigation
  nextStep: () => Promise<void>
  prevStep: () => void
  goToStep: (stepId: number) => void
  // Actions
  handleSubmit: () => Promise<void>
  handleSaveDraft: () => void
  handleActivateFromModal: () => Promise<void>
  handleLaunchClick: () => void
  handleRestoreDraft: () => void
  handleViewFromModal: () => void
  clearDraft: () => void
  setShowLaunchConfirmModal: React.Dispatch<React.SetStateAction<boolean>>
  // Group & benefit mutations
  toggleEmploymentType: (id: string) => void
  addGroup: () => void
  removeGroup: (groupId: string) => void
  updateGroup: (groupId: string, field: keyof BenefitGroup, value: GroupFieldValue) => void
  updateGroupCoPayment: (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => void
  updateDependentCoPayment: (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => void
  toggleService: (groupId: string, serviceId: MainServiceId) => void
  updateBenefit: (benefitId: string, field: string, value: string | number | boolean | string[]) => void
  setGroupCoverageScope: (groupId: string, scope: BenefitGroupCoverageScope) => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBenefitPolicyWizard({
  mode,
  orgId,
  initialData,
  onSuccess,
  onSaveDraft,
}: BenefitPolicyWizardOptions): BenefitPolicyWizardState {
  const isViewMode = mode === "view"

  // ── Step & UI state ─────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPostCreateModal, setShowPostCreateModal] = useState(false)
  const [showLaunchConfirmModal, setShowLaunchConfirmModal] = useState(false)
  const [depModalGroupId, setDepModalGroupId] = useState<string | null>(null)
  const [showCustomizeAssignment, setShowCustomizeAssignment] = useState(false)

  // ── Policy data ─────────────────────────────────────────────────────────────
  const [policyData, setPolicyData] = useState<Partial<BenefitPolicy>>(
    initialData?.policy || {
      name: "",
      description: "",
      eligibleEmploymentTypes: ["full-time", "part-time", "contract", "internship"],
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
      coverageScope: g.coverageScope ?? ("Employee" as BenefitGroupCoverageScope),
    }))
  )
  const [benefits, setBenefits] = useState<Benefit[]>(initialData?.benefits || [])

  // ── Assignment state ────────────────────────────────────────────────────────
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([])
  const [assignmentOrgId, setAssignmentOrgId] = useState<string>(orgId ?? "")

  // ── Validation ──────────────────────────────────────────────────────────────
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // ── Refs ────────────────────────────────────────────────────────────────────
  const policyIdRef = useRef(0)
  const groupIdRef = useRef(0)
  const benefitIdRef = useRef(0)

  // ── Draft ───────────────────────────────────────────────────────────────────
  const draftState = useMemo(
    () => ({ policyData, groups, benefits, assignedEmployeeIds, assignmentOrgId, currentStep }),
    [policyData, groups, benefits, assignedEmployeeIds, assignmentOrgId, currentStep]
  )

  const {
    hasDraft,
    savedAt: draftSavedAt,
    restored: draftRestored,
    restore: restoreDraft,
    clear: clearDraft,
  } = usePolicyDraft(policyData.organizationId || orgId, draftState, mode === "create")

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!policyData.name?.trim()) errors.name = "Policy name is required"
      else if (policyData.name.length > 100) errors.name = "Max 100 characters"
      if (!policyData.eligibleEmploymentTypes || policyData.eligibleEmploymentTypes.length === 0) {
        errors.eligibleEmploymentTypes = "Select at least one employment type"
      }
    }

    if (step === 2) {
      if (policyData.utilisationMode === "Prorated" && !policyData.prorateUnit) {
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
        const available = getAvailableRefreshCycles("Prorated", policyData.prorateUnit)
        if (policyData.refreshCycle && !available.includes(policyData.refreshCycle)) {
          errors.refreshCycle = `${policyData.refreshCycle} is not valid for ${policyData.prorateUnit} prorate. Valid: ${available.join(", ")}`
        }
      }
    }

    if (step === 3) {
      if (groups.length === 0) errors.groups = "Add at least one benefit group"
      groups.forEach((group, idx) => {
        const groupIssue = validateGroupInsert(policyData.id || "temp", group.name, groups, group.id)
        if (groupIssue) errors[`group_name_${group.id}`] = groupIssue.message

        if (group.distributionType === "SharedAmount") {
          const coversEmployee = group.coverageScope !== "Dependent"
          const coversDependent = group.coverageScope !== "Employee"
          const dependentsConfigured = (policyData.dependentCoverages?.length ?? 0) > 0

          if (coversEmployee && (!group.maxUsagePerCycle || group.maxUsagePerCycle <= 0)) {
            errors[`group_cap_${group.id}`] = "Shared pools need a cap (e.g. RM 1000)"
          }
          if (
            coversDependent &&
            dependentsConfigured &&
            (!group.dependentGroupCap || group.dependentGroupCap <= 0)
          ) {
            errors[`group_dep_cap_${group.id}`] = "Shared pools need a dependent cap (e.g. RM 1000)"
          }

          const copayIssue = validateCoPayment(undefined, group.coPayment)
          if (copayIssue) errors[`group_copay_${group.id}`] = copayIssue.message

          const depCopayIssue = validateCoPayment(undefined, group.dependentCoPayment)
          if (depCopayIssue) errors[`group_dep_copay_${group.id}`] = depCopayIssue.message
        }

        const groupBenefits = benefits.filter((b) => b.groupId === group.id)
        if (groupBenefits.length === 0) {
          errors[`group_${idx}`] = `Select at least one benefit for ${group.name || "this group"}`
        }
        groupBenefits.forEach((benefit) => {
          const issues = validateBenefit(benefit, benefits)
          issues.forEach((issue) => {
            if (issue.field === "amount") errors[`benefit_${group.id}_${benefit.serviceId}`] = issue.message
            if (issue.field === "coPayment.value") errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message
            if (issue.field === "dependentCoPayment.value") errors[`dep_copay_${group.id}_${benefit.serviceId}`] = issue.message
            if (issue.field === "serviceId") errors[`group_${idx}`] = issue.message
          })
        })
      })
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Callbacks ───────────────────────────────────────────────────────────────

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
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
    setBenefits((prev) => prev.filter((b) => b.groupId !== groupId))
  }

  const updateGroup = (groupId: string, field: keyof BenefitGroup, value: GroupFieldValue) => {
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
        const coPayment = g.coPayment ?? { required: false, type: "Percentage" as const, value: 0 }
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
        const coPayment = g.dependentCoPayment ?? { required: false, type: "Percentage" as const, value: 0 }
        return { ...g, dependentCoPayment: { ...coPayment, [field]: value } }
      })
    )
  }

  const toggleService = (groupId: string, serviceId: MainServiceId) => {
    const exists = benefits.find((b) => b.groupId === groupId && b.serviceId === serviceId)
    if (exists) {
      setBenefits((prev) => prev.filter((b) => !(b.groupId === groupId && b.serviceId === serviceId)))
    } else {
      benefitIdRef.current += 1
      setBenefits((prev) => [
        ...prev,
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

  const updateBenefit = (benefitId: string, field: string, value: string | number | boolean | string[]) => {
    setBenefits((prev) =>
      prev.map((b) => {
        if (b.id !== benefitId) return b
        if (field.includes(".")) {
          const [parent, child] = field.split(".")
          if (parent === "coPayment") {
            return { ...b, coPayment: { ...b.coPayment, [child]: value } } as Benefit
          }
          if (parent === "dependentCoPayment") {
            const dependentCoPayment = b.dependentCoPayment ?? {
              required: false,
              type: "Percentage" as const,
              value: 0,
            }
            return { ...b, dependentCoPayment: { ...dependentCoPayment, [child]: value } } as Benefit
          }
          return b
        }
        return { ...b, [field]: value }
      })
    )
  }

  const setGroupCoverageScope = useCallback((groupId: string, scope: BenefitGroupCoverageScope) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, coverageScope: scope } : g))
    )
    setBenefits((prev) =>
      prev.map((b) => {
        if (b.groupId !== groupId) return b
        if (scope === "Both") {
          const employeeAmount = typeof b.employeeAmount === "number" ? b.employeeAmount : 0
          const dependantAmount = typeof b.dependantAmount === "number" ? b.dependantAmount : 0
          return {
            ...b,
            employeeAmount,
            dependantAmount,
            amount: employeeAmount + dependantAmount,
            dependentCoPayment: b.dependentCoPayment ?? { required: false, type: "Percentage", value: 0 },
          }
        }
        if (scope === "Employee") {
          const nextAmount = typeof b.employeeAmount === "number" ? b.employeeAmount : b.amount
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
        const nextAmount = typeof b.dependantAmount === "number" ? b.dependantAmount : b.amount
        return {
          ...b,
          amount: nextAmount,
          dependantAmount: nextAmount,
          employeeAmount: undefined,
          dependantTypes: undefined,
          dependentCoPayment: b.dependentCoPayment ?? { required: false, type: "Percentage", value: 0 },
        }
      })
    )
  }, [])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const nextStep = async () => {
    if (isSubmitting) return
    if (!validateStep(currentStep)) return
    if (mode === "create" && currentStep === 1 && !policyData.id) {
      setIsSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 650))
      policyIdRef.current += 1
      const id = `POL-new-${String(policyIdRef.current).padStart(4, "0")}`
      const shellPolicy: Partial<BenefitPolicy> = { ...policyData, id, status: policyData.status ?? "draft" }
      setPolicyData(shellPolicy)
      onSaveDraft?.({ policy: shellPolicy, groups, benefits })
      setIsSubmitting(false)
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const goToStep = (stepId: number) => {
    if (isSubmitting) return
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) return
    }
    setCurrentStep(stepId)
  }

  // ── Submit / draft handlers ─────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsSubmitting(false)
    setIsSuccess(true)
    clearDraft()
    setTimeout(() => onSuccess({ policy: policyData, groups, benefits, assignedEmployeeIds }), 1800)
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
      () => onSuccess({ policy: { ...policyData, status: "active" }, groups, benefits }),
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

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    currentStep,
    isSubmitting,
    isSuccess,
    showPostCreateModal,
    showLaunchConfirmModal,
    policyData,
    setPolicyData,
    groups,
    benefits,
    validationErrors,
    depModalGroupId,
    setDepModalGroupId,
    assignedEmployeeIds,
    setAssignedEmployeeIds,
    assignmentOrgId,
    setAssignmentOrgId,
    showCustomizeAssignment,
    setShowCustomizeAssignment,
    groupIdRef,
    benefitIdRef,
    hasDraft,
    draftSavedAt,
    draftRestored,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    handleSaveDraft,
    handleActivateFromModal,
    handleLaunchClick,
    handleRestoreDraft,
    handleViewFromModal,
    clearDraft,
    toggleEmploymentType,
    addGroup,
    removeGroup,
    updateGroup,
    updateGroupCoPayment,
    updateDependentCoPayment,
    toggleService,
    updateBenefit,
    setGroupCoverageScope,
    setShowLaunchConfirmModal,
  }
}
