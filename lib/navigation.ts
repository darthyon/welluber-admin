/**
 * Navigation types and utilities.
 *
 * The actual navigation config (sidebar items per persona) lives in
 * components/shared/app-sidebar.tsx since it references Phosphor icon
 * components which must stay within the 'use client' boundary.
 *
 * This file can be used for:
 * - Shared navigation type exports
 * - Route path constants
 * - Breadcrumb utilities
 */

export const routes = {
  host: {
    dashboard: "/dashboard",
    organizations: "/organizations",
    providers: "/providers",
    users: "/users",
    policies: "/policies",
    accounts: "/accounts",
    transactions: "/transactions",
    settings: "/settings",
    create: {
      organization: "/organizations/new",
      employee: "/employees/new",
      employeeForOrganization: (organizationId: string) => `/organizations/${encodeURIComponent(organizationId)}/employees/new`,
      policy: "/policies/new",
      policyForOrganization: (organizationId: string) => `/organizations/${encodeURIComponent(organizationId)}/policies/new`,
      serviceProvider: "/service-providers/new",
      branchForServiceProvider: (serviceProviderId: string) => `/service-providers/${encodeURIComponent(serviceProviderId)}/branches/new`,
      voucherPackageForProvider: (serviceProviderId: string) => `/service-providers/${encodeURIComponent(serviceProviderId)}/voucher-packages/new`,
    },
    edit: {
      employee: (employeeId: string) => `/employees/${encodeURIComponent(employeeId)}/edit`,
      employeeForOrganization: (organizationId: string, employeeId: string) => `/organizations/${encodeURIComponent(organizationId)}/employees/${encodeURIComponent(employeeId)}/edit`,
      organization: (organizationId: string) => `/organizations/${encodeURIComponent(organizationId)}/edit`,
      policy: (policyId: string) => `/policies/${encodeURIComponent(policyId)}/edit`,
      policyForOrganization: (organizationId: string, policyId: string) => `/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(policyId)}/edit`,
      policyReview: (policyId: string) => `/policies/${encodeURIComponent(policyId)}/edit/review`,
      policyReviewForOrganization: (organizationId: string, policyId: string) => `/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(policyId)}/edit/review`,
      serviceProvider: (serviceProviderId: string) => `/service-providers/${encodeURIComponent(serviceProviderId)}/edit`,
      branchForServiceProvider: (serviceProviderId: string, branchId: string) => `/service-providers/${encodeURIComponent(serviceProviderId)}/branches/${encodeURIComponent(branchId)}/edit`,
      voucherPackageForProvider: (serviceProviderId: string, voucherPackageId: string) => `/service-providers/${encodeURIComponent(serviceProviderId)}/voucher-packages/${encodeURIComponent(voucherPackageId)}/edit`,
    },
  },
  org: {
    dashboard: (slug: string) => `/${slug}/dashboard`,
    employees: (slug: string) => `/${slug}/employees`,
    branches: (slug: string) => `/${slug}/branches`,
    policies: (slug: string) => `/${slug}/policies`,
    claims: (slug: string) => `/${slug}/claims`,
    vouchers: (slug: string) => `/${slug}/vouchers`,
    activity: (slug: string) => `/${slug}/activity`,
    transactions: (slug: string) => `/${slug}/transactions`,
    reports: (slug: string) => `/${slug}/reports`,
    settings: (slug: string) => `/${slug}/settings`,
  },
  sp: {
    dashboard: (slug: string) => `/${slug}/dashboard`,
    branches: (slug: string) => `/${slug}/branches`,
    vouchers: (slug: string) => `/${slug}/vouchers`,
    settlements: (slug: string) => `/${slug}/settlements`,
    settings: (slug: string) => `/${slug}/settings`,
  },
} as const
