"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import {
  type BenefitPolicy,
  type BenefitGroup,
  type Benefit,
  type BenefitGroupCoverageScope,
} from "@/types/policy"
import { usePolicyDraft } from "@/hooks/use-policy-draft"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import type { GroupFieldValue } from "@/components/host/policies/wizard-types"
import {
  createInitialPolicyData,
  hydrateInitialGroups,
  validateWizardStep,
} from "@/hooks/use-benefit-policy-wizard.helpers"
import type {
  BenefitPolicyWizardOptions,
  BenefitPolicyWizardState,
} from "@/hooks/use-benefit-policy-wizard.types"

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBenefitPolicyWizard({
  mode,
  orgId,
  initialData,
  onSuccess,
  onSaveDraft,
}: BenefitPolicyWizardOptions): BenefitPolicyWizardState {
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
    createInitialPolicyData(initialData?.policy)
  )

  const [groups, setGroups] = useState<BenefitGroup[]>(hydrateInitialGroups(initialData?.groups))
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
    const errors = validateWizardStep({ currentStep: step, policyData, groups, benefits })
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
