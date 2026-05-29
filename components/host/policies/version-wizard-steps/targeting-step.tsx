"use client"

import { Users, Buildings, Check, MagnifyingGlass, X } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VersionWizardCtx } from "../version-wizard-types"

interface TargetingStepProps {
  ctx: VersionWizardCtx
}

export function TargetingStep({ ctx }: TargetingStepProps) {
  const {
    orgTierConfigs,
    tierOptions,
    departments,
    tierFilter,
    departmentFilter,
    pinnedEmployeeIds,
    empSearch,
    setEmpSearch,
    showEmpDropdown,
    setShowEmpDropdown,
    empSearchResults,
    targetedEmployees,
    employees,
    toggleTier,
    toggleDept,
    pinEmployee,
    unpinEmployee,
  } = ctx

  return (
    <div className="space-y-6">
      {/* Tier filter */}
      {tierOptions.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-primary" weight="duotone" />
            <p className="text-label font-semibold text-foreground">Tier Filter</p>
          </div>
          <p className="text-label text-faint mb-4">
            {orgTierConfigs.length > 0
              ? "Filter by organisation tier configuration."
              : "Filter by employee tier labels."}
          </p>
          <div className="flex flex-wrap gap-2">
            {tierOptions.map((tier) => (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-label font-medium transition-all",
                  tierFilter.includes(tier)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Department filter */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Buildings size={16} className="text-primary" weight="duotone" />
          <p className="text-label font-semibold text-foreground">Department Filter</p>
        </div>
        <p className="text-label text-faint mb-4">Leave empty to include all departments.</p>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => toggleDept(dept)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-label font-medium transition-all",
                departmentFilter.includes(dept)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Individual employee pins */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Check size={16} className="text-primary" weight="bold" />
          <p className="text-label font-semibold text-foreground">Pin Individuals</p>
        </div>
        <p className="text-label text-faint mb-4">
          Pinned employees are always included regardless of tier or department filters.
        </p>
        <div className="relative mb-3">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name or employee code…"
            value={empSearch}
            onChange={(e) => {
              setEmpSearch(e.target.value)
              setShowEmpDropdown(true)
            }}
            onFocus={() => setShowEmpDropdown(true)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-body text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
          />
          {showEmpDropdown && empSearchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
              {empSearchResults.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => pinEmployee(emp.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label font-semibold shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-foreground leading-tight">
                      {emp.name}
                    </p>
                    <p className="text-label text-faint font-mono">{emp.empCode}</p>
                  </div>
                  <span className="ml-auto text-label text-faint">{emp.department}</span>
                </button>
              ))}
            </div>
          )}
          {showEmpDropdown && empSearch.trim() && empSearchResults.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg px-4 py-3">
              <p className="text-body text-muted-foreground">No employees found.</p>
            </div>
          )}
        </div>
        {showEmpDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setShowEmpDropdown(false)} />
        )}

        {pinnedEmployeeIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {pinnedEmployeeIds.map((id) => {
              const emp = employees.find((e) => e.id === id)
              if (!emp) return null
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="inline-flex items-center gap-1.5 px-3 py-1"
                >
                  {emp.name}
                  <button
                    onClick={() => unpinEmployee(id)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-muted/30 px-5 py-3 text-body font-medium text-foreground">
        Targeting{" "}
        <span className="font-semibold text-primary">{targetedEmployees.length}</span>{" "}
        employee{targetedEmployees.length !== 1 ? "s" : ""}
        {pinnedEmployeeIds.length > 0 && (
          <span className="text-muted-foreground text-label ml-1">
            ({pinnedEmployeeIds.length} pinned)
          </span>
        )}
      </div>
    </div>
  )
}
