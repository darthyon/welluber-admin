import { MOCK_ORGS } from "@/lib/mock-data"

const ORG_BY_SLUG: Record<string, string> = {
  "acme-corporation": "ORG-20260115-0001",
}

export function getOrganizationBySlug(slug: string) {
  const organizationId = ORG_BY_SLUG[slug]
  return organizationId
    ? MOCK_ORGS.find((organization) => organization.id === organizationId) ?? null
    : null
}
