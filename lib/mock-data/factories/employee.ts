import type { Employee, EmploymentType } from "@/features/organizations/types"

const NAMES = [
  "Ahmad Faizal", "Sarah Lim", "Michael Tan", "Nurul Huda",
  "Kevin Tan", "Priya Raj", "Robert Fox", "Jenny Wilson",
  "David Lee", "Aisha Karim", "Chen Wei", "Amir Hassan",
  "Lisa Wong", "Rajesh Kumar", "Emily Chen", "Faisal Ibrahim",
  "Siti Aminah", "Jason Ong", "Mei Ling", "Ravi Shankar",
  "Hannah Park", "Imran Shah", "Yasmin Abdullah", "Daniel Lim",
  "Natasha Singh", "Omar Hassan", "Chloe Tan", "Vikram Patel",
  "Sofia Reyes", "Arif Rahman", "Zara Malik", "Benjamin Cho",
  "Farah Nazri", "Kumar Selvaraj", "Isabella Goh", "Hafizuddin",
  "Lina Kow", "Ramesh Nair", "Nadia Aziz", "Tariq Jamil",
  "Grace Ho", "Syed Abbas", "Maya Krishnan", "Fong Wai",
  "Diana Lee", "Anwar Mokhtar", "Jasmine Teoh", "Sanjay Menon",
  "Alyssa Tan", "Irfan Yusof",
]

// Department + tier configs mirror all MOCK_ORGS
const DEPARTMENTS_BY_ORG: Record<string, { id: string; name: string }[]> = {
  "ORG-20260115-0001": [
    { id: "DC-001", name: "HR" },
    { id: "DC-002", name: "Tech" },
    { id: "DC-003", name: "Marketing" },
    { id: "DC-004", name: "Finance" },
    { id: "DC-005", name: "Operations" },
  ],
  "ORG-20260301-0002": [
    { id: "DC-101", name: "HR" },
    { id: "DC-102", name: "Tech" },
    { id: "DC-103", name: "Marketing" },
  ],
  "ORG-20260310-0003": [
    { id: "DC-201", name: "Product" },
    { id: "DC-202", name: "Engineering" },
    { id: "DC-203", name: "Sales" },
    { id: "DC-204", name: "Legal" },
  ],
  "ORG-20260401-0004": [
    { id: "DC-301", name: "Clinical" },
    { id: "DC-302", name: "Admin" },
    { id: "DC-303", name: "Pharmacy" },
    { id: "DC-304", name: "Nursing" },
  ],
  "ORG-20260401-0005": [
    { id: "DC-401", name: "Merchandising" },
    { id: "DC-402", name: "Store Ops" },
    { id: "DC-403", name: "E-commerce" },
    { id: "DC-404", name: "Warehouse" },
  ],
  "ORG-20260401-0006": [
    { id: "DC-501", name: "Project Management" },
    { id: "DC-502", name: "Site Engineering" },
    { id: "DC-503", name: "QS" },
  ],
  "ORG-20260401-0007": [
    { id: "DC-601", name: "Academics" },
    { id: "DC-602", name: "Student Affairs" },
    { id: "DC-603", name: "Admin" },
  ],
  "ORG-20260401-0008": [
    { id: "DC-701", name: "R&D" },
    { id: "DC-702", name: "Manufacturing" },
    { id: "DC-703", name: "QA" },
  ],
  "ORG-20260401-0009": [
    { id: "DC-801", name: "Front Office" },
    { id: "DC-802", name: "Housekeeping" },
    { id: "DC-803", name: "F&B" },
  ],
  "ORG-20260401-0010": [
    { id: "DC-901", name: "Creative" },
    { id: "DC-902", name: "Media" },
    { id: "DC-903", name: "Strategy" },
  ],
}

const TIERS_BY_ORG: Record<string, { id: string; name: string; roles: string[] }[]> = {
  "ORG-20260115-0001": [
    { id: "TC-001", name: "Executive", roles: ["CEO", "CTO", "CFO", "COO"] },
    { id: "TC-002", name: "Senior Manager", roles: ["Engineering Manager", "Product Manager", "Marketing Manager", "Operations Manager"] },
    { id: "TC-003", name: "Manager", roles: ["Team Lead", "Project Manager", "Account Manager", "Sales Manager"] },
    { id: "TC-004", name: "Associate", roles: ["Software Engineer", "Product Designer", "Marketing Specialist", "Business Analyst"] },
  ],
  "ORG-20260301-0002": [
    { id: "TC-005", name: "Director", roles: ["Engineering Director", "Product Director", "Sales Director"] },
    { id: "TC-006", name: "Associate", roles: ["Analyst", "Coordinator", "Specialist"] },
  ],
  "ORG-20260310-0003": [
    { id: "TC-007", name: "VP", roles: ["VP Engineering", "VP Product", "VP Sales", "VP Marketing"] },
    { id: "TC-008", name: "Senior", roles: ["Senior Analyst", "Senior Consultant", "Senior Advisor"] },
    { id: "TC-009", name: "Analyst", roles: ["Junior Analyst", "Research Analyst", "Data Analyst"] },
  ],
  "ORG-20260401-0004": [
    { id: "TC-010", name: "Consultant", roles: ["Management Consultant", "Strategy Consultant", "IT Consultant"] },
    { id: "TC-011", name: "Specialist", roles: ["HR Specialist", "Finance Specialist", "Marketing Specialist"] },
    { id: "TC-012", name: "Resident", roles: ["Medical Resident", "Research Resident"] },
  ],
  "ORG-20260401-0005": [
    { id: "TC-013", name: "Lead", roles: ["Team Lead", "Technical Lead", "Project Lead"] },
    { id: "TC-014", name: "Buyer", roles: ["Procurement Buyer", "Strategic Buyer", "Commodity Buyer"] },
    { id: "TC-015", name: "Coordinator", roles: ["Logistics Coordinator", "Operations Coordinator", "Event Coordinator"] },
  ],
  "ORG-20260401-0006": [
    { id: "TC-016", name: "Project Director", roles: ["Construction Director", "Infrastructure Director"] },
    { id: "TC-017", name: "Engineer", roles: ["Civil Engineer", "Structural Engineer", "MEP Engineer", "Site Engineer"] },
    { id: "TC-018", name: "Site Supervisor", roles: ["Site Supervisor", "Safety Supervisor"] },
  ],
  "ORG-20260401-0007": [
    { id: "TC-019", name: "Principal", roles: ["School Principal", "Academic Director"] },
    { id: "TC-020", name: "Senior Tutor", roles: ["Senior Math Tutor", "Senior Science Tutor", "Senior English Tutor"] },
    { id: "TC-021", name: "Tutor", roles: ["Math Tutor", "Science Tutor", "English Tutor", "Art Tutor"] },
  ],
  "ORG-20260401-0008": [
    { id: "TC-022", name: "Head Scientist", roles: ["Research Director", "Lab Director"] },
    { id: "TC-023", name: "Technician", roles: ["Lab Technician", "Field Technician", "Research Technician"] },
    { id: "TC-024", name: "Operator", roles: ["Plant Operator", "Equipment Operator"] },
  ],
  "ORG-20260401-0009": [
    { id: "TC-025", name: "GM", roles: ["General Manager", "Operations GM"] },
    { id: "TC-026", name: "Supervisor", roles: ["Floor Supervisor", "Shift Supervisor", "Warehouse Supervisor"] },
    { id: "TC-027", name: "Associate", roles: ["Retail Associate", "Customer Service Associate", "Stock Associate"] },
  ],
  "ORG-20260401-0010": [
    { id: "TC-028", name: "Creative Lead", roles: ["Art Director", "Design Lead", "Creative Director"] },
    { id: "TC-029", name: "Strategist", roles: ["Brand Strategist", "Content Strategist", "Digital Strategist"] },
    { id: "TC-030", name: "Executive", roles: ["Account Executive", "Creative Executive", "Media Executive"] },
  ],
}

const ORG_IDS = [
  "ORG-20260115-0001", "ORG-20260301-0002", "ORG-20260310-0003",
  "ORG-20260401-0004", "ORG-20260401-0005", "ORG-20260401-0006",
  "ORG-20260401-0007", "ORG-20260401-0008", "ORG-20260401-0009",
  "ORG-20260401-0010",
]

const BRANCH_IDS = [
  "BR-20260115-0001", "BR-20260301-0001", "BR-20260310-0001",
  "BR-20260401-0004", "BR-20260401-0005", "BR-20260401-0006",
  "BR-20260401-0007", "BR-20260401-0008", "BR-20260401-0009",
  "BR-20260401-0010",
]

const EMP_TYPES: EmploymentType[] = [
  "full_time", "full_time", "full_time", "part_time", "contract",
  "internship", "full_time", "full_time", "contract", "full_time",
]

export function createEmployee(index: number): Employee {
  const n = index + 1
  const orgIdx = index % ORG_IDS.length
  const orgId = ORG_IDS[orgIdx]!
  const orgDepts = DEPARTMENTS_BY_ORG[orgId] ?? []
  const orgTiers = TIERS_BY_ORG[orgId] ?? []
  const dept = orgDepts.length > 0 ? orgDepts[index % orgDepts.length]! : undefined
  const tier = orgTiers.length > 0 ? orgTiers[index % orgTiers.length]! : undefined
  const role = tier?.roles?.length ? tier.roles[index % tier.roles.length] : undefined
  return {
    id: `EMP-20260115-${String(n).padStart(4, "0")}`,
    orgId,
    branchId: BRANCH_IDS[orgIdx]!,
    name: NAMES[index] ?? `Employee ${n}`,
    email: `${(NAMES[index] ?? `employee${n}`).toLowerCase().replace(/\s+/g, ".")}@company.com`,
    empCode: `EMP-${String(n).padStart(3, "0")}`,
    departmentId: dept?.id,
    department: dept?.name,
    role,
    tierId: tier?.id,
    tier: tier?.name,
    dateOfBirth: `${1985 + (index % 15)}-0${(index % 9) + 1}-15T00:00:00Z`,
    gender: index % 2 === 0 ? "female" : "male",
    mobileNumber: `+6011${10000000 + index * 1234567}`,
    joinDate: index < 3 ? "2026-01-15T00:00:00Z" : "2026-04-01T00:00:00Z",
    probationEndDate: index % 5 === 0 ? "2026-07-01T00:00:00Z" : undefined,
    employmentType: EMP_TYPES[index]!,
    endDate: ["part_time", "contract", "internship"].includes(EMP_TYPES[index]!) ? "2026-12-31T00:00:00Z" : undefined,
    status: index === 7 ? "deactivated" : "active",
    isProbation: index % 5 === 0,
  }
}
