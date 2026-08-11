import { EmployeeCreateFlow } from "@/components/host/employees/employee-create-flow"

interface OrgNewEmployeePageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function OrgNewEmployeePage({ params }: OrgNewEmployeePageProps) {
  const { orgSlug } = await params
  return <EmployeeCreateFlow returnPath={`/${orgSlug}/employees`} />
}
