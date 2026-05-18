export type PoolType = "Individual" | "Shared";
export type DependentsPoolType = "Individual" | "Shared" | "SharedWithEmployee";
export type DependentCoverageType = "spouse" | "child" | "mother" | "father" | "sibling" | "inlaw";
export type UtilisationMode = "Fixed" | "Prorated";
export type ProrateUnit = "Daily" | "Weekly" | "Monthly" | "Quarterly";
export type RefreshCycle = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type RefreshStartReference = "financial_year" | "calendar_year";
export type PolicyStatus = "draft" | "active" | "deactivated";
export type DistributionType = "SharedAmount" | "IndividualBenefitAmount";

export interface DependentCoverage {
  type: DependentCoverageType;
  capAmount?: number;
}

export interface BenefitPolicy {
  id: string;
  code?: string;
  name: string;
  description?: string;
  organizationId: string; // Policy belongs to exactly one org
  eligibleEmploymentTypes: string[];
  dependentCoverages?: DependentCoverage[];
  benefitPoolType: PoolType; // employee pool type
  dependentsPoolType?: DependentsPoolType; // only when dependents are covered
  utilisationMode: UtilisationMode;
  prorateUnit?: ProrateUnit;
  refreshCycle: RefreshCycle;
  refreshStartReference: RefreshStartReference;
  refreshStartMonth?: number; // 1–12, month the cycle begins
  effectiveDate?: "immediate" | "scheduled";
  effectiveCustomDate?: string; // ISO date string, only when effectiveDate === "scheduled"
  status: PolicyStatus;
  totalCapAmount?: number; // employee-level spending ceiling (RM), optional
  dependentCapAmount?: number; // shared dependent pool ceiling when dependentsPoolType === "Shared"
  createdAt?: string;
  groupCount?: number;
  clonedFrom?: string; // original policy id
  templateId?: string; // reference to PolicyTemplate used, if any
  assignedOrgs?: number;
  // Employee eligibility filters
  eligibility?: {
    minAge?: number;
    maxAge?: number;
    gender?: "male" | "female" | "all";
    tierIds?: string[];
    departmentIds?: string[];
  };
  version?: string;             // e.g. V1.1
  parentPolicyId?: string;      // present = this is a version of another policy
  targetEmployeeIds?: string[]; // individually pinned employees for this version
}

export interface PolicyTemplate {
  id: string;
  name: string;
  tagline: string;
  icon: string; // Phosphor icon name
  prefill: {
    name?: string;
    description?: string;
    eligibleEmploymentTypes: string[];
    dependentCoverages?: DependentCoverage[];
    benefitPoolType: PoolType;
    dependentsPoolType?: DependentsPoolType;
    utilisationMode: UtilisationMode;
    refreshCycle: RefreshCycle;
    refreshStartReference: RefreshStartReference;
    refreshStartMonth?: number;
    groups: BenefitGroup[];
    benefits: Benefit[];
  };
}

export interface BenefitGroup {
  id: string;
  policyId: string;
  name: string;
  description?: string;
  distributionType: DistributionType;
  maxUsagePerCycle?: number; // employee group cap per cycle
  dependentGroupCap?: number; // dependent group cap per cycle
  isTaxable?: boolean; // Malaysia LHDN BIK classification at benefit-category (group) level
  coPayment?: Benefit["coPayment"]; // employee copayment at group level (SharedAmount)
  dependentCoPayment?: Benefit["coPayment"]; // dependent copayment at group level (SharedAmount)
  utilisationMode?: UtilisationMode; // Optional override; unset = inherit from policy
  prorateUnit?: ProrateUnit; // Optional override when utilisationMode === "Prorated"
}

export interface Benefit {
  id: string;
  groupId: string;
  serviceId: string; // MainServiceId from unified taxonomy
  amount: number;
  employeeAmount?: number; // employee portion when split (dependents enabled)
  dependantAmount?: number; // dependant portion when split (dependents enabled)
  dependantTypes?: string[]; // which dependent types get this override amount
  coPayment: {
    required: boolean;
    type: "Percentage" | "Fixed";
    value: number;
  };
}

export interface BenefitCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}
