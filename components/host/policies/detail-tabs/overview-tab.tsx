"use client"

import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import {
  IdentificationCard,
  Gear,
  Users,
} from "@phosphor-icons/react"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface OverviewTabProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  onEdit: () => void
}

export function OverviewTab({ policy }: OverviewTabProps) {
  const refreshLabels: Record<string, string> = {
    financial_year: "Financial Year",
    calendar_year: "Calendar Year",
  }

  return (
    <div className="space-y-6">
      <DetailSection
        title="Policy Overview"
        icon={<IdentificationCard size={18} weight="duotone" />}
        description="Basic information and configuration"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Policy Name" value={policy.name} />
          <DetailField label="Policy Code" value={policy.code || "—"} />
          <DetailField
            label="Status"
            value={<span className="capitalize">{policy.status}</span>}
          />
          <DetailField label="Organisation" value={policy.organizationId} />
          <div className="col-span-2 md:col-span-4">
            <DetailField label="Description" value={policy.description || "—"} />
          </div>
          <div className="col-span-2 md:col-span-4">
            <DetailField
              label="Employment Types"
              value={policy.eligibleEmploymentTypes
                .map((t) =>
                  t
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")
                )
                .join(", ")}
            />
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title="Pool & Cycle"
        icon={<Gear size={18} weight="duotone" />}
        description="Fund allocation and refresh configuration"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField
            label="Dependents"
            value={
              (policy.dependentCoverages?.length ?? 0) > 0
                ? "Covered"
                : "Employee Only"
            }
          />
          {(policy.dependentCoverages?.length ?? 0) > 0 && (
            <DetailField
              label="Dependent Types"
              value={
                policy.dependentCoverages
                  ?.map((c) =>
                    c.type === "spouse"
                      ? "Spouse"
                      : c.type === "child"
                        ? "Child"
                        : c.type === "mother"
                          ? "Mother"
                          : c.type === "father"
                            ? "Father"
                            : c.type === "sibling"
                              ? "Sibling"
                              : "In-law"
                  )
                  .join(", ") || "—"
              }
            />
          )}
          {(policy.dependentCoverages?.length ?? 0) > 0 && (
            <DetailField
              label="Dependents Pool Type"
              value={
                policy.dependentsPoolType === "SharedWithEmployee"
                  ? "Shared with Employee"
                  : policy.dependentsPoolType || "—"
              }
            />
          )}
          <DetailField
            label="Utilisation Mode"
            value={
              policy.utilisationMode === "Fixed"
                ? "Fixed Allocation"
                : "Prorated Allocation"
            }
          />
          {policy.utilisationMode === "Prorated" && (
            <DetailField label="Prorate Unit" value={policy.prorateUnit || "—"} />
          )}
          <DetailField label="Refresh Cycle" value={policy.refreshCycle} />
          <DetailField
            label="Start Reference"
            value={
              refreshLabels[policy.refreshStartReference] ||
              policy.refreshStartReference
            }
          />
          {policy.refreshStartMonth && (
            <DetailField
              label="Start Month"
              value={
                [
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ][policy.refreshStartMonth - 1] ?? "—"
              }
            />
          )}
        </div>
      </DetailSection>

      {policy.eligibility && (
        <DetailSection
          title="Employee Eligibility"
          icon={<Users size={18} weight="duotone" />}
          description="Filter criteria for automatic employee assignment"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            <DetailField
              label="Age Range"
              value={
                policy.eligibility.minAge || policy.eligibility.maxAge
                  ? `${policy.eligibility.minAge || "Any"} — ${policy.eligibility.maxAge || "Any"}`
                  : "Any age"
              }
            />
            <DetailField
              label="Gender"
              value={
                <span className="capitalize">
                  {policy.eligibility.gender || "All"}
                </span>
              }
            />
            <DetailField
              label="Tier Restrictions"
              value={
                policy.eligibility.tierIds?.length
                  ? `${policy.eligibility.tierIds.length} tier(s)`
                  : "None"
              }
            />
          </div>
        </DetailSection>
      )}
    </div>
  )
}
