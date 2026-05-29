import { Briefcase, Clock, Handshake, GraduationCap } from "@phosphor-icons/react"
import type { IdTypeOption } from "@/components/shared/identification-input"

export const EMPLOYMENT_TYPES = [
  {
    id: "full-time",
    title: "Full-time",
    description: "Standard permanent role with full benefits & probation.",
    icon: Briefcase,
  },
  {
    id: "part-time",
    title: "Part-time",
    description: "Reduced hours role with prorated benefits.",
    icon: Clock,
  },
  {
    id: "contract",
    title: "Contract",
    description: "Fixed-term engagement based on contract duration.",
    icon: Handshake,
  },
  {
    id: "internship",
    title: "Internship",
    description: "Temporary learning-focused role with limited benefits.",
    icon: GraduationCap,
  },
]

export const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Mother",
  "Father",
  "Brother",
  "Sister",
  "Mother-in-law",
  "Father-in-law",
]

export const MOCK_BRANCHES = [
  { id: "br_1", name: "ACME HQ (Kuala Lumpur)", country: "Malaysia" },
  { id: "br_2", name: "ACME Subang Jaya", country: "Malaysia" },
  { id: "br_3", name: "ACME Singapore", country: "Singapore" },
]

export const ID_TYPES_BY_COUNTRY: Record<string, IdTypeOption[]> = {
  Malaysia: [
    { id: "IC", label: "IC", description: "National ID Card (MyKad)" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
  Singapore: [
    { id: "NRIC", label: "NRIC", description: "Singapore National ID" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
  Indonesia: [
    { id: "KTP", label: "KTP", description: "Kartu Tanda Penduduk" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
  Thailand: [
    { id: "NID", label: "Thai NID", description: "Thai National ID Card" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
}

export const MOCK_DEPARTMENTS = [
  { id: "DC-001", name: "HR" },
  { id: "DC-002", name: "Tech" },
  { id: "DC-003", name: "Marketing" },
  { id: "DC-004", name: "Finance" },
  { id: "DC-005", name: "Operations" },
]

export const MOCK_TIERS = [
  { id: "TC-001", name: "Executive" },
  { id: "TC-002", name: "Senior Manager" },
  { id: "TC-003", name: "Manager" },
  { id: "TC-004", name: "Associate" },
]
