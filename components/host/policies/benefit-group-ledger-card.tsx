"use client"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  getMainServiceName,
  resolveMainServiceId,
} from "@/lib/mock-data/service-catalog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CaretDown, Info, TreeStructure } from "@phosphor-icons/react"
import type {
  Benefit,
  BenefitGroup,
  BenefitGroupCoverageScope,
  BenefitPolicy,
} from "@/types/policy"
import { getMainServiceIcon } from "./detail-tabs/policy-detail-helpers"
import {
  formatCopay,
  formatRM,
  getBenefitAmount,
  getEffectiveRefresh,
  getEffectiveUtilisation,
  getGroupCap,
  getServiceCopay,
  hasDependentSide,
  hasEmployeeSide,
} from "./policy-datapoint-helpers"
import {
  ContractSection,
  DataPoint,
  TechnicalBadge,
} from "./policy-datapoint-ui"

interface BenefitGroupLedgerCardProps {
  policy: BenefitPolicy
  group: BenefitGroup
  benefits: Benefit[]
}

export function BenefitGroupLedgerCard({
  policy,
  group,
  benefits,
}: BenefitGroupLedgerCardProps) {
  const coverageScope = group.coverageScope ?? "Employee"

  return (
    <ContractSection
      title={group.name}
      description={formatGroupMeta(group, coverageScope, benefits.length)}
      icon={<TreeStructure size={18} weight="duotone" />}
    >
      <div className="space-y-5">
        {group.description ? (
          <p className="max-w-3xl text-label text-faint">{group.description}</p>
        ) : null}

        <ServiceGrid
          benefits={benefits}
          group={group}
          coverageScope={coverageScope}
        />

        <Collapsible className="-mx-4 -mb-4 border-t border-border bg-muted/20">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="group flex h-auto w-full items-center justify-between rounded-none px-4 py-3 text-label font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span className="flex items-start gap-2">
                <TreeStructure size={14} weight="duotone" className="mt-0.5" />
                <span>Benefit Group Details</span>
              </span>
              <CaretDown
                size={14}
                className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-5 border-t border-border px-4 pt-4 pb-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <RuleSummaryItem
                  label="Utilisation"
                  value={getEffectiveUtilisation(policy, group)}
                />
                <RuleSummaryItem
                  label="Refresh"
                  value={`${getEffectiveRefresh(policy, group)} Refresh`}
                />
              </div>
              <BenefitGroupDatapoints
                group={group}
                serviceCount={benefits.length}
                coverageScope={coverageScope}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ContractSection>
  )
}

function ServiceGrid({
  benefits,
  coverageScope,
  group,
}: {
  benefits: Benefit[]
  coverageScope: BenefitGroupCoverageScope
  group: BenefitGroup
}) {
  return (
    <div>
      <p className="mb-3 text-label font-semibold text-muted-foreground">
        Services
      </p>
      {benefits.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-label text-faint">
          No benefits configured for this group.
        </p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {benefits.map((benefit) => (
            <ServiceRow
              key={benefit.id}
              benefit={benefit}
              group={group}
              coverageScope={coverageScope}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceRow({
  benefit,
  coverageScope,
  group,
}: {
  benefit: Benefit
  coverageScope: BenefitGroupCoverageScope
  group: BenefitGroup
}) {
  const employeeAmount = getBenefitAmount(benefit, "employee") ?? 0
  const dependentAmount = getBenefitAmount(benefit, "dependent") ?? 0
  const employeeCoPay = getServiceCopay(group, benefit, "employee")
  const dependentCoPay = getServiceCopay(group, benefit, "dependent")

  return (
    <Collapsible className="bg-card">
      <CollapsibleTrigger asChild>
        <button className="group flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30">
          <span className="shrink-0">{getMainServiceIcon(benefit.serviceId)}</span>
          <span className="truncate text-body font-semibold text-foreground">
            {getMainServiceName(benefit.serviceId)}
          </span>
          <span className="ml-auto shrink-0">
            <TechnicalBadge>
              {resolveMainServiceId(benefit.serviceId)}
            </TechnicalBadge>
          </span>
          <CaretDown
            size={14}
            className="shrink-0 text-faint transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 gap-3 border-t border-border bg-muted/20 px-4 py-4 sm:grid-cols-2">
          <EntitlementMetric
            label="Employee"
            helper="Benefit amount allocated to the employee for this service per cycle."
            value={
              hasEmployeeSide(coverageScope)
                ? formatRM(employeeAmount)
                : "Not Applicable"
            }
            coPay={
              hasEmployeeSide(coverageScope) && employeeCoPay?.required
                ? formatCopay(employeeCoPay)
                : null
            }
          />
          <EntitlementMetric
            label="Dependent"
            helper="Benefit amount allocated to each covered dependent for this service per cycle."
            value={
              hasDependentSide(coverageScope)
                ? formatRM(dependentAmount)
                : "Not Applicable"
            }
            coPay={
              hasDependentSide(coverageScope) && dependentCoPay?.required
                ? formatCopay(dependentCoPay)
                : null
            }
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function BenefitGroupDatapoints({
  coverageScope,
  group,
  serviceCount,
}: {
  coverageScope: BenefitGroupCoverageScope
  group: BenefitGroup
  serviceCount: number
}) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
      <DataPoint label="Coverage Scope" value={coverageScope} />
      <DataPoint
        label="Distribution Type"
        value={
          group.distributionType === "SharedAmount"
            ? "SharedAmount"
            : "IndividualBenefitAmount"
        }
      />
      <DataPoint
        label="Taxable Flag"
        value={group.isTaxable ? "Taxable" : "Not Taxable"}
      />
      <DataPoint
        label="Service Count"
        value={`${serviceCount} ${serviceCount === 1 ? "Service" : "Services"}`}
      />
      <DataPoint
        label="Employee Co-payment"
        value={
          hasEmployeeSide(coverageScope)
            ? formatCopay(group.coPayment)
            : "Not Applicable"
        }
      />
      <DataPoint
        label="Dependent Co-payment"
        value={
          hasDependentSide(coverageScope)
            ? formatCopay(group.dependentCoPayment)
            : "Not Applicable"
        }
      />
    </div>
  )
}

function formatGroupMeta(
  group: BenefitGroup,
  coverageScope: BenefitGroupCoverageScope,
  serviceCount: number
) {
  const distribution =
    group.distributionType === "SharedAmount"
      ? "Shared Amount"
      : "Individual Benefit Amount"

  const segments: string[] = []
  if (hasEmployeeSide(coverageScope)) {
    segments.push(`Employee Group Cap: ${getGroupCap(group, "employee").value}`)
  }
  if (hasDependentSide(coverageScope)) {
    segments.push(`Dependent Group Cap: ${getGroupCap(group, "dependent").value}`)
  }
  segments.push(
    distribution,
    group.isTaxable ? "Taxable" : "Not Taxable",
    `${serviceCount} ${serviceCount === 1 ? "Service" : "Services"}`
  )
  return segments.join(" · ")
}

function RuleSummaryItem({
  helper,
  label,
  value,
}: {
  helper?: string | null
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex min-w-0 items-center gap-1.5">
        <span className="text-body font-semibold text-foreground">{value}</span>
        {helper ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${label} Details`}
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-4xl text-faint transition-colors hover:text-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Info size={13} weight="regular" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64 text-label">
                {helper}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  )
}

function EntitlementMetric({
  coPay,
  helper,
  label,
  value,
}: {
  coPay: string | null
  helper?: string | null
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-label font-medium text-muted-foreground">{label}</p>
        {helper ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${label} Details`}
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-4xl text-faint transition-colors hover:text-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Info size={13} weight="regular" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64 text-label">
                {helper}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-2">
        <p className="text-body font-semibold text-foreground tabular-nums">
          {value}
        </p>
        {coPay ? (
          <span className="rounded-4xl border border-border bg-background px-2 py-0.5 text-label font-medium text-muted-foreground">
            Co-pay: {coPay}
          </span>
        ) : null}
      </div>
    </div>
  )
}
