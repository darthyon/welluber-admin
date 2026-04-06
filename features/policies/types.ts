import { ISODate } from "@/features/organizations/types";

export type PolicyStatus = "Draft" | "Published" | "Unlisted" | "Deactivated";
export type DistributionType = "SharedAmount" | "IndividualBenefitAmount";
export type RefreshCycle = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type RefreshStartReference = "OrgFY" | "JoinDate" | "CustomDate";
export type ActivationMode = "JoinDate" | "ProbationEnds" | "CustomDate";

export interface BenefitPolicy {
  id: string;
  name: string;
  code: string; // The "meaningful" Benefit ID
  description: string;
  status: PolicyStatus;
  eligibility: {
    roles: string[];
    employeeTypes: string[];
    departments?: string[];
  };
  benefitPoolType: {
    employee: "Individual" | "Shared";
    dependents: "None" | "Individual" | "Shared";
  };
  utilisationMode: "Fixed" | "Prorated";
  refreshCycle: RefreshCycle;
  refreshStartReference: RefreshStartReference;
  activationMode: ActivationMode;
  createdAt: ISODate;
  updatedAt: ISODate;
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
  serviceId: string;
  amount: number;
  coPayment: {
    required: boolean;
    type: "Percentage" | "Fixed";
    value: number;
  };
}
