import { redirect } from "next/navigation"
import { PolicyEditFlow } from "@/components/host/policies/policy-edit-flow"

interface EditPolicyPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditPolicyPage({ params, searchParams }: EditPolicyPageProps) {
  const { id } = await params
  const query = await searchParams
  const source = typeof query.source === "string" ? query.source : undefined
  const organizationId = typeof query.orgId === "string" ? query.orgId : undefined

  if (source === "org" && organizationId) {
    redirect(`/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(id)}/edit`)
  }

  return <PolicyEditFlow policyId={id} />
}
