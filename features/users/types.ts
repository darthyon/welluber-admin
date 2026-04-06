export type UserRole = "HostAdmin" | "OrgAdmin" | "SPAdmin" | "Employee" | "Dependent";

export interface Member {
  id: string;
  name: string;
  email: string;
  type: "Employee" | "Dependent";
  organization: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  status: "Active" | "Inactive" | "Pending";
  joinedDate: string;
}

export interface Administrator {
  id: string;
  name: string;
  email: string;
  role: "HostAdmin" | "OrgAdmin" | "SPAdmin";
  entity?: {
    id: string;
    name: string;
    type: "Organization" | "ServiceProvider" | "Platform";
  };
  status: "Active" | "Inactive";
  lastLogin: string;
}
