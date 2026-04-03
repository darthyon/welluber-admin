# Screen Inventory — Welluber Host Admin Portal — April 2026

## Product Areas

The Host Admin (Welluber HQ) operates in **six mental model areas**, not a flat list:
1. **Dashboard** — overview of platform health, transactions, revenue
2. **Organization Management** — onboard orgs, manage accounts, view wallets
3. **Service Provider Management** — onboard SPs, approve, configure commission, manage packages
4. **Settlement & Payouts** — generate settlement statements, trigger payouts, view ledger
5. **Platform Config** — taxonomy, system defaults, cron settings, expired voucher policy
6. **Admin Auth & Settings** — login, 2FA, user management for Host team

---

## Dashboard

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-DASH-01 | Platform Overview | Initial login | View real-time KPIs: active orgs, active SPs, total tx value, revenue earned this month (with stacked bar sub-metrics) |
| SCR-DASH-02 | Service Categories | Dashboard bottom row | Monitor high-performing service categories via horizontal progress bars + MoM trend metrics |
| SCR-DASH-03 | Settlement Status | Sidebar nav | View current settlement cycle: pending payouts, completed payouts, failed payouts (last 90 days) |
| SCR-DASH-04 | Top Lists | Dashboard bottom row | View Top Organisations and Top Service Providers with dynamic metric dropdowns (Volume, Check-ins, Commission, Rating) |
| SCR-DASH-05 | Voucher Lifecycle Chart | Dashboard center | Visualize "Voucher Issued" vs "Verified Check-ins" alongside custom period ranges and Organisation filtering |
| SCR-GLB-01 | Global Notification Center | Top bar bell icon | Real-time ecosystem stream with triage tabs ("All" vs "Action Required") and popover interface |

**Non-obvious states — SCR-DASH-01:**
- Empty (day 1): Show banner + onboarding CTA: "No organizations yet. Add your first organization."
- Loading: Skeleton cards for KPI tiles. Transactions feed shows loading state (pulse animation).
- Error (API down): Show alert banner with retry button. Retain last-loaded data if available.
- No data (legitimate zero state): If no transactions in 24h, show "No transactions yet" with historical toggle to show last 7 days.

**Non-obvious states — SCR-DASH-03:**
- Pending settlement: Shows "Settlement cycle in progress" + estimated completion date.
- Completed payout: Green badge + timestamp. Links to detailed settlement statement (SCR-SET-02).
- Failed payout: Red badge. CTA: "View error details" + manual retry button (Host only).
- Multi-currency (future): Currently MYR only. Placeholder for phase 2.

---

## Organization Management

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-ORG-01 | Organization List (Triage) | Sidebar nav | **Workforce Health Dashboard:** Browse and triage organizations using a tactical toolbar (Status, Needs Action, Service Category) and high-density cards with Utilization Rings. |
| SCR-ORG-02 | Organization Registration (New) | "Add Organization" button on SCR-ORG-01 | Register new org: company name, reg no., industry, org type, financial year start date |
| SCR-ORG-03 | Organization Approval | Link from SCR-ORG-01 when status=Pending | Review org application → Approve/Reject. On approve, org gets email with portal access. |
| SCR-ORG-04 | Organization Detail View | Click org row on SCR-ORG-01 | View org summary: profile, PICs, branches, active benefit policies, employee count, wallet status, subscription |
| SCR-ORG-05 | Branch Wallet Management | Tab on SCR-ORG-04 | View all branch wallets for this org. Per-branch: current balance, model (Cash/Credit), top-up history, pending deductions |
| SCR-ORG-06 | Org Suspension / Deactivation | Actions menu on SCR-ORG-04 | Deactivate org: confirm, optional reason. All benefits and vouchers expire immediately. |

- **Smart Data Table (SCR-ORG-01 Table View):**
  - **Frozen Identity:** Company Name (First Column) is sticky-frozen to the left for easy reference.
  - **Frozen Actions:** Three-dot menu (Last Column) is sticky-frozen to the right.
  - **Needs Action Column:** Repurposed to show colorful condition pills (e.g., `Missing PIC`, `Wallet Low`). Shows `✅ All Good` with a green check for healthy orgs.
  - **Utilization Column:** Integrates the **Utilization Ring Chart** with internal percentage and external RM balance label.
  - **Service Categories:** New column displaying the top-tier benefit categories assigned to the org.
  - **Modular Action Menu:** Synchronized with the card menu (Edit, Invite, Manage Benefit Policies).
  - **Pagination:** Structured at 10 records per page for optimized performance.

**Non-obvious states — SCR-ORG-02:**
- File upload: Logo (optional). Image cropping/validation.
- Industry enum: Dropdown with standard SIC categories (Malaysia standard).
- Financial year start: Date picker. Anchor for benefit proration.
- Error validation: If reg no. already registered, show inline error + disambiguation: "Is this the same company? Contact support if incorrect."

**Non-obvious states — SCR-ORG-03:**
- Pre-approval checks (non-blocking, informational):
  - Company registration validity (lookupable via Malaysia SSM? or manual?).
  - PIC contact verification (host sends verification email to PIC, PIC confirms in email link).
  - Payment method on file (org must register payment method before activation).
- Error: If any pre-check fails, flag as "Requires manual review" + escalation queue to a dedicated approvals team.

**Non-obvious states — SCR-ORG-04:**
- Tabs: Org Details | Branches | Employees | Benefit Policy | Utilization & Claims
- Status badge: Active (green) / Pending (orange) / Suspended (red) / On Hold.
- Actions menu: View details, Edit profile, Manage branches, Manage benefit policies, Suspend, View full activity log.
- Breadcrumb: Dashboard > Organizations > [Org Name] — allow quick back navigation.
- Note: Wallet and Subscription management are not yet surfaced as tabs in the current build. These are deferred to a later sprint.

**Non-obvious states — SCR-ORG-05:**
- Per-branch table: Branch name | Wallet model | Balance | Consumed % | Pending deductions | Last top-up | Status.
- Wallet model badge: "Cash Balance" (pre-funded) vs "Credit Limit" (post-paid).
- Balance warnings: If balance < 10% of monthly allocation, show amber alert: "Low balance — org may block purchases soon."
- Top-up history expandable: Click branch row → show recent top-ups (date, amount, payment method).
- Cron-triggered balance refresh: Every 5 minutes in dev/test; less frequently in prod.

**Non-obvious states — SCR-ORG-06:**
- Confirm dialog: "Deactivate [Org Name]? All benefits will expire immediately. This cannot be undone." + strong CTA style (e.g. disabled by default, enable checkbox to confirm).
- On deactivate: All associated employees' corporate identities → deactivated status. Benefit assignments marked as expired. All active vouchers → expired status (triggering expired voucher split). Email sent to org's primary PIC.

---

## Benefit Policy Management

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-POL-01 | Benefit Policies List | Sidebar nav → Policies | Browse all benefit policies with status badges. Empty state prompts wizard launch. |
| SCR-POL-02 | Benefit Policy Wizard (Create) | "Create New Policy" button on SCR-POL-01 | Multi-step wizard: define eligibility, pool type, utilization mode, refresh cycle, activation mode, benefit groups, and individual benefit allowances. |

**Non-obvious states — SCR-POL-01:**
- Empty state: Full-page empty state with wizard launch CTA. No table is rendered until at least one policy exists.
- Policy card: Shows policy name, code (mono), description (clamped to 2 lines), budget pool amount, and assigned org avatar stack.
- Status badge: Active (emerald) / Draft / Unlisted / Deactivated.

**Non-obvious states — SCR-POL-02:**
- Step-by-step wizard. Each step must be valid before advancing.
- Eligibility step: Select eligible roles and employment types (full-time, part-time, contract, internship).
- Pool type step: Employee pool (Individual | Shared) × Dependent pool (Individual | Shared | None).
- Utilization mode: Fixed vs Prorated. Fixed hides proration unit. Prorated constrains valid refresh cycle options.
- Benefit groups: Add one or more named groups. Per group: distribution type (Shared Amount | Individual Benefit Amount), max usage per cycle, and a list of allowed services with amounts and optional co-payment.
- Policy is saved as Draft until explicitly published.

---

## Service Provider Management

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-SP-01 | Service Provider List | Sidebar nav | Browse all SPs: name, status (Active/Pending/Suspended), branch count, commission rate, total payouts YTD |
| SCR-SP-02 | Service Provider Registration (New) | "Add Service Provider" button on SCR-SP-01 | Register new SP: company name, reg no., service categories, PIC details, tax registration status |
| SCR-SP-03 | Service Provider Approval | Link from SCR-SP-01 when status=Pending | Review SP application → Approve/Reject. On approve, assign commission schema (see SCR-SP-04). |
| SCR-SP-04 | Commission Schema Editor | Tab on SCR-SP-03 or SCR-SP-05 | Configure per-SP commission: rate table by service category. Separate rates for Redeemed vs Expired. |
| SCR-SP-05 | Service Provider Detail View | Click SP row on SCR-SP-01 | View SP summary: profile, branches, packages, total commission rate, settlement history, contact info. |
| SCR-SP-06 | SP Branch Listing | Tab on SCR-SP-05 | List all branches for this SP. Per-branch: location, operating hours, facilities, active package count. |
| SCR-SP-07 | SP Package Approval Queue | Sidebar nav (if approval workflow enabled) | Review pending package submissions from SPs. Approve/Reject with optional feedback message. ⚠️ TBD: whether approval is required. |
| SCR-SP-08 | SP Suspension / Deactivation | Actions menu on SCR-SP-05 | Suspend/deactivate SP: confirm, optional reason. All future transactions blocked. Existing active vouchers unaffected. |

**Non-obvious states — SCR-SP-01:**
- Filter + sort: By status, service category, commission rate, payout history, creation date.
- Search: By SP name or registration number.
- Onboarding funnel view (optional, phase 2): Track SPs in pipeline: Applied → Under Review → Commission Configured → Approved → Live.
- Empty: "No service providers registered yet."

**Non-obvious states — SCR-SP-02:**
- Service categories: Multi-select from Welluber taxonomy (Fitness, Mental Health, Massage, etc.).
- Is tax registered: Toggle. If yes, require tax_reg_no + validate format (Malaysia only for MVP).
- Tax rate: Default 8% (SST). Read-only in v1; allow override in future phases (per-country config).
- T&C: Upload document or paste text. ⚠️ TBD: Self-serve or Host-reviewed approval. For MVP, assume Host review + manual approval.

**Non-obvious states — SCR-SP-03:**
- Pre-approval checks (non-blocking, informational):
  - Company registration validity (SP company must be verified).
  - Banking details for settlement (SP must register bank account before payout can trigger).
  - Commission rates agreed (commercial team confirms rate range with SP separately; Host configures here).
- Error: If banking details invalid, block approval until SP updates in their portal.

**Non-obvious states — SCR-SP-04:**
- Table format: Service Category | Commission Rate (Redeemed) | Commission Rate (Expired) | Notes.
- Rates must be percentages (0.00--1.00 displayed as 0%--100%). Validation: rate ≥ 10% AND ≤ 30% per rate.
- Redeemed vs Expired: Toggle per category to apply different rates or lock both to same rate.
- Tooltips: "Redeemed = member used the voucher. Expired = redemption period lapsed."
- Save: Applies to all future transactions for this SP.
- Version history (nice-to-have, v2): Show when rates were last changed + effective date.

**Non-obvious states — SCR-SP-05:**
- Tabs: Profile | Branches | Packages | Settlement History | Contact.
- Status badge: Active (green) / Pending (orange) / Suspended (red) / On Hold.
- Widgets: Total commission earned YTD, average commission rate, next settlement date, pending payout balance.
- Actions menu: View details, Edit profile, Manage branches, Manage commission, View settlement history, Suspend, View activity log.

**Non-obvious states — SCR-SP-06:**
- Per-branch table: Branch name | Location | Services offered | Active packages | Operating hours | Rating (if phase 2) | Status.
- Click branch: Expand or link to detailed branch view (including address, operating hours calendar, facilities, contact).

**Non-obvious states — SCR-SP-07:**
- Queue shows: Package name | SP name | Service category | Price | Submitted date | Submitted packages count.
- Approve: Package status Draft → Published. Ready for marketplace when activation_period begins.
- Reject + feedback: Reason (text). Message sent to SP email. SP can resubmit after addressing feedback.
- ⚠️ Design note: Approval workflow is a business decision. If enabled, this screen is critical path. If disabled, packages auto-publish on SP submission. Confirm with product before building.

**Non-obvious states — SCR-SP-08:**
- Suspend (temporary): All future purchases blocked. Existing vouchers remain valid. SP can request unsuspend.
- Deactivate (permanent): All future purchases blocked. Existing vouchers remain valid. Cannot be undone in v1 (deactivation is permanent).
- Confirm dialog: "Suspend [SP Name]? Members cannot purchase from this provider, but existing vouchers remain valid. Reason (optional): [text field]"

---

## Settlement & Payouts

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-SET-01 | Settlement Dashboard | Sidebar nav | View settlement cycles: current cycle status, next cycle date, pending payouts, completed payouts, payout summary (total $ awaiting payout, total $ paid this month) |
| SCR-SET-02 | Settlement Statement (Per SP) | Click on SP from SCR-SET-01 payout list | View itemized settlement for an SP: voucher codes, dates, covered amounts, commissions, net payout, tax breakdowns |
| SCR-SET-03 | Settlement Ledger (Platform-wide) | Tab on SCR-SET-01 | Chronological ledger of all transactions: date, SP, org, transaction type (redemption/walk-in/expiry), amounts, commission split |
| SCR-SET-04 | Payout Trigger & Execution | Actions on SCR-SET-01 | Trigger settlement: select SPs, initiate payout (batch or individual), confirm via 2FA, show payout confirmation + receipt |

**Non-obvious states — SCR-SET-01:**
- Settlement cycle UI:
  - Current cycle: "Next settlement: [date]. Payouts queued: [count]. Pending amount: RM [total]."
  - Previous cycles: Table of completed settlements (date, total $ paid, count of SPs paid, status: Completed/Failed/Partial).
- Manual payout override: Host can trigger out-of-cycle payouts for specific SPs (e.g. dispute resolution, urgent request).
- Failed payouts: Show count of failed payouts (e.g. invalid banking details). Alert + CTA: "View failed payouts" → SCR-SET-02 (filtered to failed only).

**Non-obvious states — SCR-SET-02:**
- Header: SP name, settlement period (date range), total net payout, payout status (Pending/Processing/Completed/Failed/On Hold).
- Itemized table: Voucher code | Transaction type | Date | Covered amount | Commission deducted | Net | Tax breakdown.
- Grouping: Optionally group by transaction type (Redemptions / Walk-ins / Expirations).
- Footer summary: Total covered RM | Total commission RM | Total net RM | Tax summary (if applicable).
- Export: Download as PDF or CSV (for SP records or accounting).
- Payout details: If payout has been processed, show: Payout method (bank transfer, TBD), reference ID, payout date, bank confirmation.

**Non-obvious states — SCR-SET-03:**
- Filters: Date range, SP (multi-select), Org (multi-select), Transaction type (Redemption/Walk-in/Expiry), Status (Completed/Pending/Error).
- Columns: Date | Time | SP | Org | Transaction type | Voucher code | Member name (anonymized option?) | Covered amount | Commission rate | Commission $ | Status.
- Pagination: 100 rows per page default. Performance-critical; consider server-side filtering.
- Export to CSV: Full ledger for auditing.
- Search: By voucher code, SP name, org name, member name (if not anonymized).

**Non-obvious states — SCR-SET-04:**
- Payout initiation workflow:
  1. Host selects SPs to pay (or "Pay All Pending").
  2. System calculates total payout amount + preview.
  3. Host confirms via 2FA (if 2FA enabled on Host account).
  4. System triggers payout via banking integration (TBD provider).
  5. Host receives confirmation: "Payout initiated. Reference: [ID]. Expected completion: [date]."
- Failure handling: If payout fails, show error reason + retry button. If banking details invalid, link to SP's account to update banking info.
- Batch vs individual: Host can pay one SP or multiple SPs in one batch. Batch reduces banking fees; individual allows targeting specific SPs (e.g. urgent request).

---

## Platform Configuration

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-CFG-01 | Service Taxonomy Management | Sidebar nav (Settings > Taxonomy) | View/edit three-level service taxonomy: Category → Main Service → Sub-service. Add, edit, deactivate categories (but don't delete live ones). |
| SCR-CFG-02 | Global Cron Settings | Sidebar nav (Settings > Cron) | Configure system-wide defaults: voucher cancellation window (pending → cancelled), voucher validity period, settlement cycle frequency |
| SCR-CFG-03 | Expired Voucher Policy | Sidebar nav (Settings > Expired Voucher) | Configure global expired voucher split: % refund to org wallet, % to SP ledger, % to Welluber. Must sum to 100%. Can be overridden per SP commission schema. |
| SCR-CFG-04 | Payment Gateway Configuration | Sidebar nav (Settings > Integrations) | Configure payment gateway for Org top-ups: API keys, webhook endpoints, test/live mode toggle (Host only) |
| SCR-CFG-05 | Tax Configuration | Sidebar nav (Settings > Tax) | Configure tax rates by country/region. Default 8% for Malaysia SST. Add rates for phase 2 countries. |
| SCR-CFG-06 | Email Templates | Sidebar nav (Settings > Email) | Manage transactional email templates sent to Orgs, SPs, Members (e.g., org approval, SP payout notification). Edit copy, preview, test send. |

**Non-obvious states — SCR-CFG-01:**
- Taxonomy browser: Tree or collapsed list view. Categories expandable → main services → sub-services.
- Add category: Form. Category name, optional description, icon (for member app marketplace display).
- Add main service: Select parent category → enter name, description.
- Add sub-service: Select parent main service → enter name.
- Deactivate (not delete): If a taxonomy item is live (SPs have mapped packages, or benefits use it), deactivate but don't delete. Prevents breaking live benefit policies.
- Reordering: Drag-and-drop within each level (if UX allows).
- Validation: Category names must be unique. Cannot deactivate if benefits or packages depend on it (unless Host overrides with confirmation).

**Non-obvious states — SCR-CFG-02:**
- Voucher cancellation window: Current default (e.g. 3 hours). Input: numeric + unit (minutes/hours/days). Recommended range: 30 min -- 7 days.
- Voucher validity period: Current default (e.g. 15 days). Input: numeric + unit. Recommended range: 1 day -- 365 days.
- Settlement cycle: Current frequency (e.g. Monthly). Dropdown: Weekly / Monthly / On-Demand (manual trigger only). Effective date for changes: immediate or scheduled?
- Preview: Show impact summary: "All pending vouchers will auto-cancel after [new duration]. [X] vouchers currently pending." (impact preview, non-blocking).
- Save: Changes apply to all future transactions. No retroactive changes to existing vouchers.

**Non-obvious states — SCR-CFG-03:**
- Split inputs: Three sliders or input fields for %Org Refund, %SP Ledger, %Welluber. Must sum to 100%. Real-time validation with visual feedback.
- Example: "Split 50% refund to org, 40% to SP, 10% to Welluber."
- Per-SP override option (checkbox): "Allow SPs to override this split in their commission schema?" (if yes, SP commission schema can define per-SP splits; if no, global split applies to all).
- Preview impact: "For a RM 1,000 expired voucher: Org refund RM 500, SP credit RM 400, Welluber revenue RM 100."
- Effective date: Immediate or scheduled for future date.

**Non-obvious states — SCR-CFG-04:**
- Provider selection dropdown: Stripe / 2Checkout / Doku / Custom (TBD). Selection locked once live (Host must contact support to change providers).
- API key input: Masked. Show/hide toggle. Validation: test key vs live key (separate inputs).
- Webhook endpoints: List of registered webhooks (e.g. payment.success, payment.failure). Test webhook button to verify integration.
- Test mode toggle: When enabled, all Org top-ups are simulated (no real payment deducted). Useful for staging/testing.
- Credentials security: Keys stored encrypted in HSM or secure vault. Host cannot view full key after initial entry (show last 4 chars only).

**Non-obvious states — SCR-CFG-05:**
- Tax rate per country: Country dropdown → select → tax rate (%)  editable. Malaysia (8%) locked/read-only in v1.
- Add country (future): Form for Phase 2 expansion.
- Validation: Tax rate ≥ 0% AND ≤ 100%.
- Impact: All future transactions from that country apply the new rate. No retroactive changes.
- Notes field: Optional, for compliance details (e.g. "Checked with [Auditor] on [date]").

**Non-obvious states — SCR-CFG-06:**
- Email templates list: Org Approval, SP Approval, Payout Ready, Member Enrollment, Magic Link, etc.
- Edit template: Recipient, subject line, body (WYSIWYG or plaintext), variable injection (e.g. {{org_name}}, {{payout_date}}).
- Preview: Show rendered version with sample data.
- Test send: Host enters test email → real email sent (subject prefixed with "[TEST]").
- Version history: Show when template was last edited + by whom.
- Localization (future): Support for multiple languages.

---

## Admin Auth & Settings

| ID | Screen | Entry point | Primary action |
|---|---|---|---|
| SCR-AUTH-01 | Host Admin Login | `/admin/login` URL | Enter email + password. Optional: 2FA code (if 2FA enabled on account). |
| SCR-AUTH-02 | Admin Account Settings | Avatar/profile menu in top-right | Manage personal settings: password, email, 2FA, session management (active devices). |
| SCR-AUTH-03 | Host Team Management | Sidebar nav (Settings > Team) | Manage Host Admin users: add/remove team members, assign roles (Super Admin / Approver / Viewer), manage permissions. |
| SCR-AUTH-04 | Activity Audit Log | Sidebar nav (Settings > Audit Log) | Chronological log of all Host Admin actions: user, action, affected entity, timestamp, IP. Searchable + exportable. |

**Non-obvious states — SCR-AUTH-01:**
- Field validation: Email format, password strength (min 12 chars, mixed case, numbers, symbols).
- Password reset link: "Forgot password?" → email reset link (60 min expiry).
- 2FA (optional for MVP): If enabled on Host account, show TOTP input (6-digit code from authenticator app).
- Error states: Invalid credentials, account locked (too many failed attempts), 2FA code expired.
- "Remember this device" checkbox (optional): Store device fingerprint to skip 2FA on this device for 30 days.

**Non-obvious states — SCR-AUTH-02:**
- Tabs: Account | Password | 2FA | Sessions | Notifications.
- Password change: Current password (required) → New password (with strength meter) → Confirm → Save.
- 2FA setup: QR code for authenticator app (Google Authenticator, Authy, etc.) + backup codes (save these in case you lose access).
- 2FA disable: Confirm via current 2FA code.
- Sessions list: Current device (badge) | IP address | Browser / OS | Last activity | Logout button (kill session).
- Notifications: Toggle email notifications for: Org approvals pending, SP approvals pending, Payout failures, System alerts.

**Non-obvious states — SCR-AUTH-03:**
- Team list: Name | Email | Role | Status (Active/Inactive) | Last activity | Actions (edit, revoke access).
- Invite new team member: Email input. Select role (Super Admin / Approver / Viewer). On submit, send invite email with magic link (60 min expiry).
- Role permissions matrix (informational):
  - Super Admin: Full access to all screens + can invite/manage team.
  - Approver: Access to approval queues (Org, SP, packages) + settlements + settings read-only.
  - Viewer: Read-only access to dashboards, settlements, org/SP lists.
- Deactivate team member: Mark as Inactive. Revoke all active sessions immediately.

**Non-obvious states — SCR-AUTH-04:**
- Columns: Timestamp | User | Action (Created org, Approved SP, Triggered payout, Changed settings, etc.) | Affected entity | Status (Success/Failed) | IP address.
- Filters: Date range, user, action type, status.
- Search: By entity name (org name, SP name, etc.).
- Export: Full audit log as CSV for compliance.
- Retention: 90 days minimum (configurable). Older entries archived.

---

## Out of Scope

| Screen | Why cut |
|---|---|
| Member app screens | Member app (React Native) is phase 2 delivery. Host portal is a web portal only. |
| SP portal screens | SP portal is a separate web app. Not included in Host Portal inventory. |
| Org portal screens | Org (HR) portal is a separate web app. Not included in Host Portal inventory. |
| Real-time analytics dashboard | Phase 2 enhancement. MVP dashboard shows basic KPIs; advanced analytics (cohort analysis, churn, LTV) deferred. |
| Dispute resolution workflow | Phase 2. MVP assumes no disputes; if disputes arise, escalate to support@welluber queue. |
| Dunning (billing retry for failed payments) | Phase 2. MVP assumes successful payment or immediate manual retry by Host. |
| Multi-currency reporting | Phase 2. MVP is MYR only; multi-currency reports deferred. |
| Role-based filters for Host team | MVP assumes Host team is small; all Super Admins have same access. Role-based row-level filtering (e.g. Approver only sees pending items) deferred to phase 2. |
| Bulk actions (bulk suspend orgs, etc.) | Deferred. Phase 2 enhancement for efficiency. MVP is single-item actions only. |
| Webhooks / event streaming for partners | Phase 2. Host internal only in MVP. |

---

## Open Questions

- [ ] **SCR-CFG-04 Payment Gateway:** Which payment gateway for Org top-ups (Stripe, Doku, 2Checkout, custom)? This locks the integration scope for Host portal.
- [ ] **SCR-SP-02 T&C Workflow:** Should SPs self-serve T&C upload, or does Host review + approve? Affects SPR-SP-02 design (form-only vs approval queue).
- [ ] **SCR-SP-07 Package Approval:** Is Host package approval enabled in v1, or do packages auto-publish? Affects whether SCR-SP-07 is even needed in MVP.
- [ ] **SCR-CFG-03 Per-SP Split Override:** Can SPs override the global expired voucher split in their commission schema, or is the global split immutable? Affects commission schema design.
- [ ] **SCR-AUTH-03 Team Role Granularity:** How many Host team roles in v1? (Current: Super Admin / Approver / Viewer). Or simpler: Super Admin / Admin / Viewer?
- [ ] **Settlement Cycle Automation:** SCR-SET-01 and SCR-SET-04 assume monthly cycle. Can Host trigger mid-cycle payouts? (Current design: yes, but needs 2FA confirmation). Confirm if this is required in MVP or deferred.

---

## Notes for Claude Code

1. **Navigation structure:** Host portal should have persistent sidebar (left, ~250px) with main areas: Dashboard, Organizations, Service Providers, Settlement, Configuration, Admin. Collapse/expand drawer on mobile.

2. **Layout zones:** Top bar (Welluber logo, search, Host user menu, notifications bell). Sidebar (navigation). Main content (scrollable, full-width). Modals overlay for approvals, confirmations, form submissions.

3. **Data fetching:** All list screens (orgs, SPs, transactions, ledger) should support client-side pagination (100 items per page) initially. Server-side pagination (cursor or offset) if lists exceed 10k items.

4. **Permissions at UI level:** Use role-based conditionals to hide/show buttons (Approve, Suspend, etc.). Backend must also enforce permissions. Never rely on UI alone.

5. **Form validation:** Inline validation with error messages. Save buttons disabled until form is valid. Show success toast on save.

6. **Timestamps:** All timestamps should show user's local timezone (or configurable). Store as UTC in DB.

7. **Currency:** Display all monetary values in RM with thousand separators (e.g., RM 1,234.56). No cents display for whole amounts (e.g., RM 1,000, not RM 1,000.00).

8. **Confirmation dialogs:** Critical actions (Suspend, Deactivate, Trigger payout) require explicit confirmation dialogs. Include what will happen + impact summary.

9. **Loading states:** Show skeleton screens or progress spinners for async operations. No blank screens.

10. **Error recovery:** All error states should offer a path forward (Retry button, contact support CTA, etc.). Never dead-end the user.
