# Address Model Verification Checklist

This checklist verifies the address model consolidation changes across all surfaces.

## Pre-requisites
- Dev server running: `pnpm dev`
- Access to the admin console (authenticated)

---

## 1. Organisation Creation Flow

### 1.1 Navigate to Create Organisation
- [ ] Go to `/organizations/new`
- [ ] Verify page loads with "Add New Organisation" heading
- [ ] Verify "Step 1 of 2" badge is visible

### 1.2 Business Address Section - LocationPicker
- [ ] Scroll to "Business Address" section
- [ ] Verify all fields are present:
  - [ ] Address Line (text input)
  - [ ] City (text input)
  - [ ] State (dropdown select)
  - [ ] Postal Code (text input)
  - [ ] Country (dropdown select - should show Malaysia, Singapore, Indonesia, Thailand)

### 1.3 Fill Address with Coordinates
- [ ] Fill in address:
  - Address Line: `Level 15, Menara Southpoint`
  - City: `Kuala Lumpur`
  - State: `Wilayah Persekutuan`
  - Postal Code: `59200`
  - Country: `Malaysia`
- [ ] Look for coordinates/map section
- [ ] If coordinates input is available, enter:
  - Latitude: `3.1390`
  - Longitude: `101.7036`
- [ ] Verify coordinates are accepted as numbers (no validation errors)

### 1.4 Complete Step 1
- [ ] Fill all required fields (name, legal identity, type, TIN, bank details)
- [ ] Click "Next" or "Continue"
- [ ] Verify navigation to Step 2: "Set Up HQ Branch"
- [ ] Verify address data is preserved (check if branch address pre-fills)

---

## 2. Organisation Edit Flow

### 2.1 Navigate to Edit Page
- [ ] Go to `/organizations/ORG-20260115-0001/edit` (Acme Corporation)
- [ ] Verify page loads with "Edit Organisation" heading

### 2.2 Verify Pre-filled Address
- [ ] Scroll to "Business Address" section
- [ ] Verify address fields are pre-filled with existing data:
  - [ ] Address Line has a value (not empty)
  - [ ] City has a value
  - [ ] State is selected
  - [ ] Postal Code has a value
  - [ ] Country is selected
- [ ] If coordinates are displayed, verify they show as numbers (e.g., `3.1390`, not `"3.1390"`)

---

## 3. Branch Detail View (Host)

### 3.1 Navigate to Branch Detail
- [ ] Go to `/organizations/ORG-20260115-0001/branches/br_1`
- [ ] Verify page loads with branch name heading

### 3.2 Verify Address Display
- [ ] Look for address section
- [ ] Verify structured address fields are displayed:
  - [ ] Address Line
  - [ ] City
  - [ ] Postal Code
  - [ ] State
  - [ ] Country

### 3.3 Verify Coordinates Display
- [ ] Look for Latitude/Longitude fields
- [ ] Verify coordinates are displayed as **numbers** (e.g., `3.1390`)
- [ ] Verify field label says "Longitude" (not "Lng")
- [ ] Verify coordinates are **flat** (not nested under "coordinates")

### 3.4 Verify Timezone
- [ ] Look for Timezone field
- [ ] Verify timezone is displayed **separately** from address (not inside address object)
- [ ] Verify timezone value is shown (e.g., "GMT +8:00")

---

## 4. Branch Detail View (Org Portal)

### 4.1 Navigate to Org Portal Branch Detail
- [ ] Go to `/acme-corp/branches/br_1`
- [ ] Verify page loads with branch name heading

### 4.2 Verify Address Field Naming
- [ ] Look for address display
- [ ] Verify field label says "Address" or "Address Line" (not "Street")
- [ ] Verify address value is displayed
- [ ] **Critical**: Search page source for "street" - should NOT be present
  - Right-click → Inspect → Search for "street"
  - Should find 0 matches

---

## 5. Branch Card Display

### 5.1 Navigate to Branches Tab
- [ ] Go to `/organizations/ORG-20260115-0001`
- [ ] Click on "Branches" tab
- [ ] Verify branch cards are displayed

### 5.2 Verify Card Summary
- [ ] Look at branch card location display
- [ ] Verify format is "City, State" (e.g., "Kuala Lumpur, Wilayah Persekutuan")
- [ ] Verify comma separator is present

---

## 6. Organisation Profile Tab

### 6.1 Navigate to Profile Tab
- [ ] Go to `/organizations/ORG-20260115-0001`
- [ ] Click on "Profile" tab
- [ ] Scroll to "Business Address" section

### 6.2 Verify Address Data Source
- [ ] Verify address fields are displayed:
  - [ ] Address Line
  - [ ] Country
  - [ ] Postal Code
  - [ ] City
  - [ ] State
- [ ] **Critical**: Values should come from `org.address` data, not hardcoded
  - If you have access to mock data, verify the displayed values match the data
  - If you change the mock data, the display should update

---

## 7. Service Provider Branch Form

### 7.1 Navigate to SP Branch Creation
- [ ] Go to `/service-providers/SP-001/branches/new`
- [ ] Verify page loads with "Add Branch" or "New Branch" heading

### 7.2 Fill Address
- [ ] Fill in address fields:
  - Address Line: `No. 10, Jalan SP`
  - City: `Penang`
  - State: `Pulau Pinang`
  - Postal Code: `10000`
  - Country: `Malaysia`
- [ ] Verify all fields accept input correctly
- [ ] Verify no validation errors appear

### 7.3 Verify Address Normalization
- [ ] If coordinates are available, enter numeric values
- [ ] Verify coordinates are stored as numbers (not strings)
- [ ] Submit form (if possible) and verify no errors

---

## 8. Type Safety Verification

### 8.1 TypeScript Compilation
- [ ] Run: `pnpm typecheck`
- [ ] Verify: **0 errors**

### 8.2 Design System Lint
- [ ] Run: `pnpm lint:design`
- [ ] Verify: **0 violations**

### 8.3 Build
- [ ] Run: `pnpm build`
- [ ] Verify: Build completes successfully

---

## 9. Data Consistency Checks

### 9.1 Mock Data Verification
- [ ] Check `lib/mock-data/acme-org-detail.ts`
- [ ] Verify `ACME_BRANCHES` array has full `Address` objects:
  - [ ] Each branch has `line`, `city`, `state`, `postalCode`, `country`
  - [ ] Coordinates are numbers (if present)

### 9.2 Canonical Type Usage
- [ ] Search for `import.*Address.*from.*types/address`
- [ ] Verify multiple files import from canonical type:
  - [ ] `types/organization.ts`
  - [ ] `types/provider.ts`
  - [ ] `features/organizations/types.ts`
  - [ ] `components/shared/location-picker.tsx`
  - [ ] `components/host/organizations/branch-form.tsx`
  - [ ] `components/host/organizations/branch-card.tsx`
  - [ ] `lib/mock-data/acme-org-detail.ts`

---

## 10. Regression Testing

### 10.1 Organisation List
- [ ] Go to `/organizations`
- [ ] Verify organisation list loads
- [ ] Verify "Location" column shows abbreviated format (e.g., "KL-MY")
- [ ] Verify tooltip shows full state/country names

### 10.2 Branch List
- [ ] Go to `/organizations/ORG-20260115-0001/branches`
- [ ] Verify branch list/grid loads
- [ ] Verify branch cards show city, state summary

### 10.3 Service Provider Detail
- [ ] Go to `/service-providers/SP-001`
- [ ] Verify SP detail page loads
- [ ] Verify address displays correctly (if present)

---

## Known Issues / Notes

- **Authentication**: E2E tests require auth setup (not configured)
- **Mock Data**: All test data uses mock data from `lib/mock-data/`
- **Coordinate Types**: All coordinates should be `number`, not `string`
- **Field Naming**: Use `line` (not `street`), `lon` (not `lng`)

---

## Sign-off

- [ ] All checks passed
- [ ] No regressions found
- [ ] Address model is consistent across all surfaces

**Tester**: _______________  
**Date**: _______________  
**Notes**: _____________________________________________
