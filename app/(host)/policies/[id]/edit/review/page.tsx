import { redirect } from "next/navigation"
import { PolicyEditReviewFlow } from "@/components/host/policies/policy-edit-review-flow"

interface EditPolicyReviewPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditPolicyReviewPage({ params, searchParams }: EditPolicyReviewPageProps) {
  const { id } = await params
  const query = await searchParams
  const source = typeof query.source === "string" ? query.source : undefined
  const organizationId = typeof query.orgId === "string" ? query.orgId : undefined

  if (source === "org" && organizationId) {
    redirect(`/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(id)}/edit/review`)
  }

  return <PolicyEditReviewFlow policyId={id} />
}
