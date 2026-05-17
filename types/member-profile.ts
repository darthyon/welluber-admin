/**
 * MemberProfile — the permanent personal identity on WellUber.
 *
 * Created when any user first signs up in the Member App using their
 * personal email, Google, or Apple SSO. Entirely separate from their
 * employment — survives job changes, company deactivations, and offboarding.
 *
 * A MemberProfile can be:
 *   - Public (no linked EmployeeAccount) — can browse the marketplace
 *   - Linked (1+ active EmployeeAccounts) — benefit wallet unlocked per company
 *
 * One MemberProfile can hold multiple EmployeeAccounts (multiple employers)
 * and multiple DependentAccounts (their family members registered by companies).
 */
export type MemberProfileStatus = "active" | "deactivated"
export type AuthProvider = "email" | "google" | "apple"

export interface MemberProfile {
  id: string // Firebase UID — personal, permanent

  /** Personal email used to sign in. Never used for corporate verification. */
  personalEmail: string
  authProvider: AuthProvider

  name: string
  phone?: string
  avatarUrl?: string

  /**
   * true  = no linked EmployeeAccount yet — can browse, cannot use benefit wallet
   * false = has at least one active EmployeeAccount linked
   */
  isPublicOnly: boolean

  status: MemberProfileStatus
  createdAt: string
  updatedAt: string
}
