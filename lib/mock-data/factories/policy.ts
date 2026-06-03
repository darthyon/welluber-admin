import type { BenefitGroup, Benefit } from "@/types/policy"
import type { PolicyListItem, PolicyData } from "@/features/policies/types"
import { MAIN_SERVICE_IDS } from "@/lib/mock-data/service-catalog"
import { createPresetPolicyBundle } from "@/lib/mock-data/factories/policy-presets"

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
  const org = ORG_MAP[index] ?? {
    orgId: `ORG-20260401-00${String(index + 1).padStart(2, "0")}`,
    orgName: `Enterprise Partner ${index - 4} Sdn Bhd`,
  }

  const presetBundle = createPresetPolicyBundle(index, id, org)
  if (presetBundle) return presetBundle

  // Generated (index 5-9)
  const g = index - 5
  const statusOpts: PolicyListItem["status"][] = [
    "active",
    "draft",
    "active",
    "active",
    "deactivated",
  ]
  const modeOpts: PolicyListItem["utilisationMode"][] = [
    "Fixed",
    "Prorated",
    "Fixed",
    "Fixed",
    "Fixed",
  ]
  const cycleOpts: PolicyListItem["refreshCycle"][] = [
    "Yearly",
    "Quarterly",
    "Monthly",
    "Yearly",
    "Yearly",
  ]
  const groupNames = [
    "Core Wellness",
    "Mental Health",
    "Physical Fitness",
    "Nutrition Care",
    "Holistic Health",
  ]
  const gId1 = `${id}-G1`
  const groups: BenefitGroup[] = [
    {
      id: gId1,
      policyId: id,
      name: groupNames[g]!,
      coverageScope: "Employee",
      distributionType: "IndividualBenefitAmount",
      isTaxable: groupNames[g] !== "Mental Health",
    },
  ]
  const serviceId: string = MAIN_SERVICE_IDS[g % MAIN_SERVICE_IDS.length]!
  const benefits: Benefit[] = [
    {
      id: `${id}-B1`,
      groupId: gId1,
      serviceId,
      amount: 200 + g * 50,
      coPayment: { required: false, type: "Percentage", value: 0 },
    },
  ]
  return {
    policy: {
      id,
      name: `Wellness Policy ${n}`,
      code: `BEN-GEN-0${n}`,
      description: `Generated policy for ${org.orgName}.`,
      organizationId: org.orgId,
      eligibleEmploymentTypes: ["full-time"],
      dependentCoverages: [],
      benefitPoolType: "Individual",
      utilisationMode: modeOpts[g]!,
      prorateUnit: modeOpts[g] === "Prorated" ? "Monthly" : undefined,
      refreshCycle: cycleOpts[g]!,
      refreshStartReference: "financial_year",
      status: statusOpts[g]!,
      groupCount: 1,
      orgName: org.orgName,
      createdAt: "2026-04-01T00:00:00Z",
    },
    data: { groups, benefits },
  }
}
