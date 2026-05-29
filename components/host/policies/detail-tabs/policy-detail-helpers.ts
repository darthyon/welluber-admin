import {
  IdentificationCard,
  TreeStructure,
  Buildings,
  ClockCounterClockwise,
  Barbell,
  Sparkle,
  FlowerLotus,
  Brain,
  HandHeart,
  Scissors,
  Leaf,
  Baby,
  PersonSimpleWalk,
} from "@phosphor-icons/react"
import { createElement } from "react"
import { SERVICES, resolveMainServiceId } from "@/lib/mock-data/service-catalog"
import type { BenefitPolicy } from "@/types/policy"

export const TABS = [
  { id: "overview", label: "Overview", icon: IdentificationCard },
  { id: "benefit-groups", label: "Benefit Groups", icon: TreeStructure },
  { id: "versions", label: "Versions", icon: TreeStructure },
  { id: "employees", label: "Assigned Employees", icon: Buildings },
  { id: "audit", label: "Audit Log", icon: ClockCounterClockwise },
] as const

export type TabId = (typeof TABS)[number]["id"]

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

export function getMainServiceIcon(serviceId: string) {
  const category = SERVICES.find((s) => s.id === resolveMainServiceId(serviceId))?.category
  switch (category) {
    case "Fitness & Exercise":
      return createElement(Barbell, { size: 16, weight: "duotone", className: "text-faint" })
    case "Massage & Bodywork":
      return createElement(HandHeart, { size: 16, weight: "duotone", className: "text-faint" })
    case "Spa & Aesthetics":
      return createElement(Sparkle, { size: 16, weight: "duotone", className: "text-faint" })
    case "Beauty & Personal Care":
      return createElement(Scissors, { size: 16, weight: "duotone", className: "text-faint" })
    case "Mental Health & Mindfulness":
      return createElement(Brain, { size: 16, weight: "duotone", className: "text-faint" })
    case "Alternative & Holistic Therapies":
      return createElement(Leaf, { size: 16, weight: "duotone", className: "text-faint" })
    case "Maternal & Child Wellness":
      return createElement(Baby, { size: 16, weight: "duotone", className: "text-faint" })
    case "Senior & Geriatric Wellness":
      return createElement(PersonSimpleWalk, { size: 16, weight: "duotone", className: "text-faint" })
    default:
      return createElement(FlowerLotus, { size: 16, weight: "duotone", className: "text-faint" })
  }
}

export function formatDependentLabel(policy: BenefitPolicy): string {
  if (!policy.dependentCoverages?.length) return "Employee only"
  const typeMap: Record<string, string> = {
    spouse: "Spouse",
    child: "Child",
    mother: "Mother",
    father: "Father",
    sibling: "Sibling",
    inlaw: "In-law",
  }
  return policy.dependentCoverages.map((c) => typeMap[c.type] ?? c.type).join(", ")
}

export function formatEmploymentChip(policy: BenefitPolicy): string {
  const types = (policy.eligibleEmploymentTypes ?? []).map(
    (t) => EMPLOYMENT_TYPE_LABELS[t] ?? t
  )
  if (types.length === 0) return "No employment types"
  if (types.length === 1) return types[0]
  const joined = `${types[0]} + ${types[1]}`
  if (types.length === 2 && joined.length <= 24) return joined
  return `${types.length} employment types`
}

export function formatRefreshChip(policy: BenefitPolicy): string {
  if (policy.refreshCycle !== "Yearly") return policy.refreshCycle
  return `Yearly · ${
    policy.refreshStartReference === "financial_year" ? "FY start" : "Calendar year"
  }`
}

export function formatUtilisationChip(policy: BenefitPolicy): string {
  if (policy.utilisationMode === "Fixed") return "Fixed utilisation"
  return `Prorated ${(policy.prorateUnit ?? "Monthly").toLowerCase()}`
}

export function formatCoverageChip(policy: BenefitPolicy): string {
  return (policy.dependentCoverages?.length ?? 0) > 0
    ? "Employee + dependents"
    : "Employee only"
}

export function formatAmountChip(policy: BenefitPolicy): string {
  return typeof policy.totalCapAmount === "number"
    ? `RM ${policy.totalCapAmount.toLocaleString()}`
    : "Unlimited amount"
}
