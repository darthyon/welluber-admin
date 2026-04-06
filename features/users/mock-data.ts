import { Member, Administrator } from "./types";

export const MOCK_MEMBERS: Member[] = [
  {
    id: "mem_1",
    name: "Alex Johnson",
    email: "alex.j@techcorp.com",
    type: "Employee",
    organization: { id: "org_1", name: "TechCorp Solutions" },
    branch: { id: "br_1", name: "Main HQ" },
    status: "Active",
    joinedDate: "2024-01-15",
  },
  {
    id: "mem_2",
    name: "Sarah Johnson",
    email: "sarah.j@gmail.com",
    type: "Dependent",
    organization: { id: "org_1", name: "TechCorp Solutions" },
    status: "Active",
    joinedDate: "2024-02-10",
  },
  {
    id: "mem_3",
    name: "Michael Chen",
    email: "m.chen@welluber.com",
    type: "Employee",
    organization: { id: "org_2", name: "WellUber Global" },
    branch: { id: "br_2", name: "KL Office" },
    status: "Pending",
    joinedDate: "2024-03-01",
  },
];

export const MOCK_ADMINS: Administrator[] = [
  {
    id: "adm_1",
    name: "Yon Yusuf",
    email: "yon@welluber.com",
    role: "HostAdmin",
    status: "Active",
    lastLogin: "2024-04-06 14:30",
  },
  {
    id: "adm_2",
    name: "Danish Azhar",
    email: "danish@techcorp.com",
    role: "OrgAdmin",
    entity: { id: "org_1", name: "TechCorp Solutions", type: "Organization" },
    status: "Active",
    lastLogin: "2024-04-05 09:15",
  },
  {
    id: "adm_3",
    name: "Amira Rahman",
    email: "amira@medicare.com",
    role: "SPAdmin",
    entity: { id: "sp_1", name: "MediCare Clinic Group", type: "ServiceProvider" },
    status: "Inactive",
    lastLogin: "2024-03-20 16:45",
  },
];
