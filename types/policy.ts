export type PoolType = "Individual" | "Shared";
export type DependentsPoolType = "Individual" | "Shared" | "SharedWithEmployee";
export type UtilisationMode = "Fixed" | "Prorated";
export type ProrateUnit = "Daily" | "Weekly" | "Monthly" | "Quarterly";
export type RefreshCycle = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type RefreshStartReference = "fy_start" | "join_date" | "custom_date";
export type ActivationMode = "after_join" | "after_probation" | "custom_date";
export type PolicyStatus = "draft" | "active" | "deactivated";
export type DistributionType = "SharedAmount" | "IndividualBenefitAmount";

export interface BenefitPolicy {
  id: string;
  code?: string;
  name: string;
  description?: string;
  organizationId: string; // Policy belongs to exactly one org
  eligibleEmploymentTypes: string[];
  coversDependents: boolean;
  benefitPoolType: PoolType; // employee pool type
  dependentsPoolType?: DependentsPoolType; // only when coversDependents is true
  utilisationMode: UtilisationMode;
  prorateUnit?: ProrateUnit;
  refreshCycle: RefreshCycle;
  refreshStartReference: RefreshStartReference;
  refreshCustomDate?: string; // ISO date string
  activationMode: ActivationMode;
  activationCustomDate?: string; // ISO date string, only when activationMode === "custom_date"
  status: PolicyStatus;
  totalCapAmount?: number; // policy-level spending ceiling (RM), optional
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
  };
  parentPolicyId?: string;      // present = this is a sub-policy
  targetEmployeeIds?: string[]; // individually pinned employees for this sub-policy
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
    coversDependents: boolean;
    benefitPoolType: PoolType;
    dependentsPoolType?: DependentsPoolType;
    utilisationMode: UtilisationMode;
    refreshCycle: RefreshCycle;
    refreshStartReference: RefreshStartReference;
    activationMode: ActivationMode;
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
  maxUsagePerCycle?: number;
}

export interface Benefit {
  id: string;
  groupId: string;
  serviceId: string; // From TaxonomyMainService
  amount: number;
  employeeAmount?: number; // employee portion when split (coversDependents)
  dependantAmount?: number; // dependant portion when split (coversDependents)
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


