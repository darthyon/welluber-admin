export type UserRole = "HostAdmin" | "OrgAdmin" | "SPAdmin" | "Employee" | "Dependent";

export interface MemberDevice {
  model: string;
  os: string;
}

export interface Member {
  id: string;
  /** Stable app-side identifier. Distinct from the human-readable `id`. */
  uuid: string;
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
  lastActive: string;
  /** Last device the member signed in from. Absent until first app login. */
  device?: MemberDevice;
}

export type MemberActivityType =
  | "Signup"
  | "Login"
  | "VoucherPurchased"
  | "VoucherRedeemed"
  | "ProfileUpdated";

export interface MemberActivityEntry {
  id: string;
  memberId: string;
  type: MemberActivityType;
  title: string;
  description: string;
  timestamp: string;
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
  joinedDate: string;
  lastLogin: string;
  lastActive: string;
}
