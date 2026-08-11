import { redirect } from "next/navigation"
import { EmployeeCreateFlow } from "@/components/host/employees/employee-create-flow"

interface NewEmployeePageProps {
  searchParams: Promise<{ org?: string }>
}

export default async function NewEmployeePage({ searchParams }: NewEmployeePageProps) {
  const params = await searchParams
  if (params.org) redirect(`/organizations/${encodeURIComponent(params.org)}/employees/new`)
  return <EmployeeCreateFlow />
}
