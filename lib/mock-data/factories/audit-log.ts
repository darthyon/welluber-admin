import type { AuditLogEntry, AuditLogType } from "@/features/audit-log/types"

const ADMINS = [
  { name: "Yon Yusuf", email: "yon@welluber.com" },
  { name: "Danish Azhar", email: "danish@welluber.com" },
  { name: "Sarah Chen", email: "sarah@welluber.com" },
  { name: "System", email: "system@welluber.com" },
]

const ROWS: Omit<AuditLogEntry, "id">[] = [
  { title: "Organization Approved", type: "Approval", desc: "Approved Acme Corporation application for Platform access.", timestamp: "2026-04-06 15:45", updatedBy: ADMINS[0]!, entity: { id: "ORG-20260115-0001", name: "Acme Corporation Sdn Bhd", type: "Organization" } },
  { title: "Benefit Policy Created", type: "Create", desc: "New 'Standard Health 2026' policy created by Host Admin.", timestamp: "2026-04-06 14:20", updatedBy: ADMINS[0]!, entity: { id: "POL-20260115-0001", name: "Standard Health 2026", type: "Policy" } },
  { title: "Service Provider Payout", type: "Payout", desc: "Triggered monthly payout for 'Zenith Yoga Studio'.", timestamp: "2026-04-06 11:30", updatedBy: ADMINS[1]!, entity: { id: "SP-20260101-0001", name: "Zenith Yoga Studio", type: "ServiceProvider" } },
  { title: "System Settings Updated", type: "SettingChange", desc: "Voucher validity period increased from 15 to 30 days.", timestamp: "2026-04-05 16:50", updatedBy: ADMINS[0]!, entity: { id: "sys_1", name: "System Settings", type: "System" } },
  { title: "New Brand Added", type: "Create", desc: "Onboarded 'Agile Group' brand into the ecosystem.", timestamp: "2026-04-05 10:15", updatedBy: ADMINS[1]!, entity: { id: "BRD-20260115-0002", name: "Agile Group", type: "Brand" } },
  { title: "Administrator Invited", type: "Create", desc: "Invited 'Amira Rahman' as SPAdmin to the Host Portal.", timestamp: "2026-04-05 09:00", updatedBy: ADMINS[0]! },
  { title: "Payout API Failure", type: "SettingChange", desc: "Maybank API returned 503 Service Unavailable during batch payout.", timestamp: "2026-04-04 22:15", updatedBy: ADMINS[3]!, entity: { id: "sys_1", name: "Payout API", type: "System" } },
  { title: "Organization Suspended", type: "Update", desc: "Nexus Innovations suspended pending account review.", timestamp: "2026-04-04 16:30", updatedBy: ADMINS[0]!, entity: { id: "ORG-20260310-0003", name: "Nexus Innovations", type: "Organization" } },
  { title: "Policy Deactivated", type: "Update", desc: "Contractor Lite policy deactivated — org restructure.", timestamp: "2026-04-03 11:00", updatedBy: ADMINS[1]!, entity: { id: "POL-20260115-0003", name: "Contractor Lite", type: "Policy" } },
  { title: "Service Provider Onboarded", type: "Create", desc: "CoreFit Rehabilitation added pending profile verification.", timestamp: "2026-04-02 09:45", updatedBy: ADMINS[2]!, entity: { id: "SP-20260201-0003", name: "CoreFit Rehabilitation", type: "ServiceProvider" } },
]

export function createAuditLog(index: number): AuditLogEntry {
  const n = index + 1
  return { id: `AUD-20260406-${String(n).padStart(4, "0")}`, ...ROWS[index % ROWS.length]! }
}
