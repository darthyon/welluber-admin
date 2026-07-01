import {
  Buildings,
  Users,
  Shield,
  Gear,
  SealCheck,
  Ticket,
  IdentificationCard,
  Scroll,
} from "@phosphor-icons/react"
import type { BenefitPolicy } from "@/types/policy"

export type AssignedPolicy = BenefitPolicy & {
  assignedTo: string
  employeeCount: number
  lastUpdated: string
  categories?: string[]
  groups?: string[]
}

export const ORG_TYPE_LABELS: Record<string, string> = {
  sole_proprietorship: "Sole Proprietorship",
  partnership: "Partnership",
  sdn_bhd: "Private Limited (Sdn. Bhd.)",
  llp: "Limited Liability Partnership (LLP)",
  bhd: "Public Limited (Bhd.)",
  clbg: "Company Limited by Guarantee (CLBG)",
}

export const TABS = [
  { id: "profile", label: "Org Details", icon: Buildings },
  { id: "branches", label: "Branches", icon: Buildings },
  { id: "employees", label: "Employees", icon: Users },
  { id: "policies", label: "Benefit Policy", icon: Shield },
  { id: "claims", label: "Claims", icon: SealCheck },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
  { id: "settings", label: "Settings", icon: Gear },
] as const

export type TabId = (typeof TABS)[number]["id"]

export const ORG_FTU_ORG_ID = "ORG-20260401-0004"

export const OTHER_ORGS = [
  {
    label: "Acme Corporation Sdn Bhd",
    href: "/organizations/ORG-20260115-0001",
  },
  { label: "Global Tech Solutions", href: "/organizations/ORG-20260301-0002" },
  { label: "Nexus Innovations", href: "/organizations/ORG-20260310-0003" },
]

export const EMPLOYEE_SUB_TABS = [
  { id: "directory", label: "Employee Directory", icon: Users },
  { id: "dependents", label: "Dependent Directory", icon: IdentificationCard },
  { id: "entitlements", label: "Entitlements", icon: Scroll },
  { id: "claims", label: "Claims", icon: SealCheck },
] as const
