"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  CloudArrowUp,
  FileCsv,
  CheckCircle,
  WarningCircle,
  Info,
  ArrowRight,
  Shield,
  ArrowLeft,
  Calendar,
  Globe,
  X,
  Sparkle,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { StatusBadge } from "@/components/shared/status-badge"
import { SharedDataTable, Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BulkUploadWizardProps {
  onBack: () => void
  onSuccess?: () => void
  orgTierConfigs?: { id: string; name: string; code?: string }[]
  availablePolicies?: { name: string; tiers: string[] }[]
}

type BulkRecord = {
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
}

type UploadStep = "upload" | "processing" | "preview" | "success"
type FilterChip = "all" | "valid" | "issues" | "auto" | "newDept"

const COLUMN_ORDER = [
  "select", "code", "name", "email", "dob", "gender", "mobile",
  "department", "role", "branch", "employmentType", "joinDate",
  "tier", "probation", "residency", "taxable", "policy", "issues",
]

function applyPolicyAutoAssign(rows: BulkRecord[], policies: { name: string; tiers: string[] }[]): BulkRecord[] {
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDate(value: string): string {
  if (!value) return ""
  if (value === "Invalid" || value === "Invalid Date") return value
  // Match YYYY-MM-DD
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const [, y, mo, d] = m
    const monthIdx = parseInt(mo, 10) - 1
    if (monthIdx >= 0 && monthIdx < 12) return `${parseInt(d, 10).toString().padStart(2, "0")} ${MONTHS[monthIdx]} ${y}`
  }
  // Try Date parse
  const parsed = new Date(value)
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getDate().toString().padStart(2, "0")} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`
  }
  return value
}

interface EditableCellProps {
  value: string
  onChange: (v: string) => void
  invalid?: boolean
  placeholder?: string
  mono?: boolean
  maxWidth?: number
  className?: string
  displayFormatter?: (v: string) => string
}

function EditableCell({ value, onChange, invalid, placeholder, mono, maxWidth = 140, className, displayFormatter }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }
  const cancel = () => {
    setEditing(false)
    setDraft(value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") cancel()
        }}
        style={{ minWidth: maxWidth }}
        className={cn(
          "w-full rounded border border-primary/40 bg-background px-1.5 py-0.5 text-body outline-none ring-2 ring-primary/10",
          mono && "font-mono text-label",
          className
        )}
      />
    )
  }

  const isMissing = !value
  const display = value && displayFormatter ? displayFormatter(value) : value
  const button = (
    <button
      type="button"
      onClick={() => setEditing(true)}
      style={{ maxWidth }}
      className={cn(
        "block w-full truncate rounded border border-transparent px-1.5 py-0.5 text-left text-body transition hover:border-border hover:bg-muted/40",
        invalid && "border-rose-500/30 bg-rose-500/5 font-semibold text-rose-600 dark:text-rose-400",
        isMissing && !invalid && "text-rose-600 italic dark:text-rose-400 border-rose-500/20 bg-rose-500/5",
        mono && "font-mono text-label",
        className
      )}
    >
      {display || placeholder || "Add"}
    </button>
  )

  if (!value) return button
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top" className="text-label font-medium">{value}</TooltipContent>
    </Tooltip>
  )
}

function TruncatedText({ text, maxWidth = 140, className }: { text: string; maxWidth?: number; className?: string }) {
  if (!text) return <span className="text-faint">—</span>
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          style={{ maxWidth }}
          className={cn("block truncate", className)}
        >
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-label font-medium">{text}</TooltipContent>
    </Tooltip>
  )
}

export function BulkUploadWizard({ onBack, onSuccess, orgTierConfigs = [], availablePolicies = [] }: BulkUploadWizardProps) {
  const [step, setStep] = useState<UploadStep>("upload")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  const tierCodes = useMemo(() =>
    orgTierConfigs.map(tc => tc.code || tc.name),
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
    const codes = orgTierConfigs.map(tc => tc.code || tc.name)
    return [{ name: "General Policy", tiers: codes }]
  }, [availablePolicies, orgTierConfigs])

  const [records, setRecords] = useState<BulkRecord[]>(() =>
    applyPolicyAutoAssign(MOCK_RECORDS, policyTierMap)
  )

  const handleFieldChange = (id: string, field: keyof BulkRecord, value: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, [field]: value }
        // Re-validate after edits
        if (field === "code" && value) next.issue = next.issue?.replace(/Code( & |, )?/, "").replace(/^Missing $/, "") || undefined
        if (field === "email" && value) next.issue = next.issue?.replace(/Email( & |, )?/, "").replace(/^Missing $/, "") || undefined
        if (field === "dob" && value !== "Invalid") next.issue = next.issue?.replace(/Invalid DOB( & |, )?/, "") || undefined
        if (field === "date" && value !== "Invalid Date") next.issue = next.issue?.replace(/Invalid Join Date( & |, )?/, "").replace(/Join Date( & |, )?/, "") || undefined
        const stillBad = !next.code || !next.email || next.dob === "Invalid" || next.date === "Invalid Date" || next.policyIssue
        next.status = stillBad ? "Issue" : "Valid"
        if (!stillBad) next.issue = undefined
        return next
      })
    )
  }

  const resolvePolicy = (id: string, policyName: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const stillBad = !r.code || !r.email || r.dob === "Invalid" || r.date === "Invalid Date"
        return {
          ...r,
          policies: policyName,
          policyIssue: false,
          issue: stillBad ? r.issue : undefined,
          status: stillBad ? "Issue" : "Valid",
        }
      })
    )
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const search = searchQuery.toLowerCase()
      const matchesSearch =
        !search ||
        [r.name, r.email, r.code, r.department, r.role, r.tier, r.employmentType, r.policies].some((f) =>
          String(f).toLowerCase().includes(search)
        )
      if (!matchesSearch) return false
      switch (activeFilter) {
        case "valid": return r.status === "Valid"
        case "issues": return r.status === "Issue"
        case "auto": return !!r.autoAssigned
        case "newDept": return !!r.isNewDept
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
  }), [records])

  const allFilteredSelected = filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.has(r.id))

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
        return { ...r, policies: policyName, policyIssue: false, issue: undefined, status: !r.code || !r.email || r.dob === "Invalid" || r.date === "Invalid Date" ? "Issue" : "Valid" }
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

  // Build column map — 1 field per column
  const SelectHeader = (
    <input
      type="checkbox"
      checked={allFilteredSelected}
      onChange={toggleSelectAll}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
      aria-label="Select all"
    />
  )

  const columnMap: Record<string, Column<BulkRecord>> = {
    select: {
      header: SelectHeader,
      headerClassName: "w-10",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={(e) => { e.stopPropagation(); toggleSelect(row.id) }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
        />
      ),
    },
    code: {
      header: "Code",
      render: (row) => (
        <EditableCell
          value={row.code}
          onChange={(v) => handleFieldChange(row.id, "code", v)}
          placeholder="Missing"
          invalid={!row.code}
          mono
        />
      ),
    },
    name: {
      header: "Name",
      render: (row) => (
        <EditableCell
          value={row.name}
          onChange={(v) => handleFieldChange(row.id, "name", v)}
          placeholder="Missing"
          className="font-semibold"
        />
      ),
    },
    email: {
      header: "Email",
      render: (row) => (
        <EditableCell
          value={row.email}
          onChange={(v) => handleFieldChange(row.id, "email", v)}
          placeholder="Missing email"
          invalid={!row.email}
          mono
        />
      ),
    },
    dob: {
      header: "DOB",
      render: (row) => (
        <EditableCell
          value={row.dob}
          onChange={(v) => handleFieldChange(row.id, "dob", v)}
          placeholder="DD MMM YYYY"
          invalid={row.dob === "Invalid"}
          displayFormatter={formatDate}
        />
      ),
    },
    gender: {
      header: "Gender",
      render: (row) => <span className="text-body capitalize text-muted-foreground">{row.gender}</span>,
    },
    mobile: {
      header: "Mobile",
      render: (row) => (
        <EditableCell
          value={row.mobile}
          onChange={(v) => handleFieldChange(row.id, "mobile", v)}
          placeholder="Missing"
          invalid={!row.mobile}
          mono
        />
      ),
    },
    department: {
      header: "Department",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <EditableCell
            value={row.department}
            onChange={(v) => handleFieldChange(row.id, "department", v)}
            className="font-medium"
          />
          {row.isNewDept && (
            <StatusBadge
              status="New"
              variant="amber"
              className="text-micro h-4 px-1.5 uppercase tracking-tighter"
            />
          )}
        </div>
      ),
    },
    role: {
      header: "Role",
      render: (row) => (
        <EditableCell
          value={row.role}
          onChange={(v) => handleFieldChange(row.id, "role", v)}
          className="text-muted-foreground"
        />
      ),
    },
    branch: {
      header: "Branch",
      render: (row) => (
        <TruncatedText text={row.branch} maxWidth={140} className="text-body font-medium text-muted-foreground" />
      ),
    },
    employmentType: {
      header: "Employment",
      render: (row) => (
        <span className="text-body capitalize text-muted-foreground">{row.employmentType.replace("-", " ")}</span>
      ),
    },
    joinDate: {
      header: "Join Date",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className={row.date === "Invalid Date" ? "text-rose-500" : "text-faint"} />
          <EditableCell
            value={row.date}
            onChange={(v) => handleFieldChange(row.id, "date", v)}
            invalid={row.date === "Invalid Date"}
            displayFormatter={formatDate}
            placeholder="DD MMM YYYY"
          />
        </div>
      ),
    },
    tier: {
      header: "Tier",
      render: (row) => {
        const tc = resolveTier(row.tier)
        const displayName = tc?.name || row.tier
        const code = tc?.code
        const pill = (
          <span className="rounded border border-primary/15 bg-primary/5 px-1.5 py-0.5 text-label font-semibold text-primary truncate max-w-[140px]">
            {displayName}
          </span>
        )
        return (
          <div className="flex items-center gap-1.5">
            {code ? (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>{pill}</TooltipTrigger>
                <TooltipContent side="top" className="text-label font-medium">
                  {displayName} <span className="text-faint">· {code}</span>
                </TooltipContent>
              </Tooltip>
            ) : pill}
            {row.isProbation && (
              <span title="Probation" className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            )}
          </div>
        )
      },
    },
    probation: {
      header: "Probation",
      render: (row) => row.isProbation ? (
        <StatusBadge status="Yes" variant="amber" />
      ) : (
        <span className="text-label text-faint">—</span>
      ),
    },
    residency: {
      header: "Residency",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-label text-muted-foreground">
          <Globe size={11} />
          <span>{row.residency}</span>
        </div>
      ),
    },
    taxable: {
      header: "Taxable",
      render: (row) => (
        <span className={cn(
          "text-label font-semibold",
          row.taxable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}>
          {row.taxable ? "Yes" : "No"}
        </span>
      ),
    },
    policy: {
      header: "Policy",
      render: (row) => {
        if (row.policyIssue && row.tier) {
          const matches = policyTierMap.filter((p) => p.tiers.includes(row.tier))
          return (
            <select
              value=""
              onChange={(e) => e.target.value && resolvePolicy(row.id, e.target.value)}
              className="rounded border border-amber-500/40 bg-amber-500/5 px-2 py-1 text-label font-semibold text-amber-700 dark:text-amber-400 outline-none focus:border-amber-500"
            >
              <option value="">Resolve…</option>
              {matches.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          )
        }
        if (row.policies) {
          return (
            <div className="flex items-center gap-1.5 text-primary/80">
              <Shield size={14} weight="fill" className="shrink-0" />
              <TruncatedText text={row.policies} maxWidth={120} className="text-body font-semibold" />
              {row.autoAssigned && (
                <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-micro font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Auto
                </span>
              )}
            </div>
          )
        }
        return <span className="text-faint">—</span>
      },
    },
    issues: {
      header: "",
      headerClassName: "w-12 text-center",
      render: (row) => {
        const isValid = row.status === "Valid"
        const message = isValid ? "All fields valid" : (row.issue || "Issue")
        return (
          <div className="flex justify-center">
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                    isValid
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                  )}
                  aria-label={message}
                >
                  {isValid ? (
                    <CheckCircle size={14} weight="fill" />
                  ) : (
                    <WarningCircle size={14} weight="fill" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[240px]">
                <div className="flex items-start gap-2">
                  {isValid ? (
                    <CheckCircle size={14} weight="fill" className="mt-0.5 shrink-0 text-emerald-500" />
                  ) : (
                    <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0 text-rose-500" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className={cn(
                      "text-label font-bold uppercase tracking-wide",
                      isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {isValid ? "Valid" : "Issue"}
                    </span>
                    <span className="text-label font-medium text-foreground">{message}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
  }

  const visibleColumns: Column<BulkRecord>[] = useMemo(
    () => COLUMN_ORDER.map((key) => columnMap[key]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, selectedIds, allFilteredSelected, policyTierMap]
  )

  const filterChips: { key: FilterChip; label: string; count: number; tone: string }[] = [
    { key: "all", label: "All", count: counts.total, tone: "default" },
    { key: "valid", label: "Valid", count: counts.valid, tone: "emerald" },
    { key: "issues", label: "Issues", count: counts.issues, tone: "rose" },
    { key: "auto", label: "Auto-assigned", count: counts.auto, tone: "primary" },
    { key: "newDept", label: "New depts", count: counts.newDept, tone: "amber" },
  ]

  const chipToneClasses = (tone: string, active: boolean) => {
    if (active) {
      switch (tone) {
        case "emerald": return "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
        case "rose": return "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300"
        case "primary": return "bg-primary/15 border-primary/40 text-primary"
        case "amber": return "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
        default: return "bg-foreground/10 border-foreground/30 text-foreground"
      }
    }
    return "bg-background border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
  }

  const uniqueTiers = useMemo(() => Array.from(new Set(records.map((r) => r.tier))), [records])

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

  return (
    <div className="animate-in overflow-hidden rounded-lg border border-border bg-card duration-500 fade-in slide-in-from-bottom-4">
      {/* Wizard Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-1 h-8 w-8 text-muted-foreground"
          >
            <ArrowLeft size={18} weight="bold" />
          </Button>
          <div>
            <h3 className="font-semibold text-foreground">Bulk Employee Enrollment</h3>
            <p className="mt-0.5 text-label font-medium tracking-wider text-muted-foreground">
              CSV Import Wizard
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-[400px] p-8">
        {step === "upload" && (
          <div className="mx-auto max-w-xl space-y-8 py-4">
            <div
              className="group flex cursor-pointer flex-col items-center space-y-4 rounded-lg border-2 border-dashed border-border p-16 text-center transition-all hover:border-primary/30 hover:bg-primary/5"
              onClick={() => handleFileSelect("employee_list_2026.csv")}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground shadow-sm transition-all duration-300 group-hover:bg-background group-hover:text-primary">
                <CloudArrowUp size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-body font-semibold text-foreground">Drop your CSV here</p>
                <p className="max-w-[280px] text-body text-subtle">
                  Drag &amp; drop or browse for .csv or .xlsx formats (max 10MB).
                </p>
              </div>
              <Button variant="secondary" className="mt-2 h-10 rounded-4xl px-8 font-semibold shadow-sm">
                Select File
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Info size={24} weight="bold" />
                </div>
                <div className="space-y-1">
                  <p className="text-label font-semibold text-primary">Required Columns</p>
                  <p className="text-label leading-relaxed text-primary/80">
                    Code, Email, Name, DOB, Gender, Mobile, Department, Role, Join Date, Branch, Tier, Employment Type, Status, Is Probation.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 rounded-lg border border-border bg-muted/10 p-4">
                <p className="text-label font-semibold text-foreground">Need help formatting?</p>
                <button className="text-left text-label font-semibold text-primary underline hover:text-primary/80">
                  Download Sample Template
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex animate-in flex-col items-center justify-center space-y-8 py-20 text-center duration-300 zoom-in-95">
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  className="text-primary transition-all duration-200"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  r="52"
                  cx="56"
                  cy="56"
                  strokeDasharray={326.7}
                  strokeDashoffset={326.7 * (1 - progress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-display font-semibold text-foreground">
                {progress}%
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-heading font-semibold text-foreground">Analyzing Records</h4>
              <p className="text-body text-muted-foreground">Validating record integrity for {fileName}...</p>
            </div>
          </div>
        )}

        {step === "preview" && (
          <TooltipProvider delayDuration={200}>
          <div className="animate-in space-y-5 duration-500 fade-in">
            {/* Summary header */}
            <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/5">
                  <FileCsv size={28} weight="fill" />
                </div>
                <div>
                  <p className="text-body font-semibold text-foreground">{fileName}</p>
                  <p className="text-label font-medium text-muted-foreground">
                    {counts.total} records · {counts.valid} valid · {counts.issues} issues
                    {counts.newDept > 0 && ` · ${counts.newDept} new ${counts.newDept === 1 ? "department" : "departments"} to create`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep("upload")}
                  className="h-10 px-4 font-semibold text-muted-foreground transition-all hover:bg-muted"
                >
                  Restart
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={counts.valid === 0}
                  className="h-10 animate-in bg-primary px-10 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all fade-in rounded-4xl hover:bg-primary/90"
                >
                  Confirm Import ({counts.valid})
                  <ArrowRight size={18} className="ml-2" weight="bold" />
                </Button>
              </div>
            </div>

            {/* Filter chips + search */}
            <DataFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search records..."
              filters={
                <div className="flex items-center gap-2 flex-wrap">
                  {filterChips.map((chip) => {
                    const active = activeFilter === chip.key
                    return (
                      <button
                        key={chip.key}
                        onClick={() => setActiveFilter(chip.key)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-label font-semibold transition-all",
                          chipToneClasses(chip.tone, active)
                        )}
                      >
                        {chip.label}
                        <span className={cn(
                          "rounded-full px-1.5 text-micro font-bold",
                          active ? "bg-background/40" : "bg-muted"
                        )}>
                          {chip.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              }
            />

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <div className="flex animate-in items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2 text-label font-semibold text-primary">
                  <Sparkle size={14} weight="fill" />
                  {selectedIds.size} selected
                </div>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => { if (e.target.value) { bulkAssignPolicy(e.target.value); e.target.value = "" } }}
                    className="rounded border border-border bg-background px-2 py-1 text-label font-semibold outline-none hover:border-primary/40"
                  >
                    <option value="">Assign Policy…</option>
                    {policyTierMap.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    onChange={(e) => { if (e.target.value) { bulkSetTier(e.target.value); e.target.value = "" } }}
                    className="rounded border border-border bg-background px-2 py-1 text-label font-semibold outline-none hover:border-primary/40"
                  >
                    <option value="">Set Tier…</option>
                    {uniqueTiers.map((t) => {
                      const tc = resolveTier(t)
                      const label = tc?.name ? (tc.code ? `${tc.name} (${tc.code})` : tc.name) : t
                      return <option key={t} value={t}>{label}</option>
                    })}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={bulkRemove}
                    className="h-8 px-3 text-label font-semibold text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    Remove
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-8 px-2 text-muted-foreground"
                  >
                    <X size={14} weight="bold" />
                  </Button>
                </div>
              </div>
            )}

            <SharedDataTable
              data={filteredRecords}
              columns={visibleColumns}
              rowsPerPage={10}
              freezeFirst
              freezeLast
              className="border-border/60"
            />
          </div>
          </TooltipProvider>
        )}

        {step === "success" && (
          <div className="animate-in py-10 duration-500 zoom-in-95">
            <SuccessCelebration
              title="Import Successful"
              message={`${counts.valid} new employee records have been successfully added to the organization directory.`}
            />
            <div className="mt-12 flex justify-center">
              <Button
                onClick={onBack}
                className="h-12 rounded-4xl bg-foreground px-12 font-semibold text-background shadow-xl transition-transform hover:scale-[1.02]"
              >
                Return to Directory
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
