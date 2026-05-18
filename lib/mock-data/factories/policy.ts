import type { BenefitGroup, Benefit } from "@/types/policy"
import type { PolicyListItem, PolicyData } from "@/features/policies/types"
import { MAIN_SERVICE_IDS } from "@/lib/mock-data/service-catalog"

export interface PolicyBundle {
  policy: PolicyListItem
  data: PolicyData
}

const ORG_MAP: Record<number, { orgId: string; orgName: string }> = {
  0: { orgId: "ORG-20260115-0001", orgName: "Acme Corporation Sdn Bhd" },
  1: { orgId: "ORG-20260115-0001", orgName: "Acme Corporation Sdn Bhd" },
  2: { orgId: "ORG-20260301-0002", orgName: "Global Tech Solutions" },
  3: { orgId: "ORG-20260115-0001", orgName: "Acme Corporation Sdn Bhd" },
  4: { orgId: "ORG-20260115-0001", orgName: "Acme Corporation Sdn Bhd" },
}

export function createPolicy(index: number): PolicyBundle {
  const n = index + 1
  const id = `POL-20260115-${String(n).padStart(4, "0")}`
  const org = ORG_MAP[index] ?? { orgId: `ORG-20260401-00${String(index + 1).padStart(2, "0")}`, orgName: `Enterprise Partner ${index - 4} Sdn Bhd` }

  // Hand-crafted policies (0-4 match existing data with new IDs)
  if (index === 0) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", distributionType: "IndividualBenefitAmount", isTaxable: false },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "FX-PT", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "NT-NUT", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Acme Employee Wellness Policy FY2026", code: "BEN-STD-01", description: "Core employee wellness handbook policy for full-time staff coverage.", organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], dependentCoverages: [], benefitPoolType: "Individual", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", status: "active", groupCount: groups.length, orgName: org.orgName, createdAt: "2026-01-15T10:00:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 1) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Premium Wellness", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Clinical Therapy", distributionType: "IndividualBenefitAmount", isTaxable: false },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Acme Leadership Benefits Policy FY2026", code: "BEN-EXC-02", description: "Leadership-tier benefits handbook policy with expanded clinical therapy coverage.", organizationId: org.orgId, eligibleEmploymentTypes: ["full-time", "part-time"], dependentCoverages: [], benefitPoolType: "Individual", utilisationMode: "Prorated", prorateUnit: "Monthly", refreshCycle: "Quarterly", refreshStartReference: "join_date", status: "draft", groupCount: groups.length, orgName: org.orgName, createdAt: "2026-03-22T14:30:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 2) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Lite Benefits", distributionType: "SharedAmount", maxUsagePerCycle: 200, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 50, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Global Tech Core Benefits Policy FY2026", code: "BEN-CON-03", description: "Core logistics workforce handbook policy for contract and internship coverage.", organizationId: org.orgId, eligibleEmploymentTypes: ["contract", "internship"], dependentCoverages: [], benefitPoolType: "Shared", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", status: "deactivated", groupCount: groups.length, orgName: org.orgName, createdAt: "2026-11-05T09:15:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 3) {
    const parentId = "POL-20260115-0001"
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", distributionType: "IndividualBenefitAmount", isTaxable: false },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 350, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "FX-PT", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "NT-NUT", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Acme Engineering Wellness Supplement FY2026", code: "BEN-STD-01-ENG", description: "Engineering supplement with higher gym allocation than base policy.", parentPolicyId: parentId, organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], dependentCoverages: [], benefitPoolType: "Individual", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", status: "active", groupCount: groups.length, orgName: org.orgName, targetEmployeeIds: ["EMP-20260115-0001"], createdAt: "2026-02-01T00:00:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 4) {
    const parentId = "POL-20260115-0001"
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: true },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", distributionType: "IndividualBenefitAmount", isTaxable: false },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500, isTaxable: true },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "FX-GYM", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "FX-PT", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "MH-THR", amount: 500, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "NT-NUT", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Acme Senior Band Wellness Supplement FY2026", code: "BEN-STD-01-SNR", description: "Senior band supplement with elevated therapy cap versus base policy.", parentPolicyId: parentId, organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], dependentCoverages: [], benefitPoolType: "Individual", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", status: "active", groupCount: groups.length, orgName: org.orgName, targetEmployeeIds: ["EMP-20260115-0002", "EMP-20260115-0004"], createdAt: "2026-02-15T00:00:00Z" },
      data: { groups, benefits },
    }
  }

  // Generated (index 5-9)
  const g = index - 5
  const statusOpts: PolicyListItem["status"][] = ["active", "draft", "active", "active", "deactivated"]
  const modeOpts: PolicyListItem["utilisationMode"][] = ["Fixed", "Prorated", "Fixed", "Fixed", "Fixed"]
  const cycleOpts: PolicyListItem["refreshCycle"][] = ["Yearly", "Quarterly", "Monthly", "Yearly", "Yearly"]
  const groupNames = ["Core Wellness", "Mental Health", "Physical Fitness", "Nutrition Care", "Holistic Health"]
  const gId1 = `${id}-G1`
  const groups: BenefitGroup[] = [{ id: gId1, policyId: id, name: groupNames[g]!, distributionType: "IndividualBenefitAmount", isTaxable: groupNames[g] !== "Mental Health" }]
  const serviceId: string = MAIN_SERVICE_IDS[g % MAIN_SERVICE_IDS.length]!
  const benefits: Benefit[] = [{ id: `${id}-B1`, groupId: gId1, serviceId, amount: 200 + g * 50, coPayment: { required: false, type: "Percentage", value: 0 } }]
  return {
    policy: { id, name: `Wellness Policy ${n}`, code: `BEN-GEN-0${n}`, description: `Generated policy for ${org.orgName}.`, organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], dependentCoverages: [], benefitPoolType: "Individual", utilisationMode: modeOpts[g]!, prorateUnit: modeOpts[g] === "Prorated" ? "Monthly" : undefined, refreshCycle: cycleOpts[g]!, refreshStartReference: "fy_start", status: statusOpts[g]!, groupCount: 1, orgName: org.orgName, createdAt: "2026-04-01T00:00:00Z" },
    data: { groups, benefits },
  }
}
