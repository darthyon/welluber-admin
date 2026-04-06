# Flow: Wallet Management (Host Admin)

## Overview
Host Admins need a centralized view of all Organization and Branch wallets to manage balances, credit limits, and monitor transaction health. This flow ensures fiscal oversight across the entire platform.

## User Persona
- **Actor:** Host Admin (Super Admin)
- **Scope:** Platform-wide wallet management

## User Flow

### 1. Overall Wallet Listing
- **Entry:** Main navigation → "Wallets"
- **Visibility:** List of all wallets, including their current balance, model (Cash/Credit), and the associated Organization and Branch.
- **Search:** By Organization Name, Branch Name, or Wallet ID.
- **Filters:**
  - **Organization:** Multi-select filter.
  - **Branch:** Multi-select filter.
  - **Status:** Active, Suspended.
  - **Model:** Cash Balance, Credit Limit.
- **Summary Metrics:**
  - Total Cash Balance (Aggregation of all cash wallets).
  - Total Credit Exposure (Aggregation of all utilized credit).
  - Low Balance Alerts (Count of wallets below threshold).

### 2. Create/Assign Wallet
- **Action:** Add Wallet
- **Step 1:** Select Organization.
- **Step 2:** Select Branch (only branches without an existing wallet are shown).
- **Step 3:** Select Model (Cash Balance or Credit Limit).
- **Step 4:** Set Initial Balance / Credit Limit.
- **Result:** New wallet created and linked to the branch. Redirect to Wallet Detail page.

### 3. Wallet Detail & Transactions
- **Action:** Click on Wallet ID or "View Detail".
- **Views:**
  - **Balance Overview:** High-level card showing current balance, credit limit (if applicable), and pending deductions.
  - **Transaction History:** Ledger view of all deposits, deductions, and adjustments.
  - **Lifecycle Actions:** Suspend Wallet, Resume Wallet.

### 4. Adjustments & Top-Ups (CRUD Update)
- **Top-Up (Cash Model):** Add funds to a cash wallet. Requires a reference ID/Note.
- **Adjust Limit (Credit Model):** Increase or decrease the credit limit available to a branch.
- **Status Change:** Suspend a wallet to block all member purchases until resolved.

## Edge Cases & Error Handling
- **Double Assignment:** System must prevent assigning more than one wallet to a single branch.
- **Insufficient Funds (Credit):** purchases are blocked if `pending_deductions + amount > credit_limit`.
- **Negative Balance:** Only possible through manual adjustments; purchases check against 0 or credit limit.

## Audit Logging
- Every top-up, limit adjustment, or status change MUST log:
  - Performing Host Admin ID.
  - Timestamp.
  - Previous Value → New Value.
  - Purpose/Reference Note.
