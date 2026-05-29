"use client"

import { useMemo } from "react"
import {
  CloudArrowUp,
  FileCsv,
  Info,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkle,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { FormSelect } from "@/components/shared/form-select"
import { SharedDataTable } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NewValuesConfirmation } from "./bulk-upload-steps/new-values-confirmation"
import { buildBulkUploadColumns } from "./bulk-upload-columns"
import { useBulkUploadWizard, type FilterChip } from "@/hooks/use-bulk-upload-wizard"

// ─── Props ────────────────────────────────────────────────────────────────────

interface BulkUploadWizardProps {
  onBack: () => void
  onSuccess?: () => void
  orgTierConfigs?: { id: string; name: string; code?: string }[]
  availablePolicies?: { name: string; version?: string; tiers: string[] }[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkUploadWizard({
  onBack,
  onSuccess,
  orgTierConfigs = [],
  availablePolicies = [],
}: BulkUploadWizardProps) {
  const wiz = useBulkUploadWizard({ onBack, onSuccess, orgTierConfigs, availablePolicies })

  const {
    step, progress, fileName, counts,
    searchQuery, setSearchQuery, activeFilter, setActiveFilter,
    selectedIds, bulkPolicyValue, setBulkPolicyValue, bulkTierValue, setBulkTierValue,
    filteredRecords, allFilteredSelected, policyTierMap, uniqueTiers,
    resolveTier, handleFileSelect, handleConfirmImport, handleFieldChange,
    toggleSelectAll, toggleSelect, clearSelection, bulkAssignPolicy, bulkSetTier, bulkRemove,
  } = wiz

  // ── Columns (rebuilt when selection / records change) ───────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visibleColumns = useMemo(
    () =>
      buildBulkUploadColumns({
        allFilteredSelected,
        selectedIds,
        toggleSelectAll,
        toggleSelect,
        handleFieldChange,
        resolveTier,
      }),
    [wiz.records, selectedIds, allFilteredSelected, policyTierMap]
  )

  // ── Filter chips ────────────────────────────────────────────────────────────

  const filterChips: { key: FilterChip; label: string; count: number; tone: string }[] = [
    { key: "all", label: "All", count: counts.total, tone: "default" },
    { key: "valid", label: "Valid", count: counts.valid, tone: "emerald" },
    { key: "issues", label: "Issues", count: counts.issues, tone: "rose" },
    { key: "auto", label: "Auto-assigned", count: counts.auto, tone: "primary" },
    { key: "newDept", label: "New Depts", count: counts.newDept, tone: "emerald" },
    { key: "newTier", label: "New Tiers", count: counts.newTier, tone: "emerald" },
    { key: "newPolicy", label: "New Policies", count: counts.newPolicy, tone: "emerald" },
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="animate-in overflow-hidden rounded-lg border border-border bg-card duration-500 fade-in slide-in-from-bottom-4">
      {/* Header */}
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
        {/* ── Upload ── */}
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
              <Button
                variant="secondary"
                className="mt-2 h-10 rounded-4xl px-8 font-semibold shadow-sm"
              >
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
                    Code, Email, Name, DOB, Gender, Mobile, Department, Role, Join Date, Branch,
                    Tier, Employment Type, Status, Is Probation.
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

        {/* ── Processing ── */}
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
              <p className="text-body text-muted-foreground">
                Validating record integrity for {fileName}...
              </p>
            </div>
          </div>
        )}

        {/* ── Preview ── */}
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
                      {counts.newDept > 0 &&
                        ` · ${counts.newDept} new ${counts.newDept === 1 ? "department" : "departments"}`}
                      {counts.newTier > 0 &&
                        ` · ${counts.newTier} new ${counts.newTier === 1 ? "tier" : "tiers"}`}
                      {counts.newPolicy > 0 &&
                        ` · ${counts.newPolicy} new ${counts.newPolicy === 1 ? "policy" : "policies"}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleFileSelect("")}
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

              {/* New values banner */}
              {(counts.newDept > 0 || counts.newTier > 0 || counts.newPolicy > 0) && (
                <NewValuesConfirmation
                  newDeptCount={counts.newDept}
                  newTierCount={counts.newTier}
                  newPolicyCount={counts.newPolicy}
                />
              )}

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
                          <span
                            className={cn(
                              "rounded-full px-1.5 text-micro font-semibold",
                              active ? "bg-background/40" : "bg-muted"
                            )}
                          >
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
                    <FormSelect
                      value={bulkPolicyValue}
                      onChange={(v) => {
                        if (v) { bulkAssignPolicy(v); setBulkPolicyValue("") }
                      }}
                      options={[
                        { label: "Assign Policy…", value: "" },
                        ...policyTierMap.map((p) => ({ label: p.name, value: p.name })),
                      ]}
                      triggerClassName="h-8 text-label"
                    />
                    <FormSelect
                      value={bulkTierValue}
                      onChange={(v) => {
                        if (v) { bulkSetTier(v); setBulkTierValue("") }
                      }}
                      options={[
                        { label: "Set Tier…", value: "" },
                        ...uniqueTiers.map((t) => {
                          const tc = resolveTier(t)
                          const label = tc?.name
                            ? (tc.code ? `${tc.name} (${tc.code})` : tc.name)
                            : t
                          return { label, value: t }
                        }),
                      ]}
                      triggerClassName="h-8 text-label"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={bulkRemove}
                      className="h-8 px-3 text-label font-semibold"
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

        {/* ── Success ── */}
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
