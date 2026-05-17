/**
 * EmployeeAccount — the corporate identity linkage.
 *
 * Created by HR when an employee is registered in the system.
 * It bridges the HR-side Employee record with a MemberProfile.
 *
 * Linkage flow (two-step verification):
 *
 *   Step 1 — Member initiates in app
 *     Member enters: corporateEmail + empCode
 *     System finds matching EmployeeAccount (status must be "unlinked")
 *     System generates a confirmation token and emails it to corporateEmail
 *     Status → "pending_verification"
 *
 *   Step 2 — Member confirms from corporate inbox
 *     Member clicks link in corporate email: welluber://confirm-linkage/[token]
 *     System verifies token (not expired, not reused, status = pending_verification)
 *     memberProfileId is set, linkedAt recorded
 *     Status → "active"
 *
 * Security properties:
 *   - Knowing corporateEmail + empCode is not enough — you must also
 *     have access to the corporate email inbox to confirm.
 *   - Token is single-use, 60-minute expiry.
 *   - Only the token hash is stored (not the plaintext).
 *
 * History:
 *   - When HR deactivates an employee, status → "deactivated".
 *   - The linked MemberProfile remains untouched — employee keeps their
 *     personal account and can see their benefit usage history (read-only).
 *   - The same MemberProfile can link to a new EmployeeAccount at a
 *     different company later.
 */
export type EmployeeAccountLinkageStatus =
  | "unlinked"              // created by HR, member has not started linkage
  | "pending_verification"  // member entered email+code, awaiting inbox confirmation
  | "active"                // confirmed and fully linked
  | "deactivated"           // employee left company; benefits stopped, history preserved

export interface EmployeeAccount {
  id: string

  // ── HR side (created by org admin, never changes) ──────────────────────────
  /** FK → Employee (the HR record managed by the org) */
  employeeId: string
  /** FK → Organization */
  orgId: string
  /** FK → OrganizationBranch */
  branchId: string
  /** HR-registered corporate email. This is where the confirmation email is sent. */
  corporateEmail: string
  /** HR-assigned employee code. Required to initiate linkage together with corporateEmail. */
  empCode: string

  // ── Member side (populated on confirmation) ────────────────────────────────
  /**
   * FK → MemberProfile.
   * null until the member confirms linkage from their corporate inbox.
   */
  memberProfileId: string | null

  // ── Linkage state ──────────────────────────────────────────────────────────
  linkageStatus: EmployeeAccountLinkageStatus
  /** Hashed token sent to corporateEmail. Only the hash is stored. */
  linkageTokenHash?: string
  /** ISO timestamp — token expires 60 min after issuance */
  linkageTokenExpiresAt?: string
  /** When the member submitted corporateEmail + empCode in the app */
  linkageRequestedAt?: string
  /** When the member clicked the confirmation link from their corporate inbox */
  linkedAt?: string
  /** When HR deactivated this account */
  deactivatedAt?: string

  createdAt: string
  updatedAt: string
}

/**
 * DependentAccount — optional personal identity for a dependent.
 *
 * A dependent registered by HR (Dependent entity) can optionally have
 * their own MemberProfile if the company allows dependents to use the
 * Member App directly (e.g., spouse books gym sessions independently).
 *
 * If a dependent has no DependentAccount, the employee books on their behalf.
 */
export interface DependentAccount {
  id: string
  /** FK → Dependent (the HR-side record) */
  dependentId: string
  /** FK → EmployeeAccount (the parent employee's linkage) */
  employeeAccountId: string
  /**
   * FK → MemberProfile — the dependent's own personal account.
   * null if the dependent uses the employee's session to redeem.
   */
  memberProfileId: string | null
  status: "active" | "deactivated"
  createdAt: string
  updatedAt: string
}
