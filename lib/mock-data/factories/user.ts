import type { Member, MemberDevice, Administrator } from "@/features/users/types"

const MEMBER_NAMES = [
  "Alex Johnson", "Sarah Johnson", "Michael Chen", "Priya Nair",
  "Kevin Lim", "Nurul Ain", "John Doe", "Mary Tan", "Ahmad Razif", "Jenny Wilson",
]
const ADMIN_NAMES = [
  "Yon Yusuf", "Danish Azhar", "Amira Rahman", "Wei Lin Chong",
  "Priya Krishnan", "Hafiz Azmi", "Lena Yap", "James Wong", "Sara Lim", "Mei Tan",
]
const ORG_IDS = ["ORG-20260115-0001", "ORG-20260301-0002", "ORG-20260310-0003"]
const ORG_NAMES = ["Acme Corporation Sdn Bhd", "Global Tech Solutions", "Nexus Innovations"]
const SP_IDS = ["SP-20260101-0001", "SP-20260115-0002", "SP-20260201-0003"]
const SP_NAMES = ["Zenith Yoga Studio", "AgileMind Therapy Centre", "CoreFit Rehabilitation"]
const BRANCH_IDS = ["BR-20260115-0001", "BR-20260301-0001", "BR-20260310-0001"]
const BRANCH_NAMES = ["Kuala Lumpur HQ", "Petaling Jaya Branch", "Singapore HQ"]

const MEMBER_DEVICES: MemberDevice[] = [
  { model: "iPhone 15 Pro", os: "iOS 17.4" },
  { model: "Samsung Galaxy S24", os: "Android 14" },
  { model: "iPhone 13", os: "iOS 17.2" },
  { model: "Xiaomi Redmi Note 13", os: "Android 14" },
  { model: "iPhone 14 Plus", os: "iOS 16.6" },
  { model: "Oppo Reno 11", os: "Android 13" },
  { model: "iPhone SE (3rd gen)", os: "iOS 17.3" },
  { model: "Samsung Galaxy A55", os: "Android 14" },
  { model: "Google Pixel 8", os: "Android 14" },
  { model: "Huawei nova 12", os: "HarmonyOS 4" },
]

/** Deterministic UUID-shaped id so mock data stays stable across reloads. */
function memberUuid(index: number): string {
  const seed = String(index + 1).padStart(4, "0")
  return `7f${seed}a1-4c${seed}-4b8e-9d${seed.slice(0, 2)}-5e6f${seed}a71c2d`
}

export function createMember(index: number): Member {
  const n = index + 1
  const orgIdx = index % ORG_IDS.length
  const statuses: Member["status"][] = ["Active", "Active", "Pending", "Active", "Active", "Inactive", "Active", "Pending", "Active", "Active"]
  const status = statuses[index]!
  return {
    id: `MEM-20260115-${String(n).padStart(4, "0")}`,
    uuid: memberUuid(index),
    name: MEMBER_NAMES[index] ?? `Member ${n}`,
    email: `${(MEMBER_NAMES[index] ?? `member${n}`).toLowerCase().replace(/\s+/g, ".")}@company.com`,
    type: index % 5 === 1 ? "Dependent" : "Employee",
    organization: { id: ORG_IDS[orgIdx]!, name: ORG_NAMES[orgIdx]! },
    branch: index % 5 !== 1 ? { id: BRANCH_IDS[orgIdx]!, name: BRANCH_NAMES[orgIdx]! } : undefined,
    status,
    joinedDate: index < 3 ? "15 Jan 2026" : "01 Apr 2026",
    lastActive: `0${(index % 9) + 1} Apr 2026, 10:${String(15 + index * 7).padStart(2, "0")}`,
    // Pending members have been invited but never signed in, so no device yet.
    device: status === "Pending" ? undefined : MEMBER_DEVICES[index % MEMBER_DEVICES.length],
  }
}

export function createAdmin(index: number): Administrator {
  const n = index + 1
  const orgIdx = index % ORG_IDS.length
  const spIdx = index % SP_IDS.length
  const statuses: Administrator["status"][] = ["Active", "Active", "Inactive", "Active", "Active", "Active", "Inactive", "Active", "Active", "Active"]

  if (index === 0) return {
    id: "USR-20260101-0001",
    name: "Yon Yusuf",
    email: "yon@welluber.com",
    role: "HostAdmin",
    status: "Active",
    joinedDate: "01 Jan 2026",
    lastLogin: "06 Apr 2026, 14:30",
    lastActive: "06 May 2026, 16:45",
  }

  if (index === 1) return {
    id: "USR-20260115-0002",
    name: "Danish Azhar",
    email: "danish@techcorp.com",
    role: "OrgAdmin",
    entity: { id: "ORG-20260115-0001", name: "Acme Corporation Sdn Bhd", type: "Organization" },
    status: "Active",
    joinedDate: "15 Jan 2026",
    lastLogin: "05 Apr 2026, 09:15",
    lastActive: "06 May 2026, 11:30",
  }

  if (index === 2) return {
    id: "USR-20260201-0003",
    name: "Amira Rahman",
    email: "amira@serenityspa.my",
    role: "SPAdmin",
    entity: { id: "SP-20260101-0001", name: "Zenith Yoga Studio", type: "ServiceProvider" },
    status: "Inactive",
    joinedDate: "10 Feb 2026",
    lastLogin: "20 Mar 2026, 16:45",
    lastActive: "24 Mar 2026, 13:10",
  }

  // Generated (index 3-9)
  const role: Administrator["role"] = index % 3 === 0 ? "OrgAdmin" : index % 3 === 1 ? "SPAdmin" : "HostAdmin"
  return {
    id: `USR-20260401-00${String(n).padStart(2, "0")}`,
    name: ADMIN_NAMES[index] ?? `Admin ${n}`,
    email: `${(ADMIN_NAMES[index] ?? `admin${n}`).toLowerCase().replace(/\s+/g, ".")}@welluber.com`,
    role,
    entity: role === "OrgAdmin"
      ? { id: ORG_IDS[orgIdx]!, name: ORG_NAMES[orgIdx]!, type: "Organization" }
      : role === "SPAdmin"
      ? { id: SP_IDS[spIdx]!, name: SP_NAMES[spIdx]!, type: "ServiceProvider" }
      : undefined,
    status: statuses[index]!,
    joinedDate: "01 Apr 2026",
    lastLogin: `0${(index % 9) + 1} Apr 2026, 09:${String(10 + index * 5).padStart(2, "0")}`,
    lastActive: `0${(index % 9) + 1} May 2026, 14:00`,
  }
}
