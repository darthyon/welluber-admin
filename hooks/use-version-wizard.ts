import { useState, useMemo } from "react"
import type {
  BenefitOverride,
  VersionWizardProps,
  VersionWizardCtx,
} from "@/components/host/policies/version-wizard-types"

// ─── Return type ──────────────────────────────────────────────────────────────

export interface VersionWizardState {
  ctx: VersionWizardCtx
  currentStep: number
  isSubmitting: boolean
  isSuccess: boolean
  goNext: () => void
  goPrev: () => void
  handleSubmit: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVersionWizard(options: VersionWizardProps): VersionWizardState {
  const {
    parentPolicy,
    parentGroups,
    parentBenefits,
    employees,
    orgTierConfigs = [],
    onSuccess,
  } = options

  // Navigation
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Step 1
  const [versionName, setVersionName] = useState<string>(parentPolicy.name)
  const [capOverride, setCapOverride] = useState<string>(
    parentPolicy.totalCapAmount ? String(parentPolicy.totalCapAmount) : ""
  )
  const [overrides, setOverrides] = useState<Record<string, BenefitOverride>>({})

  // Step 2
  const [tierFilter, setTierFilter] = useState<string[]>(
    parentPolicy.eligibility?.tierIds ?? []
  )
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
  const [pinnedEmployeeIds, setPinnedEmployeeIds] = useState<string[]>([])
  const [empSearch, setEmpSearch] = useState("")
  const [showEmpDropdown, setShowEmpDropdown] = useState(false)

  // Step 3
  const [confirmedEmployeeIds, setConfirmedEmployeeIds] = useState<string[]>([])

  // ── Derived ────────────────────────────────────────────────────────────────

  const departments = useMemo(() => {
    const set = new Set<string>()
    employees.forEach((e) => {
      if (e.department) set.add(e.department)
    })
    return Array.from(set).sort()
  }, [employees])

  const tierOptions = useMemo(() => {
    if (orgTierConfigs.length > 0) {
      return orgTierConfigs.map((tc) => tc.code || tc.name)
    }
    const set = new Set<string>()
    employees.forEach((e) => {
      if (e.tier) set.add(e.tier)
    })
    return Array.from(set).sort()
  }, [orgTierConfigs, employees])

  const targetedEmployees = useMemo(() => {
    const filtered = employees.filter((emp) => {
      const matchesTier = tierFilter.length === 0 || tierFilter.includes(emp.tier ?? "")
      const matchesDept =
        departmentFilter.length === 0 || departmentFilter.includes(emp.department ?? "")
      return matchesTier && matchesDept
    })
    const pinnedEmps = employees.filter(
      (e) => pinnedEmployeeIds.includes(e.id) && !filtered.find((f) => f.id === e.id)
    )
    return [...filtered, ...pinnedEmps]
  }, [employees, tierFilter, departmentFilter, pinnedEmployeeIds])

  const empSearchResults = useMemo(() => {
    if (!empSearch.trim()) return []
    const q = empSearch.toLowerCase()
    return employees
      .filter(
        (e) =>
          !pinnedEmployeeIds.includes(e.id) &&
          (e.name.toLowerCase().includes(q) || e.empCode.toLowerCase().includes(q))
      )
      .slice(0, 6)
  }, [employees, empSearch, pinnedEmployeeIds])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const setOverride = (
    benefitId: string,
    field: Exclude<keyof BenefitOverride, "benefitId">,
    value: number | undefined
  ) => {
    setOverrides((prev) => ({
      ...prev,
      [benefitId]: { ...prev[benefitId], benefitId, [field]: value },
    }))
  }

  const clearOverride = (
    benefitId: string,
    field: Exclude<keyof BenefitOverride, "benefitId">
  ) => {
    setOverrides((prev) => {
      const next = { ...prev }
      if (next[benefitId]) {
        const updated = { ...next[benefitId] }
        delete updated[field]
        const hasValues = Object.keys(updated).some((k) => k !== "benefitId")
        if (hasValues) {
          next[benefitId] = updated
        } else {
          delete next[benefitId]
        }
      }
      return next
    })
  }

  const toggleTier = (tier: string) => {
    setTierFilter((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    )
  }

  const toggleDept = (dept: string) => {
    setDepartmentFilter((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    )
  }

  const pinEmployee = (empId: string) => {
    setPinnedEmployeeIds((prev) => [...prev, empId])
    setEmpSearch("")
    setShowEmpDropdown(false)
  }

  const unpinEmployee = (empId: string) => {
    setPinnedEmployeeIds((prev) => prev.filter((id) => id !== empId))
  }

  const toggleConfirmed = (empId: string) => {
    setConfirmedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    )
  }

  const toggleAllConfirmed = () => {
    if (confirmedEmployeeIds.length === targetedEmployees.length) {
      setConfirmedEmployeeIds([])
    } else {
      setConfirmedEmployeeIds(targetedEmployees.map((e) => e.id))
    }
  }

  const goNext = () => {
    if (currentStep === 2) {
      setConfirmedEmployeeIds(targetedEmployees.map((e) => e.id))
    }
    setCurrentStep((s) => s + 1)
  }

  const goPrev = () => setCurrentStep((s) => s - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise<void>((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => {
      const capNum = capOverride ? parseFloat(capOverride) : undefined
      const benefitOverrides = Object.values(overrides)
      onSuccess({
        policy: {
          ...parentPolicy,
          id: undefined,
          name: versionName || parentPolicy.name,
          parentPolicyId: parentPolicy.id,
          totalCapAmount: capNum,
          targetEmployeeIds: confirmedEmployeeIds,
          status: "active",
        },
        benefitOverrides,
        targetEmployeeIds: confirmedEmployeeIds,
      })
    }, 800)
  }

  // ── Context ────────────────────────────────────────────────────────────────

  const ctx: VersionWizardCtx = {
    parentPolicy,
    parentGroups,
    parentBenefits,
    employees,
    orgTierConfigs,
    versionName,
    setVersionName,
    capOverride,
    setCapOverride,
    overrides,
    setOverride,
    clearOverride,
    tierFilter,
    departmentFilter,
    pinnedEmployeeIds,
    empSearch,
    setEmpSearch,
    showEmpDropdown,
    setShowEmpDropdown,
    tierOptions,
    departments,
    targetedEmployees,
    empSearchResults,
    toggleTier,
    toggleDept,
    pinEmployee,
    unpinEmployee,
    confirmedEmployeeIds,
    toggleConfirmed,
    toggleAllConfirmed,
  }

  return { ctx, currentStep, isSubmitting, isSuccess, goNext, goPrev, handleSubmit }
}
