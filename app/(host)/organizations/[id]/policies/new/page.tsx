import { redirect } from "next/navigation";

export default async function NewOrgPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/policies/new?source=org&orgId=${encodeURIComponent(id)}`);
}
