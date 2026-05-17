import type { MainServiceId } from "@/lib/mock-data/service-catalog";

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

  // ── Eligibility ────────────────────────────────────────────────────────────
  eligibleEmploymentTypes: string[];
  coversDependents: boolean;
  /**
   * Whether employees get individual pools per group, or share one pool across
   * all employees in the policy per group.
   *   "Individual" → each employee gets their own BenefitAssignment per group
   *   "Shared"     → all employees share one BenefitAssignment per group
   * Groups themselves are ALWAYS independent — a claim deducts from exactly
   * one group's pool and cannot spill across groups.
   */
  benefitPoolType: PoolType;
  dependentsPoolType?: DependentsPoolType; // only when coversDependents is true

  // ── Timing (policy-wide) ───────────────────────────────────────────────────
  /**
   * When the refresh cycle starts — policy-wide anchor.
   * Individual groups define their own refreshCycle (how often),
   * but all groups share the same start reference.
   */
  refreshStartReference: RefreshStartReference;
  refreshCustomDate?: string; // ISO date, only when refreshStartReference === "custom_date"

  /**
   * Default utilisation mode applied to all groups unless a group overrides it.
   * Groups may set their own utilisationMode (null = inherit this default).
   */
  defaultUtilisationMode: UtilisationMode;

  // ── Activation ─────────────────────────────────────────────────────────────
  activationMode: ActivationMode;
  activationCustomDate?: string; // ISO date, only when activationMode === "custom_date"

  // ── Spending caps (RM) ─────────────────────────────────────────────────────
  totalCapAmount?: number;      // employee-level ceiling across all groups, optional
  dependentsCapAmount?: number; // dependents-level ceiling, optional

  status: PolicyStatus;
  createdAt?: string;
  groupCount?: number;
  clonedFrom?: string;   // original policy id if cloned
  templateId?: string;   // PolicyTemplate used, if any
  assignedOrgs?: number;

  // Employee eligibility filters
  eligibility?: {
    minAge?: number;
    maxAge?: number;
    gender?: "male" | "female" | "all";
    tierIds?: string[];
    departmentIds?: string[];
  };

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
    coversDependents: boolean;
    benefitPoolType: PoolType;
    dependentsPoolType?: DependentsPoolType;
    defaultUtilisationMode: UtilisationMode;
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

  /**
   * Each group has its own independent pool.
   * Claims deduct from exactly this group's pool — no cross-group spending.
   * distributionType governs how the pool budget is distributed across services within the group.
   */
  distributionType: DistributionType;

  /**
   * How often this group's pool resets.
   * Different groups in the same policy can refresh at different intervals.
   * e.g. Gym = Yearly, Meal Allowance = Monthly, Therapy = Quarterly.
   */
  refreshCycle: RefreshCycle;

  /**
   * null → inherit policy's defaultUtilisationMode.
   * Set explicitly to override for this group only.
   */
  utilisationMode?: UtilisationMode | null;

  /**
   * Required when utilisationMode = "Prorated" (or inherited mode is Prorated).
   */
  prorateUnit?: ProrateUnit | null;

  /** RM cap on total spend from this group's pool per refresh cycle. null = uncapped. */
  maxUsagePerCycle?: number;
}

export interface Benefit {
  id: string;
  groupId: string;
  serviceId: MainServiceId; // canonical taxonomy id (Tier 2)
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

