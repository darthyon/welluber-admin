import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PolicyListItem extends BenefitPolicy {
  groupCount: number;
  orgName?: string;
  assignedOrgNames?: string[];
  createdAt: string;
}

export interface PolicyData {
  groups: BenefitGroup[];
  benefits: Benefit[];
}

// ─── Services ─────────────────────────────────────────────────────────────────

export const SERVICES = [
  { id: "s1", category: "Physical Wellbeing", name: "Gymnasium Facilities", subServices: ["Standard Gym Access", "Boutique Studio Memberships"] },
  { id: "s2", category: "Physical Wellbeing", name: "Group Fitness", subServices: ["Yoga", "Pilates", "Indoor Cycling", "Zumba"] },
  { id: "s3", category: "Psychological Wellbeing", name: "Clinical Therapy", subServices: ["Psychotherapy", "CBT", "Psychiatric Care"] },
  { id: "s4", category: "Psychological Wellbeing", name: "Mental Fitness", subServices: ["Meditation Apps", "Mindfulness Workshops"] },
  { id: "s5", category: "Nutritional Support", name: "Dietary Counseling", subServices: ["Dietitian Consultations", "Diabetic Management"] },
  { id: "s6", category: "Personal Care", name: "Therapeutic Spa Services", subServices: ["Relaxation Massage", "Hydrotherapy"] },
];

// ─── Policies ─────────────────────────────────────────────────────────────────

export const INITIAL_POLICIES: PolicyListItem[] = [
  {
    id: "1",
    name: "Standard Health 2026",
    code: "BEN-STD-01",
    description: "Comprehensive wellness policy for all full-time staff.",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    coversDependents: false,
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "fy_start",
    activationMode: "after_join",
    status: "active",
    groupCount: 3,
    orgName: "Acme Corporation Sdn Bhd",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Executive Wellness",
    code: "BEN-EXC-02",
    description: "Premium tier benefits including specialized clinical therapy.",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time", "part-time"],
    coversDependents: false,
    benefitPoolType: "Individual",
    utilisationMode: "Prorated",
    prorateUnit: "Monthly",
    refreshCycle: "Quarterly",
    refreshStartReference: "join_date",
    activationMode: "after_join",
    status: "draft",
    groupCount: 2,
    orgName: "Acme Corporation Sdn Bhd",
    createdAt: "2024-03-22T14:30:00Z",
  },
  {
    id: "3",
    name: "Contractor Lite",
    code: "BEN-CON-03",
    description: "Stripped-down benefits for contract and intern staff.",
    organizationId: "ORG-20260201-0002",
    eligibleEmploymentTypes: ["contract", "internship"],
    coversDependents: false,
    benefitPoolType: "Shared",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "fy_start",
    activationMode: "after_join",
    status: "deactivated",
    groupCount: 1,
    orgName: "Global Tech Solutions",
    createdAt: "2023-11-05T09:15:00Z",
  },
  {
    id: "4",
    name: "Standard Health 2026 — Engineering Override",
    code: "BEN-STD-01-ENG",
    description: "Engineering team variant with higher gym allocation.",
    parentPolicyId: "1",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    coversDependents: false,
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "fy_start",
    activationMode: "after_join",
    status: "active",
    groupCount: 3,
    orgName: "Acme Corporation Sdn Bhd",
    targetEmployeeIds: ["emp_1"],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Standard Health 2026 — Seniors",
    code: "BEN-STD-01-SNR",
    description: "Senior band variant with elevated therapy cap.",
    parentPolicyId: "1",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    coversDependents: false,
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "fy_start",
    activationMode: "after_join",
    status: "active",
    groupCount: 3,
    orgName: "Acme Corporation Sdn Bhd",
    targetEmployeeIds: ["emp_2", "emp_4"],
    createdAt: "2026-02-15T00:00:00Z",
  },
];

// ─── Policy Data Map ──────────────────────────────────────────────────────────

export const POLICY_DATA_MAP_INITIAL: Record<string, PolicyData> = {
  "1": {
    groups: [
      { id: "g1", policyId: "1", name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount" },
      { id: "g2", policyId: "1", name: "Mental Fitness", distributionType: "IndividualBenefitAmount" },
      { id: "g3", policyId: "1", name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500 },
    ],
    benefits: [
      { id: "b1", groupId: "g1", serviceId: "s1", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b2", groupId: "g1", serviceId: "s2", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b3", groupId: "g2", serviceId: "s3", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: "b4", groupId: "g3", serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ],

  },
  "2": {
    groups: [
      { id: "g4", policyId: "2", name: "Premium Wellness", distributionType: "IndividualBenefitAmount" },
      { id: "g5", policyId: "2", name: "Clinical Therapy", distributionType: "IndividualBenefitAmount" },
    ],
    benefits: [
      { id: "b5", groupId: "g4", serviceId: "s1", amount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b6", groupId: "g5", serviceId: "s3", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
    ],
  },
  "3": {
    groups: [
      { id: "g6", policyId: "3", name: "Lite Benefits", distributionType: "SharedAmount", maxUsagePerCycle: 200 },
    ],
    benefits: [
      { id: "b7", groupId: "g6", serviceId: "s1", amount: 50, coPayment: { required: false, type: "Percentage", value: 0 } },
    ],
  },
  "4": {
    groups: [
      { id: "g1-4", policyId: "4", name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount" },
      { id: "g2-4", policyId: "4", name: "Mental Fitness", distributionType: "IndividualBenefitAmount" },
      { id: "g3-4", policyId: "4", name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500 },
    ],
    benefits: [
      { id: "b1-4", groupId: "g1-4", serviceId: "s1", amount: 350, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b2-4", groupId: "g1-4", serviceId: "s2", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b3-4", groupId: "g2-4", serviceId: "s3", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: "b4-4", groupId: "g3-4", serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ],
  },
  "5": {
    groups: [
      { id: "g1-5", policyId: "5", name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount" },
      { id: "g2-5", policyId: "5", name: "Mental Fitness", distributionType: "IndividualBenefitAmount" },
      { id: "g3-5", policyId: "5", name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500 },
    ],
    benefits: [
      { id: "b1-5", groupId: "g1-5", serviceId: "s1", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b2-5", groupId: "g1-5", serviceId: "s2", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: "b3-5", groupId: "g2-5", serviceId: "s3", amount: 500, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: "b4-5", groupId: "g3-5", serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ],
  },
};
