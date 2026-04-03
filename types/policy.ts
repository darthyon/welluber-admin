export type PoolType = "Individual" | "Shared";
export type UtilisationMode = "Fixed" | "Prorated";
export type RefreshCycle = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type RefreshStartReference = "OrgFY" | "JoinDate" | "CustomDate";
export type ActivationMode = "JoinDate" | "ProbationEnds" | "CustomDate";
export type PolicyStatus = "Draft" | "Published" | "Unlisted" | "Deactivated";
export type DistributionType = "SharedAmount" | "IndividualBenefitAmount";

export interface BenefitPolicy {
  id: string;
  code: string;
  name: string;
  description: string;
  eligibility: {
    roles: string[];
    employeeTypes: string[];
  };
  benefitPoolType: {
    employee: PoolType;
    dependents: PoolType | "None";
  };
  utilisationMode: UtilisationMode;
  refreshCycle: RefreshCycle;
  refreshStartReference: RefreshStartReference;
  activationMode: ActivationMode;
  status: PolicyStatus;
}

export interface BenefitGroup {
  id: string;
  policyId: string;
  name: string;
  description: string;
  distributionType: DistributionType;
  maxUsagePerCycle?: number;
}

export interface Benefit {
  id: string;
  groupId: string;
  serviceId: string; // From Masterlist
  amount: number;
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
