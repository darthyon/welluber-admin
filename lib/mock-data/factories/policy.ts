import type { BenefitGroup, Benefit } from "@/types/policy"
import type { PolicyListItem, PolicyData } from "@/features/policies/types"

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
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500 },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "s1", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "s2", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "s3", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Standard Health 2026", code: "BEN-STD-01", description: "Comprehensive wellness policy for all full-time staff.", organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], coversDependents: false, benefitPoolType: "Individual", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", activationMode: "after_join", status: "active", groupCount: groups.length, orgName: org.orgName, createdAt: "2026-01-15T10:00:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 1) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Premium Wellness", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G2`, policyId: id, name: "Clinical Therapy", distributionType: "IndividualBenefitAmount" },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "s1", amount: 500, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G2`, serviceId: "s3", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Executive Wellness", code: "BEN-EXC-02", description: "Premium tier benefits including specialized clinical therapy.", organizationId: org.orgId, eligibleEmploymentTypes: ["full-time", "part-time"], coversDependents: false, benefitPoolType: "Individual", utilisationMode: "Prorated", prorateUnit: "Monthly", refreshCycle: "Quarterly", refreshStartReference: "join_date", activationMode: "after_join", status: "draft", groupCount: groups.length, orgName: org.orgName, createdAt: "2026-03-22T14:30:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 2) {
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Lite Benefits", distributionType: "SharedAmount", maxUsagePerCycle: 200 },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "s1", amount: 50, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Contractor Lite", code: "BEN-CON-03", description: "Stripped-down benefits for contract and intern staff.", organizationId: org.orgId, eligibleEmploymentTypes: ["contract", "internship"], coversDependents: false, benefitPoolType: "Shared", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", activationMode: "after_join", status: "deactivated", groupCount: groups.length, orgName: org.orgName, createdAt: "2026-11-05T09:15:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 3) {
    const parentId = "POL-20260115-0001"
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500 },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "s1", amount: 350, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "s2", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "s3", amount: 300, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Standard Health 2026 — Engineering Override", code: "BEN-STD-01-ENG", description: "Engineering team variant with higher gym allocation.", parentPolicyId: parentId, organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], coversDependents: false, benefitPoolType: "Individual", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", activationMode: "after_join", status: "active", groupCount: groups.length, orgName: org.orgName, targetEmployeeIds: ["EMP-20260115-0001"], createdAt: "2026-02-01T00:00:00Z" },
      data: { groups, benefits },
    }
  }

  if (index === 4) {
    const parentId = "POL-20260115-0001"
    const groups: BenefitGroup[] = [
      { id: `${id}-G1`, policyId: id, name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G2`, policyId: id, name: "Mental Fitness", distributionType: "IndividualBenefitAmount" },
      { id: `${id}-G3`, policyId: id, name: "Nutritional Support", distributionType: "SharedAmount", maxUsagePerCycle: 500 },
    ]
    const benefits: Benefit[] = [
      { id: `${id}-B1`, groupId: `${id}-G1`, serviceId: "s1", amount: 200, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B2`, groupId: `${id}-G1`, serviceId: "s2", amount: 150, coPayment: { required: false, type: "Percentage", value: 0 } },
      { id: `${id}-B3`, groupId: `${id}-G2`, serviceId: "s3", amount: 500, coPayment: { required: true, type: "Percentage", value: 10 } },
      { id: `${id}-B4`, groupId: `${id}-G3`, serviceId: "s5", amount: 100, coPayment: { required: false, type: "Percentage", value: 0 } },
    ]
    return {
      policy: { id, name: "Standard Health 2026 — Seniors", code: "BEN-STD-01-SNR", description: "Senior band variant with elevated therapy cap.", parentPolicyId: parentId, organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], coversDependents: false, benefitPoolType: "Individual", utilisationMode: "Fixed", refreshCycle: "Yearly", refreshStartReference: "fy_start", activationMode: "after_join", status: "active", groupCount: groups.length, orgName: org.orgName, targetEmployeeIds: ["EMP-20260115-0002", "EMP-20260115-0004"], createdAt: "2026-02-15T00:00:00Z" },
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
  const groups: BenefitGroup[] = [{ id: gId1, policyId: id, name: groupNames[g]!, distributionType: "IndividualBenefitAmount" }]
  const benefits: Benefit[] = [{ id: `${id}-B1`, groupId: gId1, serviceId: `s${(g % 6) + 1}`, amount: 200 + g * 50, coPayment: { required: false, type: "Percentage", value: 0 } }]
  return {
    policy: { id, name: `Wellness Policy ${n}`, code: `BEN-GEN-0${n}`, description: `Generated policy for ${org.orgName}.`, organizationId: org.orgId, eligibleEmploymentTypes: ["full-time"], coversDependents: false, benefitPoolType: "Individual", utilisationMode: modeOpts[g]!, prorateUnit: modeOpts[g] === "Prorated" ? "Monthly" : undefined, refreshCycle: cycleOpts[g]!, refreshStartReference: "fy_start", activationMode: "after_join", status: statusOpts[g]!, groupCount: 1, orgName: org.orgName, createdAt: "2026-04-01T00:00:00Z" },
    data: { groups, benefits },
  }
}
