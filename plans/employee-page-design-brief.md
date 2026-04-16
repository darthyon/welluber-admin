# Employee Individual Page - Design Brief

## 1. Feature Summary
A dedicated employee profile page for host admins to view and manage individual employee details, benefit entitlements, policy assignments, and claims history. This page will replace the inline employee detail view currently embedded within organization pages, providing a more comprehensive and focused interface for employee management.

**Primary Users**: Host admins (WellUber operations team)
**Context**: Accessed from employee directory or organization employee lists
**Goal**: Provide a single, comprehensive view of an employee's profile, benefits, and activity

## 2. Primary User Action
The host admin needs to:
1. View complete employee profile information
2. Manage benefit policy assignments (assign/unassign)
3. Review benefit entitlements and utilization
4. Monitor claims history and transaction activity

## 3. Design Direction
**Aesthetic**: Consistent with WellUber's "precision infrastructure" brand - calm, exacting, quietly premium
**Feel**: Operational tooling - information-dense without being cramped, intentional hierarchy, fast interactions
**Consistency**: Follows existing patterns from organization detail pages and policy management interfaces
**Reference**: Similar to Linear's issue detail view with vertical navigation tabs

## 4. Layout Strategy
**Two-column layout**:
- Left column (240px): Vertical tabs for navigation
- Right column (flexible): Content area for the selected tab

**Vertical Tabs** (left sidebar):
1. Employee Details
2. Entitlements  
3. Benefit Policy
4. Claims

**Content Area Hierarchy**:
1. Page header with employee name, status, and quick actions
2. Tab-specific content with appropriate density and spacing
3. Consistent use of cards, tables, and detail sections

## 5. Key States

### Default State (Employee Details tab)
- Complete employee profile information
- Basic info, employment details, contact information
- Edit button for profile updates

### Entitlements Tab
- Benefit allocations summary
- Pool balances and utilization percentages
- Refresh history and upcoming allocations

### Benefit Policy Tab
- Current assigned policy card (if any)
- "Assign Policy" / "Unassign Policy" actions
- Policy details with benefit groups and pools
- Empty state when no policy assigned

### Claims Tab  
- Table of claims (one row per claim)
- Filtering by date range, status, service type
- Export functionality

### Empty States
- No policy assigned (Benefit Policy tab)
- No claims yet (Claims tab)
- No entitlements yet (Entitlements tab)

### Loading State
- Skeleton loading for all content areas
- Progressive loading per tab

### Error States
- Employee not found
- Failed to load data
- Permission errors

## 6. Interaction Model
**Tab Navigation**: Click vertical tabs to switch content
**Policy Management**: 
- "Assign Policy" opens modal with policy selection
- "Unassign Policy" shows confirmation dialog (with warning if active claims exist)
- Policy changes trigger entitlement recalculations

**Data Updates**:
- Real-time updates for claims
- Manual refresh for entitlements
- Edit-in-place for employee details

**Breadcrumb Navigation**: Back to employee directory or organization

## 7. Content Requirements

### Employee Details
- Full name, employee ID, employee code
- Email, phone, date of birth
- Identification details (type, number)
- Employment: join date, department, designation, work type
- Branch/location information
- Status indicators

### Entitlements
- Benefit pool names and amounts
- Current balance vs. allocated amount
- Utilization percentage
- Refresh cycle information
- Last refreshed date

### Benefit Policy
- Policy name and description
- Benefit groups with allocations
- Pool configuration (individual/shared)
- Eligibility rules
- Effective dates

### Claims
- Voucher code
- Service name
- Provider name
- Location
- Date
- Amount
- Status (Approved/Pending/Rejected)

### Microcopy
- Empty state messages
- Confirmation dialogs
- Success/error notifications
- Tooltips for complex terms

## 8. Recommended References
- `.impeccable.md` for design principles
- `components/shared/vertical-tabs.tsx` for tab component
- `components/host/organizations/employee-detail-view.tsx` for existing employee view
- `components/shared/utilisation-claims-table.tsx` for claims table
- `components/shared/detail-section.tsx` for detail layouts

## 9. Open Questions (Resolved)

1. **Multiple policies**: Employees only have 1 policy at a time (1:1 relationship)
2. **Unassigning policy with active claims**: 
   - Show confirmation modal when trying to unassign policy with active claims
   - Claim records remain tied to the old policy for historical reference
   - Policy change doesn't delete claim history
3. **Audit trail**: Policy changes should be logged (timestamp, user, action)
4. **Quick actions**: 
   - Edit employee
   - Assign/unassign policy  
   - Located in top right of tab content area (not separate quick actions section)
5. **Export format**: CSV export for claims data (mock implementation acceptable)
   - Export button should be icon-based