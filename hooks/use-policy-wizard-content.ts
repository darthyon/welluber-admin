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
import {
  validateBenefit,
  validateCoPayment,
  validateGroupInsert,
} from "@/lib/policy/validation"
import { getAvailableRefreshCycles } from "@/components/host/policies/wizard-constants"
import { usePolicyDraft } from "@/hooks/use-policy-draft"
import type { PolicyWizardCtx } from "@/components/host/policies/wizard-section-types"

// ─── Options ──────────────────────────────────────────────────────────────────

export interface PolicyWizardContentOptions {
  mode?: "create" | "edit"
  groupsOnly?: boolean
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
  lockedOrganizationId?: string
  onSubmit: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onReview?: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onValidationChange?: (sectionErrorCounts: Record<string, number>) => void
  onDirtyChange?: (dirty: boolean) => void
  onTargetingChange?: (targeting: {
    organizationId?: string
    employmentTypes: string[]
    tierIds: string[]
    departmentIds: string[]
  }) => void
  onIssuesChange?: (entries: Array<{ key: string; label: string; target: string }>) => void
  onSaveStatusChange?: (state: { status: "idle" | "saving" | "saved"; savedAt?: string }) => void
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface PolicyWizardContentState {
  ctx: PolicyWizardCtx
  handleSubmit: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_FOR_KEY: Array<{ test: (key: string) => boolean; section: string }> = [
  {
    test: (k) => ["name", "organizationId", "eligibleEmploymentTypes"].includes(k),
    section: "policy-details",
  },
  {
    test: (k) =>
      ["prorateUnit", "dependentsPoolType", "refreshCycle", "refreshStartMonth"].includes(k),
    section: "pool-cycle",
  },
  { test: (k) => k.startsWith("dependent_cap_"), section: "pool-cycle" },
  {
    test: (k) =>
      k === "groups" ||
      k.startsWith("group_") ||
      k.startsWith("group_copay_") ||
      k.startsWith("group_name_") ||
      k.startsWith("group_cap_") ||
      k.startsWith("benefit_") ||
      k.startsWith("copay_"),
    section: "groups-services",
  },
]

function sectionForKey(key: string): string {
  for (const rule of SECTION_FOR_KEY) {
    if (rule.test(key)) return rule.section
  }
  return "policy-details"
}

function targetIdForKey(key: string): string {
  if (key.startsWith("group_name_") || key.startsWith("group_cap_")) {
    return `group-${key.replace(/^group_(name|cap)_/, "")}`
  }
  if (key.startsWith("group_copay_")) {
    return `group-${key.replace(/^group_copay_/, "")}`
  }
  if (key.startsWith("dependent_cap_")) return "pool-cycle"
  if (key.startsWith("benefit_") || key.startsWith("copay_")) {
    const parts = key.split("_")
    return parts.length >= 2 ? `group-${parts[1]}` : sectionForKey(key)
  }
  if (key.startsWith("group_")) return "groups-services"
  return sectionForKey(key)
}

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

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("policy-submit-error")
    if (!raw) return
    try {
      const err = JSON.parse(raw) as { field: string; message: string }
      sessionStorage.removeItem("policy-submit-error")
      setTimeout(() => {
        setValidationErrors((prev) => ({ ...prev, [err.field]: err.message }))
      }, 0)
      if (err.field === "name") {
        setTimeout(() => {
          nameInputRef.current?.focus()
          nameInputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
        }, 100)
      }
    } catch {
      sessionStorage.removeItem("policy-submit-error")
    }
  }, [])

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

  // ── Realtime error clearing ───────────────────────────────────────────────

  useEffect(() => {
    if (validationErrors.name && policyData.name?.trim() && policyData.name.length <= 100) {
      setTimeout(() => setFieldError("name", undefined), 0)
    }
  }, [policyData.name, validationErrors.name, setFieldError])

  useEffect(() => {
    if (validationErrors.organizationId && policyData.organizationId) {
      setTimeout(() => setFieldError("organizationId", undefined), 0)
    }
  }, [policyData.organizationId, validationErrors.organizationId, setFieldError])

  useEffect(() => {
    if (
      validationErrors.eligibleEmploymentTypes &&
      (policyData.eligibleEmploymentTypes?.length ?? 0) > 0
    ) {
      setTimeout(() => setFieldError("eligibleEmploymentTypes", undefined), 0)
    }
  }, [
    policyData.eligibleEmploymentTypes,
    validationErrors.eligibleEmploymentTypes,
    setFieldError,
  ])

  useEffect(() => {
    if (
      validationErrors.dependentsPoolType &&
      ((policyData.dependentCoverages?.length ?? 0) === 0 || policyData.dependentsPoolType)
    ) {
      setTimeout(() => setFieldError("dependentsPoolType", undefined), 0)
    }
  }, [
    policyData.dependentCoverages,
    policyData.dependentsPoolType,
    validationErrors.dependentsPoolType,
    setFieldError,
  ])

  useEffect(() => {
    if (
      validationErrors.prorateUnit &&
      (policyData.utilisationMode !== "Prorated" || policyData.prorateUnit)
    ) {
      setTimeout(() => setFieldError("prorateUnit", undefined), 0)
    }
  }, [
    policyData.utilisationMode,
    policyData.prorateUnit,
    validationErrors.prorateUnit,
    setFieldError,
  ])

  useEffect(() => {
    if (validationErrors.groups && groups.length > 0) {
      setTimeout(() => setFieldError("groups", undefined), 0)
    }
  }, [groups.length, validationErrors.groups, setFieldError])

  useEffect(() => {
    setTimeout(() => {
      setValidationErrors((prev) => {
        let changed = false
        const next = { ...prev }
        benefits.forEach((b) => {
          const amountKey = `benefit_${b.groupId}_${b.serviceId}`
          if (next[amountKey] && b.amount > 0) {
            delete next[amountKey]
            changed = true
          }
          const copayKey = `copay_${b.groupId}_${b.serviceId}`
          if (next[copayKey]) {
            const v = b.coPayment.value || 0
            const ok =
              !b.coPayment.required ||
              (b.coPayment.type === "Percentage" && v >= 0 && v <= 100) ||
              (b.coPayment.type === "Fixed" && v <= b.amount)
            if (ok) {
              delete next[copayKey]
              changed = true
            }
          }
        })
        groups.forEach((g) => {
          const capKey = `group_cap_${g.id}`
          if (next[capKey] && g.distributionType === "SharedAmount" && (g.maxUsagePerCycle ?? 0) > 0) {
            delete next[capKey]
            changed = true
          }
          if (next[capKey] && g.distributionType !== "SharedAmount") {
            delete next[capKey]
            changed = true
          }
          const nameKey = `group_name_${g.id}`
          if (next[nameKey] && g.name?.trim()) {
            delete next[nameKey]
            changed = true
          }
          const groupCopayKey = `group_copay_${g.id}`
          if (next[groupCopayKey]) {
            const copay = g.coPayment
            const v = copay?.value ?? 0
            const ok =
              !copay?.required ||
              (copay.type === "Percentage" && v >= 0 && v <= 100) ||
              copay.type === "Fixed"
            if (ok) {
              delete next[groupCopayKey]
              changed = true
            }
          }
        })
        ;(policyData.dependentCoverages ?? []).forEach((c) => {
          const key = `dependent_cap_${c.type}`
          if (next[key] && (c.capAmount ?? 0) > 0) {
            delete next[key]
            changed = true
          }
        })
        return changed ? next : prev
      })
    }, 0)
  }, [benefits, groups, policyData.dependentCoverages])

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!groupsOnly) {
      if (!policyData.name?.trim()) errors.name = "Policy name is required"
      else if (policyData.name.length > 100) errors.name = "Max 100 characters"

      if (!policyData.organizationId) errors.organizationId = "Select an organisation"

      if (!policyData.eligibleEmploymentTypes || policyData.eligibleEmploymentTypes.length === 0) {
        errors.eligibleEmploymentTypes = "Select at least one employment type"
      }

      if (policyData.utilisationMode === "Prorated" && !policyData.prorateUnit) {
        errors.prorateUnit = "Pick a prorate unit (Monthly is most common)"
      }

      const hasDependents = (policyData.dependentCoverages?.length ?? 0) > 0

      if (hasDependents && !policyData.dependentsPoolType) {
        errors.dependentsPoolType = "Select a pool type for dependents"
      }

      if (
        hasDependents &&
        policyData.dependentsPoolType &&
        policyData.dependentsPoolType !== "SharedWithEmployee"
      ) {
        ;(policyData.dependentCoverages ?? []).forEach((coverage) => {
          if (!coverage.capAmount || coverage.capAmount <= 0) {
            errors[`dependent_cap_${coverage.type}`] = "Enter an amount greater than 0"
          }
        })
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

    if (mode !== "create" || groupsOnly) {
      if (groups.length === 0) errors.groups = "Add at least one benefit group"

      groups.forEach((group, idx) => {
        const groupIssue = validateGroupInsert(policyData.id || "temp", group.name, groups, group.id)
        if (groupIssue) errors[`group_name_${group.id}`] = groupIssue.message

        if (group.distributionType === "SharedAmount") {
          const coversEmployee = group.coverageScope !== "Dependent"
          const coversDependent = group.coverageScope !== "Employee"
          const dependentsConfigured = (policyData.dependentCoverages?.length ?? 0) > 0

          if (coversEmployee && (!group.maxUsagePerCycle || group.maxUsagePerCycle <= 0)) {
            errors[`group_cap_${group.id}`] = "Shared pools need a cap (e.g. 1000)"
          }
          if (
            coversDependent &&
            dependentsConfigured &&
            (!group.dependentGroupCap || group.dependentGroupCap <= 0)
          ) {
            errors[`group_dep_cap_${group.id}`] = "Shared pools need a dependent cap (e.g. 1000)"
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
            if (issue.field === "coPayment.value" && group.distributionType !== "SharedAmount") {
              errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message
            }
            if (issue.field === "dependentCoPayment.value" && group.distributionType !== "SharedAmount") {
              errors[`dep_copay_${group.id}_${benefit.serviceId}`] = issue.message
            }
            if (issue.field === "serviceId") errors[`group_${idx}`] = issue.message
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
    const newGroup: BenefitGroup = {
      id: `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

  const updateGroup = (
    groupId: string,
    field: keyof BenefitGroup,
    value: string | number | boolean | undefined
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
        const dependentCoPayment = g.dependentCoPayment ?? {
          required: false,
          type: "Percentage" as const,
          value: 0,
        }
        return { ...g, dependentCoPayment: { ...dependentCoPayment, [field]: value } }
      })
    )
  }

  const toggleService = useCallback((groupId: string, serviceId: MainServiceId) => {
    setBenefits((prev) => {
      const exists = prev.find((b) => b.groupId === groupId && b.serviceId === serviceId)
      if (exists) {
        return prev.filter((b) => !(b.groupId === groupId && b.serviceId === serviceId))
      }
      return [
        ...prev,
        {
          id: `ben-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          groupId,
          serviceId,
          amount: 0,
          coPayment: { required: false, type: "Percentage", value: 0 },
        },
      ]
    })
  }, [])

  const updateBenefit = (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[]
  ) => {
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

  const sectionErrorCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "policy-details": 0,
      "pool-cycle": 0,
      "groups-services": 0,
    }
    Object.keys(validationErrors).forEach((key) => {
      const section = sectionForKey(key)
      counts[section] = (counts[section] ?? 0) + 1
    })
    return counts
  }, [validationErrors])

  useEffect(() => {
    onValidationChange?.(sectionErrorCounts)
  }, [sectionErrorCounts, onValidationChange])

  // ── Error entries ─────────────────────────────────────────────────────────

  const errorEntries = useMemo(() => {
    return Object.entries(validationErrors).map(([key, message]) => {
      let label = message
      if (key.startsWith("benefit_") || key.startsWith("copay_")) {
        const [, gid, sid] = key.split("_")
        const group = groups.find((g) => g.id === gid)
        const groupLabel = group?.name || "Group"
        const fieldLabel = key.startsWith("copay_") ? "Co-payment" : "Amount"
        label = `${groupLabel} → ${sid} → ${fieldLabel}: ${message}`
      } else if (key.startsWith("group_name_")) {
        const gid = key.replace("group_name_", "")
        const group = groups.find((g) => g.id === gid)
        label = `${group?.name || "Group"} → Name: ${message}`
      } else if (key.startsWith("group_cap_")) {
        const gid = key.replace("group_cap_", "")
        const group = groups.find((g) => g.id === gid)
        label = `${group?.name || "Group"} → Cap: ${message}`
      } else if (key.startsWith("group_")) {
        label = `Groups: ${message}`
      }
      return { key, message, label, target: targetIdForKey(key) }
    })
  }, [validationErrors, groups])

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
