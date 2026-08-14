import { EmployeeEditFlow } from "@/components/host/employees/employee-edit-flow"
import { redirect } from "next/navigation"
import { MOCK_EMPLOYEES } from "@/lib/mock-data"

interface OrganizationEmployeeEditPageProps {
  params: Promise<{ id: string; employeeId: string }>
}

export default async function OrganizationEmployeeEditPage({ params }: OrganizationEmployeeEditPageProps) {
  const { id, employeeId } = await params

  if (!MOCK_EMPLOYEES.some((employee) => employee.id === employeeId)) {
    redirect(`/organizations/${encodeURIComponent(id)}?tab=employees`)
  }

  return (
    <EmployeeEditFlow
      employeeId={employeeId}
      returnPath={`/organizations/${encodeURIComponent(id)}?tab=employees`}
    />
  )
}
