import { redirect } from "next/navigation"
import { EmployeeEditFlow } from "@/components/host/employees/employee-edit-flow"

interface EditEmployeePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditEmployeePage({ params, searchParams }: EditEmployeePageProps) {
  const { id } = await params
  const query = await searchParams
  const organizationId = typeof query.from === "string" ? query.from : undefined

  if (organizationId) {
    redirect(`/organizations/${encodeURIComponent(organizationId)}/employees/${encodeURIComponent(id)}/edit`)
  }

  return <EmployeeEditFlow employeeId={id} />
}
