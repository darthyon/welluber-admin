# Frontend Prototype UI/UX Audit

## Purpose

Audit this repository as a frontend product prototype, not as a production backend system.

The goal is to determine whether every screen, route, interaction, component, and user journey forms a coherent, complete, and believable product experience.

Do not modify files during the audit.

Do not spend time on backend architecture, APIs, databases, infrastructure, deployment, or production security unless the visible prototype implies behaviour that is contradictory or impossible to demonstrate.

---

## Audit Objectives

Determine whether users can:

- Understand the product and each screen
- Find and enter intended workflows
- Complete each workflow from start to finish
- Recover, cancel, go back, edit, retry, or exit appropriately
- Navigate without losing context
- Understand statuses, labels, actions, and outcomes
- Use the prototype consistently across modules and breakpoints
- Experience a coherent design system rather than isolated screen implementations

The audit must cover:

- Product structure
- Roles and permissions represented in the UI
- Routes and navigation
- User flows
- Screen-level UX
- Interaction patterns
- Forms
- Lists, tables, cards, and detail views
- Missing states
- Product logic represented in the UI
- Responsive behaviour
- Accessibility fundamentals
- Shared components and design-system usage
- Hardcoded or duplicated patterns
- Visual and terminology consistency

---

# 1. Establish Prototype Context

Before auditing, identify:

- Intended user roles
- Main modules
- Route structure
- Primary navigation
- Known completed flows
- Known incomplete flows
- Explicitly out-of-scope areas
- Supported breakpoints
- Shared component or design-system directories
- Existing design tokens
- Source-of-truth PRDs, briefs, or design references
- Demo-only assumptions
- Placeholder, legacy, abandoned, or experimental screens

If intended behaviour cannot be inferred from the repository, classify the issue as **Product decision required** rather than inventing an answer.

---

# 2. Build the Product Map

Document:

- All represented user roles
- Role-specific navigation
- Modules and submodules
- Pages and subpages
- Route hierarchy
- Nested routes
- Tabs
- Modals
- Drawers
- Wizards and multi-step flows
- Overlays
- Mobile and desktop variants
- Entry points into each module
- Links between modules
- Dependencies between screens
- Orphaned or unreachable screens
- Duplicate, legacy, placeholder, or abandoned screens

Do not rely only on route files. Inspect actual buttons, cards, menus, links, handlers, and rendered interactions.

---

# 3. Map Every Major Flow

For each workflow, document:

- User role
- User goal
- Entry point
- Preconditions
- Main steps
- Available actions
- Completion point
- Follow-up action
- Back behaviour
- Cancel behaviour
- Edit behaviour
- Delete or archive behaviour
- Retry or recovery behaviour
- Related screens
- Missing screens, states, or transitions

Common flow types include:

- View list
- Search
- Filter
- Sort
- View details
- Create
- Edit
- Delete
- Archive or deactivate
- Restore
- Assign or unassign
- Approve or reject
- Upload or attach
- Configure settings
- Upgrade or unlock
- Complete a multi-step task

Do not assume every feature needs every action. Judge each flow based on what the prototype appears to promise.

For every flow, ask:

- Can users discover the flow?
- Can they enter it from a believable place?
- Can they complete it?
- Can they leave without confusion?
- Can they return to the correct context?
- Are essential decisions or steps missing?
- Are users shown actions that do not apply to the current state?
- Does the experience change appropriately by role?
- Does the flow work on both desktop and mobile where applicable?

---

# 4. Audit Navigation and Routing

Inspect:

- Route configuration
- Sidebar navigation
- Top navigation
- Tabs
- Breadcrumbs
- Cards
- Buttons
- Text links
- Menus
- Row actions
- Icon actions
- Modals and drawers
- Back buttons
- Cancel buttons
- Deep links
- Mobile navigation

Flag:

- Buttons or links that do nothing
- Incorrect destinations
- Missing destinations
- Dead-end pages
- Circular navigation
- Pages that cannot be reached
- Routes that exist but are never linked
- Links that lead to the wrong module, tab, record, or state
- Navigation labels that do not match the destination
- Back actions that lose context
- Cancel actions that return somewhere unexpected
- Tabs that reset unexpectedly
- Filters, selected records, or pagination lost after navigation
- Duplicate routes for the same screen
- Legacy or placeholder routes still exposed
- Deep links that render incomplete screens
- Desktop-only navigation with no mobile equivalent
- Mobile navigation that hides essential functionality
- Similar actions inconsistently opening pages, drawers, or modals

Classify each route as:

- Working and reachable
- Working but unreachable
- Broken
- Wrong destination
- Redirect-only
- Duplicate
- Legacy
- Placeholder
- Permission mismatch
- Missing destination
- Unknown or needs runtime verification

---

# 5. Audit Every Screen

## 5.1 Purpose and Clarity

Check:

- Is the purpose immediately clear?
- Does the page title match the task?
- Is the primary action obvious?
- Are secondary actions correctly prioritised?
- Is important context missing?
- Does the screen answer the user's likely questions?
- Does the layout reflect the user's goal rather than the implementation structure?

## 5.2 Information Architecture

Check:

- Is information grouped logically?
- Is the hierarchy clear?
- Are related actions and information placed together?
- Is important information buried?
- Is too much competing for attention?
- Are labels, statuses, dates, values, and metadata understandable?
- Are summaries consistent with details?
- Are modules organised around user mental models?

## 5.3 Interaction Design

Check:

- Is it obvious what is clickable?
- Are interactions consistent across modules?
- Are actions placed where users expect?
- Are destructive actions handled carefully?
- Are important actions hidden in overflow menus?
- Are duplicated actions clearly differentiated?
- Are pages, drawers, modals, and tabs used consistently?
- Are there hover-only interactions with no touch or keyboard equivalent?
- Are disabled states understandable?
- Does feedback appear after actions?

## 5.4 Forms

Check:

- Clear labels
- Required versus optional fields
- Logical field order
- Sensible defaults
- Dependencies between fields
- Helper text
- Examples
- Validation
- Error states
- Disabled states
- Completed states
- Unsaved changes
- Create and edit consistency
- View and edit field parity
- Read-only states
- Destructive confirmations
- Long input handling
- Mobile keyboard and input suitability

Flag:

- Fields shown in detail but missing in create or edit
- Fields appearing in one module but named differently elsewhere
- Controls that imply unsupported behaviour
- Unclear dependencies
- Inconsistent form sections
- Actions available before required information is entered

## 5.5 Lists, Tables, and Cards

Check:

- Is it clear what each item represents?
- Is the most important information visible?
- Can users find the relevant item?
- Are search, filter, sort, and pagination represented where needed?
- Are row or card actions discoverable?
- Are statuses understandable?
- Are empty states represented?
- Are zero-result states represented?
- Are long names and values handled?
- Are bulk actions implied or missing?
- Does mobile preserve essential information and actions?
- Is a card or table pattern being used consistently for the same kind of content?

## 5.6 Detail Views

Check:

- Does the screen show enough information to understand the record?
- Are related records visible where needed?
- Are status, history, metadata, and ownership represented?
- Are edit and management actions easy to find?
- Does the screen return naturally to the list?
- Are actions duplicated or missing between list and detail views?
- Does the detail view match the corresponding create and edit structures?

---

# 6. Audit Missing UX States

Flag missing or weak representations of:

- Empty state
- First-use state
- No search results
- Loading state
- Error state
- Success confirmation
- Disabled state
- Locked or restricted state
- Permission denied
- Partial data
- Missing data
- Long content
- Overflow
- Large datasets
- Very long names
- Missing images
- Missing attachments
- Expired
- Inactive
- Cancelled
- Rejected
- Archived
- Unsaved changes
- Delete confirmation
- Duplicate submission prevention
- Mobile and narrow-screen states
- Offline or unavailable states, only if visibly relevant
- Multi-step progress
- Interrupted or abandoned flow recovery

Separate required prototype states from production-only states that add no value to the prototype.

---

# 7. Audit Product Logic Represented in the UI

Even without backend logic, the prototype should communicate believable behaviour.

Flag:

- Actions available in inappropriate states
- Status transitions that do not make sense
- Missing prerequisites
- Missing dependencies between screens
- Contradictory fields or values
- Counts that do not align with detail views
- Summary metrics that contradict lists
- Role capabilities represented inconsistently
- Plan restrictions or locked features represented differently across screens
- Journeys that skip essential decisions
- Forms that collect data never shown later
- Detail pages showing data never collected
- Screens built around implementation structure instead of user tasks
- Flows designed around existing screens rather than coherent user goals
- CTAs that promise functionality the prototype does not demonstrate
- State labels that do not match available actions

Mark ambiguous cases as **Product decision required**.

---

# 8. Audit Consistency

Flag inconsistencies in:

- Naming
- Terminology
- Page titles
- Button labels
- Status labels
- Status colours
- Date formats
- Time formats
- Currency formats
- Number formats
- Icons
- Typography
- Spacing
- Borders
- Shadows
- Radii
- Card patterns
- Table patterns
- Form patterns
- Modal patterns
- Drawer patterns
- Breadcrumbs
- Tabs
- Alerts
- Empty states
- Confirmation patterns
- Responsive behaviour
- Create, edit, and view layouts
- Similar workflows implemented differently across modules

Identify whether differences are:

- Intentional and justified
- Accidental
- Caused by component limitations
- Caused by duplicated implementation
- A design-system decision that remains unresolved

---

# 9. Component and Design-System Implementation Audit

Audit whether the prototype is built consistently from shared components, tokens, and patterns, or whether screens recreate UI locally.

For every major screen and repeated pattern, determine:

- Whether an existing shared component is used
- Whether a shared component exists but is bypassed
- Whether a pattern is duplicated across modules
- Whether UI is hardcoded directly inside page components
- Whether styling values are hardcoded instead of using tokens
- Whether variants are implemented through props or copied components
- Whether similar interactions behave differently due to independent implementations
- Whether shared components are overridden so heavily that they stop behaving consistently
- Whether components are too generic
- Whether components are too specific
- Whether components are incorrectly abstracted
- Whether reusable patterns are missing from the component library

Inspect repeated patterns including:

- Page headers
- Navigation
- Cards
- KPI or summary cards
- Tables
- Lists
- Status badges
- Buttons
- Inputs
- Selects
- Date pickers
- Search
- Filters
- Tabs
- Modals
- Drawers
- Alerts
- Empty states
- Pagination
- Action menus
- Mobile cards
- Form sections
- Detail sections
- Confirmation patterns

Flag:

- Duplicate components with minor differences
- Pages recreating components that already exist
- Shared components bypassed for raw HTML or local JSX
- Hardcoded colours
- Hardcoded spacing
- Hardcoded typography
- Hardcoded borders
- Hardcoded shadows
- Hardcoded radii
- Hardcoded breakpoints
- Hardcoded labels
- Hardcoded statuses
- Repeated status mappings
- Repeated arrays
- Repeated menu items
- Repeated field definitions
- Repeated table columns
- Copied component variants
- Inconsistent props for similar components
- Fragile local CSS overrides
- Separate desktop and mobile implementations where structure could be shared
- Shared components forcing poor UX because required variants are missing

Do not recommend consolidation merely to reduce file count.

A component should be shared when it represents the same product concept, visual pattern, or interaction behaviour.

Classify each repeated pattern as:

- Shared and consistently used
- Shared but inconsistently used
- Shared but heavily overridden
- Duplicated
- Hardcoded locally
- Missing shared component
- Intentionally screen-specific
- Needs design-system decision

For each issue, include:

- File or component location
- Existing shared alternative
- Difference between implementations
- Whether the difference appears intentional
- UX or consistency impact
- Recommended action: reuse, extend, merge, standardise, or leave separate
- Confidence

---

# 10. Audit Responsive Experience

Review every important flow at available breakpoints.

Flag:

- Hidden actions
- Lost information
- Broken hierarchy
- Dense or unreadable layouts
- Tables that do not translate properly
- Modals or drawers exceeding the viewport
- Small touch targets
- Horizontal scrolling that damages comprehension
- Desktop-only interactions
- Missing mobile equivalents
- Important actions pushed too far down
- Cards becoming unnecessarily tall
- Repeated content that creates excessive scrolling
- Different behaviour between breakpoints without a clear reason
- Mobile flows missing steps available on desktop
- Navigation patterns that change unpredictably

---

# 11. Audit Accessibility Fundamentals

Focus on issues tied to the actual interface.

Check:

- Colour contrast
- Status communicated by colour alone
- Missing or unclear labels
- Ambiguous icon-only actions
- Weak or missing focus states
- Illogical keyboard order
- Hover-dependent controls
- Small touch targets
- Dense or unreadable text
- Poor heading hierarchy
- Modal and drawer focus behaviour
- Content order
- Form association and labelling
- Disabled controls without explanation
- Interactive elements that do not appear interactive

Avoid generic compliance commentary. Report only repository-specific findings.

---

# 12. Validate Findings With Evidence

Every finding must include:

- Screen
- Route
- Component
- File path
- Affected role
- Affected flow
- Current behaviour
- Why it is a problem
- Recommended behaviour
- Severity
- Confidence

Use these confidence labels:

- Confirmed
- Highly likely
- Needs runtime verification
- Product decision required

Do not report speculation as confirmed.

---

# Required Outputs

## A. Executive Summary

Provide:

- Overall product coherence assessment
- Most serious UX risks
- Most serious routing risks
- Most serious component-consistency risks
- Areas that are strongest
- Ten highest-impact fixes

## B. Product and Route Map

Summarise:

- Roles
- Modules
- Route hierarchy
- Navigation structure
- Major journeys
- Orphaned screens
- Cross-module dependencies

## C. Flow Inventory

| Flow | Role | Entry point | Main steps | Completion point | Missing steps or states | Status |
|---|---|---|---|---|---|---|

Use these statuses:

- Complete
- Partially represented
- Broken
- Unreachable
- Inconsistent
- Missing
- Needs product decision
- Needs runtime verification

## D. Screen Inventory

| Screen | Route | Purpose | Entry points | Primary action | Connected flows | Issues |
|---|---|---|---|---|---|---|

## E. Route and Interaction Audit

| Route or interaction | Entry point | Destination or outcome | Classification | Issue | Evidence |
|---|---|---|---|---|---|

Use:

- Working
- Broken
- Unreachable
- Wrong destination
- Placeholder
- Duplicate
- Legacy
- Missing destination
- Inconsistent behaviour
- Needs verification

## F. Component Audit

| Pattern | Shared component | Used by | Duplicated or hardcoded in | UX impact | Recommended action |
|---|---|---|---|---|---|

## G. Findings

Group findings under:

1. Broken or incomplete user flows
2. Routing and navigation problems
3. Missing screens and UX states
4. Information architecture issues
5. Interaction and form issues
6. Product logic inconsistencies
7. Component and design-system inconsistencies
8. Responsive issues
9. Accessibility issues
10. Visual and terminology inconsistencies
11. Product decisions unresolved by the prototype

Use this format:

## [Severity] Finding title

- **Location:**
- **Affected role or flow:**
- **Current experience:**
- **Problem:**
- **Recommended experience:**
- **Evidence:**
- **Confidence:**

## H. Prioritised Improvement Plan

Classify recommendations as:

- **P0:** Prevents a core flow from being understood or completed
- **P1:** Major navigation, flow, role, or product-logic problem
- **P2:** Significant confusion, inconsistency, duplication, or missing state
- **P3:** Polish, accessibility, responsiveness, or maintainability issue

For each recommendation include:

- Problem
- Screens or components affected
- Suggested change
- Dependencies
- Risk of inconsistency or regression
- Validation or testing needed

---

# Audit Rules

- Do not modify the prototype.
- Do not focus on backend, API, database, or infrastructure concerns.
- Do not treat placeholder data as a problem unless it damages the experience or creates contradictions.
- Run the prototype and follow actual clickable paths where possible.
- Do not rely only on route definitions.
- Inspect the repository broadly before drawing conclusions.
- Do not stop after dashboards or primary routes.
- Distinguish visual polish from actual usability and flow problems.
- Avoid generic UX advice.
- Tie every finding to a route, screen, component, interaction, or file.
- Deduplicate findings that share a root cause.
- Prioritise comprehension, task completion, navigation, product coherence, and design-system consistency.
- When uncertain, label the issue as a product decision or runtime-verification item.
- If the repository is large, audit one module at a time and maintain a consolidated master report.
- Do not declare completion until every route, major module, and repeated component pattern has been classified.
