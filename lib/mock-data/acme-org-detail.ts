// Centralised seed for the demo "Acme Corporation" org-detail data.
// Single source shared by the host org-detail tabs and the org portal so the
// two never drift — edit here and both surfaces reflect it.

export interface AcmeBranchRow {
  id: string;
  name: string;
  type: string; // "HQ" | "Branch office"
  status: string; // "Active" | ...
  accountModel: string; // "New" | "Existing"
  accountName: string;
  accountId: string;
  cashBalance: number;
  creditBalance: number;
  claimsCount: number;
  employees: number; // host tab field name
  employeesCount: number; // org portal field name (kept in sync with employees)
  address: { city: string; state: string };
}

export const ACME_BRANCHES: AcmeBranchRow[] = [
  {
    id: "br_1",
    name: "ACME HQ (Kuala Lumpur)",
    type: "HQ",
    status: "Active",
    accountModel: "New",
    accountName: "KL HQ Account",
    accountId: "ACC-20260115-0001",
    cashBalance: 45000,
    creditBalance: 10000,
    claimsCount: 12,
    employees: 1240,
    employeesCount: 1240,
    address: { city: "Kuala Lumpur", state: "Wilayah Persekutuan" },
  },
  {
    id: "br_2",
    name: "ACME Subang Jaya",
    type: "Branch office",
    status: "Active",
    accountModel: "Existing",
    accountName: "Subang Shared Pool",
    accountId: "ACC-20260115-0002",
    cashBalance: 12500,
    creditBalance: 5000,
    claimsCount: 5,
    employees: 450,
    employeesCount: 450,
    address: { city: "Subang Jaya", state: "Selangor" },
  },
];

export interface AcmePolicyRow {
  id: string;
  name: string;
  code: string;
  version?: string;
  type: string;
  assignedTo: string;
  status: "draft" | "active" | "deactivated";
  employeeCount: number;
  lastUpdated: string;
}

export const ACME_POLICIES: AcmePolicyRow[] = [
  {
    id: "pol_1",
    name: "Acme Employee Wellness Policy FY2026",
    code: "BEN-STD-01",
    version: "V1.1",
    type: "Wellness",
    assignedTo: "All Branches",
    status: "active",
    employeeCount: 1240,
    lastUpdated: "24 Mar 2026",
  },
  {
    id: "pol_2",
    name: "Acme Leadership Benefits Policy FY2026",
    code: "BEN-EXC-02",
    version: "V2.0",
    type: "Lifestyle",
    assignedTo: "Subang Jaya",
    status: "active",
    employeeCount: 450,
    lastUpdated: "02 Apr 2026",
  },
];

export const ACME_BRANCHES_BY_SLUG: Record<string, AcmeBranchRow[]> = {
  "acme-corporation": ACME_BRANCHES,
};

export const ACME_POLICIES_BY_SLUG: Record<string, AcmePolicyRow[]> = {
  "acme-corporation": ACME_POLICIES,
};
