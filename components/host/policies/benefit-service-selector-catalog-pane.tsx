"use client"

import { CaretDown, CaretRight, Check, MagnifyingGlass } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { SERVICES } from "@/lib/mock-data/service-catalog"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import type { Benefit, BenefitGroupCoverageScope } from "@/types/policy"

export interface ServiceCategoryGroup {
  category: string
  services: typeof SERVICES
}

export const GROUPED_SERVICES: ServiceCategoryGroup[] = SERVICES.reduce<ServiceCategoryGroup[]>(
  (acc, service) => {
    const group = acc.find((item) => item.category === service.category)
    if (group) group.services.push(service)
    else acc.push({ category: service.category, services: [service] })
    return acc
  },
  [],
)

interface ServiceCatalogPaneProps {
  filteredGroups: ServiceCategoryGroup[]
  onToggleCategory: (category: string) => void
  onToggleService: (serviceId: MainServiceId) => void
  openCategory: string | null
  search: string
  selectedServiceIds: Set<string>
  setSearch: (value: string) => void
}

export function ServiceCatalogPane({
  filteredGroups,
  onToggleCategory,
  onToggleService,
  openCategory,
  search,
  selectedServiceIds,
  setSearch,
}: ServiceCatalogPaneProps) {
  return (
    <div className="flex w-52 shrink-0 flex-col border-r border-border/60 bg-muted/20">
      <div className="border-b border-border/60 p-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
          <MagnifyingGlass size={13} className="shrink-0 text-faint" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services…"
            className="min-w-0 flex-1 bg-transparent text-label outline-none placeholder:text-faint"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {filteredGroups.length === 0 ? (
          <p className="py-6 text-center text-label text-faint">No results</p>
        ) : (
          filteredGroups.map((group) => {
            const isCollapsed = openCategory !== group.category && !search.trim()
            const selectedCount = group.services.filter((service) =>
              selectedServiceIds.has(service.id as MainServiceId),
            ).length

            return (
              <div key={group.category}>
                <button
                  type="button"
                  onClick={() => onToggleCategory(group.category)}
                  className="flex w-full items-center justify-between px-3 py-2 text-label font-semibold text-muted-foreground transition-colors hover:bg-muted/40"
                >
                  <span className="truncate">{group.category}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {selectedCount > 0 ? (
                      <span className="rounded bg-primary/10 px-1.5 text-micro font-medium text-primary">
                        {selectedCount}
                      </span>
                    ) : null}
                    {search.trim() ? null : isCollapsed ? (
                      <CaretRight size={10} className="text-faint" />
                    ) : (
                      <CaretDown size={10} className="text-faint" />
                    )}
                  </div>
                </button>

                {!isCollapsed
                  ? group.services.map((service) => {
                      const isChecked = selectedServiceIds.has(service.id as MainServiceId)
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => onToggleService(service.id as MainServiceId)}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors",
                            isChecked
                              ? "bg-primary/8 text-primary"
                              : "text-foreground hover:bg-muted/40",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                              isChecked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background",
                            )}
                          >
                            {isChecked ? <Check size={10} weight="bold" /> : null}
                          </div>
                          <span className="truncate text-label">{service.name}</span>
                        </button>
                      )
                    })
                  : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

interface BenefitViewListProps {
  coverageScope: BenefitGroupCoverageScope
  groupBenefits: Benefit[]
}

export function BenefitViewList({ coverageScope, groupBenefits }: BenefitViewListProps) {
  return (
    <div className="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60">
      {groupBenefits.length === 0 ? (
        <p className="py-4 text-center text-label text-faint italic">
          No benefits configured for this group.
        </p>
      ) : (
        groupBenefits.map((benefit) => {
          const service = SERVICES.find((item) => item.id === benefit.serviceId)
          const employeeAmount =
            typeof benefit.employeeAmount === "number" ? benefit.employeeAmount : benefit.amount
          const dependentAmount =
            typeof benefit.dependantAmount === "number" ? benefit.dependantAmount : benefit.amount

          return (
            <div key={benefit.id} className="flex items-center justify-between bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <Check size={14} weight="bold" className="shrink-0 text-primary" />
                <span className="text-body font-medium text-foreground">
                  {service?.name ?? benefit.serviceId}
                </span>
                <span className="text-label text-faint">{service?.category}</span>
              </div>
              <div className="flex items-center gap-3">
                {coverageScope !== "Dependent" && benefit.coPayment.required ? (
                  <span className="text-label font-medium text-faint">
                    Employee Co-pay{" "}
                    {benefit.coPayment.type === "Percentage"
                      ? `${benefit.coPayment.value}%`
                      : `RM ${benefit.coPayment.value}`}
                  </span>
                ) : null}
                {coverageScope !== "Employee" && benefit.dependentCoPayment?.required ? (
                  <span className="text-label font-medium text-faint">
                    Dependent Co-pay{" "}
                    {benefit.dependentCoPayment.type === "Percentage"
                      ? `${benefit.dependentCoPayment.value}%`
                      : `RM ${benefit.dependentCoPayment.value}`}
                  </span>
                ) : null}
                <span className="font-mono text-body font-semibold tabular-nums text-foreground">
                  {coverageScope === "Both"
                    ? `RM ${employeeAmount.toFixed(2)} / RM ${dependentAmount.toFixed(2)}`
                    : `RM ${(coverageScope === "Dependent" ? dependentAmount : employeeAmount).toFixed(2)}`}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
