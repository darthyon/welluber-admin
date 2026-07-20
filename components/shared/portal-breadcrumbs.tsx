"use client"

import { useParams, usePathname } from "next/navigation"
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/breadcrumbs"

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
  employees: "Employee Directory",
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

const MANUAL_BREADCRUMB_PATHS = [
  /^\/accounts\/[^/]+$/,
  /^\/organizations\/[^/]+$/,
  /^\/service-providers\/[^/]+$/,
  /^\/services\/[^/]+$/,
  /^\/voucher-packages\/[^/]+\/vouchers$/,
]

function getSegmentLabel(segment: string, previousSegment?: string) {
  return (
    SEGMENT_LABELS[segment] ??
    (previousSegment ? DETAIL_LABELS[previousSegment] : undefined) ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

export function PortalBreadcrumbs({ portal }: { portal: Portal }) {
  const pathname = usePathname()
  const params = useParams<{ orgSlug?: string }>()

  if (
    portal === "host" &&
    MANUAL_BREADCRUMB_PATHS.some((path) => path.test(pathname))
  ) {
    return null
  }

  const segments = pathname.split("/").filter(Boolean)
  const isOrgPortal = portal === "org" && params.orgSlug === segments[0]
  const routeSegments = isOrgPortal ? segments.slice(1) : segments
  const pathPrefix = isOrgPortal ? `/${params.orgSlug}` : ""
  const items: BreadcrumbItem[] = []

  if (isOrgPortal) {
    items.push({
      label: "Organization Portal",
      href: `${pathPrefix}/dashboard`,
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
