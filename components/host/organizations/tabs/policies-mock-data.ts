import type { BenefitGroup, Benefit } from "@/types/policy"

export const INITIAL_MOCK_GROUPS: BenefitGroup[] = [
  {
    id: "g1",
    policyId: "pol_1",
    name: "Physical Wellbeing",
    description: "Standard physical health services",
    coverageScope: "Employee",
    distributionType: "IndividualBenefitAmount" as const,
  },
  {
    id: "g2",
    policyId: "pol_1",
    name: "Mental Fitness",
    description: "Counseling and meditation support",
    coverageScope: "Employee",
    distributionType: "IndividualBenefitAmount" as const,
  },
  {
    id: "g3",
    policyId: "pol_2",
    name: "Flexi-Benefits",
    description: "Shared budget for various lifestyle services",
    coverageScope: "Employee",
    distributionType: "SharedAmount" as const,
    maxUsagePerCycle: 500,
  },
]

export const INITIAL_MOCK_BENEFITS: Benefit[] = [
  {
    id: "b1",
    groupId: "g1",
    serviceId: "FX-GYM",
    amount: 200,
    coPayment: { required: false, type: "Percentage", value: 0 },
  },
  {
    id: "b2",
    groupId: "g2",
    serviceId: "MH-MED",
    amount: 150,
    coPayment: { required: true, type: "Percentage", value: 10 },
  },
  {
    id: "b3",
    groupId: "g3",
    serviceId: "NT-NUT",
    amount: 100,
    coPayment: { required: false, type: "Percentage", value: 0 },
  },
  {
    id: "b4",
    groupId: "g3",
    serviceId: "SP-FAC",
    amount: 100,
    coPayment: { required: false, type: "Percentage", value: 0 },
  },
]
