import { EmployeeCreateFlow } from "@/components/host/employees/employee-create-flow"

interface OrganizationNewEmployeePageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationNewEmployeePage({ params }: OrganizationNewEmployeePageProps) {
  const { id } = await params
  return <EmployeeCreateFlow returnPath={`/organizations/${id}?tab=employees`} />
}
