"use client"

import { useParams, useRouter } from "next/navigation"
import {
  Users,
  Envelope,
  Buildings,
  IdentificationCard,
  Shield,
  Calendar,
} from "@phosphor-icons/react"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { StatusBadge } from "@/components/shared/status-badge"
import { BackButton } from "@/components/shared/back-button"
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { Badge } from "@/components/ui/badge"
import { MOCK_EMPLOYEES, MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"
import { routes } from "@/lib/navigation"

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const employeeId = params.employeeId as string

  const employee = MOCK_EMPLOYEES.find((e) => e.id === employeeId)
  const utilisation = MOCK_EMPLOYEE_UTILISATION.filter((r) => r.id === employeeId)

  if (!employee) {
    return (
      <div className="space-y-4">
        <BackButton label="Employees" onClick={() => router.push(routes.org.employees(orgSlug))} />
        <p className="text-muted-foreground">Employee not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <BackButton label="Employees" onClick={() => router.push(routes.org.employees(orgSlug))} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{employee.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-label font-mono text-faint">{employee.empCode}</span>
            <StatusBadge
              status={employee.status}
              variant={employee.status === "Linked" ? "emerald" : "amber"}
            />
          </div>
        </div>
      </div>

      {/* Profile */}
      <DetailSection title="Employee Profile" icon={<Users size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Full Name"
            value={employee.name}
            icon={<Users size={14} weight="duotone" />}
          />
          <DetailField
            label="Email"
            value={employee.email}
            icon={<Envelope size={14} weight="duotone" />}
          />
          <DetailField
            label="Branch"
            value={employee.branch}
            icon={<Buildings size={14} weight="duotone" />}
          />
          <DetailField
            label="Department"
            value={employee.department}
          />
          <DetailField
            label="Tier"
            value={employee.tier}
            icon={<IdentificationCard size={14} weight="duotone" />}
          />
          <DetailField
            label="Employment Type"
            value={EMPLOYMENT_TYPE_LABELS[employee.employmentType ?? ""] ?? employee.employmentType ?? "—"}
          />
          <DetailField
            label="Joined"
            value={employee.joinDate}
            icon={<Calendar size={14} weight="duotone" />}
          />
          <DetailField
            label="Last Active"
            value={employee.lastActive}
          />
        </div>
      </DetailSection>

      {/* Benefit Policies */}
      <DetailSection title="Benefit Policies" icon={<Shield size={16} weight="duotone" />}>
        {employee.benefitPolicies.length === 0 ? (
          <p className="text-body text-muted-foreground py-4">No benefit policies assigned.</p>
        ) : (
          <div className="space-y-3">
            {employee.benefitPolicies.map((pol) => (
              <div
                key={pol.policyId}
                className="flex items-start justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="text-body font-semibold text-foreground">{pol.policyName}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {pol.benefitGroups.length > 0 ? (
                      pol.benefitGroups.map((g) => (
                        <Badge key={g} variant="secondary" className="text-label">{g}</Badge>
                      ))
                    ) : (
                      <span className="text-label text-faint">No groups assigned</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-label font-medium text-subtle">Utilisation</p>
                  <p className="text-body font-semibold text-foreground tabular-nums">{pol.utilisation}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      {/* Claims */}
      {utilisation.length > 0 && (
        <DetailSection title="Claims History" icon={<Shield size={16} weight="duotone" />} ghost>
          <UtilisationClaimsTable data={utilisation} />
        </DetailSection>
      )}
    </div>
  )
}
