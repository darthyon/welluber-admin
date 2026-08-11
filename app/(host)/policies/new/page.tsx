import { redirect } from "next/navigation"
import { NewPolicyCreateFlow } from "@/components/host/policies/new-policy-create-flow"

interface NewPolicyPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewPolicyPage({ searchParams }: NewPolicyPageProps) {
  const params = await searchParams
  const source = typeof params.source === "string" ? params.source : undefined
  const orgId = typeof params.orgId === "string" ? params.orgId : undefined

  if (source === "org" && orgId) {
    const nestedParams = new URLSearchParams()
    for (const key of ["template", "clone"]) {
      const value = params[key]
      if (typeof value === "string") nestedParams.set(key, value)
    }
    const query = nestedParams.toString()
    redirect(`/organizations/${encodeURIComponent(orgId)}/policies/new${query ? `?${query}` : ""}`)
  }

  return <NewPolicyCreateFlow />
}
