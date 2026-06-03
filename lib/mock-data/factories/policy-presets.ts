import type { BenefitGroup, Benefit } from "@/types/policy"
import type { PolicyBundle } from "./policy"

export function createPresetPolicyBundle(
  index: number,
  id: string,
  org: { orgId: string; orgName: string }
): PolicyBundle | null {
  if (index === 0) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", coverageScope: "Employee", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", coverageScope: "Employee", distributionType: "IndividualBenefitAmount", isTaxable: false },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", coverageScope: "Employee", distributionType: "SharedAmount", maxUsagePerCycle: 500, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "FX-PT", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "NT-NUT", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: {
        id,
        name: "Acme Employee Wellness Policy FY2026",
        code: "BEN-STD-01",
        version: "V1.1",
        description: "Core employee wellness handbook policy for full-time staff coverage.",
        organizationId: org.orgId,
        eligibleEmploymentTypes: ["full-time"],
        dependentCoverages: [{ type: "spouse" }, { type: "child" }, { type: "mother" }, { type: "father" }, { type: "sibling" }],
        dependentsPoolType: "SharedWithEmployee",
        benefitPoolType: "Individual",
        utilisationMode: "Fixed",
        refreshCycle: "Yearly",
        refreshStartReference: "financial_year",
        status: "active",
        groupCount: groups.length,
        orgName: org.orgName,
        createdAt: "2026-01-15T10:00:00Z",
      },
      data: { groups, benefits },
    }
  }

  if (index === 1) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Premium Wellness", coverageScope: "Employee", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Mindful Support", coverageScope: "Employee", distributionType: "IndividualBenefitAmount", isTaxable: false },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: {
        id,
        name: "Acme Leadership Benefits Policy FY2026",
        code: "BEN-EXC-02",
        version: "V2.0",
        description: "Leadership-tier benefits handbook policy with expanded wellbeing support.",
        organizationId: org.orgId,
        eligibleEmploymentTypes: ["full-time", "part-time"],
        dependentCoverages: [],
        benefitPoolType: "Individual",
        utilisationMode: "Prorated",
        prorateUnit: "Monthly",
        refreshCycle: "Quarterly",
        refreshStartReference: "financial_year",
        status: "draft",
        groupCount: groups.length,
        orgName: org.orgName,
        createdAt: "2026-03-22T14:30:00Z",
      },
      data: { groups, benefits },
    }
  }

  if (index === 2) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Lite Benefits", coverageScope: "Employee", distributionType: "SharedAmount", maxUsagePerCycle: 200, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 50, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: {
        id,
        name: "Global Tech Core Benefits Policy FY2026",
        code: "BEN-CON-03",
        version: "V1.0",
        description: "Core workforce handbook policy for contract and internship coverage.",
        organizationId: org.orgId,
        eligibleEmploymentTypes: ["contract", "internship"],
        dependentCoverages: [],
        benefitPoolType: "Individual",
        utilisationMode: "Fixed",
        refreshCycle: "Yearly",
        refreshStartReference: "financial_year",
        status: "deactivated",
        groupCount: groups.length,
        orgName: org.orgName,
        createdAt: "2026-11-05T09:15:00Z",
      },
      data: { groups, benefits },
    }
  }

  if (index === 3 || index === 4) {
    const parentId = "POL-20260115-0001"
    const therapyAmount = index === 3 ? 300 : 500
    const targetEmployeeIds =
      index === 3 ? ["EMP-20260115-0001"] : ["EMP-20260115-0002", "EMP-20260115-0004"]
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", coverageScope: "Employee", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", coverageScope: "Employee", distributionType: "IndividualBenefitAmount", isTaxable: false },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", coverageScope: "Employee", distributionType: "SharedAmount", maxUsagePerCycle: 500, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: index === 3 ? 350 : 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "FX-PT", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: therapyAmount, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "NT-NUT", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: {
        id,
        name: index === 3 ? "Acme Engineering Wellness Supplement FY2026" : "Acme Senior Band Wellness Supplement FY2026",
        code: index === 3 ? "BEN-STD-01-ENG" : "BEN-STD-01-SNR",
        version: index === 4 ? "V1.1" : undefined,
        description:
          index === 3
            ? "Engineering supplement with higher gym allocation than the base policy."
            : "Senior band supplement with elevated therapy support versus the base policy.",
        parentPolicyId: parentId,
        organizationId: org.orgId,
        eligibleEmploymentTypes: ["full-time"],
        dependentCoverages: [],
        benefitPoolType: "Individual",
        utilisationMode: "Fixed",
        refreshCycle: "Yearly",
        refreshStartReference: "financial_year",
        status: "active",
        groupCount: groups.length,
        orgName: org.orgName,
        targetEmployeeIds,
        createdAt: index === 3 ? "2026-02-01T00:00:00Z" : "2026-02-15T00:00:00Z",
      },
      data: { groups, benefits },
    }
  }

  return null
}
