"use client"

import { Suspense } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/breadcrumbs"
import { MOCK_EMPLOYEES, MOCK_ORGS } from "@/lib/mock-data"

type Portal = "host" | "org" | "serviceprovider"

const SEGMENT_LABELS: Record<string, string> = {
  accounts: "Accounts",
  activity: "Activity",
  administrators: "Administrators",
  "audit-log": "Audit Log",
  brands: "Brands",
  branches: "Branches",
  claims: "Claims",
  dashboard: "Dashboard",
  edit: "Edit",
  employees: "Employees",
  groups: "Benefit Groups",
  members: "Members",
  new: "New",
  organizations: "Organizations",
  policies: "Benefit Policy",
  reports: "Reports",
  review: "Review",
  "service-providers": "Service Providers",
  services: "Services",
  settings: "Settings",
  transactions: "Transactions",
  users: "Users",
  versions: "Versions",
  "voucher-packages": "Voucher Packages",
  vouchers: "Vouchers",
}

const DETAIL_LABELS: Record<string, string> = {
  accounts: "Account",
  brands: "Brand",
  branches: "Branch",
  employees: "Employee",
  organizations: "Organization",
  policies: "Benefit Policy",
  "service-providers": "Service Provider",
  services: "Service",
  "voucher-packages": "Voucher Package",
}

function getSegmentLabel(segment: string, previousSegment?: string) {
  if (previousSegment === "employees") {
    return (
      MOCK_EMPLOYEES.find((employee) => employee.id === segment)?.name ??
      "Employee Details"
    )
  }

  if (previousSegment === "organizations") {
    return (
      MOCK_ORGS.find((org) => org.id === segment)?.name ??
      "Organization Details"
    )
  }

  return (
    SEGMENT_LABELS[segment] ??
    (previousSegment ? DETAIL_LABELS[previousSegment] : undefined) ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

function PortalBreadcrumbsInner({ portal }: { portal: Portal }) {
  const pathname = usePathname()
  const params = useParams<{ orgSlug?: string }>()
  const searchParams = useSearchParams()

  const segments = pathname.split("/").filter(Boolean)
  const isOrgPortal = portal === "org" && params.orgSlug === segments[0]
  const routeSegments = isOrgPortal ? segments.slice(1) : segments
  const pathPrefix = isOrgPortal ? `/${params.orgSlug}` : ""
  const items: BreadcrumbItem[] = []

  if (routeSegments.length <= 1) {
    return null
  }

  if (isOrgPortal) {
    items.push({
      label: "Organisation",
      href: `${pathPrefix}/dashboard`,
    })
  }

  // Check if navigating to an employee from a Host Organization context (?from=ORG-123)
  const fromOrgId = searchParams?.get("from")
  if (portal === "host" && routeSegments[0] === "employees" && fromOrgId) {
    const org = MOCK_ORGS.find((o) => o.id === fromOrgId)
    items.push({
      label: "Organizations",
      href: "/organizations",
    })
    items.push({
      label: org?.name ?? "Organization Details",
      href: `/organizations/${fromOrgId}?tab=employees`,
    })
  }

  routeSegments.forEach((segment, index) => {
    const href = `${pathPrefix}/${routeSegments.slice(0, index + 1).join("/")}`
    items.push({
      label: getSegmentLabel(segment, routeSegments[index - 1]),
      href,
    })
  })

  return items.length > 0 ? (
    <Breadcrumbs items={items} className="mb-6" />
  ) : null
}

export function PortalBreadcrumbs({ portal }: { portal: Portal }) {
  return (
    <Suspense fallback={null}>
      <PortalBreadcrumbsInner portal={portal} />
    </Suspense>
  )
}
