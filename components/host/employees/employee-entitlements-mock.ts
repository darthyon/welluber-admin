import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { BeneficiaryUsage } from "@/features/employees/types"

/** One assigned policy + its groups/benefits + the employee's runtime consumption.
 *  Drives the Entitlement → Usage view. Everything but `usage` is the real policy
 *  domain model; `usage` is the consumption overlay. Flexi services only. */
export interface AssignedPolicyEntitlement {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  usage: BeneficiaryUsage[]
}

const ROBERT = "EMP-20260115-0001"
const JENNY = "EMP-20260115-0002"
const JENNY_SPOUSE = "DEP-0002-1"
const JENNY_CHILD = "DEP-0002-2"
const MICHAEL = "EMP-20260115-0003"
const MICHAEL_SPOUSE = "DEP-0003-1"
const MICHAEL_CHILD = "DEP-0003-2"
const MARVIN = "EMP-20260115-0004"
const AHMAD = "EMP-20260115-0006"
const AHMAD_SPOUSE = "DEP-0006-1"
const AHMAD_CHILD = "DEP-0006-2"

// ── Policy A — Employee-only individual pool ──
const A = "POL-20260115-0001"
const policyA: AssignedPolicyEntitlement = {
  policy: {
    id: A,
    code: "BEN-ESS-26",
    name: "Employee Essentials 2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 1500,
    groupCount: 1,
  },
  groups: [
    {
      id: `${A}-G1`,
      policyId: A,
      name: "General Wellness",
      coverageScope: "Employee",
      distributionType: "IndividualBenefitAmount",
      isTaxable: true,
    },
  ],
  benefits: [
    { id: `${A}-B1`, groupId: `${A}-G1`, serviceId: "FX-GYM", amount: 600, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${A}-B2`, groupId: `${A}-G1`, serviceId: "MD-SCR", amount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${A}-B3`, groupId: `${A}-G1`, serviceId: "MD-EYE", amount: 400, coPayment: { required: false, type: "Percentage", value: 0 } },
  ],
  usage: [
    { beneficiaryId: ROBERT, benefitId: `${A}-B1`, allocated: 600, balance: 420, spent: 180 },
    { beneficiaryId: ROBERT, benefitId: `${A}-B2`, allocated: 500, balance: 500, spent: 0 },
    { beneficiaryId: ROBERT, benefitId: `${A}-B3`, allocated: 400, balance: 280, spent: 120 },
  ],
}

// ── Policy B — Employee pool + dependent cover shared with employee for one group ──
const B = "POL-20260115-0002"
const policyB: AssignedPolicyEntitlement = {
  policy: {
    id: B,
    code: "BEN-FAM-26",
    name: "Acme Family Wellness 2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [
      { type: "spouse" },
      { type: "child" },
    ],
    dependentsPoolType: "SharedWithEmployee",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 3000,
    groupCount: 2,
  },
  groups: [
    {
      id: `${B}-G1`,
      policyId: B,
      name: "Physical Wellbeing",
      coverageScope: "Both",
      distributionType: "IndividualBenefitAmount",
      isTaxable: false,
    },
    {
      id: `${B}-G2`,
      policyId: B,
      name: "Mental Fitness",
      coverageScope: "Employee",
      distributionType: "IndividualBenefitAmount",
      isTaxable: false,
      coPayment: { required: true, type: "Percentage", value: 10 },
    },
  ],
  benefits: [
    { id: `${B}-B1`, groupId: `${B}-G1`, serviceId: "FX-GYM", amount: 200, employeeAmount: 200, dependantAmount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${B}-B2`, groupId: `${B}-G1`, serviceId: "FX-PT", amount: 150, employeeAmount: 150, dependantAmount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${B}-B3`, groupId: `${B}-G2`, serviceId: "MH-THR", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
    { id: `${B}-B4`, groupId: `${B}-G2`, serviceId: "MH-MED", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
  ],
  usage: [
    { beneficiaryId: JENNY, benefitId: `${B}-B1`, allocated: 200, balance: 20, spent: 180 },
    { beneficiaryId: JENNY_SPOUSE, beneficiaryName: "Daniel Wilson", relationship: "Spouse", benefitId: `${B}-B1`, allocated: 200, balance: 20, spent: 0 },
    { beneficiaryId: JENNY_CHILD, beneficiaryName: "Emma Wilson", relationship: "Child", benefitId: `${B}-B1`, allocated: 200, balance: 20, spent: 0 },
    { beneficiaryId: JENNY, benefitId: `${B}-B2`, allocated: 150, balance: 80, spent: 40 },
    { beneficiaryId: JENNY_SPOUSE, beneficiaryName: "Daniel Wilson", relationship: "Spouse", benefitId: `${B}-B2`, allocated: 150, balance: 80, spent: 20 },
    { beneficiaryId: JENNY_CHILD, beneficiaryName: "Emma Wilson", relationship: "Child", benefitId: `${B}-B2`, allocated: 150, balance: 80, spent: 10 },
    { beneficiaryId: JENNY, benefitId: `${B}-B3`, allocated: 300, balance: 180, spent: 120 },
    { beneficiaryId: JENNY, benefitId: `${B}-B4`, allocated: 300, balance: 220, spent: 80 },
  ],
}

// ── Policy C — Shared dependent pool (Shared), Both group ──
const C = "POL-20260115-0009"
const policyC: AssignedPolicyEntitlement = {
  policy: {
    id: C,
    code: "BEN-NUT-03",
    name: "Acme Nutrition Plan FY2026",
    version: "V1.2",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [{ type: "spouse" }, { type: "child" }],
    dependentsPoolType: "Shared",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Quarterly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 800,
    dependentCapAmount: 600,
    groupCount: 1,
  },
  groups: [
    {
      id: `${C}-G1`,
      policyId: C,
      name: "Nutrition & Recovery",
      coverageScope: "Both",
      distributionType: "SharedAmount",
      maxUsagePerCycle: 800,
      dependentGroupCap: 600,
      isTaxable: false,
      coPayment: { required: true, type: "Fixed", value: 20 },
      dependentCoPayment: { required: false, type: "Percentage", value: 0 },
    },
  ],
  benefits: [
    { id: `${C}-B1`, groupId: `${C}-G1`, serviceId: "NT-NUT", amount: 400, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${C}-B2`, groupId: `${C}-G1`, serviceId: "RC-SPR", amount: 400, coPayment: { required: false, type: "Percentage", value: 0 } },
  ],
  usage: [
    { beneficiaryId: MICHAEL, benefitId: `${C}-B1`, allocated: 800, balance: 300, spent: 500 },
    // Dependents share one pool (allocated repeated; spend aggregated across deps)
    { beneficiaryId: MICHAEL_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${C}-B1`, allocated: 600, balance: 350, spent: 150 },
    { beneficiaryId: MICHAEL_CHILD, beneficiaryName: "Adam Faizal", relationship: "Child", benefitId: `${C}-B1`, allocated: 600, balance: 350, spent: 100 },
    { beneficiaryId: MICHAEL, benefitId: `${C}-B2`, allocated: 800, balance: 800, spent: 0 },
    { beneficiaryId: MICHAEL_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${C}-B2`, allocated: 600, balance: 600, spent: 0 },
  ],
}

// ── Policy D — Executive employee pool + individual dependent pools ──
const D = "POL-20260115-0010"
const policyD: AssignedPolicyEntitlement = {
  policy: {
    id: D,
    code: "BEN-EXEC-26",
    name: "Executive Benefits Programme 2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [
      { type: "spouse", capAmount: 2000 },
      { type: "child", capAmount: 2000 },
    ],
    dependentsPoolType: "Individual",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 5000,
    groupCount: 2,
  },
  groups: [
    {
      id: `${D}-G1`,
      policyId: D,
      name: "Comprehensive Health",
      coverageScope: "Both",
      distributionType: "IndividualBenefitAmount",
      isTaxable: false,
      coPayment: { required: false, type: "Percentage", value: 0 },
      dependentCoPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${D}-G2`,
      policyId: D,
      name: "Wellness Extras",
      coverageScope: "Both",
      distributionType: "IndividualBenefitAmount",
      isTaxable: false,
      coPayment: { required: true, type: "Percentage", value: 20 },
      dependentCoPayment: { required: true, type: "Percentage", value: 20 },
    },
  ],
  benefits: [
    { id: `${D}-B1`, groupId: `${D}-G1`, serviceId: "MD-MSP", amount: 1500, employeeAmount: 1500, dependantAmount: 1000, coPayment: { required: false, type: "Percentage", value: 0 }, dependentCoPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${D}-B2`, groupId: `${D}-G1`, serviceId: "MD-DEN", amount: 500, employeeAmount: 500, dependantAmount: 500, coPayment: { required: false, type: "Percentage", value: 0 }, dependentCoPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${D}-B3`, groupId: `${D}-G2`, serviceId: "FX-GYM", amount: 800, employeeAmount: 800, dependantAmount: 400, coPayment: { required: true, type: "Percentage", value: 20 }, dependentCoPayment: { required: true, type: "Percentage", value: 20 } },
    { id: `${D}-B4`, groupId: `${D}-G2`, serviceId: "NT-NUT", amount: 400, employeeAmount: 400, dependantAmount: 200, coPayment: { required: true, type: "Percentage", value: 20 }, dependentCoPayment: { required: true, type: "Percentage", value: 20 } },
    { id: `${D}-B5`, groupId: `${D}-G2`, serviceId: "MH-THR", amount: 300, employeeAmount: 300, dependantAmount: 200, coPayment: { required: true, type: "Percentage", value: 20 }, dependentCoPayment: { required: true, type: "Percentage", value: 20 } },
  ],
  usage: [
    { beneficiaryId: AHMAD, benefitId: `${D}-B1`, allocated: 1500, balance: 900, spent: 600 },
    { beneficiaryId: AHMAD_SPOUSE, beneficiaryName: "Nadia Faizal", relationship: "Spouse", benefitId: `${D}-B1`, allocated: 1000, balance: 700, spent: 300 },
    { beneficiaryId: AHMAD_CHILD, beneficiaryName: "Aisyah Faizal", relationship: "Child", benefitId: `${D}-B1`, allocated: 1000, balance: 1000, spent: 0 },
    { beneficiaryId: AHMAD, benefitId: `${D}-B2`, allocated: 500, balance: 500, spent: 0 },
    { beneficiaryId: AHMAD_SPOUSE, beneficiaryName: "Nadia Faizal", relationship: "Spouse", benefitId: `${D}-B2`, allocated: 500, balance: 300, spent: 200 },
    { beneficiaryId: AHMAD_CHILD, beneficiaryName: "Aisyah Faizal", relationship: "Child", benefitId: `${D}-B2`, allocated: 500, balance: 500, spent: 0 },
    { beneficiaryId: AHMAD, benefitId: `${D}-B3`, allocated: 800, balance: 500, spent: 300 },
    { beneficiaryId: AHMAD_SPOUSE, beneficiaryName: "Nadia Faizal", relationship: "Spouse", benefitId: `${D}-B3`, allocated: 400, balance: 400, spent: 0 },
    { beneficiaryId: AHMAD_CHILD, beneficiaryName: "Aisyah Faizal", relationship: "Child", benefitId: `${D}-B3`, allocated: 400, balance: 300, spent: 100 },
    { beneficiaryId: AHMAD, benefitId: `${D}-B4`, allocated: 400, balance: 200, spent: 200 },
    { beneficiaryId: AHMAD_SPOUSE, beneficiaryName: "Nadia Faizal", relationship: "Spouse", benefitId: `${D}-B4`, allocated: 200, balance: 200, spent: 0 },
    { beneficiaryId: AHMAD_CHILD, beneficiaryName: "Aisyah Faizal", relationship: "Child", benefitId: `${D}-B4`, allocated: 200, balance: 150, spent: 50 },
    { beneficiaryId: AHMAD, benefitId: `${D}-B5`, allocated: 300, balance: 180, spent: 120 },
    { beneficiaryId: AHMAD_SPOUSE, beneficiaryName: "Nadia Faizal", relationship: "Spouse", benefitId: `${D}-B5`, allocated: 200, balance: 200, spent: 0 },
    { beneficiaryId: AHMAD_CHILD, beneficiaryName: "Aisyah Faizal", relationship: "Child", benefitId: `${D}-B5`, allocated: 200, balance: 200, spent: 0 },
  ],
}

// ── Policy E — Contract employee monthly essentials ──
const E = "POL-20260115-0011"
const policyE: AssignedPolicyEntitlement = {
  policy: {
    id: E,
    code: "BEN-CON-26",
    name: "Contract Staff Essentials 2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["contract"],
    benefitPoolType: "Individual",
    utilisationMode: "Prorated",
    prorateUnit: "Monthly",
    refreshCycle: "Yearly",
    refreshStartReference: "calendar_year",
    status: "active",
    totalCapAmount: 100,
    groupCount: 1,
  },
  groups: [
    {
      id: `${E}-G1`,
      policyId: E,
      name: "Basic Medical",
      coverageScope: "Employee",
      distributionType: "IndividualBenefitAmount",
      isTaxable: false,
      utilisationMode: "Prorated",
      prorateUnit: "Monthly",
      refreshCycle: "Yearly",
    },
  ],
  benefits: [
    { id: `${E}-B1`, groupId: `${E}-G1`, serviceId: "MD-GPV", amount: 60, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${E}-B2`, groupId: `${E}-G1`, serviceId: "MD-RX", amount: 40, coPayment: { required: false, type: "Percentage", value: 0 } },
  ],
  usage: [
    { beneficiaryId: MARVIN, benefitId: `${E}-B1`, allocated: 60, balance: 20, spent: 40 },
    { beneficiaryId: MARVIN, benefitId: `${E}-B2`, allocated: 40, balance: 40, spent: 0 },
  ],
}

/** One employee → one assigned policy. The three pool-type cases live on different
 *  employees as test fixtures (combined / dedicated / shared). */
const BY_EMPLOYEE: Record<string, AssignedPolicyEntitlement> = {
  "EMP-20260115-0001": policyA, // Employee-only dedicated pool
  "EMP-20260115-0002": policyB, // SharedWithEmployee (combined)
  "EMP-20260115-0003": policyC, // Shared (shared dependent pool)
  "EMP-20260115-0004": policyE, // Contract essentials
  "EMP-20260115-0006": policyD, // Executive family programme
}

export function getEmployeeEntitlement(employeeId: string): AssignedPolicyEntitlement {
  return BY_EMPLOYEE[employeeId] ?? policyA
}
