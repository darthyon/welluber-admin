"use client"

import { Badge } from "@/components/ui/badge"
import {
  getMainServiceName,
  resolveMainServiceId,
} from "@/lib/mock-data/service-catalog"
import { TreeStructure } from "@phosphor-icons/react"
import type { Benefit, BenefitGroup } from "@/types/policy"
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
  type PolicyWithDisplayFields,
} from "./policy-datapoint-helpers"
import {
  ContractSection,
  DataGrid,
  DataPoint,
  ScopeBadge,
  TechnicalBadge,
} from "./policy-datapoint-ui"

interface BenefitGroupsContractSectionProps {
  policy: PolicyWithDisplayFields
  groups: BenefitGroup[]
  benefits: Benefit[]
}

export function BenefitGroupsContractSection({
  policy,
  groups,
  benefits,
}: BenefitGroupsContractSectionProps) {
  return (
    <ContractSection
      title="Benefit Groups"
      description="Group caps, taxable state, copayments, and service amounts"
      icon={<TreeStructure size={18} weight="duotone" />}
    >
      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/10 py-8 text-center text-body font-medium text-muted-foreground">
          No benefit groups configured.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((group) => (
            <BenefitGroupContract
              key={group.id}
              policy={policy}
              group={group}
              benefits={benefits.filter(
                (benefit) => benefit.groupId === group.id
              )}
            />
          ))}
        </div>
      )}
    </ContractSection>
  )
}

function BenefitGroupContract({
  policy,
  group,
  benefits,
}: {
  policy: PolicyWithDisplayFields
  group: BenefitGroup
  benefits: Benefit[]
}) {
  const scope = group.coverageScope ?? "Employee"
  const employeeCap = getGroupCap(group, "employee")
  const dependentCap = getGroupCap(group, "dependent")

  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="space-y-3">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <h4 className="text-lead font-semibold text-foreground">
              {group.name}
            </h4>
            {group.description ? (
              <p className="mt-0.5 text-label text-muted-foreground">
                {group.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <ScopeBadge>{scope}</ScopeBadge>
            <ScopeBadge>
              {group.distributionType === "SharedAmount"
                ? "SharedAmount"
                : "IndividualBenefitAmount"}
            </ScopeBadge>
            <Badge
              variant={group.isTaxable ? "secondary" : "outline"}
              className="rounded-4xl"
            >
              {group.isTaxable ? "Taxable" : "Not Taxable"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ScopeBadge>{getEffectiveUtilisation(policy, group)}</ScopeBadge>
          <ScopeBadge>{getEffectiveRefresh(policy, group)} Refresh</ScopeBadge>
          <ScopeBadge>
            {benefits.length} {benefits.length === 1 ? "Service" : "Services"}
          </ScopeBadge>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        <DataGrid>
          <DataPoint
            label="Employee Coverage"
            value={hasEmployeeSide(scope) ? "Covered" : "Not Covered"}
            helper={
              !hasEmployeeSide(scope)
                ? "Group scope excludes employees."
                : undefined
            }
          />
          <DataPoint
            label="Employee Group Cap"
            value={
              hasEmployeeSide(scope) ? employeeCap.value : "Not Applicable"
            }
            helper={
              hasEmployeeSide(scope)
                ? employeeCap.helper
                : "Group scope excludes employees."
            }
          />
          <DataPoint
            label="Employee Co-payment"
            value={
              hasEmployeeSide(scope)
                ? formatCopay(group.coPayment)
                : "Not Applicable"
            }
          />
          <DataPoint
            label="Dependent Coverage"
            value={hasDependentSide(scope) ? "Covered" : "Not Covered"}
            helper={
              !hasDependentSide(scope)
                ? "Group scope excludes dependents."
                : undefined
            }
          />
          <DataPoint
            label="Dependent Group Cap"
            value={
              hasDependentSide(scope) ? dependentCap.value : "Not Applicable"
            }
            helper={
              hasDependentSide(scope)
                ? dependentCap.helper
                : "Group scope excludes dependents."
            }
          />
          <DataPoint
            label="Dependent Co-payment"
            value={
              hasDependentSide(scope)
                ? formatCopay(group.dependentCoPayment)
                : "Not Applicable"
            }
          />
        </DataGrid>

        <ServiceAmountGrid group={group} scope={scope} benefits={benefits} />
      </div>
    </div>
  )
}

function ServiceAmountGrid({
  benefits,
  group,
  scope,
}: {
  benefits: Benefit[]
  group: BenefitGroup
  scope: BenefitGroup["coverageScope"]
}) {
  return (
    <div>
      <div className="grid grid-cols-12 gap-3 border-y border-border py-2 text-label font-medium text-muted-foreground">
        <span className="col-span-4">Service</span>
        <span className="col-span-2">Employee Amount</span>
        <span className="col-span-2">Dependent Amount</span>
        <span className="col-span-2">Employee Co-pay</span>
        <span className="col-span-2">Dependent Co-pay</span>
      </div>
      <div className="divide-y divide-border/50">
        {benefits.length === 0 ? (
          <p className="py-5 text-center text-label text-faint">
            No services configured.
          </p>
        ) : (
          benefits.map((benefit) => (
            <ServiceAmountRow
              key={benefit.id}
              group={group}
              benefit={benefit}
              scope={scope}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ServiceAmountRow({
  benefit,
  group,
  scope,
}: {
  benefit: Benefit
  group: BenefitGroup
  scope: BenefitGroup["coverageScope"]
}) {
  const serviceCode = resolveMainServiceId(benefit.serviceId)

  return (
    <div className="grid grid-cols-12 items-center gap-3 py-3">
      <div className="col-span-4 min-w-0">
        <p className="truncate text-body font-medium text-foreground">
          {getMainServiceName(benefit.serviceId)}
        </p>
        <TechnicalBadge>{serviceCode}</TechnicalBadge>
      </div>
      <span className="col-span-2 font-mono text-body font-medium text-foreground tabular-nums">
        {hasEmployeeSide(scope)
          ? formatRM(getBenefitAmount(benefit, "employee"))
          : "Not Applicable"}
      </span>
      <span className="col-span-2 font-mono text-body font-medium text-foreground tabular-nums">
        {hasDependentSide(scope)
          ? formatRM(getBenefitAmount(benefit, "dependent"))
          : "Not Applicable"}
      </span>
      <span className="col-span-2 text-body font-medium text-foreground">
        {hasEmployeeSide(scope)
          ? formatCopay(getServiceCopay(group, benefit, "employee"))
          : "Not Applicable"}
      </span>
      <span className="col-span-2 text-body font-medium text-foreground">
        {hasDependentSide(scope)
          ? formatCopay(getServiceCopay(group, benefit, "dependent"))
          : "Not Applicable"}
      </span>
    </div>
  )
}
