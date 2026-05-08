
export type AuditLogType = "Create" | "Update" | "Delete" | "Approval" | "Rejection" | "SettingChange" | "Login" | "Payout";

export interface AuditLogEntry {
  id: string;
  title: string;
  type: AuditLogType;
  desc: string;
  timestamp: string;
  updatedBy: {
    name: string;
    email: string;
    avatar?: string;
  };
  entity?: {
    id: string;
    name: string;
    type: "Organization" | "ServiceProvider" | "Brand" | "Policy" | "System";
  };
}
