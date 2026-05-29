"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DetailSection } from "@/components/shared/detail-section"
import { BenefitGroupSnapshot } from "@/components/host/policies/benefit-group-snapshot"
import { NotePencil, TreeStructure } from "@phosphor-icons/react"
import { getMainServiceIcon } from "./policy-detail-helpers"
import { getMainServiceName } from "@/lib/mock-data/service-catalog"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface BenefitGroupsTabProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
}

export function BenefitGroupsTab({ policy, groups, benefits }: BenefitGroupsTabProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <DetailSection
        title="Benefit Groups"
        icon={<TreeStructure size={18} weight="duotone" />}
        description="Benefits and amounts configured per group"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem(
                  `policy-groups-draft-${policy.id}`,
                  JSON.stringify({ policy, groups, benefits })
                )
              }
              router.push(`/policies/${policy.id}/groups/edit`)
            }}
            className="flex h-8 items-center gap-2 text-label font-medium"
          >
            <NotePencil size={14} weight="bold" />
            Edit Groups
          </Button>
        }
      >
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-16">
            <TreeStructure size={36} weight="duotone" className="mb-3 text-faint" />
            <p className="text-body font-medium text-muted-foreground">
              No benefit groups configured.
            </p>
            <p className="mt-1 text-label text-faint">
              Add groups to define which benefits are available.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    `policy-groups-draft-${policy.id}`,
                    JSON.stringify({ policy, groups, benefits })
                  )
                }
                router.push(`/policies/${policy.id}/groups/edit`)
              }}
              className="mt-3 font-semibold text-primary"
            >
              <NotePencil size={14} weight="bold" className="mr-1.5" />
              Add Groups
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const groupBenefits = benefits.filter((b) => b.groupId === group.id)
              const coverageScope = group.coverageScope ?? "Employee"
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-lg border border-border bg-card/40"
                >
                  <div className="border-b border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-body font-semibold text-foreground">
                              {group.name}
                            </p>
                          </div>
                          {group.description && (
                            <p className="truncate text-label text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                          <BenefitGroupSnapshot
                            policy={policy}
                            group={group}
                            benefits={groupBenefits}
                            variant="inline"
                            className="mt-3"
                          />
                        </div>
                      </div>
                      <Badge variant="outline">
                        {groupBenefits.length}{" "}
                        {groupBenefits.length === 1 ? "Service" : "Services"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    {groupBenefits.map((benefit) => {
                      const employeeCoPay =
                        group.distributionType === "SharedAmount"
                          ? group.coPayment
                          : benefit.coPayment
                      const dependentCoPay =
                        group.distributionType === "SharedAmount"
                          ? group.dependentCoPayment
                          : benefit.dependentCoPayment
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
                          className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            {getMainServiceIcon(benefit.serviceId)}
                            <span className="text-body font-medium text-foreground">
                              {getMainServiceName(benefit.serviceId)}
                            </span>
                            {coverageScope !== "Dependent" && employeeCoPay?.required && (
                              <Badge variant="secondary">
                                Employee Co-pay{" "}
                                {employeeCoPay.type === "Percentage"
                                  ? `${employeeCoPay.value}%`
                                  : `RM ${employeeCoPay.value}`}
                              </Badge>
                            )}
                            {coverageScope !== "Employee" && dependentCoPay?.required && (
                              <Badge variant="secondary">
                                Dependent Co-pay{" "}
                                {dependentCoPay.type === "Percentage"
                                  ? `${dependentCoPay.value}%`
                                  : `RM ${dependentCoPay.value}`}
                              </Badge>
                            )}
                          </div>
                          {coverageScope === "Both" ? (
                            <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                              RM {employeeAmount.toFixed(2)} / RM {dependentAmount.toFixed(2)}
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
                      )
                    })}
                    {groupBenefits.length === 0 && (
                      <p className="py-4 text-center text-label text-faint italic">
                        No benefits configured for this group.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DetailSection>
    </div>
  )
}
