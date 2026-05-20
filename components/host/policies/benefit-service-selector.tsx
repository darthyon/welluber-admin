"use client"

import { useState, useMemo } from "react"
import {
  MagnifyingGlass,
  CaretDown,
  CaretRight,
  Check,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { FormSelect } from "@/components/shared/form-select"
import { FieldHelp } from "@/components/shared/field-help"
import { SERVICES } from "@/lib/mock-data/service-catalog"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import type { Benefit, BenefitGroupCoverageScope } from "@/types/policy"

interface BenefitServiceSelectorProps {
  groupId: string
  groupBenefits: Benefit[]
  isViewMode: boolean
  groupErrors: Record<string, string>
  coverageScope: BenefitGroupCoverageScope
  policyEmployeeCap?: number
  policyDependentCap?: number
  onToggleService: (serviceId: MainServiceId) => void
  onUpdateBenefit: (
    benefitId: string,
    field: string,
    value: string | number | boolean | string[]
  ) => void
}

// Group flat SERVICES catalog by category for the tree view
const GROUPED_SERVICES = SERVICES.reduce<
  { category: string; services: typeof SERVICES }[]
>((acc, service) => {
  const group = acc.find((g) => g.category === service.category)
  if (group) {
    group.services.push(service)
  } else {
    acc.push({ category: service.category, services: [service] })
  }
  return acc
}, [])

function CoPaymentToggle({
  required,
  type,
  value,
  errorKey,
  groupErrors,
  onToggle,
  onChangeType,
  onChangeValue,
}: {
  required: boolean
  type: "Percentage" | "Fixed"
  value: number
  errorKey: string
  groupErrors: Record<string, string>
  onToggle: () => void
  onChangeType: (v: string) => void
  onChangeValue: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-1 text-micro font-medium text-faint">
        Co-payment <FieldHelp termKey="coPayment" />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "relative h-4 w-8 shrink-0 rounded-full transition-colors",
            required ? "bg-primary" : "bg-border"
          )}
        >
          <div
            className={cn(
              "absolute top-[2px] h-3 w-3 rounded-full border border-border/40 bg-background transition-all",
              required ? "right-0.5" : "left-0.5"
            )}
          />
        </button>
        {required && (
          <div className="flex items-center gap-1.5">
            <FormSelect
              value={type}
              onChange={onChangeType}
              options={[
                { label: "%", value: "Percentage" },
                { label: "RM", value: "Fixed" },
              ]}
              triggerClassName="w-16 h-8"
            />
            <input
              type="number"
              className={cn(
                "w-16 rounded-lg border bg-background px-2 py-1.5 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
                groupErrors[errorKey] ? "border-destructive" : "border-border"
              )}
              value={value || ""}
              onChange={(e) =>
                onChangeValue(
                  e.target.value === "" ? 0 : parseFloat(e.target.value)
                )
              }
            />
          </div>
        )}
      </div>
      {groupErrors[errorKey] && (
        <p className="text-micro text-destructive">{groupErrors[errorKey]}</p>
      )}
    </div>
  )
}

export function BenefitServiceSelector({
  groupId,
  groupBenefits,
  isViewMode,
  groupErrors,
  coverageScope,
  policyEmployeeCap,
  policyDependentCap,
  onToggleService,
  onUpdateBenefit,
}: BenefitServiceSelectorProps) {
  const [search, setSearch] = useState("")
  const [openCategory, setOpenCategory] = useState<string | null>(
    GROUPED_SERVICES[0]?.category ?? null
  )
  const [expandedBenefits, setExpandedBenefits] = useState<Set<string>>(
    new Set()
  )

  const selectedServiceIds = useMemo(
    () => new Set(groupBenefits.map((b) => b.serviceId)),
    [groupBenefits]
  )

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return GROUPED_SERVICES
    const q = search.toLowerCase()
    return GROUPED_SERVICES.flatMap((g) => {
      const matched = g.services.filter((s) => s.name.toLowerCase().includes(q))
      return matched.length > 0 ? [{ ...g, services: matched }] : []
    })
  }, [search])

  const toggleCategory = (cat: string) => {
    setOpenCategory((prev) => (prev === cat ? null : cat))
  }

  const toggleBenefitExpanded = (benefitId: string) => {
    setExpandedBenefits((prev) => {
      const next = new Set(prev)
      if (next.has(benefitId)) next.delete(benefitId)
      else next.add(benefitId)
      return next
    })
  }

  // View mode: simple flat list
  if (isViewMode) {
    return (
      <div className="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60">
        {groupBenefits.length === 0 ? (
          <p className="py-4 text-center text-label text-faint italic">
            No benefits configured for this group.
          </p>
        ) : (
          groupBenefits.map((benefit) => {
            const service = SERVICES.find((s) => s.id === benefit.serviceId)
            const employeeAmount =
              typeof benefit.employeeAmount === "number"
                ? benefit.employeeAmount
                : benefit.amount
            const dependentAmount =
              typeof benefit.dependantAmount === "number"
                ? benefit.dependantAmount
                : benefit.amount
            return (
              <div
                key={benefit.id}
                className="flex items-center justify-between bg-muted/20 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Check
                    size={14}
                    weight="bold"
                    className="shrink-0 text-primary"
                  />
                  <span className="text-body font-medium text-foreground">
                    {service?.name ?? benefit.serviceId}
                  </span>
                  <span className="text-label text-faint">
                    {service?.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {coverageScope !== "Dependent" &&
                    benefit.coPayment.required && (
                      <span className="text-label font-medium text-faint">
                        Employee Co-pay{" "}
                        {benefit.coPayment.type === "Percentage"
                          ? `${benefit.coPayment.value}%`
                          : `RM ${benefit.coPayment.value}`}
                      </span>
                    )}
                  {coverageScope !== "Employee" &&
                    benefit.dependentCoPayment?.required && (
                      <span className="text-label font-medium text-faint">
                        Dependent Co-pay{" "}
                        {benefit.dependentCoPayment.type === "Percentage"
                          ? `${benefit.dependentCoPayment.value}%`
                          : `RM ${benefit.dependentCoPayment.value}`}
                      </span>
                    )}
                  {coverageScope === "Both" ? (
                    <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                      RM {employeeAmount.toFixed(2)} / RM{" "}
                      {dependentAmount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                      RM{" "}
                      {(coverageScope === "Dependent"
                        ? dependentAmount
                        : employeeAmount
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-[320px] overflow-hidden rounded-lg border border-border/60">
      {/* Left: Service catalog */}
      <div className="flex w-52 shrink-0 flex-col border-r border-border/60 bg-muted/20">
        {/* Search */}
        <div className="border-b border-border/60 p-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
            <MagnifyingGlass size={13} className="shrink-0 text-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="min-w-0 flex-1 bg-transparent text-label outline-none placeholder:text-faint"
            />
          </div>
        </div>

        {/* Category tree */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredGroups.length === 0 ? (
            <p className="py-6 text-center text-label text-faint">No results</p>
          ) : (
            filteredGroups.map((group) => {
              const isCollapsed =
                openCategory !== group.category && !search.trim()
              const selectedCount = group.services.filter((s) =>
                selectedServiceIds.has(s.id as MainServiceId)
              ).length

              return (
                <div key={group.category}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    className="flex w-full items-center justify-between px-3 py-2 text-label font-semibold text-muted-foreground transition-colors hover:bg-muted/40"
                  >
                    <span className="truncate">{group.category}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {selectedCount > 0 && (
                        <span className="rounded bg-primary/10 px-1.5 text-micro font-medium text-primary">
                          {selectedCount}
                        </span>
                      )}
                      {search.trim() ? null : isCollapsed ? (
                        <CaretRight size={10} className="text-faint" />
                      ) : (
                        <CaretDown size={10} className="text-faint" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed &&
                    group.services.map((service) => {
                      const isChecked = selectedServiceIds.has(
                        service.id as MainServiceId
                      )
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() =>
                            onToggleService(service.id as MainServiceId)
                          }
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors",
                            isChecked
                              ? "bg-primary/8 text-primary"
                              : "text-foreground hover:bg-muted/40"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                              isChecked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background"
                            )}
                          >
                            {isChecked && <Check size={10} weight="bold" />}
                          </div>
                          <span className="truncate text-label">
                            {service.name}
                          </span>
                        </button>
                      )
                    })}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right: Selected services config — accordion rows */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border/60 bg-muted/10 px-4 py-2.5">
          <p className="text-label font-medium text-muted-foreground">
            {groupBenefits.length === 0
              ? "Selected services"
              : `Selected (${groupBenefits.length})`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groupBenefits.length === 0 ? (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-label text-faint italic">
                Select services from the list
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {groupBenefits.map((benefit) => {
                const service = SERVICES.find((s) => s.id === benefit.serviceId)
                const isExpanded = expandedBenefits.has(benefit.id)
                const employeeAmount =
                  typeof benefit.employeeAmount === "number"
                    ? benefit.employeeAmount
                    : benefit.amount
                const dependentAmount =
                  typeof benefit.dependantAmount === "number"
                    ? benefit.dependantAmount
                    : benefit.amount
                const amountSummary =
                  coverageScope === "Both"
                    ? `RM ${employeeAmount.toLocaleString()} employee / RM ${dependentAmount.toLocaleString()} dependent`
                    : coverageScope === "Dependent"
                      ? dependentAmount > 0
                        ? `RM ${dependentAmount.toLocaleString()}`
                        : "Set amount"
                      : benefit.amount > 0
                        ? `RM ${benefit.amount.toLocaleString()}`
                        : "Set amount"

                return (
                  <div key={benefit.id}>
                    {/* Accordion header */}
                    <button
                      type="button"
                      onClick={() => toggleBenefitExpanded(benefit.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/20"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="truncate text-label font-medium text-foreground">
                          {service?.name ?? benefit.serviceId}
                        </span>
                        <span className="shrink-0 text-micro text-faint">
                          {service?.category}
                        </span>
                      </div>
                      <div className="ml-2 flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "font-mono text-label tabular-nums",
                            benefit.amount > 0
                              ? "font-semibold text-foreground"
                              : "text-faint italic"
                          )}
                        >
                          {amountSummary}
                        </span>
                        <CaretDown
                          size={12}
                          weight="bold"
                          className={cn(
                            "shrink-0 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </button>

                    {/* Accordion body */}
                    {isExpanded && (
                      <div className="animate-in space-y-4 border-t border-border/40 bg-muted/10 px-4 pt-3 pb-5 duration-150 fade-in slide-in-from-top-1">
                        {/* Policy defaults hint */}
                        {(policyEmployeeCap || policyDependentCap) && (
                          <p className="text-micro text-faint">
                            Policy default:{" "}
                            {policyEmployeeCap
                              ? `RM ${policyEmployeeCap.toLocaleString()} emp`
                              : ""}
                            {policyEmployeeCap && policyDependentCap
                              ? " / "
                              : ""}
                            {policyDependentCap
                              ? `RM ${policyDependentCap.toLocaleString()} dep`
                              : ""}
                          </p>
                        )}

                        <div className="flex flex-wrap items-end gap-5">
                          {/* Amount inputs */}
                          {coverageScope === "Both" ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="space-y-1">
                                <label className="block text-micro font-medium text-faint">
                                  Employee Amount (RM)
                                </label>
                                <input
                                  type="number"
                                  className={cn(
                                    "w-32 rounded-lg border bg-background px-2 py-1.5 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
                                    groupErrors[
                                      `benefit_${groupId}_${benefit.serviceId}`
                                    ]
                                      ? "border-destructive"
                                      : "border-border"
                                  )}
                                  value={benefit.employeeAmount ?? ""}
                                  onChange={(e) => {
                                    const emp =
                                      e.target.value === ""
                                        ? 0
                                        : parseFloat(e.target.value)
                                    const dep = benefit.dependantAmount ?? 0
                                    onUpdateBenefit(
                                      benefit.id,
                                      "employeeAmount",
                                      emp
                                    )
                                    onUpdateBenefit(
                                      benefit.id,
                                      "amount",
                                      emp + dep
                                    )
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-micro font-medium text-faint">
                                  Dependent Amount (RM)
                                </label>
                                <input
                                  type="number"
                                  className={cn(
                                    "w-32 rounded-lg border bg-background px-2 py-1.5 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
                                    groupErrors[
                                      `benefit_${groupId}_${benefit.serviceId}`
                                    ]
                                      ? "border-destructive"
                                      : "border-border"
                                  )}
                                  value={benefit.dependantAmount ?? ""}
                                  onChange={(e) => {
                                    const dep =
                                      e.target.value === ""
                                        ? 0
                                        : parseFloat(e.target.value)
                                    const emp = benefit.employeeAmount ?? 0
                                    onUpdateBenefit(
                                      benefit.id,
                                      "dependantAmount",
                                      dep
                                    )
                                    onUpdateBenefit(
                                      benefit.id,
                                      "amount",
                                      emp + dep
                                    )
                                  }}
                                />
                              </div>
                              {groupErrors[
                                `benefit_${groupId}_${benefit.serviceId}`
                              ] && (
                                <p className="text-micro text-destructive sm:col-span-2">
                                  {
                                    groupErrors[
                                      `benefit_${groupId}_${benefit.serviceId}`
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <label className="block text-micro font-medium text-faint">
                                Amount (RM)
                              </label>
                              <input
                                type="number"
                                className={cn(
                                  "w-24 rounded-lg border bg-background px-2 py-1.5 text-right font-mono text-label outline-none focus:ring-2 focus:ring-primary/10",
                                  groupErrors[
                                    `benefit_${groupId}_${benefit.serviceId}`
                                  ]
                                    ? "border-destructive"
                                    : "border-border"
                                )}
                                value={
                                  coverageScope === "Dependent"
                                    ? (typeof benefit.dependantAmount ===
                                      "number"
                                        ? benefit.dependantAmount
                                        : benefit.amount) || ""
                                    : benefit.amount || ""
                                }
                                onChange={(e) => {
                                  const v =
                                    e.target.value === ""
                                      ? 0
                                      : parseFloat(e.target.value)
                                  if (coverageScope === "Dependent") {
                                    onUpdateBenefit(
                                      benefit.id,
                                      "dependantAmount",
                                      v
                                    )
                                    onUpdateBenefit(benefit.id, "amount", v)
                                  } else {
                                    onUpdateBenefit(benefit.id, "amount", v)
                                  }
                                }}
                              />
                              {groupErrors[
                                `benefit_${groupId}_${benefit.serviceId}`
                              ] && (
                                <p className="text-micro text-destructive">
                                  {
                                    groupErrors[
                                      `benefit_${groupId}_${benefit.serviceId}`
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                          )}

                          {/* Co-payment */}
                          {coverageScope !== "Dependent" && (
                            <CoPaymentToggle
                              required={benefit.coPayment.required}
                              type={benefit.coPayment.type}
                              value={benefit.coPayment.value}
                              errorKey={`copay_${groupId}_${benefit.serviceId}`}
                              groupErrors={groupErrors}
                              onToggle={() =>
                                onUpdateBenefit(
                                  benefit.id,
                                  "coPayment.required",
                                  !benefit.coPayment.required
                                )
                              }
                              onChangeType={(v) =>
                                onUpdateBenefit(benefit.id, "coPayment.type", v)
                              }
                              onChangeValue={(v) =>
                                onUpdateBenefit(
                                  benefit.id,
                                  "coPayment.value",
                                  v
                                )
                              }
                            />
                          )}
                          {coverageScope !== "Employee" && (
                            <CoPaymentToggle
                              required={
                                benefit.dependentCoPayment?.required ?? false
                              }
                              type={
                                benefit.dependentCoPayment?.type ?? "Percentage"
                              }
                              value={benefit.dependentCoPayment?.value ?? 0}
                              errorKey={`dep_copay_${groupId}_${benefit.serviceId}`}
                              groupErrors={groupErrors}
                              onToggle={() =>
                                onUpdateBenefit(
                                  benefit.id,
                                  "dependentCoPayment.required",
                                  !(
                                    benefit.dependentCoPayment?.required ??
                                    false
                                  )
                                )
                              }
                              onChangeType={(v) =>
                                onUpdateBenefit(
                                  benefit.id,
                                  "dependentCoPayment.type",
                                  v
                                )
                              }
                              onChangeValue={(v) =>
                                onUpdateBenefit(
                                  benefit.id,
                                  "dependentCoPayment.value",
                                  v
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
