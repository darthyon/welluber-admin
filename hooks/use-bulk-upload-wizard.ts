import { useState, useEffect, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type BulkRecord = {
  id: string
  code: string
  name: string
  email: string
  dob: string
  gender: string
  mobile: string
  department: string
  role: string
  date: string
  policies: string
  status: string
  issue?: string
  policyIssue?: boolean
  autoAssigned?: boolean
  branch: string
  tier: string
  residency: string
  taxable: boolean
  employmentType: string
  employeeStatus: string
  isProbation: boolean
  isNewDept?: boolean
  isNewTier?: boolean
  isNewPolicy?: boolean
}

export type UploadStep = "upload" | "processing" | "preview" | "success"
export type FilterChip = "all" | "valid" | "issues" | "auto" | "newDept" | "newTier" | "newPolicy"

// ─── Utilities ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function formatDate(value: string): string {
  if (!value) return ""
  if (value === "Invalid" || value === "Invalid Date") return value
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m
    const monthIdx = parseInt(mo, 10) - 1
    if (monthIdx >= 0 && monthIdx < 12)
      return `${parseInt(d, 10).toString().padStart(2, "0")} ${MONTHS[monthIdx]} ${y}`
  }
  const parsed = new Date(value)
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getDate().toString().padStart(2, "0")} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`
  }
  return value
}

function applyPolicyAutoAssign(
  rows: BulkRecord[],
  policies: { name: string; tiers: string[] }[]
): BulkRecord[] {
  return rows.map((r) => {
    if (r.policies) {
      const known = policies.find((p) => p.name === r.policies)
      if (!known) {
        return { ...r, status: "Issue", issue: `Unknown policy: ${r.policies}`, policyIssue: true }
      }
      return r
    }
    if (r.tier) {
      const matches = policies.filter((p) => p.tiers.includes(r.tier))
      if (matches.length === 1) {
        return { ...r, policies: matches[0].name, autoAssigned: true }
      }
      if (matches.length > 1) {
        return {
          ...r,
          status: "Issue",
          issue: "Needs policy assignment — multiple policies match tier",
          policyIssue: true,
        }
      }
    }
    return r
  })
}

// ─── Hook options ─────────────────────────────────────────────────────────────

interface BulkUploadWizardOptions {
  onBack: () => void
  onSuccess?: () => void
  orgTierConfigs?: { id: string; name: string; code?: string }[]
  availablePolicies?: { name: string; version?: string; tiers: string[] }[]
}

// ─── Hook return ──────────────────────────────────────────────────────────────

export interface BulkUploadWizardState {
  step: UploadStep
  progress: number
  fileName: string | null
  searchQuery: string
  setSearchQuery: (v: string) => void
  activeFilter: FilterChip
  setActiveFilter: (v: FilterChip) => void
  selectedIds: Set<string>
  bulkPolicyValue: string
  setBulkPolicyValue: (v: string) => void
  bulkTierValue: string
  setBulkTierValue: (v: string) => void
  records: BulkRecord[]
  filteredRecords: BulkRecord[]
  counts: {
    total: number
    valid: number
    issues: number
    auto: number
    newDept: number
    newTier: number
    newPolicy: number
  }
  allFilteredSelected: boolean
  policyTierMap: { name: string; tiers: string[] }[]
  uniqueTiers: string[]
  resolveTier: (value: string) => { name: string; code?: string } | undefined
  handleFileSelect: (name: string) => void
  handleConfirmImport: () => void
  handleFieldChange: (id: string, field: keyof BulkRecord, value: string) => void
  toggleSelectAll: () => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  bulkAssignPolicy: (policyName: string) => void
  bulkSetTier: (tier: string) => void
  bulkRemove: () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBulkUploadWizard(options: BulkUploadWizardOptions): BulkUploadWizardState {
  const { onSuccess, orgTierConfigs = [], availablePolicies = [] } = options

  const [step, setStep] = useState<UploadStep>("upload")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkPolicyValue, setBulkPolicyValue] = useState("")
  const [bulkTierValue, setBulkTierValue] = useState("")

  // Progress interval for processing step
  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setStep("preview")
            return 100
          }
          return prev + 5
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [step])

  const tierCodes = useMemo(
    () => orgTierConfigs.map((tc) => tc.code || tc.name),
    [orgTierConfigs]
  )

  const mockTier = (index: number) => tierCodes[index % tierCodes.length] || `T${index + 1}`

  const MOCK_RECORDS: BulkRecord[] = [
    {
      id: "rec_0", code: "E001", name: "Robert Fox", email: "robert.f@acme.com",
      dob: "1990-05-12", gender: "male", mobile: "012-3456789", department: "Engineering",
      role: "Staff", date: "2026-04-10", policies: "", status: "Valid",
      branch: "ACME HQ", tier: mockTier(0), residency: "Local", taxable: true,
      employmentType: "full-time", employeeStatus: "active", isProbation: false,
    },
    {
      id: "rec_1", code: "E002", name: "Jenny Wilson", email: "jenny.w@acme.com",
      dob: "1988-11-24", gender: "female", mobile: "012-9876543", department: "Product",
      role: "Management", date: "2026-05-15", policies: "", status: "Valid",
      branch: "ACME Subang Jaya", tier: mockTier(1), residency: "Local", taxable: true,
      employmentType: "full-time", employeeStatus: "active", isProbation: false,
    },
    {
      id: "rec_2", code: "E003", name: "Dianne Russell", email: "dianne.r@acme.com",
      dob: "1995-02-14", gender: "female", mobile: "017-1112223", department: "Growth",
      role: "Staff", date: "2026-04-01", policies: "Phantom Plan", status: "Valid",
      branch: "ACME HQ", tier: mockTier(2), residency: "Foreigner", taxable: false,
      employmentType: "internship", employeeStatus: "active", isProbation: true, isNewDept: true,
    },
    {
      id: "rec_3", code: "", name: "Unknown User", email: "",
      dob: "1992-08-30", gender: "other", mobile: "", department: "HR",
      role: "Staff", date: "2026-04-20", policies: "Standard Health", status: "Issue",
      issue: "Missing Code & Email", branch: "ACME HQ", tier: mockTier(2),
      residency: "Local", taxable: true, employmentType: "part-time",
      employeeStatus: "inactive", isProbation: false,
    },
    {
      id: "rec_4", code: "E005", name: "Guy Hawkins", email: "guy.h@acme.com",
      dob: "Invalid", gender: "male", mobile: "013-4445556", department: "Sales",
      role: "Executive", date: "Invalid Date", policies: "Executive Wellness", status: "Issue",
      issue: "Invalid DOB & Join Date", branch: "ACME HQ", tier: mockTier(1),
      residency: "Local", taxable: true, employmentType: "contract",
      employeeStatus: "active", isProbation: true,
    },
  ]

  const policyTierMap = useMemo(() => {
    if (availablePolicies.length > 0) return availablePolicies
    const codes = orgTierConfigs.map((tc) => tc.code || tc.name)
    return [{ name: "General Policy", tiers: codes }]
  }, [availablePolicies, orgTierConfigs])

  const [records, setRecords] = useState<BulkRecord[]>(() =>
    applyPolicyAutoAssign(MOCK_RECORDS, policyTierMap)
  )

  const knownDepartments = useMemo(
    () => Array.from(new Set(records.map((r) => r.department).filter(Boolean))),
    [records]
  )
  const knownPolicies = useMemo(
    () => policyTierMap.map((p) => p.name),
    [policyTierMap]
  )
  const knownTiers = useMemo(
    () => orgTierConfigs.map((tc) => tc.code || tc.name),
    [orgTierConfigs]
  )

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const search = searchQuery.toLowerCase()
      const matchesSearch =
        !search ||
        [r.name, r.email, r.code, r.department, r.role, r.tier, r.employmentType, r.policies].some(
          (f) => String(f).toLowerCase().includes(search)
        )
      if (!matchesSearch) return false
      switch (activeFilter) {
        case "valid": return r.status === "Valid"
        case "issues": return r.status === "Issue"
        case "auto": return !!r.autoAssigned
        case "newDept": return !!r.isNewDept
        case "newTier": return !!r.isNewTier
        case "newPolicy": return !!r.isNewPolicy
        default: return true
      }
    })
  }, [records, searchQuery, activeFilter])

  const counts = useMemo(() => ({
    total: records.length,
    valid: records.filter((r) => r.status === "Valid").length,
    issues: records.filter((r) => r.status === "Issue").length,
    auto: records.filter((r) => r.autoAssigned).length,
    newDept: records.filter((r) => r.isNewDept).length,
    newTier: records.filter((r) => r.isNewTier).length,
    newPolicy: records.filter((r) => r.isNewPolicy).length,
  }), [records])

  const allFilteredSelected =
    filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.has(r.id))

  const uniqueTiers = useMemo(
    () => Array.from(new Set(records.map((r) => r.tier))),
    [records]
  )

  const tierLookup = useMemo(() => {
    const map = new Map<string, { name: string; code?: string }>()
    orgTierConfigs.forEach((tc) => {
      const entry = { name: tc.name, code: tc.code }
      map.set(tc.id, entry)
      if (tc.code) map.set(tc.code, entry)
      map.set(tc.name, entry)
    })
    return map
  }, [orgTierConfigs])

  const resolveTier = (value: string) => tierLookup.get(value)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileSelect = (name: string) => {
    setFileName(name)
    setStep("processing")
  }

  const handleConfirmImport = () => {
    setStep("success")
    setTimeout(() => {
      onSuccess?.()
    }, 2500)
  }

  const handleFieldChange = (id: string, field: keyof BulkRecord, value: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, [field]: value }
        if (field === "department" && value) {
          next.isNewDept =
            !knownDepartments.includes(value) &&
            !records.some((rec) => rec.id !== id && rec.department === value)
        }
        if (field === "tier" && value) {
          next.isNewTier = !knownTiers.includes(value)
        }
        if (field === "policies" && value) {
          next.isNewPolicy = !knownPolicies.includes(value)
          next.policyIssue = false
        }
        if (field === "code" && value)
          next.issue = next.issue?.replace(/Code( & |, )?/, "").replace(/^Missing $/, "") || undefined
        if (field === "email" && value)
          next.issue = next.issue?.replace(/Email( & |, )?/, "").replace(/^Missing $/, "") || undefined
        if (field === "dob" && value !== "Invalid")
          next.issue = next.issue?.replace(/Invalid DOB( & |, )?/, "") || undefined
        if (field === "date" && value !== "Invalid Date")
          next.issue =
            next.issue?.replace(/Invalid Join Date( & |, )?/, "").replace(/Join Date( & |, )?/, "") || undefined
        const stillBad =
          !next.code || !next.email || next.dob === "Invalid" || next.date === "Invalid Date" || next.policyIssue
        next.status = stillBad ? "Issue" : "Valid"
        if (!stillBad) next.issue = undefined
        return next
      })
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) filteredRecords.forEach((r) => next.delete(r.id))
      else filteredRecords.forEach((r) => next.add(r.id))
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const bulkAssignPolicy = (policyName: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (!selectedIds.has(r.id)) return r
        return {
          ...r,
          policies: policyName,
          policyIssue: false,
          issue: undefined,
          status:
            !r.code || !r.email || r.dob === "Invalid" || r.date === "Invalid Date"
              ? "Issue"
              : "Valid",
        }
      })
    )
    clearSelection()
  }

  const bulkSetTier = (tier: string) => {
    setRecords((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, tier } : r)))
    clearSelection()
  }

  const bulkRemove = () => {
    setRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)))
    clearSelection()
  }

  return {
    step,
    progress,
    fileName,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedIds,
    bulkPolicyValue,
    setBulkPolicyValue,
    bulkTierValue,
    setBulkTierValue,
    records,
    filteredRecords,
    counts,
    allFilteredSelected,
    policyTierMap,
    uniqueTiers,
    resolveTier,
    handleFileSelect,
    handleConfirmImport,
    handleFieldChange,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    bulkAssignPolicy,
    bulkSetTier,
    bulkRemove,
  }
}
