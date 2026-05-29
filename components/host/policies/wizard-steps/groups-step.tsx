"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DetailSection } from "@/components/shared/detail-section"
import { FieldHelp } from "@/components/shared/field-help"
import { ChoiceCard } from "@/components/shared/choice-card"
import { FormSelect } from "@/components/shared/form-select"
import { Switch } from "@/components/shared/switch"
import { BenefitGroupSnapshot } from "@/components/host/policies/benefit-group-snapshot"
import { BenefitServiceSelector } from "@/components/host/policies/benefit-service-selector"
import {
  TreeStructure,
  Plus,
  Trash,
  Check,
  User,
  UsersFour,
  Gear,
  ChartLineUp,
  ArrowCounterClockwise,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { PRORATE_UNITS, getAvailableRefreshCycles } from "../wizard-constants"
import type { BenefitGroupCoverageScope, DependentCoverageType, ProrateUnit, RefreshCycle } from "@/types/policy"
import type { BenefitPolicyWizardCtx } from "../wizard-types"

interface GroupsStepProps {
  ctx: BenefitPolicyWizardCtx
}

export function GroupsStep({ ctx }: GroupsStepProps) {
  const {
    policyData,
    setPolicyData,
    groups,
    benefits,
    validationErrors,
    isViewMode,
    depModalGroupId,
    setDepModalGroupId,
    addGroup,
    removeGroup,
    updateGroup,
    updateGroupCoPayment,
    updateDependentCoPayment,
    setGroupCoverageScope,
    toggleService,
    updateBenefit,
  } = ctx

  const groupErrors = validationErrors

  return (
    <DetailSection
      title="Benefit Groups"
      icon={<TreeStructure size={18} weight="duotone" />}
      description="Organize benefits into logical groups with budget controls"
      ghost
      action={
        !isViewMode ? (
          <Button
            onClick={addGroup}
            size="sm"
            className="flex h-8 items-center gap-2 rounded-full px-4 text-label"
          >
            <Plus size={14} weight="bold" />
            Add Group
          </Button>
        ) : undefined
      }
    >
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-center">
          <TreeStructure size={36} weight="duotone" className="mx-auto mb-3 text-faint" />
          <p className="text-body font-medium text-muted-foreground">
            {isViewMode ? "No benefit groups configured." : "No benefit groups yet."}
          </p>
          {!isViewMode && (
            <Button variant="ghost" onClick={addGroup} className="mt-2 text-body font-semibold text-primary">
              Create your first group
            </Button>
          )}
          {groupErrors.groups && (
            <p className="mt-2 text-label font-medium text-rose-600 dark:text-rose-400">
              {groupErrors.groups}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, gIdx) => {
            const groupBenefits = benefits.filter((b) => b.groupId === group.id)
            return (
              <div
                key={group.id}
                className="animate-in overflow-hidden rounded-lg border border-border bg-card/40 duration-300 zoom-in-95 fade-in"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {isViewMode ? (
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-body font-semibold text-foreground">{group.name}</p>
                          {group.description && (
                            <p className="truncate text-label text-muted-foreground">{group.description}</p>
                          )}
                          <BenefitGroupSnapshot
                            policy={policyData}
                            group={group}
                            benefits={groupBenefits}
                            variant="inline"
                            className="mt-3"
                          />
                        </div>
                        <Badge variant="outline">
                          {groupBenefits.length} {groupBenefits.length === 1 ? "Service" : "Services"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10"
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                          placeholder="Group Name"
                        />
                        {groupErrors[`group_name_${group.id}`] && (
                          <p className="text-micro text-destructive">
                            {groupErrors[`group_name_${group.id}`]}
                          </p>
                        )}
                        <input
                          className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-label text-muted-foreground outline-none focus:ring-2 focus:ring-primary/10"
                          value={group.description || ""}
                          onChange={(e) => updateGroup(group.id, "description", e.target.value)}
                          placeholder="Brief description..."
                        />
                      </div>
                    )}
                  </div>
                  {!isViewMode && (
                    <button
                      onClick={() => removeGroup(group.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>

                {/* Card body */}
                <div className="space-y-5 p-4">
                  {/* Coverage scope */}
                  {!isViewMode && (
                    <div className="space-y-2">
                      <p className="text-label font-medium text-muted-foreground">Covers</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {(["Employee", "Dependent", "Both"] as BenefitGroupCoverageScope[]).map((scope) => {
                          const selected = (group.coverageScope ?? "Employee") === scope
                          return (
                            <button
                              key={scope}
                              type="button"
                              onClick={() => setGroupCoverageScope(group.id, scope)}
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
                    </div>
                  )}

                  {/* Employee / Dependent two-column grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Employee column */}
                    {group.coverageScope !== "Dependent" && (
                      <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
                        <p className="flex items-center gap-1.5 text-label font-semibold text-foreground">
                          <User size={14} weight="duotone" className="text-primary" />
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
                              "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-label outline-none focus:ring-2 focus:ring-primary/10",
                              groupErrors[`group_cap_${group.id}`] ? "border-destructive" : "border-border"
                            )}
                            value={group.maxUsagePerCycle || ""}
                            onChange={(e) =>
                              updateGroup(
                                group.id,
                                "maxUsagePerCycle",
                                e.target.value === "" ? undefined : parseFloat(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                          {groupErrors[`group_cap_${group.id}`] && (
                            <p className="text-micro text-destructive">
                              {groupErrors[`group_cap_${group.id}`]}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
                            Co-payment <FieldHelp termKey="coPayment" />
                          </label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={group.coPayment?.required ?? false}
                              onCheckedChange={(checked) =>
                                updateGroupCoPayment(group.id, "required", checked)
                              }
                            />
                            {group.coPayment?.required && (
                              <div className="flex items-center gap-1.5">
                                <FormSelect
                                  value={group.coPayment?.type ?? "Percentage"}
                                  onChange={(v) => updateGroupCoPayment(group.id, "type", v)}
                                  options={[
                                    { label: "%", value: "Percentage" },
                                    { label: "RM", value: "Fixed" },
                                  ]}
                                  triggerClassName="h-10 min-w-[76px]"
                                />
                                <input
                                  type="number"
                                  className="h-10 w-24 rounded-lg border border-border bg-background px-3 py-2 text-right font-mono text-label outline-none"
                                  value={group.coPayment?.value || ""}
                                  onChange={(e) =>
                                    updateGroupCoPayment(
                                      group.id,
                                      "value",
                                      e.target.value === "" ? 0 : parseFloat(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {groupErrors[`group_copay_${group.id}`] && (
                            <p className="text-micro text-destructive">
                              {groupErrors[`group_copay_${group.id}`]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dependent column */}
                    {group.coverageScope !== "Employee" &&
                      ((policyData.dependentCoverages?.length ?? 0) > 0 ? (
                        <div className="space-y-4 rounded-lg border border-border bg-muted/10 p-4">
                          <p className="flex items-center gap-1.5 text-label font-semibold text-foreground">
                            <UsersFour size={14} weight="duotone" className="text-primary" />
                            Dependent
                          </p>
                          <div className="space-y-1.5">
                            <p className="text-label font-medium text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                Group Cap <FieldHelp termKey="groupCap" />
                              </span>
                              <span className="ml-1 font-normal text-faint">(optional)</span>
                            </p>
                            <input
                              type="number"
                              className={cn(
                                "h-10 w-32 rounded-lg border bg-background px-3 py-2 text-label outline-none focus:ring-2 focus:ring-primary/10",
                                groupErrors[`group_dep_cap_${group.id}`]
                                  ? "border-destructive"
                                  : "border-border"
                              )}
                              value={group.dependentGroupCap || ""}
                              onChange={(e) =>
                                updateGroup(
                                  group.id,
                                  "dependentGroupCap",
                                  e.target.value === "" ? undefined : parseFloat(e.target.value)
                                )
                              }
                              placeholder="0.00"
                            />
                            {groupErrors[`group_dep_cap_${group.id}`] && (
                              <p className="text-micro text-destructive">
                                {groupErrors[`group_dep_cap_${group.id}`]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="inline-flex items-center gap-1.5 text-label font-medium text-muted-foreground">
                              Co-payment <FieldHelp termKey="coPayment" />
                            </label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={group.dependentCoPayment?.required ?? false}
                                onCheckedChange={(checked) =>
                                  updateDependentCoPayment(group.id, "required", checked)
                                }
                              />
                              {group.dependentCoPayment?.required && (
                                <div className="flex items-center gap-1.5">
                                  <FormSelect
                                    value={group.dependentCoPayment?.type ?? "Percentage"}
                                    onChange={(v) => updateDependentCoPayment(group.id, "type", v)}
                                    options={[
                                      { label: "%", value: "Percentage" },
                                      { label: "RM", value: "Fixed" },
                                    ]}
                                    triggerClassName="h-10 min-w-[76px]"
                                  />
                                  <input
                                    type="number"
                                    className={cn(
                                      "h-10 w-24 rounded-lg border bg-background px-3 py-2 text-right font-mono text-label outline-none",
                                      groupErrors[`group_dep_copay_${group.id}`]
                                        ? "border-destructive"
                                        : "border-border"
                                    )}
                                    value={group.dependentCoPayment?.value || ""}
                                    onChange={(e) =>
                                      updateDependentCoPayment(
                                        group.id,
                                        "value",
                                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          {groupErrors[`group_dep_copay_${group.id}`] && (
                            <p className="text-micro text-destructive">
                              {groupErrors[`group_dep_copay_${group.id}`]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/5 p-4 text-center">
                          <UsersFour size={28} weight="duotone" className="text-border" />
                          <p className="text-label font-medium text-faint">No dependent coverage</p>
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
                      const DEP_TYPES: { value: DependentCoverageType; label: string }[] = [
                        { value: "spouse", label: "Spouse" },
                        { value: "child", label: "Child" },
                        { value: "mother", label: "Mother" },
                        { value: "father", label: "Father" },
                        { value: "sibling", label: "Sibling" },
                        { value: "inlaw", label: "In-law" },
                      ]
                      const current = policyData.dependentCoverages ?? []
                      const allSelected = DEP_TYPES.every((t) => current.some((c) => c.type === t.value))
                      return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
                            <div className="space-y-1 p-6 pb-4">
                              <p className="text-body font-semibold text-foreground">Add Dependent Coverage</p>
                              <p className="text-label text-subtle">Select which dependents this group covers.</p>
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
                                        : DEP_TYPES.map((t) => ({ type: t.value, capAmount: undefined })),
                                      dependentsPoolType: allSelected
                                        ? undefined
                                        : (policyData.dependentsPoolType ?? "SharedWithEmployee"),
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
                                    <Check size={11} weight="bold" className="mr-1.5 inline" />
                                  )}
                                  All
                                </button>
                                {DEP_TYPES.map((opt) => {
                                  const isSelected = current.some((c) => c.type === opt.value)
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        const next = isSelected
                                          ? current.filter((c) => c.type !== opt.value)
                                          : [...current, { type: opt.value, capAmount: undefined }]
                                        setPolicyData({
                                          ...policyData,
                                          dependentCoverages: next,
                                          dependentsPoolType:
                                            next.length > 0
                                              ? (policyData.dependentsPoolType ?? "SharedWithEmployee")
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
                                        <Check size={11} weight="bold" className="mr-1.5 inline" />
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
                                disabled={(policyData.dependentCoverages?.length ?? 0) === 0}
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
                      <p className="text-label font-medium text-muted-foreground">Utilisation Mode</p>
                      {!isViewMode &&
                        (group.utilisationMode || group.prorateUnit || group.refreshCycle) ? (
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
                      <p className="text-micro text-faint">Policy Default Allocation</p>
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
                        selected={(group.utilisationMode ?? policyData.utilisationMode) === "Fixed"}
                        onSelect={() => {
                          updateGroup(group.id, "utilisationMode", "Fixed")
                          updateGroup(group.id, "prorateUnit", undefined)
                        }}
                      />
                      <ChoiceCard
                        title="Prorated Allocation"
                        description="Amounts prorated based on time."
                        icon={ChartLineUp}
                        selected={(group.utilisationMode ?? policyData.utilisationMode) === "Prorated"}
                        onSelect={() => {
                          updateGroup(group.id, "utilisationMode", "Prorated")
                          if (!group.prorateUnit) updateGroup(group.id, "prorateUnit", "Monthly")
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(group.utilisationMode ?? policyData.utilisationMode) === "Prorated" && (
                        <div className="animate-in space-y-1.5 duration-200 fade-in slide-in-from-top-1">
                          <p className="text-label font-medium text-muted-foreground">Prorate Unit</p>
                          <FormSelect
                            value={group.prorateUnit ?? policyData.prorateUnit ?? "Monthly"}
                            onChange={(v) => {
                              const nextUnit = (v || undefined) as ProrateUnit | undefined
                              updateGroup(group.id, "prorateUnit", nextUnit)
                              const available = getAvailableRefreshCycles(
                                "Prorated",
                                (nextUnit ?? policyData.prorateUnit ?? "Monthly") as ProrateUnit
                              )
                              const current = group.refreshCycle ?? policyData.refreshCycle
                              if (current && !available.includes(current as RefreshCycle)) {
                                updateGroup(group.id, "refreshCycle", available[0])
                              }
                            }}
                            options={[
                              { label: "Inherit (Policy)", value: "" },
                              ...PRORATE_UNITS.map((u) => ({ label: u, value: u })),
                            ]}
                            triggerClassName="max-w-[240px]"
                            disabled={isViewMode}
                          />
                        </div>
                      )}

                      <div className="animate-in space-y-1.5 duration-200 fade-in slide-in-from-top-1">
                        <p className="text-label font-medium text-muted-foreground">Refresh Cycle</p>
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
                              (group.utilisationMode ?? policyData.utilisationMode) === "Prorated"
                                ? ((group.prorateUnit ??
                                    policyData.prorateUnit ??
                                    "Monthly") as ProrateUnit)
                                : undefined
                            ).map((c) => ({ label: c, value: c })),
                          ]}
                          triggerClassName="max-w-[240px]"
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Benefits selector */}
                  <div className="space-y-3 border-t border-border/60 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-label font-semibold text-foreground">Services</p>
                      {groupErrors[`group_${gIdx}`] && (
                        <p className="text-label font-medium text-destructive">
                          {groupErrors[`group_${gIdx}`]}
                        </p>
                      )}
                    </div>
                    <BenefitServiceSelector
                      groupId={group.id}
                      groupBenefits={groupBenefits}
                      isViewMode={isViewMode}
                      groupErrors={groupErrors}
                      coverageScope={group.coverageScope ?? "Employee"}
                      policyEmployeeCap={policyData.totalCapAmount}
                      policyDependentCap={policyData.dependentCapAmount}
                      onToggleService={(serviceId) => toggleService(group.id, serviceId)}
                      onUpdateBenefit={updateBenefit}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DetailSection>
  )
}
