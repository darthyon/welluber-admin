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

const EMP = "EMP-20260115-0007" // Robert Fox
const DEP_SPOUSE = "DEP-0007-1" // Siti Rahmah
const DEP_CHILD = "DEP-0007-2" // Adam Faizal

// ── Policy A — Combined pool (SharedWithEmployee), a Both group + an Employee-only group ──
const A = "POL-20260115-0001"
const policyA: AssignedPolicyEntitlement = {
  policy: {
    id: A,
    code: "BEN-FLX-01",
    name: "Acme Flexi Wellness FY2026",
    version: "V2.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [{ type: "spouse" }, { type: "child" }],
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
      id: `${A}-G1`,
      policyId: A,
      name: "Physical Wellbeing",
      coverageScope: "Both",
      distributionType: "IndividualBenefitAmount",
      isTaxable: true,
    },
    {
      id: `${A}-G2`,
      policyId: A,
      name: "Lifestyle Perks",
      coverageScope: "Employee",
      distributionType: "SharedAmount",
      maxUsagePerCycle: 500,
      isTaxable: false,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ],
  benefits: [
    { id: `${A}-B1`, groupId: `${A}-G1`, serviceId: "FX-GYM", amount: 350, employeeAmount: 350, dependantAmount: 250, coPayment: { required: false, type: "Percentage", value: 0 } },
    { id: `${A}-B2`, groupId: `${A}-G1`, serviceId: "FX-CLS", amount: 300, employeeAmount: 300, dependantAmount: 200, coPayment: { required: true, type: "Percentage", value: 10 } },
    { id: `${A}-B3`, groupId: `${A}-G2`, serviceId: "FX-RKT", amount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
  ],
  usage: [
    // Combined pool: employee + dependents draw from one shared ceiling per benefit
    { beneficiaryId: EMP, benefitId: `${A}-B1`, allocated: 350, balance: 70, spent: 280 },
    { beneficiaryId: DEP_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${A}-B1`, allocated: 350, balance: 70, spent: 0 },
    { beneficiaryId: DEP_CHILD, beneficiaryName: "Adam Faizal", relationship: "Child", benefitId: `${A}-B1`, allocated: 350, balance: 70, spent: 0 },
    { beneficiaryId: EMP, benefitId: `${A}-B2`, allocated: 300, balance: 120, spent: 80 },
    { beneficiaryId: DEP_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${A}-B2`, allocated: 300, balance: 120, spent: 100 },
    // Employee-only group
    { beneficiaryId: EMP, benefitId: `${A}-B3`, allocated: 500, balance: 410, spent: 90 },
  ],
}

// ── Policy B — Dedicated pools (Individual), Both group with per-dependent allocations ──
const B = "POL-20260115-0008"
const policyB: AssignedPolicyEntitlement = {
  policy: {
    id: B,
    code: "BEN-FAM-02",
    name: "Acme Family Active FY2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [
      { type: "spouse", capAmount: 600 },
      { type: "child", capAmount: 400 },
    ],
    dependentsPoolType: "Individual",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "calendar_year",
    refreshStartMonth: 1,
    status: "active",
    totalCapAmount: 1000,
    groupCount: 1,
  },
  groups: [
    {
      id: `${B}-G1`,
      policyId: B,
      name: "Sports & Recreation",
      coverageScope: "Both",
      distributionType: "IndividualBenefitAmount",
      isTaxable: false,
    },
  ],
  benefits: [
    { id: `${B}-B1`, groupId: `${B}-G1`, serviceId: "FX-SWM", amount: 600, employeeAmount: 1000, dependantAmount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
  ],
  usage: [
    { beneficiaryId: EMP, benefitId: `${B}-B1`, allocated: 1000, balance: 550, spent: 450 },
    { beneficiaryId: DEP_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${B}-B1`, allocated: 600, balance: 300, spent: 300 },
    { beneficiaryId: DEP_CHILD, beneficiaryName: "Adam Faizal", relationship: "Child", benefitId: `${B}-B1`, allocated: 400, balance: 400, spent: 0 },
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
    { beneficiaryId: EMP, benefitId: `${C}-B1`, allocated: 800, balance: 300, spent: 500 },
    // Dependents share one pool (allocated repeated; spend aggregated across deps)
    { beneficiaryId: DEP_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${C}-B1`, allocated: 600, balance: 350, spent: 150 },
    { beneficiaryId: DEP_CHILD, beneficiaryName: "Adam Faizal", relationship: "Child", benefitId: `${C}-B1`, allocated: 600, balance: 350, spent: 100 },
    { beneficiaryId: EMP, benefitId: `${C}-B2`, allocated: 800, balance: 800, spent: 0 },
    { beneficiaryId: DEP_SPOUSE, beneficiaryName: "Siti Rahmah", relationship: "Spouse", benefitId: `${C}-B2`, allocated: 600, balance: 600, spent: 0 },
  ],
}

/** One employee → one assigned policy. The three pool-type cases live on different
 *  employees as test fixtures (combined / dedicated / shared). */
const BY_EMPLOYEE: Record<string, AssignedPolicyEntitlement> = {
  "EMP-20260115-0001": policyA, // SharedWithEmployee (combined)
  "EMP-20260115-0002": policyB, // Individual (dedicated)
  "EMP-20260115-0003": policyC, // Shared (shared dependent pool)
}

export function getEmployeeEntitlement(employeeId: string): AssignedPolicyEntitlement {
  return BY_EMPLOYEE[employeeId] ?? policyA
}
