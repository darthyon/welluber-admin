# Component Inventory

> All reusable components in `welluber-admin`. Use this as the component spec for building the shared `packages/ui` library in the production monorepo.
> Design system rules: see `AGENTS.md` in repo root.

---

## Shared Components (`components/shared/`)

These components are domain-agnostic and should live in `packages/ui` in the monorepo.

### Layout & Navigation

| Component | File | Key Props | Usage |
|-----------|------|-----------|-------|
| `AppSidebar` | `app-sidebar.tsx` | `user`, `navigation[]` | Main 240px frosted-glass sidebar nav. Renders per-persona navigation items |
| `TopBar` | `top-bar.tsx` | `user` | Header with page title, user avatar, theme toggle, notification bell |
| `TwoColumnDetailLayout` | `two-column-detail-layout.tsx` | `main`, `sidebar` | 2/3 + 1/3 split layout for detail pages |
| `FloatingAnchorNav` | `floating-anchor-nav.tsx` | `sections[]` | Sticky jump-link nav for long forms; highlights active section on scroll |
| `Breadcrumbs` | `breadcrumbs.tsx` | `items[]` | Breadcrumb trail with current page |
| `VerticalTabs` | `vertical-tabs.tsx` | `tabs[]`, `activeTab` | Vertical tab navigation for detail page sections |
| `ItemSection` | `item-section.tsx` | `title`, `children` | Consistent section wrapper with heading |
| `DetailSection` | `detail-section.tsx` | `title`, `children` | Card-style section for detail pages |
| `DetailField` | `detail-field.tsx` | `label`, `value` | Single labeled field in a detail view |

### Data Display

| Component | File | Key Props | Usage |
|-----------|------|-----------|-------|
| `DataTable` | `data-table.tsx` | `columns[]`, `data[]`, `onSort`, `onFilter` | Sortable/filterable table with pagination |
| `ExpandableDataTable` | `expandable-data-table.tsx` | `columns[]`, `data[]`, `renderExpanded` | Table with expandable row detail |
| `BentoGrid` | `bento-grid.tsx` | `items[]` | Responsive KPI card grid for dashboard |
| `StatusBadge` | `status-badge.tsx` | `status`, `variant` | Static status pill (Active/Pending/Inactive/etc.) |
| `PulseStatus` | `pulse-status.tsx` | `status`, `label` | Animated status with ping dot for live states |
| `OverflowTags` | `overflow-tags.tsx` | `tags[]`, `max` | Shows first N tags, "+X more" overflow |
| `EntityAvatar` | `entity-avatar.tsx` | `name`, `logo?`, `size` | Avatar with logo or initials fallback |
| `EntityHeader` | `entity-header.tsx` | `name`, `logo`, `status`, `actions[]` | Page-top entity identity block with CTA buttons |
| `ActivityTimeline` | `activity-timeline.tsx` | `entries[]` | Vertical activity feed for audit/history display |

### Search & Filtering

| Component | File | Key Props | Usage |
|-----------|------|-----------|-------|
| `DataFilterBar` | `data-filter-bar.tsx` | `search`, `filters[]`, `onSearch`, `onFilter` | Combined search input + filter chips bar |
| `MultiSelectFilter` | `multi-select-filter.tsx` | `options[]`, `selected[]`, `onChange` | Checkbox dropdown for multi-value filters |
| `AdvancedFilterSheet` | `advanced-filter-sheet.tsx` | `filters[]`, `onApply` | Drawer panel with advanced filters (sliders, date ranges, selects) |
| `SearchableFilter` | `searchable-filter-item.tsx` | `options[]`, `onSelect` | Searchable dropdown filter item |
| `SearchableMultiSelect` | `searchable-multi-select.tsx` | `options[]`, `value[]`, `onChange` | Multi-select with search input |
| `FilterItem` | `filter-item.tsx` | `label`, `options[]` | Single filter row for use in filter panels |
| `ViewToggle` | `view-toggle.tsx` | `view`, `onChange` | List/grid view switcher |

### Form Components

| Component | File | Key Props | Usage |
|-----------|------|-----------|-------|
| `DateRangePicker` | `date-range-picker.tsx` | `value`, `onChange` | Calendar-based date range picker |
| `DatePickerField` | `date-picker-field.tsx` | `value`, `onChange`, `label` | Single date picker with label |
| `PhoneInput` | `phone-input.tsx` | `value`, `onChange` | International phone with country code selector |
| `LocationPicker` | `location-picker.tsx` | `value`, `onChange` | Address input with lat/lon capture |
| `CustomCombobox` | `custom-combobox.tsx` | `options[]`, `value`, `onChange` | Searchable combobox (single select) |
| `CustomMultiSelect` | `custom-multi-select.tsx` | `options[]`, `value[]`, `onChange` | Multi-select with chips |
| `SectionedSearchSelect` | `sectioned-search-select.tsx` | `sections[]`, `value`, `onChange` | Grouped/sectioned searchable select (for Tier 2 service selection) |
| `IdentificationInput` | `identification-input.tsx` | `value`, `onChange`, `type` | Input for ID numbers with formatting |
| `LogoUpload` | `logo-upload.tsx` | `value`, `onChange` | Logo/image upload with preview |
| `DocumentUploadSection` | `document-upload-section.tsx` | `documents[]`, `onUpload` | Multi-document upload section |
| `ServiceToggleCard` | `service-toggle-card.tsx` | `service`, `selected`, `onToggle` | Selectable service card for taxonomy selection |
| `ChoiceCard` | `choice-card.tsx` | `label`, `description`, `selected`, `onSelect` | Radio-style choice card for structured options |
| `Switch` | `switch.tsx` | `checked`, `onChange`, `label` | Toggle switch with label |
| `FieldHelp` | `field-help.tsx` | `text` | Tooltip/help text for form fields |

### Feedback & Modals

| Component | File | Key Props | Usage |
|-----------|------|-----------|-------|
| `ConfirmationModal` | `confirmation-modal.tsx` | `title`, `message`, `onConfirm`, `onCancel` | Destructive action confirmation dialog |
| `SuccessModal` | `success-modal.tsx` | `title`, `message`, `actions[]` | Post-action success state |
| `SuccessCelebration` | `success-celebration.tsx` | `message` | Animated celebration on completion |
| `EmptyState` | `empty-state.tsx` | `title`, `description`, `action?` | Consistent empty list/search state |
| `Spinner` | `spinner.tsx` | `size` | Loading indicator |

### Actions

| Component | File | Key Props | Usage |
|-----------|------|-----------|-------|
| `ActionPopover` | `action-popover.tsx` | `actions[]` | Dropdown of contextual actions (edit, delete, suspend, etc.) |
| `BackButton` | `back-button.tsx` | `href?` | Consistent back navigation |
| `NotificationCenter` | `notification-center.tsx` | `notifications[]` | Notification panel from TopBar |
| `ThemeToggle` | `theme-toggle.tsx` | — | Light/dark mode toggle |
| `UserNav` | `user-nav.tsx` | `user` | User avatar dropdown with profile/logout |
| `WelluberLogo` | `welluber-logo.tsx` | `size`, `variant` | Brand logo component |
| `WelluberMark` | `welluber-mark.tsx` | `size` | Brand mark (icon only) |

### Domain-Shared Tables

| Component | File | Usage |
|-----------|------|-------|
| `OrganizationClaimsTable` | `organization-claims-table.tsx` | Reusable claims table with org context |
| `VouchersTable` | `vouchers-table.tsx` | Reusable voucher list table |
| `UtilisationClaimsTable` | `utilisation-claims-table.tsx` | Claims table with utilization context |
| `VoucherDetailSheet` | `voucher-detail-sheet.tsx` | Slide-over panel with full voucher details |

---

## Host Admin Components (`components/host/`)

Domain-specific components used within the Host Portal. These belong in `apps/admin/` in the monorepo.

### Dashboard
| Component | File | Usage |
|-----------|------|-------|
| `KpiCard` | `host/dashboard/kpi-card.tsx` | Single metric bento card (value, label, trend) |
| `ActivityChart` | `host/dashboard/activity-chart.tsx` | Line chart for platform activity over time |
| `TopOrgsList` | `host/dashboard/top-orgs-list.tsx` | Ranked org list by utilization or claims |
| `TopSpsList` | `host/dashboard/top-sps-list.tsx` | Ranked SP list by redemption volume |

### Organizations
| Component | File | Usage |
|-----------|------|-------|
| `OrgCard` | `host/organizations/org-card.tsx` | Grid view org card (name, status, member count, balance) |
| `OrgListRow` | `host/organizations/org-list-row.tsx` | Table row for org list view |
| `CreateOrgForm` | `host/organizations/create-org-form.tsx` | Multi-step org creation form |
| `OrgBranchForm` | `host/organizations/org-branch-form.tsx` | Branch create/edit form |
| `OrgOverviewTab` | `host/organizations/org-overview-tab.tsx` | Org detail overview section |
| `OrgEmployeesTab` | `host/organizations/org-employees-tab.tsx` | Employees tab in org detail |
| `OrgPoliciesTab` | `host/organizations/org-policies-tab.tsx` | Assigned policies tab |

### Policies
| Component | File | Usage |
|-----------|------|-------|
| `PolicyTemplateSelector` | `host/policies/policy-template-selector.tsx` | Template picker at policy creation start |
| `PolicyBuilderForm` | `host/policies/policy-builder-form.tsx` | Full multi-section policy form |
| `BenefitGroupEditor` | `host/policies/benefit-group-editor.tsx` | Add/edit benefit groups within policy |
| `BenefitEditor` | `host/policies/benefit-editor.tsx` | Add/edit individual benefits within a group |
| `PolicyReviewSummary` | `host/policies/policy-review-summary.tsx` | Full policy preview before activation |
| `PolicyVersionHistory` | `host/policies/policy-version-history.tsx` | Version tree sidebar in policy edit |

### Service Providers
| Component | File | Usage |
|-----------|------|-------|
| `SpCard` | `host/providers/sp-card.tsx` | Grid view SP card |
| `SpListRow` | `host/providers/sp-list-row.tsx` | Table row for SP list |
| `CreateSpForm` | `host/providers/create-sp-form.tsx` | Multi-step SP onboarding form |
| `SpBranchEditor` | `host/providers/sp-branch-editor.tsx` | Branch add/edit with operating hours |
| `SpVoucherForm` | `host/providers/sp-voucher-form.tsx` | Voucher create/edit form |
| `CommissionSchemaEditor` | `host/providers/commission-schema-editor.tsx` | Per-service commission tier editor |
| `TaxProfileForm` | `host/providers/tax-profile-form.tsx` | Tax registration and rate form |

### Accounts
| Component | File | Usage |
|-----------|------|-------|
| `AccountCard` | `host/accounts/account-card.tsx` | Wallet balance card with status |
| `TransactionTable` | `host/accounts/transaction-table.tsx` | Account transaction history table |
| `TopupApprovalForm` | `host/accounts/topup-approval-form.tsx` | Approve/reject top-up request form |

---

## shadcn/ui Primitives (`components/ui/`)

Standard Radix UI primitives, not customized. Do not edit these — extend via the shared components above.

| Primitive | Usage |
|-----------|-------|
| `Button` | Pill-shaped (`rounded-4xl`), variants: default/ghost/outline/destructive |
| `Input` | Muted background, border, label above |
| `Select` | Standard select dropdown |
| `Dialog` | Modal overlay |
| `Sheet` | Slide-over panel |
| `Drawer` | Bottom/side drawer |
| `Popover` | Floating content popover |
| `DropdownMenu` | Contextual action menu |
| `Tabs` | Horizontal tab navigation |
| `Card` | Surface container |
| `Badge` | Small label pill |
| `Avatar` | Circular image/initials |
| `Separator` | Horizontal divider |
| `Label` | Form field label |
| `Textarea` | Multi-line text input |
| `Checkbox` | Boolean toggle |
| `RadioGroup` | Single-choice group |
| `Slider` | Range slider |
| `Calendar` | Date picker calendar |
| `Tooltip` | Hover tooltip |
| `Toast` | Notification toast |

---

## Design System Constraints

When building production components, follow these rules (from `AGENTS.md`):

**Typography:**
- Max weight: `font-semibold` (600). Never `font-bold` (700)
- Scale: `text-micro` (10px) → `text-label` (12px) → `text-body` (14px) → `text-lead` (16px) → `text-heading` (20px) → `text-title` (24px) → `text-display` (32px)

**Colors:**
- Never use hardcoded hex — always CSS custom properties
- Status colors: use `StatusBadge` or `PulseStatus` — never inline status colors
- Never use `text-white`, `bg-white`, `border-zinc-*`, `border-slate-*`

**Spacing:** 4pt base unit — use 4, 8, 12, 16, 24, 32, 48px

**Borders:** `rounded-lg` for cards, `rounded-4xl` for buttons, `rounded-full` for badges

**Icons:** Phosphor Icons (`@phosphor-icons/react`) only — never Heroicons, Lucide, or emoji
