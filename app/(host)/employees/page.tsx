"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Users } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { EmptyState } from "@/components/shared/empty-state"
import { EmployeeCard } from "@/components/host/organizations/employee-card"
import {
  EmployeeDirectoryTable,
  MOCK_EMPLOYEES,
} from "@/components/host/employees/employee-directory-table"

const ORGANIZATION_OPTIONS = [
  { label: "All", value: "all" },
  ...Array.from(new Set(MOCK_EMPLOYEES.map((e) => e.organization))).map(
    (org) => ({ label: org, value: org })
  ),
]

export default function EmployeesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [orgFilter, setOrgFilter] = useState("all")

  const filteredData = useMemo(() => {
    let result = MOCK_EMPLOYEES
    if (orgFilter !== "all") {
      result = result.filter((emp) => emp.organization === orgFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.empCode.toLowerCase().includes(q) ||
          emp.branch.toLowerCase().includes(q) ||
          emp.organization.toLowerCase().includes(q) ||
          emp.department?.toLowerCase().includes(q)
      )
    }
    return result
  }, [searchQuery, orgFilter])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading font-semibold text-foreground">Employees</h1>
          <p className="text-body text-subtle">
            Global employee directory across all organisations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Link href="/employees/new">
            <Button size="sm" variant="secondary" className="h-9 text-label gap-2">
              <Plus size={14} weight="bold" /> Add Employee
            </Button>
          </Link>
        </div>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employees..."
        filters={
          <FilterItem
            label="Organization"
            value={orgFilter}
            onChange={setOrgFilter}
            options={ORGANIZATION_OPTIONS}
          />
        }
      />

      {filteredData.length === 0 ? (
        <EmptyState
          icon={<Users size={32} weight="light" />}
          title="No employees found"
          description="Try adjusting your search or add a new employee."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredData.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={{
                id: emp.id,
                name: emp.name,
                email: emp.email,
                organization: emp.organization,
                branch: emp.branch,
                status: emp.status,
                employeeId: emp.id,
                empCode: emp.empCode,
                joinDate: emp.joinDate,
                department: emp.department,
                tier: emp.tier,
                benefitPolicies: emp.benefitPolicies,
                dependentsCount: 0,
              }}
              onView={(id) => router.push(`/employees/${id}`)}
              onEdit={(id) => router.push(`/employees/${id}/edit`)}
            />
          ))}
        </div>
      ) : (
        <EmployeeDirectoryTable
          data={filteredData}
          onRowClick={(emp) => router.push(`/employees/${emp.id}`)}
          onView={(id) => router.push(`/employees/${id}`)}
          onEdit={(id) => router.push(`/employees/${id}/edit`)}
        />
      )}
    </div>
  )
}
