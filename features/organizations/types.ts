export type OrganizationStatus = "active" | "deactivated" | "suspended" | "removed" | "pending";
export type OrganizationType = "sme" | "enterprise" | "ngo";
export type OrganizationSubscription = "standard" | "premium" | "enterprise";

// ISO 8601 Date String
export type ISODate = string;

export interface OrganizationBranch {
  id: string;
  orgId: string;
  name: string;
  type: "hq" | "branch";
  address: {
    line: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    lat?: number;
    lon?: number;
  };
  timezone: string;
  active: boolean;
  pics: {
    name: string;
    email: string;
    contactNo: string;
  }[];
  claimsCount?: number;
  utilizationRate?: number;
  balance?: string;
  limit?: string;
  walletModel?: "New" | "Existing";
}

export interface OrganizationWallet {
  id: string;
  name: string;
  orgId: string;
  branchId: string;
  balance: number;
  pendingDeductions: number;
  status: "active" | "suspended";
}

export interface Organization {
  id: string;
  logo?: string;
  name: string;
  registrationNumber: string;
  industry: string;
  subIndustry?: string;
  type: OrganizationType;
  financialYearStart: ISODate;
  subscription: {
    plan: OrganizationSubscription;
    billingInformation?: string;
    paymentMethod?: string;
    startDate: ISODate;
    endDate?: ISODate;
    status: OrganizationStatus;
  };
  status: OrganizationStatus;
  tinNumber: string;
  bankAccountDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  employeeCount: number;
  picId: string | null;
  utilizationRate: number; // 0 to 100
  claimsCount?: number;
  totalWalletBalance: number; // Sum of all wallet balances (can be negative)
  walletLimit: number; // Max prepaid funds across all wallets
  creditLimit: number; // Max overdraft amount before hard block
  needsAction: string[]; // Triage status pills (e.g. "Missing PIC")
  services: string[]; // Tier 2 Service Names
  policies: string[];
  branches: string[];
  documents: string[];
  tiers?: OrgTier[];
  employeesWithoutPolicy?: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface OrganizationAdmin {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: "org_admin";
  status: "active" | "pending_activation" | "suspended";
  invitedAt: ISODate;
}

export interface OrgTier {
  id: string;
  orgId: string;
  label: string;  // "Director Level"
  code: string;   // "T1"
  level: number;  // sort order: 1, 2, 3
}

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";

export interface Employee {
  id: string;
  orgId: string;
  branchId: string;
  name: string;
  email: string;
  empCode: string;
  department?: string;
  role?: string;
  tier?: string;
  dateOfBirth?: ISODate;
  gender?: "male" | "female" | "other";
  mobileNumber?: string;
  joinDate: ISODate;
  probationEndDate?: ISODate;
  employmentType: EmploymentType;
  status: "active" | "inactive";
  isProbation: boolean;
}

export type DependentRelationship = "spouse" | "child" | "mother" | "father" | "brother" | "sister" | "mother_in_law" | "father_in_law";

export interface Dependent {
  id: string;
  employeeId: string;
  name: string;
  relationship: DependentRelationship;
  status: "active" | "inactive";
}
