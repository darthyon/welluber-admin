"use client"

import { Calendar, Globe, CheckCircle, WarningCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { EditableCell } from "@/components/shared/editable-cell"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate, type BulkRecord } from "@/hooks/use-bulk-upload-wizard"
import type { Column } from "@/components/shared/data-table"

// ─── TruncatedText ────────────────────────────────────────────────────────────

function TruncatedText({
  text,
  maxWidth = 140,
  className,
}: {
  text: string
  maxWidth?: number
  className?: string
}) {
  if (!text) return <span className="text-faint">—</span>
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span style={{ maxWidth }} className={cn("block truncate", className)}>
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-label font-medium">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

// ─── Column order ─────────────────────────────────────────────────────────────

export const COLUMN_ORDER = [
  "select", "code", "name", "email", "dob", "gender", "mobile",
  "department", "role", "branch", "employmentType", "joinDate",
  "tier", "probation", "residency", "taxable", "policy", "issues",
]

// ─── Builder args ─────────────────────────────────────────────────────────────

export interface BuildColumnsArgs {
  allFilteredSelected: boolean
  selectedIds: Set<string>
  toggleSelectAll: () => void
  toggleSelect: (id: string) => void
  handleFieldChange: (id: string, field: keyof BulkRecord, value: string) => void
  resolveTier: (value: string) => { name: string; code?: string } | undefined
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildBulkUploadColumns(args: BuildColumnsArgs): Column<BulkRecord>[] {
  const {
    allFilteredSelected,
    selectedIds,
    toggleSelectAll,
    toggleSelect,
    handleFieldChange,
    resolveTier,
  } = args

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
      render: (row) => (
        <span className="text-body capitalize text-muted-foreground">{row.gender}</span>
      ),
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
            <StatusBadge status="New" variant="emerald" className="text-micro h-4 px-1.5" />
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
        <TruncatedText
          text={row.branch}
          maxWidth={140}
          className="text-body font-medium text-muted-foreground"
        />
      ),
    },
    employmentType: {
      header: "Employment",
      render: (row) => (
        <span className="text-body capitalize text-muted-foreground">
          {row.employmentType.replace("-", " ")}
        </span>
      ),
    },
    joinDate: {
      header: "Join Date",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar
            size={12}
            className={row.date === "Invalid Date" ? "text-destructive" : "text-faint"}
          />
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
        const code = tc?.code
        return (
          <div className="flex items-center gap-1.5">
            <EditableCell
              value={row.tier}
              onChange={(v) => handleFieldChange(row.id, "tier", v)}
              className={code ? "font-semibold text-primary" : "font-medium"}
            />
            {row.isNewTier && (
              <StatusBadge status="New" variant="emerald" className="text-micro h-4 px-1.5" />
            )}
          </div>
        )
      },
    },
    probation: {
      header: "Probation",
      render: (row) =>
        row.isProbation ? (
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
        <span
          className={cn(
            "text-label font-semibold",
            row.taxable
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          )}
        >
          {row.taxable ? "Yes" : "No"}
        </span>
      ),
    },
    policy: {
      header: "Policy",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <EditableCell
            value={row.policies}
            onChange={(v) => handleFieldChange(row.id, "policies", v)}
            placeholder="Add policy…"
            className="font-medium"
          />
          {row.isNewPolicy && (
            <StatusBadge status="New" variant="emerald" className="text-micro h-4 px-1.5" />
          )}
          {row.autoAssigned && (
            <StatusBadge status="Auto" variant="emerald" className="h-4 px-1.5 text-micro" />
          )}
        </div>
      ),
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
                    <CheckCircle
                      size={14}
                      weight="fill"
                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                  ) : (
                    <WarningCircle
                      size={14}
                      weight="fill"
                      className="mt-0.5 shrink-0 text-destructive"
                    />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-label font-semibold uppercase tracking-wide",
                        isValid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
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

  return COLUMN_ORDER.map((key) => columnMap[key])
}
