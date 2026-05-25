"use client"

import { useParams, useRouter } from "next/navigation"
import {
  Shield,
  IdentificationCard,
  TreeStructure,
  Users,
  Calendar,
  Tag,
} from "@phosphor-icons/react"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { StatusBadge } from "@/components/shared/status-badge"
import { BackButton } from "@/components/shared/back-button"
import { Badge } from "@/components/ui/badge"
import { routes } from "@/lib/navigation"

type BenefitGroup = {
  id: string
  name: string
  category: string
  monthlyLimit: number
  yearlyLimit: number
}

type PolicyRow = {
  id: string
  name: string
  code: string
  version?: string
  type: string
  assignedTo: string
  status: "draft" | "active" | "deactivated"
  employeeCount: number
  lastUpdated: string
  description?: string
  benefitGroups?: BenefitGroup[]
}

const ACME_POLICIES: PolicyRow[] = [
  {
    id: "pol_1",
    name: "Acme Employee Wellness Policy FY2026",
    code: "BEN-STD-01",
    version: "V1.1",
    type: "Wellness",
    assignedTo: "All Branches",
    status: "active",
    employeeCount: 1240,
    lastUpdated: "24 Mar 2026",
    description: "Standard wellness policy covering gym, nutrition, and mental health benefits for all Acme employees.",
    benefitGroups: [
      { id: "bg_1", name: "Gym & Fitness", category: "Wellness", monthlyLimit: 200, yearlyLimit: 2400 },
      { id: "bg_2", name: "Nutrition & Dietetics", category: "Wellness", monthlyLimit: 150, yearlyLimit: 1800 },
      { id: "bg_3", name: "Mental Health", category: "Wellness", monthlyLimit: 100, yearlyLimit: 1200 },
    ],
  },
  {
    id: "pol_2",
    name: "Acme Leadership Benefits Policy FY2026",
    code: "BEN-EXC-02",
    version: "V2.0",
    type: "Lifestyle",
    assignedTo: "Subang Jaya",
    status: "active",
    employeeCount: 450,
    lastUpdated: "02 Apr 2026",
    description: "Enhanced lifestyle benefits for leadership team members at the Subang Jaya branch.",
    benefitGroups: [
      { id: "bg_4", name: "Premium Gym", category: "Lifestyle", monthlyLimit: 400, yearlyLimit: 4800 },
      { id: "bg_5", name: "Wellness Retreats", category: "Lifestyle", monthlyLimit: 300, yearlyLimit: 3600 },
    ],
  },
]

const STATUS_VARIANT = {
  active: "emerald",
  draft: "amber",
  deactivated: "zinc",
} as const

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const policyId = params.policyId as string

  const policy = ACME_POLICIES.find((p) => p.id === policyId)

  if (!policy) {
    return (
      <div className="space-y-4">
        <BackButton label="Benefit Policies" onClick={() => router.push(routes.org.policies(orgSlug))} />
        <p className="text-muted-foreground">Policy not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <BackButton label="Benefit Policies" onClick={() => router.push(routes.org.policies(orgSlug))} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{policy.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-label font-mono text-faint">{policy.code}</span>
            {policy.version && (
              <Badge variant="outline" className="text-label font-mono">{policy.version}</Badge>
            )}
            <StatusBadge
              status={policy.status}
              variant={STATUS_VARIANT[policy.status]}
            />
          </div>
        </div>
      </div>

      {/* Policy Details */}
      <DetailSection title="Policy Details" icon={<Shield size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Policy Code"
            value={policy.code}
            icon={<IdentificationCard size={14} weight="duotone" />}
          />
          <DetailField
            label="Type"
            value={policy.type}
            icon={<Tag size={14} weight="duotone" />}
          />
          <DetailField
            label="Scope"
            value={policy.assignedTo}
            icon={<TreeStructure size={14} weight="duotone" />}
          />
          <DetailField
            label="Assigned Employees"
            value={policy.employeeCount.toLocaleString()}
            icon={<Users size={14} weight="duotone" />}
          />
          <DetailField
            label="Last Updated"
            value={policy.lastUpdated}
            icon={<Calendar size={14} weight="duotone" />}
          />
          {policy.version && (
            <DetailField
              label="Version"
              value={policy.version}
            />
          )}
        </div>
        {policy.description && (
          <p className="text-body text-muted-foreground mt-4">{policy.description}</p>
        )}
      </DetailSection>

      {/* Benefit Groups */}
      {policy.benefitGroups && policy.benefitGroups.length > 0 && (
        <DetailSection title="Benefit Groups" icon={<Shield size={16} weight="duotone" />}>
          <div className="space-y-3">
            {policy.benefitGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-body font-semibold text-foreground">{group.name}</p>
                  <p className="text-label text-faint">{group.category}</p>
                </div>
                <div className="text-right shrink-0 ml-4 space-y-0.5">
                  <p className="text-label font-medium text-subtle">Monthly / Yearly</p>
                  <p className="text-body font-semibold text-foreground tabular-nums">
                    RM {group.monthlyLimit.toLocaleString()} / RM {group.yearlyLimit.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  )
}
