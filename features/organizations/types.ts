export type OrganizationStatus = "active" | "inactive" | "draft" | "deactivated" | "suspended";
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
  accountModel?: "New" | "Existing";
}

export interface OrganizationAccount {
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
  state: string;
  country: string;
  bankAccountDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  employeeCount: number;
  picId: string | null;
  utilizationRate: number; // 0 to 100
  claimsCount?: number;
  totalAccountBalance: number; // Sum of all account balances (can be negative)
  accountLimit: number; // Max prepaid funds across all accounts
  creditLimit: number; // Max overdraft amount before hard block
  needsAction: string[]; // Triage status pills (e.g. "Missing PIC")
  services: string[]; // Tier 2 Service Names
  policies: string[];
  branches: string[];
  documents: string[];
  employeesWithoutPolicy?: number;
  tierConfigs?: OrgTierConfig[];
  departmentConfigs?: OrgDepartmentConfig[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface OrgTierConfig {
  id: string;
  name: string;
  code?: string;
}

export interface OrgDepartmentConfig {
  id: string;
  name: string;
  code?: string;
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

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";

export interface Employee {
  id: string;
  orgId: string;
  branchId: string;
  name: string;
  email: string;
  empCode: string;
  departmentId?: string;
  department?: string;
  role?: string;
  tierId?: string;
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
  employeeName: string;
  name: string;
  relationship: DependentRelationship;
  status: "active" | "inactive";
  joinDate: string;
}
