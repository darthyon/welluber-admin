import { EmployeeEditFlow } from "@/components/host/employees/employee-edit-flow"

interface OrganizationEmployeeEditPageProps {
  params: Promise<{ id: string; employeeId: string }>
}

export default async function OrganizationEmployeeEditPage({ params }: OrganizationEmployeeEditPageProps) {
  const { id, employeeId } = await params
  return (
    <EmployeeEditFlow
      employeeId={employeeId}
      returnPath={`/organizations/${encodeURIComponent(id)}?tab=employees`}
    />
  )
}
