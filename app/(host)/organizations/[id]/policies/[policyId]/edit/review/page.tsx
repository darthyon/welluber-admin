import { PolicyEditReviewFlow } from "@/components/host/policies/policy-edit-review-flow"

interface OrganizationPolicyEditReviewPageProps {
  params: Promise<{ id: string; policyId: string }>
}

export default async function OrganizationPolicyEditReviewPage({ params }: OrganizationPolicyEditReviewPageProps) {
  const { id, policyId } = await params
  return <PolicyEditReviewFlow policyId={policyId} organizationId={id} />
}
