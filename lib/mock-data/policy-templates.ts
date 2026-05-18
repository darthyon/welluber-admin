import type { PolicyTemplate } from "@/types/policy"

export const MOCK_POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: "standard-health",
    name: "Standard Health",
    tagline: "Balanced physical, mental, and nutrition benefits for broad employee coverage.",
    icon: "Circle",
    prefill: {
      name: "Standard Health Policy",
      description: "Balanced physical, mental, and nutrition benefits for broad employee coverage.",
      eligibleEmploymentTypes: ["full-time", "part-time", "contract", "internship"],
      dependentCoverages: [],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "financial_year",
      groups: [
        { id: "grp-standard-physical", policyId: "", name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: true },
        { id: "grp-standard-mental", policyId: "", name: "Psychological Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: false },
        { id: "grp-standard-nutrition", policyId: "", name: "Nutritional Support", distributionType: "IndividualBenefitAmount", isTaxable: true },
      ],
      benefits: [
        { id: "ben-standard-gym", groupId: "grp-standard-physical", serviceId: "s1", amount: 700, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-standard-fitness", groupId: "grp-standard-physical", serviceId: "s2", amount: 450, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-standard-therapy", groupId: "grp-standard-mental", serviceId: "s3", amount: 900, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-standard-diet", groupId: "grp-standard-nutrition", serviceId: "s5", amount: 550, coPayment: { required: false, type: "Percentage", value: 0 } },
      ],
    },
  },
  {
    id: "executive-wellness",
    name: "Executive Wellness",
    tagline: "Premium coverage for leadership tiers with higher caps and recovery services.",
    icon: "Barbell",
    prefill: {
      name: "Executive Wellness Policy",
      description: "Premium coverage for leadership tiers with higher caps and recovery services.",
      eligibleEmploymentTypes: ["full-time", "part-time", "contract", "internship"],
      dependentCoverages: [],
      benefitPoolType: "Shared",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "financial_year",
      groups: [
        { id: "grp-exec-physical", policyId: "", name: "Physical Wellbeing", distributionType: "SharedAmount", maxUsagePerCycle: 4500, isTaxable: true },
        { id: "grp-exec-care", policyId: "", name: "Personal Care", distributionType: "SharedAmount", maxUsagePerCycle: 3000, isTaxable: true },
      ],
      benefits: [
        { id: "ben-exec-gym", groupId: "grp-exec-physical", serviceId: "s1", amount: 1800, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-exec-fitness", groupId: "grp-exec-physical", serviceId: "s2", amount: 1200, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-exec-spa", groupId: "grp-exec-care", serviceId: "s6", amount: 1800, coPayment: { required: false, type: "Percentage", value: 0 } },
      ],
    },
  },
  {
    id: "contractor-lite",
    name: "Contractor Lite",
    tagline: "Lean wellness essentials with lower caps for short-term and contract teams.",
    icon: "PencilSimpleLine",
    prefill: {
      name: "Contractor Lite Policy",
      description: "Lean wellness essentials with lower caps for short-term and contract teams.",
      eligibleEmploymentTypes: ["contract", "part-time"],
      dependentCoverages: [],
      benefitPoolType: "Individual",
      utilisationMode: "Prorated",
      refreshCycle: "Monthly",
      refreshStartReference: "financial_year",
      groups: [
        { id: "grp-contractor-mental", policyId: "", name: "Psychological Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: false },
        { id: "grp-contractor-physical", policyId: "", name: "Physical Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: true },
      ],
      benefits: [
        { id: "ben-contractor-mental", groupId: "grp-contractor-mental", serviceId: "s4", amount: 300, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-contractor-gym", groupId: "grp-contractor-physical", serviceId: "s1", amount: 250, coPayment: { required: true, type: "Percentage", value: 20 } },
      ],
    },
  },
  {
    id: "mental-health-addon",
    name: "Mental Health Add-on",
    tagline: "Focused support for therapy and counseling with flexible employee-level usage.",
    icon: "Brain",
    prefill: {
      name: "Mental Health Add-on",
      description: "Focused support for therapy and counseling with flexible employee-level usage.",
      eligibleEmploymentTypes: ["full-time", "part-time", "contract", "internship"],
      dependentCoverages: [],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "financial_year",
      groups: [
        { id: "grp-mental-core", policyId: "", name: "Psychological Wellbeing", distributionType: "IndividualBenefitAmount", isTaxable: false },
      ],
      benefits: [
        { id: "ben-mental-therapy", groupId: "grp-mental-core", serviceId: "s3", amount: 1200, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-mental-counsel", groupId: "grp-mental-core", serviceId: "s4", amount: 900, coPayment: { required: false, type: "Percentage", value: 0 } },
      ],
    },
  },
]
