import { NewPolicyCreateFlow } from "@/components/host/policies/new-policy-create-flow"

interface OrganizationNewPolicyPageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationNewPolicyPage({ params }: OrganizationNewPolicyPageProps) {
  const { id } = await params
  return <NewPolicyCreateFlow organizationId={id} />
}
