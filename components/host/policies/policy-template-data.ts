import { PolicyTemplate } from "@/types/policy";

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: "active-living",
    name: "Active Living",
    tagline: "Gym access, fitness classes, and recovery services for active employees.",
    icon: "Barbell",
    prefill: {
      name: "Active Living Plan",
      description: "Gym access, fitness classes, and recovery services for active employees.",
      eligibleEmploymentTypes: ["full-time"],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "fy_start",
      groups: [
        {
          id: "grp-active-wellbeing",
          policyId: "",
          name: "Physical Wellbeing",
          distributionType: "IndividualBenefitAmount",
        },
        {
          id: "grp-active-recovery",
          policyId: "",
          name: "Personal Care",
          distributionType: "IndividualBenefitAmount",
        },
      ],
      benefits: [
        // Physical Wellbeing group
        { id: "ben-gym", groupId: "grp-active-wellbeing", serviceId: "s1", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-fitness", groupId: "grp-active-wellbeing", serviceId: "s2", amount: 400, coPayment: { required: false, type: "Percentage", value: 0 } },
        // Personal Care group
        { id: "ben-spa", groupId: "grp-active-recovery", serviceId: "s6", amount: 600, coPayment: { required: false, type: "Percentage", value: 0 } },
      ],
    },
  },
  {
    id: "mind-and-care",
    name: "Mind & Care",
    tagline: "Therapy, mindfulness, and nutrition support for holistic employee wellbeing.",
    icon: "Brain",
    prefill: {
      name: "Mind & Care Essentials",
      description: "Therapy, mindfulness, and nutrition support for holistic employee wellbeing.",
      eligibleEmploymentTypes: ["full-time"],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "fy_start",
      groups: [
        {
          id: "grp-mind-psych",
          policyId: "",
          name: "Psychological Wellbeing",
          distributionType: "IndividualBenefitAmount",
        },
        {
          id: "grp-mind-nutrition",
          policyId: "",
          name: "Nutritional Support",
          distributionType: "IndividualBenefitAmount",
        },
      ],
      benefits: [
        // Psychological Wellbeing group
        { id: "ben-therapy", groupId: "grp-mind-psych", serviceId: "s3", amount: 1200, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-mental", groupId: "grp-mind-psych", serviceId: "s4", amount: 600, coPayment: { required: false, type: "Percentage", value: 0 } },
        // Nutritional Support group
        { id: "ben-diet", groupId: "grp-mind-nutrition", serviceId: "s5", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
      ],
    },
  },
  {
    id: "full-circle",
    name: "Full Circle",
    tagline: "Full-spectrum physical, mental, and nutritional coverage for every employee.",
    icon: "Circle",
    prefill: {
      name: "Full Circle Wellness",
      description: "Full-spectrum physical, mental, and nutritional coverage for every employee.",
      eligibleEmploymentTypes: ["full-time"],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "fy_start",
      groups: [
        {
          id: "grp-full-physical",
          policyId: "",
          name: "Physical Wellbeing",
          distributionType: "IndividualBenefitAmount",
        },
        {
          id: "grp-full-psych",
          policyId: "",
          name: "Psychological Wellbeing",
          distributionType: "IndividualBenefitAmount",
        },
        {
          id: "grp-full-nutrition",
          policyId: "",
          name: "Nutritional Support",
          distributionType: "IndividualBenefitAmount",
        },
        {
          id: "grp-full-care",
          policyId: "",
          name: "Personal Care",
          distributionType: "IndividualBenefitAmount",
        },
      ],
      benefits: [
        // Physical Wellbeing
        { id: "ben-gym-fc", groupId: "grp-full-physical", serviceId: "s1", amount: 1000, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-fitness-fc", groupId: "grp-full-physical", serviceId: "s2", amount: 600, coPayment: { required: false, type: "Percentage", value: 0 } },
        // Psychological Wellbeing
        { id: "ben-therapy-fc", groupId: "grp-full-psych", serviceId: "s3", amount: 1200, coPayment: { required: false, type: "Percentage", value: 0 } },
        { id: "ben-mental-fc", groupId: "grp-full-psych", serviceId: "s4", amount: 600, coPayment: { required: false, type: "Percentage", value: 0 } },
        // Nutritional Support
        { id: "ben-diet-fc", groupId: "grp-full-nutrition", serviceId: "s5", amount: 800, coPayment: { required: false, type: "Percentage", value: 0 } },
        // Personal Care
        { id: "ben-spa-fc", groupId: "grp-full-care", serviceId: "s6", amount: 600, coPayment: { required: false, type: "Percentage", value: 0 } },
      ],
    },
  },
];
