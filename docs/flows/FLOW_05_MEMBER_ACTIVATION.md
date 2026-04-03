# Flow 5 — Member: Account Activation & Corporate Identity Linking — April 2026

**Who:** Member (Employee)  
**Platform:** Member App (React Native)  
**From:** App launch, fresh install  
**To:** Corporate identity verified, benefit wallet unlocked, ready to browse marketplace  
**Entry condition:** Member downloads Welluber app for first time, no account yet.  
**Failure exits:** Token expired, email verification failed, employee not found in HR list, corporate identity already linked to another account.

---

## Happy Path

**1. Member:** Opens Welluber app for first time [NAVIGATE]  
   — Sees welcome screen  
   — Marketplace visible (read-only)  
   — Benefit wallet locked with CTA: "Add Corporate Identity"

**2. Member:** Taps "Create Account" [NAVIGATE]  
   — Choice: Personal Email | Google SSO | Apple SSO

**3. Member:** Creates personal account via chosen method  
   — If Personal Email: enters email + sets password (or password-free magic link)  
   — If Google/Apple SSO: taps, authenticates, consents to scopes

**4. System:** Creates Welluber root account [API] [PERSIST]  
   — Personal identity established  
   — Account status = Active  
   — No corporate link yet  
   — Logs action: "Created Welluber account via [method] for [personal email]"

**5. System:** Routes to app home / benefit wallet screen [NAVIGATE]  
   — Status: Browse mode (marketplace visible, checkout gated)  
   — Wallet section locked with banner: "Link your corporate identity to access benefits"  
   — CTA: "Add Corporate Identity"

**6. Member:** Taps "Add Corporate Identity" [NAVIGATE]  
   — Shown input options:  
   — Employee ID (numeric or alphanumeric)  
   — Corporate Email (e.g. name@company.com)

**7. Member:** Enters Employee ID or Corporate Email

**8. System:** Cross-references against HR's uploaded employee list [API]  
   — Searches: is this employee registered with any org's uploaded CSV?  
   — Filters: active employees only (start_date ≤ today ≤ termination_date)

**IF Employee found:**
   → Proceed to step 9

**IF Employee NOT found:**
   → Show error: MEMBER_NOT_FOUND  
   — "We couldn't find an employee with that ID/email. Double-check and try again, or contact your HR administrator."  
   → Allow retry

**9. System:** Sends magic link to corporate email [API]  
   — Generates secure token (60 min expiry)  
   — Email sent to corporate email address on file  
   — Email body: "Verify your Welluber account: [link] This link expires in 60 minutes."  
   — Logs action: "Sent corporate identity verification link to [corporate email] for [Employee ID]"

**10. Member:** Receives email at corporate inbox  
   — Opens email  
   — Taps magic link

**11. System:** Routes via universal link [NAVIGATE]  
   — Link scheme: `welluber://verify-identity/[token]`  
   — Deep link routing: opens Welluber app directly (never browser)  
   — Browser fallback (if app not installed): branded page with "Open in Welluber" deep link  
   — ⚠️ CRITICAL: Binding must NOT complete in browser. Browser shows: "Redirecting to Welluber app..." then closes.

**12. System:** Validates token [VALIDATE]  
   → If token expired (>60 min): show error "Link expired. Request a new verification email."  
   → If token invalid/tampered: show error "Invalid link. Try again or contact support."  
   → If token valid: proceed to step 13

**13. System:** Binds corporate identity to Welluber account [API] [PERSIST]  
   — Creates Corporate Identity record  
   — Links: personal account ← → corporate identity ← → organization  
   — Status: Active  
   — Token invalidated (single-use)  
   — Logs action: "Verified corporate identity [corporate email] and linked to Welluber account on [timestamp]"

**14. System:** Triggers Benefit Assignment eligibility check [API]  
   — Queries: does HR have a Benefit Assignment for this employee?  
   — If yes: load assignment(s) and check activation_mode  
   — If no: show empty wallet with message "Your HR admin hasn't assigned benefits yet. Check back soon."

**15. System:** Routes to Benefit Wallet screen [NAVIGATE]  
   — Wallet now UNLOCKED  
   — Benefit groups visible with remaining balance per group  
   — CTA: "Browse Marketplace"

**16. Member:** Taps "Browse Marketplace"  
   — Full marketplace access (search, filter, view details, checkout enabled)

**17. Member:** Can now:  
   — View all available vouchers  
   — See remaining balance per benefit group  
   — Add to cart  
   — Proceed to checkout  
   — Make online purchases

---

## Edge Cases

**1. Token Expired (>60 minutes)**

**User sees:** "Link expired. Request a new email."

**Member can:**
- Tap "Resend Email" → System sends new magic link to corporate email  
- Retry from step 9  
- Pending identity is NOT invalidated; only token is refreshed

---

**2. Browser Fallback (App Not Installed)**

**Flow:**
- Member taps link in email on device without app  
- Browser opens branded Welluber page  
- Page shows: "Welluber app required. Install from App Store / Google Play, then open your email link again."  
- Button: "Open App Store" → redirects to store listing  
- **Critical:** Binding does NOT complete in browser, even if link is valid  
- Token remains valid until expiry (can retry after app install)

---

**3. Multiple Corporate Identities**

**Member has:**
- Personal Welluber account  
- Corporate Identity A (Company X, active)  
- Corporate Identity B (Company Y, deactivated due to departure)

**Flow:**
- Member can add another corporate identity at any time  
- Profile → Corporate Identities → "Add New Identity"  
- Same magic link flow  
- Multiple active identities allowed (e.g., works for 2 companies)  
- Each identity shows separate benefit wallet  
- Tab/switch between identities in app

---

**4. Employee Not in HR List**

**Scenario:** Member enters Employee ID, but HR hasn't uploaded them yet or employee data is wrong

**Flow:**
- System shows: MEMBER_NOT_FOUND  
- "We couldn't find an employee with that ID. Check your ID or contact HR."  
- Member can:  
  - Retry with different ID/email  
  - Contact HR to verify enrollment  
  - Contact Welluber support

---

**5. Corporate Email Typo or Inaccessible**

**Scenario:** Member enters wrong corporate email during Employee ID lookup

**Flow:**
- System can't send magic link to wrong email  
- Magic link step fails silently (email never arrives)  
- Member waits, realizes link didn't arrive  
- Taps "Resend Email" or "Try Again"  
- Can verify/correct email before retry

---

**6. Activation Mode Not Yet Active (e.g., Employee on Probation)**

**Scenario:** Employee linked successfully, but activation_mode = "After Probation Ends" and probation hasn't ended yet

**Flow:**
- Corporate identity verified and linked ✓  
- Benefit wallet shows: "Your benefits activate on [probation_end_date]"  
- Benefit groups visible but locked  
- Marketplace shows: "Browse available services (purchase blocked until [date])"  
- Member can't checkout until activation date

---

**7. Benefit Pool Exists but Balance = 0**

**Scenario:** Org admin assigned policy but wallet hasn't been funded yet

**Flow:**
- Corporate identity linked ✓  
- Benefit wallet visible with balance = RM 0  
- Marketplace shows: "Your company hasn't funded your benefits yet. Contact HR."  
- Checkout blocked with error: ORG_WALLET_INSUFFICIENT

---

**8. Employee Deactivated by HR (After Initial Linking)**

**Scenario:** Member linked corporate identity successfully, but HR deactivates them later (termination)

**Flow:**
- Next app open: system detects deactivation  
- Show banner: "Your employment has ended. Benefits are no longer available."  
- Corporate identity marked as deactivated  
- Active vouchers auto-expired  
- Wallet locked  
- Transaction history retained (read-only)

---

**9. Corporate Email Linked to Multiple Accounts**

**Scenario:** HR uploaded employee with corporate email, but multiple personal Welluber accounts try to verify with that email

**Flow:**
- First account to verify: succeeds ✓  
- Second account to verify: error "This corporate email is already linked. Contact HR or Welluber support."  
- System prevents duplicate linkage (one corporate email = one Welluber account)

---

## Failure Exits

### Failure: Employee Not Found

**User sees:** MEMBER_NOT_FOUND error  
**Message:** "We couldn't find an employee with that ID/email. Double-check and try again."

**User can:**
- Retry with correct ID/email
- Contact HR admin to verify enrollment
- Contact Welluber support

---

### Failure: Token Expired

**User sees:** "Link expired. Request a new email."

**User can:**
- Tap "Resend Email" → new magic link sent
- Link remains valid for 60 more minutes

---

### Failure: Invalid/Tampered Token

**User sees:** "Invalid link. Try again or contact support."

**User can:**
- Tap "Resend Email" → new magic link sent
- Contact Welluber support if issue persists

---

### Failure: App Not Installed (Browser Fallback)

**User sees:** "Welluber app required. Install and try again."

**User can:**
- Download app from App Store / Google Play
- Open email link again after installation
- Token remains valid during installation window

---

## Handoff to Claude Code

**Screens needed:**
- Welcome / Create Account screen (email / Google / Apple SSO options)
- Browse mode (locked wallet, marketplace visible, "Add Corporate Identity" CTA)
- Add Corporate Identity input (Employee ID or Corporate Email)
- Loading state (magic link sent, checking email, awaiting verification)
- Benefit Wallet screen (unlocked, benefit groups with balances)
- Marketplace home screen (full access, search/filter, voucher cards)

**Key implementation notes:**
- Two-inbox model (personal email creates account, corporate email verifies employment)
- Magic link token expiry: 60 minutes (strict)
- Universal link scheme must be locked before this flow is designed
- Browser fallback: show message, don't complete binding
- Validation: cross-reference corporate email against HR employee list (join: corporate_email in employees table)
- Activation mode check: if not yet active, show message but don't block UI (wallet shows locked status)
- All changes logged to audit trail with timestamp
- Magic links single-use (token invalidated after successful verification or expiry)

