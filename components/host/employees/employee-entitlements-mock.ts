import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { BeneficiaryUsage } from "@/features/employees/types"
import {
  deriveUsage,
  type BeneficiaryAllocation,
} from "@/lib/entitlement/derive-usage"
import { MOCK_EMPLOYEE_CLAIMS } from "@/lib/mock-data"

/** What a policy GRANTS an employee and their dependents. Allocations only —
 *  consumption is not declared here, it is folded in from claims. */
interface AssignedPolicySource {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  allocations: BeneficiaryAllocation[]
}

/** One assigned policy + its groups/benefits + the employee's runtime consumption.
 *  Drives the Entitlement → Usage view. Everything but `usage` is the real policy
 *  domain model; `usage` is the consumption overlay, DERIVED from
 *  `MOCK_EMPLOYEE_CLAIMS` via `deriveUsage()`. Flexi services only. */
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
const MARVIN_SPOUSE = "DEP-0004-1"
const MARVIN_CHILD = "DEP-0004-2"
const JASON = "EMP-20260115-0005"
const JASON_SPOUSE = "DEP-0005-1"
const JASON_CHILD = "DEP-0005-2"
const AHMAD = "EMP-20260115-0006"
const AHMAD_SPOUSE = "DEP-0006-1"
const AHMAD_CHILD = "DEP-0006-2"
const AHMAD_CHILD_TWO = "DEP-0006-3"
const AHMAD_CHILD_THREE = "DEP-0006-4"
const AHMAD_CHILD_FOUR = "DEP-0006-5"
const AHMAD_CHILD_FIVE = "DEP-0006-6"

// ── Policy A — Employee-only individual pool ──
const A = "POL-20260115-0001"
const policyA: AssignedPolicySource = {
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
    {
      id: `${A}-B1`,
      groupId: `${A}-G1`,
      serviceId: "FX-GYM",
      amount: 600,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${A}-B2`,
      groupId: `${A}-G1`,
      serviceId: "MD-SCR",
      amount: 500,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${A}-B3`,
      groupId: `${A}-G1`,
      serviceId: "MD-EYE",
      amount: 400,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ],
  allocations: [
    {
      beneficiaryId: ROBERT,
      benefitId: `${A}-B1`,
      allocated: 600,
    },
    {
      beneficiaryId: ROBERT,
      benefitId: `${A}-B2`,
      allocated: 500,
    },
    {
      beneficiaryId: ROBERT,
      benefitId: `${A}-B3`,
      allocated: 400,
    },
  ],
}

// ── Policy B — C2: Individual pool + Individual dependent wallets (Jenny Wilson) ──
const B = "POL-20260115-0002"
const policyB: AssignedPolicySource = {
  policy: {
    id: B,
    code: "BEN-FAM-26",
    name: "Acme Family Wellness 2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [{ type: "spouse" }, { type: "child" }],
    dependentsPoolType: "Individual",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 1500,
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
    {
      id: `${B}-B1`,
      groupId: `${B}-G1`,
      serviceId: "FX-GYM",
      amount: 300,
      employeeAmount: 300,
      dependantAmount: 200,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${B}-B2`,
      groupId: `${B}-G1`,
      serviceId: "FX-PT",
      amount: 200,
      employeeAmount: 200,
      dependantAmount: 150,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${B}-B3`,
      groupId: `${B}-G2`,
      serviceId: "MH-THR",
      amount: 400,
      coPayment: { required: true, type: "Percentage", value: 10 },
    },
    {
      id: `${B}-B4`,
      groupId: `${B}-G2`,
      serviceId: "MH-MED",
      amount: 400,
      coPayment: { required: true, type: "Percentage", value: 10 },
    },
  ],
  allocations: [
    // Employee — her own dedicated wallet
    { beneficiaryId: JENNY, benefitId: `${B}-B1`, allocated: 300 },
    { beneficiaryId: JENNY, benefitId: `${B}-B2`, allocated: 200 },
    { beneficiaryId: JENNY, benefitId: `${B}-B3`, allocated: 400 },
    { beneficiaryId: JENNY, benefitId: `${B}-B4`, allocated: 400 },
    // Spouse — own dedicated wallet (Individual dep pool)
    {
      beneficiaryId: JENNY_SPOUSE,
      beneficiaryName: "Daniel Wilson",
      relationship: "Spouse",
      benefitId: `${B}-B1`,
      allocated: 200,
    },
    {
      beneficiaryId: JENNY_SPOUSE,
      beneficiaryName: "Daniel Wilson",
      relationship: "Spouse",
      benefitId: `${B}-B2`,
      allocated: 150,
    },
    // Child — own dedicated wallet (Individual dep pool)
    {
      beneficiaryId: JENNY_CHILD,
      beneficiaryName: "Emma Wilson",
      relationship: "Child",
      benefitId: `${B}-B1`,
      allocated: 200,
    },
    {
      beneficiaryId: JENNY_CHILD,
      beneficiaryName: "Emma Wilson",
      relationship: "Child",
      benefitId: `${B}-B2`,
      allocated: 150,
    },
  ],
}

// ── Policy C — C3: Individual pool + SharedWithEmployee (Combined Pool) (Michael Tan) ──
const C = "POL-20260115-0009"
const policyC: AssignedPolicySource = {
  policy: {
    id: C,
    code: "BEN-NUT-03",
    name: "Acme Nutrition Plan FY2026",
    version: "V1.2",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [{ type: "spouse" }, { type: "child" }],
    dependentsPoolType: "SharedWithEmployee",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Quarterly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 800,
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
    {
      id: `${C}-B1`,
      groupId: `${C}-G1`,
      serviceId: "NT-NUT",
      amount: 400,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${C}-B2`,
      groupId: `${C}-G1`,
      serviceId: "RC-SPR",
      amount: 400,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ],
  allocations: [
    // Employee — individual wallet
    { beneficiaryId: MICHAEL, benefitId: `${C}-B1`, allocated: 800 },
    { beneficiaryId: MICHAEL, benefitId: `${C}-B2`, allocated: 800 },
    // Dependents — share employee's pool (SharedWithEmployee = Combined Pool)
    // allocated/balance shown as 0; UI renders these as "—"
    {
      beneficiaryId: MICHAEL_SPOUSE,
      beneficiaryName: "Siti Rahmah",
      relationship: "Spouse",
      benefitId: `${C}-B1`,
      allocated: 0,
    },
    {
      beneficiaryId: MICHAEL_CHILD,
      beneficiaryName: "Adam Tan",
      relationship: "Child",
      benefitId: `${C}-B1`,
      allocated: 0,
    },
    {
      beneficiaryId: MICHAEL_SPOUSE,
      beneficiaryName: "Siti Rahmah",
      relationship: "Spouse",
      benefitId: `${C}-B2`,
      allocated: 0,
    },
  ],
}

// ── Policy D — Executive employee pool + individual dependent pools ──
const D = "POL-20260115-0010"
const policyD: AssignedPolicySource = {
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
    {
      id: `${D}-B1`,
      groupId: `${D}-G1`,
      serviceId: "MD-MSP",
      amount: 1500,
      employeeAmount: 1500,
      dependantAmount: 1000,
      coPayment: { required: false, type: "Percentage", value: 0 },
      dependentCoPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${D}-B2`,
      groupId: `${D}-G1`,
      serviceId: "MD-DEN",
      amount: 500,
      employeeAmount: 500,
      dependantAmount: 500,
      coPayment: { required: false, type: "Percentage", value: 0 },
      dependentCoPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${D}-B3`,
      groupId: `${D}-G2`,
      serviceId: "FX-GYM",
      amount: 800,
      employeeAmount: 800,
      dependantAmount: 400,
      coPayment: { required: true, type: "Percentage", value: 20 },
      dependentCoPayment: { required: true, type: "Percentage", value: 20 },
    },
    {
      id: `${D}-B4`,
      groupId: `${D}-G2`,
      serviceId: "NT-NUT",
      amount: 400,
      employeeAmount: 400,
      dependantAmount: 200,
      coPayment: { required: true, type: "Percentage", value: 20 },
      dependentCoPayment: { required: true, type: "Percentage", value: 20 },
    },
    {
      id: `${D}-B5`,
      groupId: `${D}-G2`,
      serviceId: "MH-THR",
      amount: 300,
      employeeAmount: 300,
      dependantAmount: 200,
      coPayment: { required: true, type: "Percentage", value: 20 },
      dependentCoPayment: { required: true, type: "Percentage", value: 20 },
    },
  ],
  allocations: [
    {
      beneficiaryId: AHMAD,
      benefitId: `${D}-B1`,
      allocated: 1500,
    },
    {
      beneficiaryId: AHMAD_SPOUSE,
      beneficiaryName: "Nadia Faizal",
      relationship: "Spouse",
      benefitId: `${D}-B1`,
      allocated: 1000,
    },
    {
      beneficiaryId: AHMAD_CHILD,
      beneficiaryName: "Aisyah Faizal",
      relationship: "Child",
      benefitId: `${D}-B1`,
      allocated: 1000,
    },
    {
      beneficiaryId: AHMAD_CHILD_TWO,
      beneficiaryName: "Faris Faizal",
      relationship: "Child",
      benefitId: `${D}-B1`,
      allocated: 1000,
    },
    {
      beneficiaryId: AHMAD_CHILD_THREE,
      beneficiaryName: "Hana Faizal",
      relationship: "Child",
      benefitId: `${D}-B1`,
      allocated: 1000,
    },
    {
      beneficiaryId: AHMAD_CHILD_FOUR,
      beneficiaryName: "Iman Faizal",
      relationship: "Child",
      benefitId: `${D}-B1`,
      allocated: 1000,
    },
    {
      beneficiaryId: AHMAD_CHILD_FIVE,
      beneficiaryName: "Juna Faizal",
      relationship: "Child",
      benefitId: `${D}-B1`,
      allocated: 1000,
    },
    {
      beneficiaryId: AHMAD,
      benefitId: `${D}-B2`,
      allocated: 500,
    },
    {
      beneficiaryId: AHMAD_SPOUSE,
      beneficiaryName: "Nadia Faizal",
      relationship: "Spouse",
      benefitId: `${D}-B2`,
      allocated: 500,
    },
    {
      beneficiaryId: AHMAD_CHILD,
      beneficiaryName: "Aisyah Faizal",
      relationship: "Child",
      benefitId: `${D}-B2`,
      allocated: 500,
    },
    {
      beneficiaryId: AHMAD,
      benefitId: `${D}-B3`,
      allocated: 800,
    },
    {
      beneficiaryId: AHMAD_SPOUSE,
      beneficiaryName: "Nadia Faizal",
      relationship: "Spouse",
      benefitId: `${D}-B3`,
      allocated: 400,
    },
    {
      beneficiaryId: AHMAD_CHILD,
      beneficiaryName: "Aisyah Faizal",
      relationship: "Child",
      benefitId: `${D}-B3`,
      allocated: 400,
    },
    {
      beneficiaryId: AHMAD,
      benefitId: `${D}-B4`,
      allocated: 400,
    },
    {
      beneficiaryId: AHMAD_SPOUSE,
      beneficiaryName: "Nadia Faizal",
      relationship: "Spouse",
      benefitId: `${D}-B4`,
      allocated: 200,
    },
    {
      beneficiaryId: AHMAD_CHILD,
      beneficiaryName: "Aisyah Faizal",
      relationship: "Child",
      benefitId: `${D}-B4`,
      allocated: 200,
    },
    {
      beneficiaryId: AHMAD,
      benefitId: `${D}-B5`,
      allocated: 300,
    },
    {
      beneficiaryId: AHMAD_SPOUSE,
      beneficiaryName: "Nadia Faizal",
      relationship: "Spouse",
      benefitId: `${D}-B5`,
      allocated: 200,
    },
    {
      beneficiaryId: AHMAD_CHILD,
      beneficiaryName: "Aisyah Faizal",
      relationship: "Child",
      benefitId: `${D}-B5`,
      allocated: 200,
    },
  ],
}

// ── Policy E — C4: Individual pool + Shared dependent pool (Marvin McKinney) ──
const E = "POL-20260115-0011"
const policyE: AssignedPolicySource = {
  policy: {
    id: E,
    code: "BEN-CON-26",
    name: "Contract Staff Essentials 2026",
    version: "V1.1",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["contract", "full-time"],
    dependentCoverages: [{ type: "spouse" }, { type: "child" }],
    dependentsPoolType: "Shared",
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "calendar_year",
    status: "active",
    totalCapAmount: 600,
    dependentCapAmount: 400,
    groupCount: 1,
  },
  groups: [
    {
      id: `${E}-G1`,
      policyId: E,
      name: "General Medical",
      coverageScope: "Both",
      distributionType: "SharedAmount",
      dependentGroupCap: 400,
      isTaxable: false,
    },
  ],
  benefits: [
    {
      id: `${E}-B1`,
      groupId: `${E}-G1`,
      serviceId: "MD-GPV",
      amount: 300,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${E}-B2`,
      groupId: `${E}-G1`,
      serviceId: "MD-SCR",
      amount: 300,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ],
  allocations: [
    // Employee — individual wallet
    { beneficiaryId: MARVIN, benefitId: `${E}-B1`, allocated: 300 },
    { beneficiaryId: MARVIN, benefitId: `${E}-B2`, allocated: 300 },
    // Dependents — share one pool separately from employee (Shared dep pool)
    // allocated reflects the shared dep cap (400); UI renders sub-rows as "—"
    {
      beneficiaryId: MARVIN_SPOUSE,
      beneficiaryName: "Linda McKinney",
      relationship: "Spouse",
      benefitId: `${E}-B1`,
      allocated: 400,
    },
    {
      beneficiaryId: MARVIN_CHILD,
      beneficiaryName: "Tyler McKinney",
      relationship: "Child",
      benefitId: `${E}-B1`,
      allocated: 400,
    },
  ],
}

// ── Policy F — C5: Shared family pot — employee + dependents share one pool (Jason Teh) ──
const F = "POL-20260115-0012"
const policyF: AssignedPolicySource = {
  policy: {
    id: F,
    code: "BEN-SCR-26",
    name: "Acme Health Screening Programme 2026",
    version: "V1.0",
    organizationId: "ORG-20260115-0001",
    eligibleEmploymentTypes: ["full-time"],
    dependentCoverages: [{ type: "spouse" }, { type: "child" }],
    benefitPoolType: "Shared",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "financial_year",
    status: "active",
    totalCapAmount: 2000,
    groupCount: 1,
  },
  groups: [
    {
      id: `${F}-G1`,
      policyId: F,
      name: "Lifestyle & Wellness",
      coverageScope: "Both",
      distributionType: "SharedAmount",
      isTaxable: false,
    },
  ],
  benefits: [
    {
      id: `${F}-B1`,
      groupId: `${F}-G1`,
      serviceId: "FX-GYM",
      amount: 1000,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
    {
      id: `${F}-B2`,
      groupId: `${F}-G1`,
      serviceId: "MH-THR",
      amount: 1000,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ],
  allocations: [
    // All draw from one shared family pot — allocated = total family ceiling
    { beneficiaryId: JASON, benefitId: `${F}-B1`, allocated: 2000 },
    { beneficiaryId: JASON, benefitId: `${F}-B2`, allocated: 2000 },
    {
      beneficiaryId: JASON_SPOUSE,
      beneficiaryName: "Mei Teh",
      relationship: "Spouse",
      benefitId: `${F}-B1`,
      allocated: 2000,
    },
    {
      beneficiaryId: JASON_CHILD,
      beneficiaryName: "Ryan Teh",
      relationship: "Child",
      benefitId: `${F}-B1`,
      allocated: 2000,
    },
  ],
}

/** One employee → one assigned policy. C1–C5 on rows 1–5 + Ahmad Faizal as extended case. */
const BY_EMPLOYEE: Record<string, AssignedPolicySource> = {
  "EMP-20260115-0001": policyA, // C1 — Individual pool, no deps (Robert Fox)
  "EMP-20260115-0002": policyB, // C2 — Individual pool, Individual deps (Jenny Wilson)
  "EMP-20260115-0003": policyC, // C3 — Individual pool, SharedWithEmployee / Combined Pool (Michael Tan)
  "EMP-20260115-0004": policyE, // C4 — Individual pool, Shared dep pool (Marvin McKinney)
  "EMP-20260115-0005": policyF, // C5 — Shared family pot, emp + deps share one pool (Jason Teh)
  "EMP-20260115-0006": policyD, // Extended — Individual pool, Individual deps, split amounts (Ahmad Faizal)
}

/**
 * The employee's assigned policy with consumption folded in from claims.
 *
 * Returns `null` for an employee with no assigned policy. It used to fall back
 * to `policyA`, so an unknown id silently rendered Robert Fox's entitlement —
 * callers must handle the empty state instead.
 */
export function getEmployeeEntitlement(
  employeeId: string
): AssignedPolicyEntitlement | null {
  const source = BY_EMPLOYEE[employeeId]
  if (!source) return null
  const { allocations, ...rest } = source
  return {
    ...rest,
    usage: deriveUsage(employeeId, MOCK_EMPLOYEE_CLAIMS, allocations),
  }
}

// ── REMOVED (invalid cases): policyG, policyH, policyI (EMP-0007–0009) ──
// UC6–UC8 (benefitPoolType:"Shared" + dependentsPoolType combinations) are not
// valid product combinations in this codebase.
