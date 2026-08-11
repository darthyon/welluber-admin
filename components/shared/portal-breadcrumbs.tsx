"use client"

import { Suspense } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/breadcrumbs"
import {
  ACME_BRANCHES,
  MOCK_BRANDS,
  MOCK_ADMINS,
  MOCK_EMPLOYEES,
  MOCK_MEMBERS,
  MOCK_ORGS,
  MOCK_POLICIES,
  MOCK_SPS,
} from "@/lib/mock-data"

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

  if (previousSegment === "members") {
    return (
      MOCK_MEMBERS.find((member) => member.id === segment)?.name ??
      "Member Details"
    )
  }

  if (previousSegment === "administrators") {
    return (
      MOCK_ADMINS.find((admin) => admin.id === segment)?.name ??
      "Administrator Details"
    )
  }

  if (previousSegment === "brands") {
    return (
      MOCK_BRANDS.find((brand) => brand.id === segment)?.name ??
      "Brand Details"
    )
  }

  if (previousSegment === "policies") {
    return (
      MOCK_POLICIES.find((policy) => policy.id === segment)?.name ??
      "Benefit Policy Details"
    )
  }

  if (previousSegment === "service-providers") {
    return (
      MOCK_SPS.find((provider) => provider.id === segment)?.name ??
      "Service Provider Details"
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

const encode = (value: string) => encodeURIComponent(value)

function contextualHostBreadcrumbs(
  routeSegments: string[],
  contextOrganizationId?: string
) {
  const [resource, resourceId, childResource, childId, action] = routeSegments
  if (!resource || !resourceId) return null

  if (resource === "organizations") {
    const org = MOCK_ORGS.find((candidate) => candidate.id === resourceId)
    const orgName = org?.name ?? "Organization Details"
    const orgHref = `/organizations/${encode(resourceId)}`
    const items: BreadcrumbItem[] = [
      { label: "Organizations", href: "/organizations" },
      { label: orgName, href: orgHref },
    ]

    if (!childResource) return items
    if (childResource === "edit") {
      items.push({ label: "Edit Organization" })
      return items
    }

    const tabLabel =
      childResource === "employees"
        ? "Employees"
        : childResource === "policies"
          ? "Benefit Policies"
          : childResource === "branches"
            ? "Branches"
            : null
    if (!tabLabel) return null

    const tabHref = `${orgHref}?tab=${childResource}`
    items.push({ label: tabLabel, href: tabHref })

    if (!childId) return items
    if (childId === "new") {
      items.push({
        label:
          childResource === "employees"
            ? "Add Employee"
            : childResource === "policies"
              ? "Add Benefit Policy"
              : "Add Branch",
      })
      return items
    }

    if (childResource === "employees") {
      const employee = MOCK_EMPLOYEES.find(
        (candidate) => candidate.id === childId
      )
      items.push({
        label: employee?.name ?? "Employee Details",
        href: `/employees/${encode(childId)}?from=${encode(resourceId)}`,
      })
      if (action === "edit") items.push({ label: "Edit Employee" })
      return items
    }

    if (childResource === "policies") {
      const policy = MOCK_POLICIES.find((candidate) => candidate.id === childId)
      items.push({
        label: policy?.name ?? "Benefit Policy Details",
        href: `/policies/${encode(childId)}?source=org&orgId=${encode(resourceId)}`,
      })
      if (action === "edit") {
        items.push({ label: "Edit Benefit Policy" })
        if (routeSegments[5] === "review") items.push({ label: "Review Changes" })
      }
      return items
    }

    const branch = ACME_BRANCHES.find((candidate) => candidate.id === childId)
    items.push({
      label: branch?.name ?? "Branch Details",
      href: tabHref,
    })
    if (action === "edit") items.push({ label: "Edit Branch" })
    return items
  }

  if (resource === "service-providers") {
    const provider = MOCK_SPS.find((candidate) => candidate.id === resourceId)
    const providerName = provider?.name ?? "Service Provider Details"
    const providerHref = `/service-providers/${encode(resourceId)}`
    const items: BreadcrumbItem[] = [
      { label: "Service Providers", href: "/service-providers" },
      { label: providerName, href: providerHref },
    ]

    if (!childResource) return items
    if (childResource === "edit") {
      items.push({ label: "Edit Service Provider" })
      return items
    }

    if (childResource !== "branches" && childResource !== "voucher-packages") {
      return null
    }

    const tab = childResource === "branches" ? "branches" : "vouchers"
    const tabLabel = childResource === "branches" ? "Branches" : "Voucher Packages"
    const tabHref = `${providerHref}?tab=${tab}`
    items.push({ label: tabLabel, href: tabHref })

    if (!childId) return items
    if (childId === "new") {
      items.push({
        label: childResource === "branches" ? "Add Branch" : "Add Voucher Package",
      })
      return items
    }

    if (childResource === "branches") {
      const branch = provider?.branches.find((candidate) => candidate.id === childId)
      items.push({ label: branch?.name ?? "Branch Details", href: tabHref })
      if (action === "edit") items.push({ label: "Edit Branch" })
      return items
    }

    const voucher = provider?.vouchers.find((candidate) => candidate.id === childId)
    items.push({ label: voucher?.name ?? "Voucher Package Details", href: tabHref })
    if (action === "edit") items.push({ label: "Edit Voucher Package" })
    return items
  }

  if (resource === "employees" && resourceId !== "new") {
    const employee = MOCK_EMPLOYEES.find(
      (candidate) => candidate.id === resourceId
    )
    const contextOrg = contextOrganizationId
      ? MOCK_ORGS.find((candidate) => candidate.id === contextOrganizationId)
      : undefined
    const employeeItems: BreadcrumbItem[] = contextOrg
      ? [
          { label: "Organizations", href: "/organizations" },
          {
            label: contextOrg.name,
            href: `/organizations/${encode(contextOrg.id)}?tab=employees`,
          },
          {
            label: "Employees",
            href: `/organizations/${encode(contextOrg.id)}?tab=employees`,
          },
        ]
      : [{ label: "Employees", href: "/employees" }]
    const items: BreadcrumbItem[] = [
      ...employeeItems,
      {
        label: employee?.name ?? "Employee Details",
        href: contextOrg
          ? `/employees/${encode(resourceId)}?from=${encode(contextOrg.id)}`
          : `/employees/${encode(resourceId)}`,
      },
    ]
    if (childResource === "edit") items.push({ label: "Edit Employee" })
    return items
  }

  if (resource === "policies" && resourceId !== "new") {
    const policy = MOCK_POLICIES.find((candidate) => candidate.id === resourceId)
    const contextOrg = contextOrganizationId
      ? MOCK_ORGS.find((candidate) => candidate.id === contextOrganizationId)
      : undefined
    const policyItems: BreadcrumbItem[] = contextOrg
      ? [
          { label: "Organizations", href: "/organizations" },
          {
            label: contextOrg.name,
            href: `/organizations/${encode(contextOrg.id)}?tab=policies`,
          },
          {
            label: "Benefit Policies",
            href: `/organizations/${encode(contextOrg.id)}?tab=policies`,
          },
        ]
      : [{ label: "Benefit Policies", href: "/policies" }]
    const items: BreadcrumbItem[] = [
      ...policyItems,
      {
        label: policy?.name ?? "Benefit Policy Details",
        href: contextOrg
          ? `/policies/${encode(resourceId)}?source=org&orgId=${encode(contextOrg.id)}`
          : `/policies/${encode(resourceId)}`,
      },
    ]
    if (childResource === "edit") {
      items.push({ label: "Edit Benefit Policy" })
      if (childId === "review") items.push({ label: "Review Changes" })
    }
    return items
  }

  if (resource === "brands" && resourceId !== "new") {
    const brand = MOCK_BRANDS.find((candidate) => candidate.id === resourceId)
    const items: BreadcrumbItem[] = [
      { label: "Brands", href: "/brands" },
      {
        label: brand?.name ?? "Brand Details",
        href: `/brands/${encode(resourceId)}`,
      },
    ]
    if (childResource === "edit") items.push({ label: "Edit Brand" })
    return items
  }

  return null
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

  if (portal === "host") {
    const contextOrganizationId =
      routeSegments[0] === "employees"
        ? searchParams.get("from") ?? undefined
        : searchParams.get("source") === "org"
          ? searchParams.get("orgId") ?? undefined
          : undefined
    const contextualItems = contextualHostBreadcrumbs(
      routeSegments,
      contextOrganizationId
    )
    if (contextualItems) {
      return <Breadcrumbs items={contextualItems} className="mb-6" />
    }
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
