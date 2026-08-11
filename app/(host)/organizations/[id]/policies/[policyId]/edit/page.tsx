import { PolicyEditFlow } from "@/components/host/policies/policy-edit-flow"

interface OrganizationPolicyEditPageProps {
  params: Promise<{ id: string; policyId: string }>
}

export default async function OrganizationPolicyEditPage({ params }: OrganizationPolicyEditPageProps) {
  const { id, policyId } = await params
  return <PolicyEditFlow policyId={policyId} organizationId={id} />
}
