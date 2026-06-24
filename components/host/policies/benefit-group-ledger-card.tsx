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
  const employeeCap = getGroupCap(group, "employee")
  const dependentCap = getGroupCap(group, "dependent")

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <RuleSummaryItem
            label="Employee Group Cap"
            value={
              hasEmployeeSide(coverageScope)
                ? employeeCap.value
                : "Not Applicable"
            }
            helper={hasEmployeeSide(coverageScope) ? employeeCap.helper : null}
          />
          <RuleSummaryItem
            label="Dependent Group Cap"
            value={
              hasDependentSide(coverageScope)
                ? dependentCap.value
                : "Not Applicable"
            }
            helper={hasDependentSide(coverageScope) ? dependentCap.helper : null}
          />
          <RuleSummaryItem
            label="Utilisation"
            value={getEffectiveUtilisation(policy, group)}
          />
          <RuleSummaryItem
            label="Refresh"
            value={`${getEffectiveRefresh(policy, group)} Refresh`}
          />
        </div>

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
              <span className="flex items-center gap-2">
                <TreeStructure size={14} weight="duotone" />
                Additional Details
              </span>
              <CaretDown
                size={14}
                className="transition-transform group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border px-4 pt-4 pb-4">
              <p className="mb-4 text-label text-faint">
                Inherited from this benefit group. Individual services can
                override amounts and co-pays.
              </p>
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
      <p className="mb-3 border-b border-border pb-2 text-label font-semibold tracking-wide text-muted-foreground uppercase">
        Services
      </p>
      {benefits.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-label text-faint">
          No benefits configured for this group.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {benefits.map((benefit) => (
            <ServiceCard
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

function ServiceCard({
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
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {getMainServiceIcon(benefit.serviceId)}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-body font-semibold text-foreground">
            {getMainServiceName(benefit.serviceId)}
          </p>
          <TechnicalBadge>
            {resolveMainServiceId(benefit.serviceId)}
          </TechnicalBadge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EntitlementMetric
          label="Employee"
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
    </div>
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
  return [
    formatCoverageScope(coverageScope),
    distribution,
    group.isTaxable ? "Taxable" : "Not Taxable",
    `${serviceCount} ${serviceCount === 1 ? "Service" : "Services"}`,
  ].join(" · ")
}

function formatCoverageScope(scope: BenefitGroupCoverageScope) {
  if (scope === "Both") return "Employee + Dependent"
  if (scope === "Dependent") return "Dependent Only"
  return "Employee Only"
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
  label,
  value,
}: {
  coPay: string | null
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-label font-medium text-muted-foreground">{label}</p>
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
