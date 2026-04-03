# Flow: Organization Onboarding

> **Status:** Planned
> **Last Updated:** 2026-04-03
> **Persona:** Host Admin

---

## 1. Overview

Multi-step wizard to register and configure a new organization on the platform.

## 2. Wizard Steps

### Step 1: Organization Details
- Legal entity name
- Registration number
- HQ address
- Industry/sector

### Step 2: Primary Contact (PIC)
- Contact person name
- Email
- Phone number
- Role/title

### Step 3: Benefit Configuration
- Select benefit categories
- Set initial budget/allocation
- Configure policy templates

### Step 4: Review & Submit
- Summary of all entered data
- Terms acceptance
- Submit for activation

---

## 3. Post-Submission

- Organization created with `Pending` status
- Host admin can review and activate
- PIC receives invitation email
- Org admin account provisioned

---

## 4. Error Paths

- Duplicate registration number → Inline validation error
- Incomplete required fields → Step validation prevents progression
- Network error on submit → Retry with preserved form state
