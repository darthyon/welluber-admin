"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  type BenefitPolicy,
  type BenefitGroup,
  type Benefit,
  type BenefitGroupCoverageScope,
} from "@/types/policy"
import { MOCK_ORGS, SERVICES } from "@/lib/mock-data"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import { usePolicyDraft } from "@/hooks/use-policy-draft"
import type { PolicyWizardCtx } from "@/components/host/policies/wizard-section-types"
import {
  useLivePolicyWizardErrorClearing,
  useStoredPolicySubmitError,
} from "@/hooks/use-policy-wizard-content.effects"
import {
  buildPolicyWizardErrorEntries,
  buildSectionErrorCounts,
  validatePolicyWizard,
} from "@/hooks/use-policy-wizard-content.helpers"
import {
  applyGroupCoverageScope,
  createBenefitGroup,
  removeBenefitGroup,
  removeBenefitsForGroup,
  toggleBenefitService,
  toggleEmploymentTypeSelection,
  updateBenefitField,
  updateBenefitGroupCopayment,
  updateBenefitGroupDependentCopayment,
  updateBenefitGroupField,
} from "@/hooks/use-policy-wizard-content.mutations"
import type {
  PolicyWizardContentOptions,
  PolicyWizardContentState,
} from "@/hooks/use-policy-wizard-content.types"

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePolicyWizardContent({
  mode = "create",
  groupsOnly = false,
  initialData,
  lockedOrganizationId,
  onSubmit,
  onReview,
  onValidationChange,
  onDirtyChange,
  onTargetingChange,
  onIssuesChange,
  onSaveStatusChange,
}: PolicyWizardContentOptions): PolicyWizardContentState {
  // ── State ─────────────────────────────────────────────────────────────────

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
      ...(lockedOrganizationId ? { organizationId: lockedOrganizationId } : {}),
    }
  )

  const [groups, setGroups] = useState<BenefitGroup[]>(
    (initialData?.groups || []).map((g) => ({
      ...g,
      coverageScope: g.coverageScope ?? ("Employee" as BenefitGroupCoverageScope),
    }))
  )
  const [benefits, setBenefits] = useState<Benefit[]>(initialData?.benefits || [])
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [depModalGroupId, setDepModalGroupId] = useState<string | null>(null)

  // ── Derived options ───────────────────────────────────────────────────────

  // SERVICE_CATEGORIES used internally (kept for potential future use)
  useMemo(() => Array.from(new Set(SERVICES.map((s) => s.category))), [])

  const tierOptions = useMemo(() => {
    if (!policyData.organizationId) return [] as { value: string; label: string }[]
    const org = MOCK_ORGS.find((item) => item.id === policyData.organizationId)
    return (org?.tierConfigs ?? []).map((tier) => ({
      value: tier.id,
      label: tier.code ? `${tier.code} - ${tier.name}` : tier.name,
    }))
  }, [policyData.organizationId])

  const departmentOptions = useMemo(() => {
    if (!policyData.organizationId) return [] as { value: string; label: string }[]
    const org = MOCK_ORGS.find((item) => item.id === policyData.organizationId)
    return (org?.departmentConfigs ?? []).map((dept) => ({
      value: dept.id,
      label: dept.code ? `${dept.code} - ${dept.name}` : dept.name,
    }))
  }, [policyData.organizationId])

  // ── Server-error injection ────────────────────────────────────────────────

  useStoredPolicySubmitError({ nameInputRef, setValidationErrors })

  // ── Per-field validators ──────────────────────────────────────────────────

  const setFieldError = useCallback((key: string, msg: string | undefined) => {
    setValidationErrors((prev) => {
      const next = { ...prev }
      if (msg) next[key] = msg
      else delete next[key]
      return next
    })
  }, [])

  const blurName = useCallback(() => {
    if (!policyData.name?.trim()) setFieldError("name", "Policy name is required")
    else if (policyData.name.length > 100) setFieldError("name", "Max 100 characters")
    else setFieldError("name", undefined)
  }, [policyData.name, setFieldError])

  const blurBenefitAmount = useCallback(
    (groupId: string, serviceId: string, amount: number) => {
      const key = `benefit_${groupId}_${serviceId}`
      if (!amount || amount <= 0) setFieldError(key, "Amount must be greater than 0")
      else setFieldError(key, undefined)
    },
    [setFieldError]
  )

  const blurCopayValue = useCallback(
    (
      groupId: string,
      serviceId: string,
      type: "Percentage" | "Fixed",
      value: number,
      benefitAmount: number
    ) => {
      const key = `copay_${groupId}_${serviceId}`
      if (type === "Percentage" && (value < 0 || value > 100)) {
        setFieldError(key, "Percentage must be 0–100")
      } else if (type === "Fixed" && value > benefitAmount) {
        setFieldError(key, "Fixed co-pay cannot exceed benefit amount")
      } else setFieldError(key, undefined)
    },
    [setFieldError]
  )

  const blurGroupCopayValue = useCallback(
    (groupId: string, type: "Percentage" | "Fixed", value: number) => {
      const key = `group_copay_${groupId}`
      if (type === "Percentage" && (value < 0 || value > 100)) {
        setFieldError(key, "Percentage must be 0–100")
      } else if (value < 0) {
        setFieldError(key, "Co-payment cannot be negative")
      } else {
        setFieldError(key, undefined)
      }
    },
    [setFieldError]
  )

  useLivePolicyWizardErrorClearing({
    benefits,
    groups,
    policyData,
    setFieldError,
    setValidationErrors,
    validationErrors,
  })

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors = validatePolicyWizard({
      benefits,
      groups,
      groupsOnly,
      mode,
      policyData,
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleEmploymentType = (id: string) => {
    setPolicyData((prev) => toggleEmploymentTypeSelection(prev, id))
  }

  const addGroup = useCallback(() => {
    setGroups((prev) => [...prev, createBenefitGroup(policyData.id)])
  }, [policyData.id])

  const removeGroup = (groupId: string) => {
    setGroups((prev) => removeBenefitGroup(prev, groupId))
    setBenefits((prev) => removeBenefitsForGroup(prev, groupId))
  }

  const updateGroup = (
    groupId: string,
    field: keyof BenefitGroup,
    value: string | number | boolean | undefined
  ) => {
    setGroups((prev) => updateBenefitGroupField(prev, groupId, field, value))
  }

  const updateGroupCoPayment = (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => {
    setGroups((prev) => updateBenefitGroupCopayment(prev, groupId, field, value))
  }

  const updateDependentCoPayment = (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => {
    setGroups((prev) => updateBenefitGroupDependentCopayment(prev, groupId, field, value))
  }

  const toggleService = useCallback((groupId: string, serviceId: MainServiceId) => {
    setBenefits((prev) => toggleBenefitService(prev, groupId, serviceId))
  }, [])

  const updateBenefit = (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[]
  ) => {
    setBenefits((prev) => updateBenefitField(prev, benefitId, field, value))
  }

  const setGroupCoverageScope = useCallback((groupId: string, scope: BenefitGroupCoverageScope) => {
    setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, coverageScope: scope } : group)))
    setBenefits((prev) => applyGroupCoverageScope(prev, groupId, scope))
  }, [])

  const handleSubmit = () => {
    if (!validate()) return
    const data = { policy: policyData, groups, benefits }
    if (mode === "create" && onReview) {
      onReview(data)
    } else {
      onSubmit(data)
    }
  }

  // ── Autosave draft ────────────────────────────────────────────────────────

  const draftState = useMemo(
    () => ({ policy: policyData, groups, benefits }),
    [policyData, groups, benefits]
  )
  const { status: draftStatus, savedAt } = usePolicyDraft(
    policyData.organizationId,
    draftState,
    mode === "create"
  )

  useEffect(() => {
    onDirtyChange?.(draftStatus !== "idle")
  }, [draftStatus, onDirtyChange])

  useEffect(() => {
    onSaveStatusChange?.({ status: draftStatus, savedAt })
  }, [draftStatus, savedAt, onSaveStatusChange])

  useEffect(() => {
    onTargetingChange?.({
      organizationId: policyData.organizationId,
      employmentTypes: policyData.eligibleEmploymentTypes ?? [],
      tierIds: policyData.eligibility?.tierIds ?? [],
      departmentIds: policyData.eligibility?.departmentIds ?? [],
    })
  }, [
    policyData.organizationId,
    policyData.eligibleEmploymentTypes,
    policyData.eligibility?.tierIds,
    policyData.eligibility?.departmentIds,
    onTargetingChange,
  ])

  // ── Section error counts ──────────────────────────────────────────────────

  const sectionErrorCounts = useMemo(
    () => buildSectionErrorCounts(validationErrors),
    [validationErrors],
  )

  useEffect(() => {
    onValidationChange?.(sectionErrorCounts)
  }, [sectionErrorCounts, onValidationChange])

  // ── Error entries ─────────────────────────────────────────────────────────

  const errorEntries = useMemo(
    () => buildPolicyWizardErrorEntries({ groups, validationErrors }),
    [groups, validationErrors],
  )

  useEffect(() => {
    onIssuesChange?.(errorEntries.map(({ key, label, target }) => ({ key, label, target })))
  }, [errorEntries, onIssuesChange])

  // ── Build ctx ─────────────────────────────────────────────────────────────

  const ctx: PolicyWizardCtx = {
    policyData,
    setPolicyData,
    groups,
    benefits,
    validationErrors,
    lockedOrganizationId,
    groupsOnly,
    tierOptions,
    departmentOptions,
    depModalGroupId,
    setDepModalGroupId,
    nameInputRef,
    toggleEmploymentType,
    addGroup,
    removeGroup,
    updateGroup,
    updateGroupCoPayment,
    updateDependentCoPayment,
    toggleService,
    updateBenefit,
    setGroupCoverageScope,
    blurName,
    blurBenefitAmount,
    blurCopayValue,
    blurGroupCopayValue,
  }

  return { ctx, handleSubmit }
}
