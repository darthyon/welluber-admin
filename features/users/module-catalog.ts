/**
 * Modules an administrator can be granted. Mirrors the host sidebar groups in
 * `components/shared/app-sidebar.tsx` — keep the two in step when nav changes.
 *
 * Presentational only: checking a module records intent, nothing enforces it.
 */

export interface AccessModule {
  id: string
  label: string
  children?: AccessModule[]
}

export interface AccessGroup {
  id: string
  label: string
  modules: AccessModule[]
}

export const MODULE_CATALOG: AccessGroup[] = [
  {
    id: "operations",
    label: "Operations",
    modules: [
      { id: "dashboard", label: "Dashboard" },
      {
        id: "organisations",
        label: "Organisations",
        children: [
          { id: "organisations.all", label: "All Organisations" },
          { id: "organisations.policies", label: "Benefit Policies" },
          { id: "organisations.claims", label: "Claims" },
          { id: "organisations.employees", label: "Employees" },
        ],
      },
      {
        id: "service-providers",
        label: "Service Providers",
        children: [
          { id: "service-providers.all", label: "All Service Providers" },
          { id: "service-providers.vouchers", label: "Voucher Packages" },
        ],
      },
    ],
  },
  {
    id: "setup",
    label: "Setup",
    modules: [
      { id: "services", label: "Services" },
      { id: "brands", label: "Brands" },
    ],
  },
  {
    id: "user-management",
    label: "User Management",
    modules: [
      { id: "users.members", label: "Members" },
      { id: "users.administrators", label: "Administrators" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    modules: [
      { id: "finance.claims", label: "Claims" },
      { id: "finance.invoices", label: "Invoices" },
      { id: "finance.settlements", label: "Settlements" },
      { id: "finance.accounts", label: "Accounts" },
      { id: "finance.reports", label: "Reports" },
    ],
  },
]

/** Every id in the catalog, parents and children alike. */
export const ALL_MODULE_IDS: string[] = MODULE_CATALOG.flatMap((group) =>
  group.modules.flatMap((entry) => [
    entry.id,
    ...(entry.children?.map((child) => child.id) ?? []),
  ])
)

/** Sensible starting grants per role, used to seed mock administrators. */
export function defaultModuleAccess(
  role: "HostAdmin" | "OrgAdmin" | "SPAdmin"
): string[] {
  if (role === "HostAdmin") return [...ALL_MODULE_IDS]

  if (role === "OrgAdmin") {
    return [
      "dashboard",
      "organisations",
      "organisations.all",
      "organisations.policies",
      "organisations.claims",
      "organisations.employees",
      "users.members",
      "finance.claims",
      "finance.reports",
    ]
  }

  return [
    "dashboard",
    "service-providers",
    "service-providers.all",
    "service-providers.vouchers",
    "finance.settlements",
    "finance.invoices",
  ]
}
