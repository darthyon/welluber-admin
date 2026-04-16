# Employee Individual Page - Implementation Plan

## Overview
Create a dedicated employee profile page at `/employees/[id]` with vertical tabs for host admins to manage employee details, entitlements, benefit policies, and claims.

## Architecture

### Route Structure
```
app/(host)/employees/[id]/page.tsx          # Main employee page
app/(host)/employees/[id]/loading.tsx       # Loading state
app/(host)/employees/[id]/error.tsx         # Error boundary
```

### Component Structure
```
components/host/employees/
├── employee-page.tsx                       # Main page wrapper with vertical tabs
├── employee-details-tab.tsx                # Tab 1: Employee details
├── employee-entitlements-tab.tsx           # Tab 2: Benefit entitlements
├── employee-policy-tab.tsx                 # Tab 3: Benefit policy management
├── employee-claims-tab.tsx                 # Tab 4: Claims history
├── assign-policy-modal.tsx                 # Modal for assigning policies
└── unassign-policy-modal.tsx               # Modal for unassigning policies
```

## Implementation Steps

### Phase 1: Foundation & Routing
1. **Create route structure**
   - Create `app/(host)/employees/[id]/` directory
   - Implement `page.tsx` with basic layout
   - Add `loading.tsx` and `error.tsx`

2. **Create main page component**
   - Implement two-column layout with vertical tabs
   - Integrate existing `VerticalTabs` component
   - Add tab state management

### Phase 2: Employee Details Tab
3. **Migrate existing employee detail view**
   - Extract content from `EmployeeDetailView` component
   - Adapt to new tab structure
   - Add edit functionality

4. **Enhance employee information display**
   - Improve information hierarchy
   - Add responsive design
   - Include status indicators

### Phase 3: Entitlements Tab
5. **Create entitlements display**
   - Design benefit pool cards
   - Implement utilization progress indicators
   - Add refresh history timeline

6. **Add entitlement management**
   - Manual refresh functionality
   - Balance adjustment controls
   - Historical data visualization

### Phase 4: Benefit Policy Tab
7. **Implement policy assignment**
   - Create policy card component
   - Add "Assign Policy" button and modal
   - Implement policy selection interface

8. **Add policy management**
   - "Unassign Policy" with confirmation modal
   - Policy details display
   - Benefit group and pool visualization

### Phase 5: Claims Tab
9. **Create claims table**
   - Reuse `UtilisationClaimsTable` component
   - Add filtering by date, status, service
   - Implement CSV export functionality

10. **Enhance claims display**
    - One row per claim requirement
    - Detailed claim view modal
    - Status update controls

### Phase 6: Integration & Polish
11. **Connect to data layer**
    - Integrate with existing employee APIs
    - Add loading states
    - Implement error handling

12. **Add navigation**
    - Breadcrumb navigation
    - Back to employee directory
    - Link to organization page

13. **Polish and testing**
    - Responsive design testing
    - Accessibility review
    - Performance optimization

## Dependencies

### Existing Components to Reuse
- `VerticalTabs` - Tab navigation
- `DetailSection` - Content sections
- `DetailField` - Key-value pairs
- `UtilisationClaimsTable` - Claims display
- `StatusBadge` - Status indicators
- `ActionPopover` - Context menus
- `ConfirmationModal` - Confirmation dialogs

### New Components Needed
- `PolicyCard` - Policy overview card
- `BenefitPoolCard` - Pool balance display
- `AssignPolicyModal` - Policy assignment interface
- `UnassignPolicyModal` - Policy removal confirmation

## Data Requirements

### Employee Data
- Basic profile information
- Employment details
- Contact information
- Status and metadata

### Benefit Data
- Assigned policy details
- Benefit pool allocations
- Current balances
- Utilization history

### Claims Data
- Transaction history
- Voucher details
- Service provider information
- Status and amounts

## Success Criteria
1. Host admins can view complete employee profiles
2. Policy assignment/unassignment works with proper confirmation
3. Claims display shows one row per claim with filtering
4. All tabs load data efficiently
5. Responsive design works on all screen sizes
6. Navigation between tabs is smooth and intuitive

## Risk Mitigation
1. **Data consistency**: Ensure policy changes don't break existing claims
2. **Performance**: Implement pagination for claims table
3. **User experience**: Maintain consistent design patterns
4. **Backward compatibility**: Keep existing employee detail view functional during transition