"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  IdentificationCard,
  Gear,
  Users,
  User,
  UsersFour,
  TreeStructure,
  Plus,
  Trash,
  Check,
  DiceFive,
  CaretDown,
  CalendarBlank,
  Calendar,
  ArrowCounterClockwise,
  ChartLineUp,
  type IconProps,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FieldHelp } from "@/components/shared/field-help"
import { FormSelect } from "@/components/shared/form-select"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  BenefitPolicy,
  BenefitGroup,
  Benefit,
  ProrateUnit,
  RefreshCycle,
  DependentsPoolType,
  DependentCoverageType,
  BenefitGroupCoverageScope,
} from "@/types/policy"
import type { PolicyGlossaryKey } from "@/lib/policy-glossary"
import { MOCK_ORGS, SERVICES } from "@/lib/mock-data"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import { BenefitServiceSelector } from "@/components/host/policies/benefit-service-selector"
import { MonthPickerField } from "@/components/shared/month-picker-field"
import {
  validateBenefit,
  validateCoPayment,
  validateGroupInsert,
} from "@/lib/policy/validation"
import { usePolicyDraft } from "@/hooks/use-policy-draft"

// ─── Constants ───────────────────────────────────────────────────────────────

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

const MONTHS = [
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
  // Prorated — strictly coarser than prorate unit
  if (!prorateUnit) return REFRESH_CYCLES
  const unitIdx = PRORATE_UNITS.indexOf(prorateUnit)
  return REFRESH_CYCLES.slice(unitIdx + 1)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description?: string
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <Icon size={18} weight="duotone" />
      </div>
      <div>
        <h3 className="text-lead font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-label text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function FieldLabel({
  children,
  required,
  helpKey,
}: {
  children: React.ReactNode
  required?: boolean
  helpKey?: PolicyGlossaryKey
}) {
  return (
    <label className="flex items-center gap-1.5 text-label font-medium text-subtle">
      <span>
        {children}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {helpKey ? <FieldHelp termKey={helpKey} /> : null}
    </label>
  )
}

function ErrorText({
  children,
  id,
}: {
  children: React.ReactNode
  id?: string
}) {
  return (
    <p id={id} className="mt-1 text-label font-medium text-destructive">
      {children}
    </p>
  )
}

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-micro text-faint">{children}</p>
}

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="text-body font-semibold text-foreground">
        {value || <span className="text-faint italic">—</span>}
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AI_POLICY_NAMES = [
  "Wellness Allocation 2026",
  "Active Living Plan",
  "Mind & Care Essentials",
  "Executive Health Plus",
  "Fitness First Bundle",
  "Holistic Wellness Program",
  "Recovery & Recharge",
  "Corporate Vitality Plan",
]

interface PolicyReviewCardsProps {
  policy: Partial<BenefitPolicy>
  groups: BenefitGroup[]
  benefits: Benefit[]
}

export function PolicyReviewCards({
  policy,
  groups,
  benefits,
}: PolicyReviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 text-body font-semibold text-foreground">
          <IdentificationCard
            size={16}
            weight="duotone"
            className="text-primary"
          />
          Policy Details
        </h4>
        <ReadField label="Policy Name" value={policy.name || undefined} />
        <ReadField
          label="Description"
          value={policy.description || undefined}
        />
        <ReadField
          label="Employment Types"
          value={policy.eligibleEmploymentTypes
            ?.map((t) =>
              t
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            )
            .join(", ")}
        />
        <ReadField
          label="Age Range"
          value={
            policy.eligibility?.minAge || policy.eligibility?.maxAge
              ? `${policy.eligibility?.minAge || "Any"} — ${policy.eligibility?.maxAge || "Any"}`
              : "Any age"
          }
        />
        <ReadField
          label="Gender"
          value={
            policy.eligibility?.gender
              ? policy.eligibility.gender.charAt(0).toUpperCase() +
                policy.eligibility.gender.slice(1)
              : "All"
          }
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <h4 className="flex items-center gap-2 text-body font-semibold text-foreground">
          <Gear size={16} weight="duotone" className="text-primary" />
          Pool & Cycle
        </h4>
        <ReadField
          label="Dependents"
          value={
            (policy.dependentCoverages?.length ?? 0) > 0
              ? `Covered (${policy.dependentCoverages?.map((c) => c.type).join(", ")})`
              : "Employee Only"
          }
        />
        <ReadField
          label="Employee Policy Amount"
          value={
            policy.totalCapAmount
              ? `RM ${policy.totalCapAmount.toFixed(2)}`
              : "Not Set"
          }
        />
        {(policy.dependentCoverages?.length ?? 0) > 0 && (
          <ReadField
            label="Dependents Pool Type"
            value={
              policy.dependentsPoolType === "SharedWithEmployee"
                ? "Shared with Employee"
                : policy.dependentsPoolType
            }
          />
        )}
        <ReadField
          label="Utilisation Mode"
          value={
            policy.utilisationMode === "Fixed"
              ? "Fixed Allocation"
              : "Prorated Allocation"
          }
        />
        {policy.utilisationMode === "Prorated" && (
          <ReadField label="Prorate Unit" value={policy.prorateUnit} />
        )}
        <ReadField label="Refresh Cycle" value={policy.refreshCycle} />
        <ReadField
          label="Start Reference"
          value={
            policy.refreshStartReference === "financial_year"
              ? "Financial Year"
              : "Calendar Year"
          }
        />
        {policy.refreshStartMonth && (
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
              ][policy.refreshStartMonth - 1]
            }
          />
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-5 md:col-span-2">
        <h4 className="flex items-center gap-2 text-body font-semibold text-foreground">
          <TreeStructure size={16} weight="duotone" className="text-primary" />
          Benefit Groups
        </h4>
        {groups.length === 0 ? (
          <p className="text-body font-medium text-faint">
            No benefit groups configured.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => {
              const groupBenefits = benefits.filter(
                (b) => b.groupId === group.id
              )
              return (
                <Collapsible key={group.id}>
                  <CollapsibleTrigger className="group w-full">
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-transparent p-3 transition-colors hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted text-primary">
                          <TreeStructure size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-body font-medium text-foreground">
                            {group.name}
                          </p>
                          <p className="text-label font-semibold text-muted-foreground">
                            {groupBenefits.length} benefit
                            {groupBenefits.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <CaretDown
                        size={14}
                        weight="bold"
                        className="ml-3 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 px-3 pt-1 pb-3">
                      {groupBenefits.length === 0 ? (
                        <p className="py-2 text-label text-faint">
                          No services configured.
                        </p>
                      ) : (
                        groupBenefits.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-2"
                          >
                            <span className="text-body text-foreground">
                              {SERVICES.find((s) => s.id === b.serviceId)
                                ?.name ?? b.serviceId}
                            </span>
                            <span className="text-body font-semibold text-foreground tabular-nums">
                              {b.amount.toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                      {group.distributionType === "SharedAmount" && (
                        <div className="mt-1 flex items-center justify-between rounded-md border-t border-border/40 px-3 py-2 pt-2">
                          <span className="text-label font-medium text-muted-foreground">
                            Group Cap
                          </span>
                          <span className="text-body font-semibold text-foreground tabular-nums">
                            {group.maxUsagePerCycle?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface PolicyWizardContentProps {
  mode?: "create" | "edit"
  groupsOnly?: boolean
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
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
  lockedOrganizationId?: string
  onValidationChange?: (sectionErrorCounts: Record<string, number>) => void
  onDirtyChange?: (dirty: boolean) => void
  onTargetingChange?: (targeting: {
    organizationId?: string
    employmentTypes: string[]
    tierIds: string[]
    departmentIds: string[]
  }) => void
  onIssuesChange?: (
    entries: Array<{ key: string; label: string; target: string }>
  ) => void
  onSaveStatusChange?: (state: {
    status: "idle" | "saving" | "saved"
    savedAt?: string
  }) => void
}

const SECTION_FOR_KEY: Array<{
  test: (key: string) => boolean
  section: string
}> = [
  {
    test: (k) =>
      ["name", "organizationId", "eligibleEmploymentTypes"].includes(k),
    section: "policy-details",
  },
  {
    test: (k) =>
      [
        "prorateUnit",
        "dependentsPoolType",
        "refreshCycle",
        "refreshStartMonth",
      ].includes(k),
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
  if (key.startsWith("dependent_cap_")) {
    return "pool-cycle"
  }
  if (key.startsWith("benefit_") || key.startsWith("copay_")) {
    const parts = key.split("_")
    return parts.length >= 2 ? `group-${parts[1]}` : sectionForKey(key)
  }
  if (key.startsWith("group_")) {
    return "groups-services"
  }
  return sectionForKey(key)
}

export function PolicyWizardContent({
  mode = "create",
  groupsOnly = false,
  initialData,
  onSubmit,
  onReview,
  lockedOrganizationId,
  onValidationChange,
  onDirtyChange,
  onTargetingChange,
  onIssuesChange,
  onSaveStatusChange,
}: PolicyWizardContentProps) {
  // ── Form state ────────────────────────────────────────────────────────────
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
      ...(lockedOrganizationId ? { organizationId: lockedOrganizationId } : {}),
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
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [groupCategories, setGroupCategories] = useState<
    Record<string, string[]>
  >({})
  const [depModalGroupId, setDepModalGroupId] = useState<string | null>(null)

  const SERVICE_CATEGORIES = useMemo(
    () => Array.from(new Set(SERVICES.map((s) => s.category))),
    []
  )

  const tierOptions = useMemo(() => {
    if (!policyData.organizationId)
      return [] as { value: string; label: string }[]
    const org = MOCK_ORGS.find((item) => item.id === policyData.organizationId)
    const configs = org?.tierConfigs ?? []
    return configs.map((tier) => ({
      value: tier.id,
      label: tier.code ? `${tier.code} - ${tier.name}` : tier.name,
    }))
  }, [policyData.organizationId])

  const departmentOptions = useMemo(() => {
    if (!policyData.organizationId)
      return [] as { value: string; label: string }[]
    const org = MOCK_ORGS.find((item) => item.id === policyData.organizationId)
    const configs = org?.departmentConfigs ?? []
    return configs.map((dept) => ({
      value: dept.id,
      label: dept.code ? `${dept.code} - ${dept.name}` : dept.name,
    }))
  }, [policyData.organizationId])

  // ── Server-error injection (e.g. 409 duplicate name) ─────────────────────
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
          nameInputRef.current?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          })
        }, 100)
      }
    } catch {
      sessionStorage.removeItem("policy-submit-error")
    }
  }, [])

  // ── Per-field validators (on-blur) ───────────────────────────────────────
  const setFieldError = useCallback((key: string, msg: string | undefined) => {
    setValidationErrors((prev) => {
      const next = { ...prev }
      if (msg) next[key] = msg
      else delete next[key]
      return next
    })
  }, [])

  const blurName = useCallback(() => {
    if (!policyData.name?.trim())
      setFieldError("name", "Policy name is required")
    else if (policyData.name.length > 100)
      setFieldError("name", "Max 100 characters")
    else setFieldError("name", undefined)
  }, [policyData.name, setFieldError])

  const blurBenefitAmount = useCallback(
    (groupId: string, serviceId: string, amount: number) => {
      const key = `benefit_${groupId}_${serviceId}`
      if (!amount || amount <= 0)
        setFieldError(key, "Amount must be greater than 0")
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

  // ── Realtime error clearing on valid input ──────────────────────────────
  useEffect(() => {
    if (
      validationErrors.name &&
      policyData.name?.trim() &&
      policyData.name.length <= 100
    ) {
      setTimeout(() => setFieldError("name", undefined), 0)
    }
  }, [policyData.name, validationErrors.name, setFieldError])

  useEffect(() => {
    if (validationErrors.organizationId && policyData.organizationId) {
      setTimeout(() => setFieldError("organizationId", undefined), 0)
    }
  }, [
    policyData.organizationId,
    validationErrors.organizationId,
    setFieldError,
  ])

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
      ((policyData.dependentCoverages?.length ?? 0) === 0 ||
        policyData.dependentsPoolType)
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
          if (
            next[capKey] &&
            g.distributionType === "SharedAmount" &&
            (g.maxUsagePerCycle ?? 0) > 0
          ) {
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

      if (!policyData.organizationId)
        errors.organizationId = "Select an organisation"

      if (
        !policyData.eligibleEmploymentTypes ||
        policyData.eligibleEmploymentTypes.length === 0
      ) {
        errors.eligibleEmploymentTypes = "Select at least one employment type"
      }

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
        hasDependents &&
        policyData.dependentsPoolType &&
        policyData.dependentsPoolType !== "SharedWithEmployee"
      ) {
        ;(policyData.dependentCoverages ?? []).forEach((coverage) => {
          if (!coverage.capAmount || coverage.capAmount <= 0) {
            errors[`dependent_cap_${coverage.type}`] =
              "Enter an amount greater than 0"
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

    if (mode !== "create" || groupsOnly) {
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
              "Shared pools need a cap (e.g. 1000)"
          }
          if (
            coversDependent &&
            dependentsConfigured &&
            (!group.dependentGroupCap || group.dependentGroupCap <= 0)
          ) {
            errors[`group_dep_cap_${group.id}`] =
              "Shared pools need a dependent cap (e.g. 1000)"
          }

          const copayIssue = validateCoPayment(undefined, group.coPayment)
          if (copayIssue) {
            errors[`group_copay_${group.id}`] = copayIssue.message
          }

          const depCopayIssue = validateCoPayment(
            undefined,
            group.dependentCoPayment
          )
          if (depCopayIssue) {
            errors[`group_dep_copay_${group.id}`] = depCopayIssue.message
          }
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
              if (group.distributionType !== "SharedAmount") {
                errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message
              }
            }
            if (issue.field === "dependentCoPayment.value") {
              if (group.distributionType !== "SharedAmount") {
                errors[`dep_copay_${group.id}_${benefit.serviceId}`] =
                  issue.message
              }
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
    setGroups(groups.filter((g) => g.id !== groupId))
    setBenefits(benefits.filter((b) => b.groupId !== groupId))
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
        const dependentCoPayment = g.dependentCoPayment ?? {
          required: false,
          type: "Percentage" as const,
          value: 0,
        }
        return {
          ...g,
          dependentCoPayment: { ...dependentCoPayment, [field]: value },
        }
      })
    )
  }

  const toggleService = useCallback(
    (groupId: string, serviceId: MainServiceId) => {
      setBenefits((prev) => {
        const exists = prev.find(
          (b) => b.groupId === groupId && b.serviceId === serviceId
        )
        if (exists) {
          return prev.filter(
            (b) => !(b.groupId === groupId && b.serviceId === serviceId)
          )
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
    },
    []
  )

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

  const handleSubmit = () => {
    if (!validate()) return
    const data = { policy: policyData, groups, benefits }
    if (mode === "create" && onReview) {
      onReview(data)
    } else {
      onSubmit(data)
    }
  }

  // ── Policy Details section ────────────────────────────────────────────────
  const renderPolicyDetailsSection = () => (
    <div className="space-y-6">
      <SectionHeader
        icon={IdentificationCard}
        title="Policy Details"
        description="Name your policy and define who is eligible"
      />

      <div className="space-y-1.5">
        <FieldLabel required>Policy Name</FieldLabel>
        <div
          className={cn(
            "flex w-full items-center overflow-hidden rounded-lg border bg-background transition-all focus-within:ring-2 focus-within:ring-primary/10",
            validationErrors.name
              ? "border-destructive focus-within:border-destructive"
              : "focus-within:border-primary/40"
          )}
        >
          <input
            ref={nameInputRef}
            type="text"
            maxLength={100}
            placeholder="e.g. Wellness Premium 2026"
            aria-invalid={!!validationErrors.name}
            aria-describedby={
              validationErrors.name ? "policy-name-error" : undefined
            }
            className="min-w-0 flex-1 border-0 px-4 py-3 text-body font-semibold text-foreground outline-none"
            value={policyData.name || ""}
            onChange={(e) =>
              setPolicyData({ ...policyData, name: e.target.value })
            }
            onBlur={blurName}
          />
          <span className="shrink-0 px-2 text-micro text-faint tabular-nums">
            {(policyData.name || "").length}/100
          </span>
          <button
            type="button"
            onClick={() => {
              const random =
                AI_POLICY_NAMES[
                  Math.floor(Math.random() * AI_POLICY_NAMES.length)
                ]
              setPolicyData({ ...policyData, name: random })
            }}
            className="inline-flex shrink-0 items-center gap-1 px-3 py-3 text-label font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary/80"
          >
            <DiceFive size={14} weight="bold" />
            Suggest
          </button>
        </div>
        {validationErrors.name && (
          <ErrorText id="policy-name-error">{validationErrors.name}</ErrorText>
        )}
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Description</FieldLabel>
        <div className="relative w-full rounded-lg border border-border bg-background transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          <textarea
            placeholder="Describe the purpose of this benefit policy..."
            rows={3}
            maxLength={300}
            className="min-h-[80px] w-full resize-none border-0 bg-transparent px-4 py-3 pb-7 text-body font-medium text-muted-foreground outline-none"
            value={policyData.description || ""}
            onChange={(e) =>
              setPolicyData({ ...policyData, description: e.target.value })
            }
          />
          <span className="absolute right-3 bottom-2 text-micro text-faint tabular-nums">
            {(policyData.description || "").length}/300
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel required>Organisation</FieldLabel>
        <FormSelect
          value={policyData.organizationId || ""}
          onChange={(v) => setPolicyData({ ...policyData, organizationId: v })}
          options={MOCK_ORGS.map((org) => ({ label: org.name, value: org.id }))}
          placeholder="Select organisation..."
          disabled={!!lockedOrganizationId}
          error={!!validationErrors.organizationId}
        />
        {validationErrors.organizationId && (
          <ErrorText>{validationErrors.organizationId}</ErrorText>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Eligible Tiers</FieldLabel>
          {policyData.organizationId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-label font-medium text-primary hover:bg-primary/5"
              onClick={() =>
                window.open(
                  `/organizations/${policyData.organizationId}?tab=settings`,
                  "_blank"
                )
              }
            >
              <Plus size={12} weight="bold" />
              Add Tier
            </Button>
          )}
        </div>
        {!policyData.organizationId ? (
          <p className="text-label text-faint italic">
            Select an organisation to load tier options.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(() => {
              const tierIds = policyData.eligibility?.tierIds ?? []
              const allSelected =
                tierOptions.length > 0 &&
                tierOptions.every((t) => tierIds.includes(t.value))
              return (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPolicyData({
                        ...policyData,
                        eligibility: {
                          ...policyData.eligibility,
                          tierIds: allSelected
                            ? []
                            : tierOptions.map((t) => t.value),
                        },
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
                  {tierOptions.map((tier) => {
                    const selected = tierIds.includes(tier.value)
                    return (
                      <button
                        type="button"
                        key={tier.value}
                        onClick={() => {
                          const updated = selected
                            ? tierIds.filter((id) => id !== tier.value)
                            : [...tierIds, tier.value]
                          setPolicyData({
                            ...policyData,
                            eligibility: {
                              ...policyData.eligibility,
                              tierIds: updated,
                            },
                          })
                        }}
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
                        {tier.label}
                      </button>
                    )
                  })}
                </>
              )
            })()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel>Eligible Departments</FieldLabel>
          {policyData.organizationId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-label font-medium text-primary hover:bg-primary/5"
              onClick={() =>
                window.open(
                  `/organizations/${policyData.organizationId}?tab=settings`,
                  "_blank"
                )
              }
            >
              <Plus size={12} weight="bold" />
              Add Department
            </Button>
          )}
        </div>
        {!policyData.organizationId ? (
          <p className="text-label text-faint italic">
            Select an organisation to load department options.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(() => {
              const deptIds = policyData.eligibility?.departmentIds ?? []
              const allSelected =
                departmentOptions.length > 0 &&
                departmentOptions.every((d) => deptIds.includes(d.value))
              return (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPolicyData({
                        ...policyData,
                        eligibility: {
                          ...policyData.eligibility,
                          departmentIds: allSelected
                            ? []
                            : departmentOptions.map((d) => d.value),
                        },
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
                  {departmentOptions.map((dept) => {
                    const selected = deptIds.includes(dept.value)
                    return (
                      <button
                        type="button"
                        key={dept.value}
                        onClick={() => {
                          const updated = selected
                            ? deptIds.filter((id) => id !== dept.value)
                            : [...deptIds, dept.value]
                          setPolicyData({
                            ...policyData,
                            eligibility: {
                              ...policyData.eligibility,
                              departmentIds: updated,
                            },
                          })
                        }}
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
                        {dept.label}
                      </button>
                    )
                  })}
                </>
              )
            })()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <FieldLabel required>Employment Types</FieldLabel>
        {validationErrors.eligibleEmploymentTypes && (
          <ErrorText>{validationErrors.eligibleEmploymentTypes}</ErrorText>
        )}
        <div className="flex flex-wrap gap-2">
          {(() => {
            const allSelected = EMPLOYMENT_TYPES.every((t) =>
              policyData.eligibleEmploymentTypes?.includes(t.id)
            )
            return (
              <button
                type="button"
                onClick={() =>
                  setPolicyData({
                    ...policyData,
                    eligibleEmploymentTypes: allSelected
                      ? []
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
                  <Check size={12} weight="bold" className="mr-1.5 inline" />
                )}
                All
              </button>
            )
          })()}
          {EMPLOYMENT_TYPES.map((type) => {
            const selected =
              policyData.eligibleEmploymentTypes?.includes(type.id) || false
            return (
              <button
                type="button"
                key={type.id}
                onClick={() => toggleEmploymentType(type.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-body font-semibold transition-all",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                )}
              >
                {selected && (
                  <Check size={12} weight="bold" className="mr-1.5 inline" />
                )}
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Advanced Filters — collapsed accordion, only when needed */}
      <div className="border-t border-border/60 pt-4">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 text-left">
            <CaretDown
              size={14}
              weight="bold"
              className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
            <span className="text-body font-semibold text-foreground">
              Advanced Filters
            </span>
            <span className="ml-1 text-label font-medium text-faint">
              (optional)
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <p className="mb-4 text-label text-muted-foreground">
              Narrow which employees are automatically assigned this policy.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <FieldLabel>Age Range (Min)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                  value={policyData.eligibility?.minAge || ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      eligibility: {
                        ...policyData.eligibility,
                        minAge: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
                <HelpText>Leave blank for no minimum.</HelpText>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Age Range (Max)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 65"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
                  value={policyData.eligibility?.maxAge || ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      eligibility: {
                        ...policyData.eligibility,
                        maxAge: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      },
                    })
                  }
                />
                <HelpText>Leave blank for no maximum.</HelpText>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Gender</FieldLabel>
                <div className="flex gap-2">
                  {(["all", "male", "female"] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() =>
                        setPolicyData({
                          ...policyData,
                          eligibility: { ...policyData.eligibility, gender: g },
                        })
                      }
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-body font-medium capitalize transition-all",
                        policyData.eligibility?.gender === g ||
                          (!policyData.eligibility?.gender && g === "all")
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )

  // ── Pool section ──────────────────────────────────────────────────────────
  const renderPoolSection = () => {
    const availableCycles = getAvailableRefreshCycles(
      policyData.utilisationMode ?? "Fixed",
      policyData.prorateUnit
    )

    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Gear}
          title="Pool & Cycle"
          description="Configure fund allocation and refresh intervals"
        />

        {/* ── Employee Policy Amount ── */}
        <div className="space-y-1.5">
          <FieldLabel helpKey="spendingCap">Employee Policy Amount</FieldLabel>
          <input
            type="number"
            min={0}
            placeholder="e.g. 3000"
            className="w-full max-w-[240px] rounded-lg border border-border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10"
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
          />
          <HelpText>
            Optional. Maximum total an employee can claim under this policy per
            cycle.
          </HelpText>
          {(policyData.dependentCoverages?.length ?? 0) > 0 &&
            policyData.dependentsPoolType === "SharedWithEmployee" && (
              <p className="text-micro text-faint">
                Dependents share this employee amount
                {typeof policyData.totalCapAmount === "number"
                  ? ` (RM ${policyData.totalCapAmount.toFixed(2)})`
                  : ""}
                .
              </p>
            )}
        </div>

        {/* ── Dependent Coverage ── */}
        <div className="space-y-3">
          <FieldLabel helpKey="dependentsPooling">Cover Dependents</FieldLabel>
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
                    ? (policyData.dependentsPoolType ?? "SharedWithEmployee")
                    : undefined,
                })
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
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
                  policyData.dependentCoverages?.some((c) => c.type === t.value)
                )
                return (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPolicyData({
                          ...policyData,
                          dependentCoverages: allSelected
                            ? []
                            : DEPENDENT_TYPES.map((t) => ({
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
                          onClick={() => {
                            const next = isSelected
                              ? (policyData.dependentCoverages ?? []).filter(
                                  (c) => c.type !== opt.value
                                )
                              : [
                                  ...(policyData.dependentCoverages ?? []),
                                  { type: opt.value, capAmount: undefined },
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
          <div className="animate-in space-y-3 duration-300 fade-in slide-in-from-top-1">
            <FieldLabel required helpKey="dependentsPooling">
              Dependents Pool Type
            </FieldLabel>
            {validationErrors.dependentsPoolType && (
              <ErrorText>{validationErrors.dependentsPoolType}</ErrorText>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
            <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-1">
              <FieldLabel helpKey="spendingCap">
                Dependent Pool Amount
              </FieldLabel>
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
              />
              <HelpText>
                Total shared pool for all dependents per cycle.
              </HelpText>
            </div>
          )}

        {/* ── Dependent Amounts (Individual pool) ── */}
        {(policyData.dependentCoverages?.length ?? 0) > 0 &&
          policyData.dependentsPoolType === "Individual" && (
            <div className="animate-in space-y-3 duration-300 fade-in slide-in-from-top-1">
              <FieldLabel required helpKey="spendingCap">
                Dependent Amounts
              </FieldLabel>
              <div className="grid max-w-xl grid-cols-1 gap-4 md:grid-cols-2">
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
                      className={cn(
                        "w-full rounded-lg border bg-background px-4 py-2.5 text-body font-medium transition-all outline-none focus:ring-2 focus:ring-primary/10",
                        validationErrors[`dependent_cap_${coverage.type}`]
                          ? "border-destructive"
                          : "border-border"
                      )}
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
                    />
                    {validationErrors[`dependent_cap_${coverage.type}`] && (
                      <ErrorText>
                        {validationErrors[`dependent_cap_${coverage.type}`]}
                      </ErrorText>
                    )}
                  </div>
                ))}
              </div>
              <HelpText>Per-dependent-type cap amounts.</HelpText>
            </div>
          )}

        {/* ── Separator ── */}
        <div className="space-y-6 border-t border-border/60 pt-6">
          {/* ── Utilisation Mode ── */}
          <div className="space-y-3">
            <FieldLabel helpKey="utilisationMode">Utilisation Mode</FieldLabel>
            <HelpText>
              This will be the default for all benefit groups, which can be
              overridden per group.
            </HelpText>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-1">
              <FieldLabel required helpKey="prorateUnit">
                Prorate Unit
              </FieldLabel>
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
                triggerClassName="max-w-[240px]"
              />
              {validationErrors.prorateUnit && (
                <ErrorText>{validationErrors.prorateUnit}</ErrorText>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <FieldLabel helpKey="refreshCycle">Refresh Cycle</FieldLabel>
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
              triggerClassName="max-w-[240px]"
            />
            {validationErrors.refreshCycle && (
              <ErrorText>{validationErrors.refreshCycle}</ErrorText>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Refresh Start Reference section ──────────────────────────────────────
  const renderRefreshStartSection = () => (
    <div className="space-y-6">
      <SectionHeader
        icon={Calendar}
        title="Refresh Start Reference"
        description="When should this policy's benefit cycle begin each year?"
      />

      <div className="space-y-3">
        <FieldLabel required>Cycle Type</FieldLabel>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ChoiceCard
            title="Financial Year"
            description="Cycle aligns to the organisation's financial year."
            icon={CalendarBlank}
            selected={policyData.refreshStartReference === "financial_year"}
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
            selected={policyData.refreshStartReference === "calendar_year"}
            onSelect={() =>
              setPolicyData({
                ...policyData,
                refreshStartReference: "calendar_year",
              })
            }
          />
        </div>
      </div>

      {policyData.refreshStartReference === "calendar_year" && (
        <div className="space-y-2">
          <FieldLabel required>Start Month</FieldLabel>
          {validationErrors.refreshStartMonth && (
            <ErrorText>{validationErrors.refreshStartMonth}</ErrorText>
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
  )

  // ── Groups section ────────────────────────────────────────────────────────
  const renderGroupsSection = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader
          icon={TreeStructure}
          title="Benefit Groups"
          description="Organise benefits into logical groups with budget controls"
        />
        <Button
          onClick={addGroup}
          size="sm"
          className="flex h-8 items-center gap-2 rounded-full px-4 text-label"
        >
          <Plus size={14} weight="bold" />
          Add Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
          <TreeStructure
            size={36}
            weight="duotone"
            className="mb-3 text-faint"
          />
          <p className="text-body font-medium text-muted-foreground">
            No benefit groups yet.
          </p>
          <Button
            variant="ghost"
            onClick={addGroup}
            className="mt-2 text-body font-semibold text-primary"
          >
            Create your first group
          </Button>
          {validationErrors.groups && (
            <ErrorText>{validationErrors.groups}</ErrorText>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group, gIdx) => {
            const groupBenefits = benefits.filter((b) => b.groupId === group.id)
            const groupError = validationErrors[`group_${gIdx}`]
            return (
              <div
                key={group.id}
                id={`group-${group.id}`}
                className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TreeStructure size={18} weight="duotone" />
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                        value={group.name}
                        onChange={(e) =>
                          updateGroup(group.id, "name", e.target.value)
                        }
                        placeholder="Group Name"
                      />
                      {validationErrors[`group_name_${group.id}`] && (
                        <ErrorText>
                          {validationErrors[`group_name_${group.id}`]}
                        </ErrorText>
                      )}
                      <input
                        className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-label text-muted-foreground outline-none focus:ring-2 focus:ring-primary/10"
                        value={group.description || ""}
                        onChange={(e) =>
                          updateGroup(group.id, "description", e.target.value)
                        }
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:text-destructive"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                {/* Card body */}
                <div className="space-y-5 p-4">
                  {/* Coverage scope */}
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
                    <p className="text-micro text-faint">
                      Controls which caps and service fields appear for this
                      group.
                    </p>
                  </div>

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
                              "w-32 rounded-lg border bg-background px-2.5 py-1.5 text-label outline-none focus:ring-2 focus:ring-primary/10",
                              validationErrors[`group_cap_${group.id}`]
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
                          {validationErrors[`group_cap_${group.id}`] && (
                            <ErrorText>
                              {validationErrors[`group_cap_${group.id}`]}
                            </ErrorText>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
                            Co-payment <FieldHelp termKey="coPayment" />
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateGroupCoPayment(
                                  group.id,
                                  "required",
                                  !(group.coPayment?.required ?? false)
                                )
                              }
                              aria-pressed={group.coPayment?.required ?? false}
                              className={cn(
                                "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                                group.coPayment?.required
                                  ? "border-primary bg-primary"
                                  : "border-border bg-muted"
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute top-[2px] h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-all",
                                  group.coPayment?.required
                                    ? "right-0.5"
                                    : "left-0.5"
                                )}
                              />
                            </button>
                            {group.coPayment?.required && (
                              <div className="flex items-center gap-1.5">
                                <FormSelect
                                  value={group.coPayment?.type ?? "Percentage"}
                                  onChange={(v) =>
                                    updateGroupCoPayment(group.id, "type", v)
                                  }
                                  options={[
                                    { label: "%", value: "Percentage" },
                                    { label: "RM", value: "Fixed" },
                                  ]}
                                  triggerClassName="w-16 h-8"
                                />
                                <input
                                  type="number"
                                  className={cn(
                                    "w-20 rounded-lg border bg-background px-2.5 py-1.5 text-right font-mono text-label outline-none",
                                    validationErrors[`group_copay_${group.id}`]
                                      ? "border-destructive"
                                      : "border-border"
                                  )}
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
                                  onBlur={() =>
                                    blurGroupCopayValue(
                                      group.id,
                                      group.coPayment?.type ?? "Percentage",
                                      group.coPayment?.value ?? 0
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {validationErrors[`group_copay_${group.id}`] && (
                            <ErrorText>
                              {validationErrors[`group_copay_${group.id}`]}
                            </ErrorText>
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
                            </p>
                            <input
                              type="number"
                              className={cn(
                                "w-32 rounded-lg border bg-background px-2.5 py-1.5 text-label outline-none focus:ring-2 focus:ring-primary/10",
                                validationErrors[`group_dep_cap_${group.id}`]
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
                            {validationErrors[`group_dep_cap_${group.id}`] && (
                              <ErrorText>
                                {validationErrors[`group_dep_cap_${group.id}`]}
                              </ErrorText>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
                              Co-payment <FieldHelp termKey="coPayment" />
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateDependentCoPayment(
                                    group.id,
                                    "required",
                                    !(
                                      group.dependentCoPayment?.required ??
                                      false
                                    )
                                  )
                                }
                                aria-pressed={
                                  group.dependentCoPayment?.required ?? false
                                }
                                className={cn(
                                  "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                                  group.dependentCoPayment?.required
                                    ? "border-primary bg-primary"
                                    : "border-border bg-muted"
                                )}
                              >
                                <div
                                  className={cn(
                                    "absolute top-[2px] h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-all",
                                    group.dependentCoPayment?.required
                                      ? "right-0.5"
                                      : "left-0.5"
                                  )}
                                />
                              </button>
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
                                    triggerClassName="w-16 h-8"
                                  />
                                  <input
                                    type="number"
                                    className={cn(
                                      "w-20 rounded-lg border bg-background px-2.5 py-1.5 text-right font-mono text-label outline-none",
                                      validationErrors[
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
                            {validationErrors[
                              `group_dep_copay_${group.id}`
                            ] && (
                              <ErrorText>
                                {
                                  validationErrors[
                                    `group_dep_copay_${group.id}`
                                  ]
                                }
                              </ErrorText>
                            )}
                          </div>
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
                      {group.utilisationMode ||
                      group.prorateUnit ||
                      group.refreshCycle ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateGroup(group.id, "utilisationMode", undefined)
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
                        selected={group.utilisationMode === "Fixed"}
                        onSelect={() => {
                          updateGroup(group.id, "utilisationMode", "Fixed")
                          updateGroup(group.id, "prorateUnit", undefined)
                        }}
                      />
                      <ChoiceCard
                        title="Prorated Allocation"
                        description="Amounts prorated based on time."
                        icon={ChartLineUp}
                        selected={group.utilisationMode === "Prorated"}
                        onSelect={() => {
                          updateGroup(group.id, "utilisationMode", "Prorated")
                          if (!group.prorateUnit)
                            updateGroup(group.id, "prorateUnit", "Monthly")
                        }}
                      />
                    </div>

                    {(group.utilisationMode ?? policyData.utilisationMode) ===
                      "Prorated" && (
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
                      />
                      <p className="text-micro text-faint">
                        Set a different refresh cadence for this group
                        (optional).
                      </p>
                    </div>
                  </div>

                  {/* Benefits selector */}
                  <div className="space-y-3 border-t border-border/60 pt-2">
                    <Collapsible defaultOpen={gIdx === 0}>
                      <CollapsibleTrigger className="group flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-label font-semibold text-foreground">
                            Services
                          </p>
                          {groupBenefits.length > 0 && (
                            <span className="rounded bg-primary/10 px-1.5 text-micro font-medium text-primary">
                              {groupBenefits.length}
                            </span>
                          )}
                          {groupError && <ErrorText>{groupError}</ErrorText>}
                        </div>
                        <CaretDown
                          size={13}
                          weight="bold"
                          className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <BenefitServiceSelector
                          groupId={group.id}
                          groupBenefits={groupBenefits}
                          isViewMode={false}
                          groupErrors={validationErrors}
                          coverageScope={group.coverageScope ?? "Employee"}
                          policyEmployeeCap={policyData.totalCapAmount}
                          policyDependentCap={policyData.dependentCapAmount}
                          onToggleService={(serviceId) =>
                            toggleService(group.id, serviceId)
                          }
                          onUpdateBenefit={updateBenefit}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

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

  // ── Error summary helpers ─────────────────────────────────────────────────
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
    onIssuesChange?.(
      errorEntries.map(({ key, label, target }) => ({ key, label, target }))
    )
  }, [errorEntries, onIssuesChange])

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <form
      id="policyWizardForm"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="space-y-8"
    >
      {/* Policy Details */}
      {!groupsOnly && (
        <section id="policy-details" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">{renderPolicyDetailsSection()}</div>
          </div>
        </section>
      )}

      {/* Pool & Cycle */}
      {!groupsOnly && (
        <section id="pool-cycle" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">{renderPoolSection()}</div>
          </div>
        </section>
      )}

      {/* Refresh Start Reference */}
      {!groupsOnly && (
        <section id="refresh-start" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">{renderRefreshStartSection()}</div>
          </div>
        </section>
      )}

      {/* Groups & Services — groups-only mode only */}
      {groupsOnly && (
        <section id="groups-services" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">{renderGroupsSection()}</div>
          </div>
        </section>
      )}

      {/* Review step is handled by the parent in create mode; edit mode renders everything inline */}
    </form>
  )
}
