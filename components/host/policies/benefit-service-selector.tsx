"use client"

import { useState, useMemo } from "react"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import type { Benefit, BenefitGroupCoverageScope } from "@/types/policy"
import {
  BenefitViewList,
  GROUPED_SERVICES,
  ServiceCatalogPane,
} from "@/components/host/policies/benefit-service-selector-catalog-pane"
import {
  SelectedBenefitsPane,
} from "@/components/host/policies/benefit-service-selector-selected-pane"

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

  const isDependentOnly = coverageScope === "Dependent"
  const isBoth = coverageScope === "Both"

  if (isViewMode) {
    return <BenefitViewList coverageScope={coverageScope} groupBenefits={groupBenefits} />
  }

  return (
    <div className="flex min-h-[320px] overflow-hidden rounded-lg border border-border/60">
      <ServiceCatalogPane
        filteredGroups={filteredGroups}
        onToggleCategory={toggleCategory}
        onToggleService={onToggleService}
        openCategory={openCategory}
        search={search}
        selectedServiceIds={selectedServiceIds}
        setSearch={setSearch}
      />
      <SelectedBenefitsPane
        coverageScope={coverageScope}
        expandedBenefits={expandedBenefits}
        groupBenefits={groupBenefits}
        groupErrors={groupErrors}
        groupId={groupId}
        isBoth={isBoth}
        isDependentOnly={isDependentOnly}
        onToggleBenefitExpanded={toggleBenefitExpanded}
        onUpdateBenefit={onUpdateBenefit}
        policyDependentCap={policyDependentCap}
        policyEmployeeCap={policyEmployeeCap}
      />
    </div>
  )
}
