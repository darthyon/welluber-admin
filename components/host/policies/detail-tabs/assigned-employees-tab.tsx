"use client"

import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Users } from "@phosphor-icons/react"
import type { BenefitPolicy } from "@/types/policy"
import type { EmployeeDirectoryItem } from "@/features/employees/types"

interface AssignedEmployeesTabProps {
  policy: BenefitPolicy
  employees?: EmployeeDirectoryItem[]
}

export function AssignedEmployeesTab({ employees }: AssignedEmployeesTabProps) {
  const employeeList = employees ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">
            Assigned Employees
          </h3>
          <p className="mt-1 text-body text-muted-foreground">
            {employeeList.length} employee{employeeList.length !== 1 ? "s" : ""}{" "}
            currently assigned.
          </p>
        </div>
      </div>

      {employeeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-20 text-center">
          <Users size={36} weight="duotone" className="mb-3 text-faint" />
          <p className="text-body font-medium text-muted-foreground">
            No assigned employees
          </p>
          <p className="mt-1 max-w-xs text-label text-faint">
            Employees matching the policy eligibility criteria will appear here
            once assigned.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="grid grid-cols-12 text-label font-semibold text-muted-foreground">
              <span className="col-span-3">Employee</span>
              <span className="col-span-3">Department</span>
              <span className="col-span-2">Tier</span>
              <span className="col-span-2">Join Date</span>
              <span className="col-span-2">Status</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {employeeList.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-muted/20"
              >
                <div className="col-span-3">
                  <p className="text-body font-semibold text-foreground">{emp.name}</p>
                  <p className="font-mono text-label text-faint">{emp.empCode}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-body text-subtle">{emp.department}</span>
                </div>
                <div className="col-span-2">
                  <Badge variant="secondary">{emp.tier}</Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-body text-subtle">{emp.joinDate}</span>
                </div>
                <div className="col-span-2">
                  <StatusBadge
                    status={
                      emp.status === "active"
                        ? "Active"
                        : emp.status === "on-leave"
                          ? "On Leave"
                          : "Inactive"
                    }
                    variant={
                      emp.status === "active"
                        ? "emerald"
                        : emp.status === "on-leave"
                          ? "amber"
                          : "zinc"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
