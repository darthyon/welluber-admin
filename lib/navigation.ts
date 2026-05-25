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
