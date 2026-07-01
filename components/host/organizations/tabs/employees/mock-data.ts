import { ORG_FTU_ORG_ID } from "@/components/host/organizations/constants"

type EmployeeDirectoryMock = {
  id: string
  name: string
  email: string
  branch: string
  status: string
  empCode: string
  joinDate: string
  lastActive: string
  department: string
  tier: string
  employmentType: string
  dependentsCount: number
  benefitPolicies: Array<{
    policyName: string
    benefitGroups: string[]
    utilisation: number
  }>
}

const ACME_EMPLOYEE_GRID: EmployeeDirectoryMock[] = [
  {
    id: "EMP-20260115-0001",
    name: "Robert Fox",
    email: "robert.f@acme.com",
    branch: "ACME HQ",
    status: "Linked",
    empCode: "ACM-001",
    joinDate: "12 Oct 2023",
    lastActive: "09 Apr 2026, 17:15",
    department: "Engineering",
    tier: "Manager",
    employmentType: "full-time",
    dependentsCount: 0,
    benefitPolicies: [
      {
        policyName: "Employee Essentials 2026",
        benefitGroups: ["General Wellness"],
        utilisation: 20,
      },
    ],
  },
  {
    id: "EMP-20260115-0002",
    name: "Jenny Wilson",
    email: "jenny.w@acme.com",
    branch: "ACME Subang Jaya",
    status: "Linked",
    empCode: "ACM-042",
    joinDate: "05 Mar 2024",
    lastActive: "09 Apr 2026, 16:45",
    department: "Product",
    tier: "Senior Manager",
    employmentType: "full-time",
    dependentsCount: 2,
    benefitPolicies: [
      {
        policyName: "Acme Family Wellness 2026",
        benefitGroups: ["Physical Wellbeing", "Mental Fitness"],
        utilisation: 15,
      },
    ],
  },
  {
    id: "EMP-20260115-0003",
    name: "Michael Tan",
    email: "michael.t@acme.com",
    branch: "ACME HQ",
    status: "Linked",
    empCode: "ACM-156",
    joinDate: "20 May 2026",
    lastActive: "09 Apr 2026, 10:20",
    department: "Marketing",
    tier: "Associate",
    employmentType: "full-time",
    dependentsCount: 2,
    benefitPolicies: [
      {
        policyName: "Acme Nutrition Plan FY2026",
        benefitGroups: ["Nutrition & Recovery"],
        utilisation: 54,
      },
    ],
  },
  {
    id: "EMP-20260115-0004",
    name: "Marvin McKinney",
    email: "marvin.m@acme.com",
    branch: "ACME HQ",
    status: "Linked",
    empCode: "ACM-089",
    joinDate: "12 Jan 2026",
    lastActive: "08 Apr 2026, 14:30",
    department: "Operations",
    tier: "Manager",
    employmentType: "contract",
    dependentsCount: 0,
    benefitPolicies: [
      {
        policyName: "Contract Staff Essentials 2026",
        benefitGroups: ["Basic Medical"],
        utilisation: 40,
      },
    ],
  },
  {
    id: "EMP-20260115-0006",
    name: "Ahmad Faizal",
    email: "ahmad.f@acme.com",
    branch: "ACME Subang Jaya",
    status: "Linked",
    empCode: "ACM-301",
    joinDate: "15 Jan 2026",
    lastActive: "07 May 2026, 08:45",
    department: "Operations",
    tier: "Senior Manager",
    employmentType: "full-time",
    dependentsCount: 2,
    benefitPolicies: [
      {
        policyName: "Executive Benefits Programme 2026",
        benefitGroups: ["Comprehensive Health", "Wellness Extras"],
        utilisation: 21,
      },
    ],
  },
]

const BRIGHTPATH_EMPLOYEE_GRID: EmployeeDirectoryMock[] = [
  {
    id: "EMP-BPT-0001",
    name: "Alicia Tan",
    email: "alicia.t@brightpath.com",
    branch: "BrightPath HQ",
    status: "Linked",
    empCode: "BPT-001",
    joinDate: "14 Feb 2026",
    lastActive: "30 Jun 2026, 16:10",
    department: "Security Operations",
    tier: "Senior",
    employmentType: "full-time",
    dependentsCount: 1,
    benefitPolicies: [
      {
        policyName: "Cyber Wellness Core 2026",
        benefitGroups: ["Wellness Core"],
        utilisation: 12,
      },
    ],
  },
  {
    id: "EMP-BPT-0002",
    name: "Marcus Lee",
    email: "marcus.l@brightpath.com",
    branch: "BrightPath HQ",
    status: "Linked",
    empCode: "BPT-014",
    joinDate: "03 Mar 2026",
    lastActive: "30 Jun 2026, 15:42",
    department: "Client Success",
    tier: "Manager",
    employmentType: "full-time",
    dependentsCount: 0,
    benefitPolicies: [],
  },
  {
    id: "EMP-BPT-0003",
    name: "Nur Iman",
    email: "nur.i@brightpath.com",
    branch: "BrightPath HQ",
    status: "Linked",
    empCode: "BPT-021",
    joinDate: "18 Apr 2026",
    lastActive: "29 Jun 2026, 11:08",
    department: "Platform",
    tier: "Associate",
    employmentType: "full-time",
    dependentsCount: 0,
    benefitPolicies: [],
  },
]

const ACME_EMPLOYEE_TABLE: EmployeeDirectoryMock[] = ACME_EMPLOYEE_GRID.map((employee) => ({
  ...employee,
  dependentsCount: 0,
}))

const BRIGHTPATH_EMPLOYEE_TABLE: EmployeeDirectoryMock[] = BRIGHTPATH_EMPLOYEE_GRID.map((employee) => ({
  ...employee,
  dependentsCount: 0,
}))

export function getMockEmployeeGrid(orgId: string): EmployeeDirectoryMock[] {
  return orgId === ORG_FTU_ORG_ID ? BRIGHTPATH_EMPLOYEE_GRID : ACME_EMPLOYEE_GRID
}

export function getMockEmployeeTable(orgId: string): EmployeeDirectoryMock[] {
  return orgId === ORG_FTU_ORG_ID ? BRIGHTPATH_EMPLOYEE_TABLE : ACME_EMPLOYEE_TABLE
}
