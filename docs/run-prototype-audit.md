# Run the Frontend Prototype Audit

Use this file as the launcher prompt for the repository audit.

## Repository Context

Fill this in before running the audit.

- **Product name:**
- **Prototype purpose:**
- **Intended user roles:**
- **Main modules:**
- **Known complete flows:**
- **Known incomplete flows:**
- **Out-of-scope areas:**
- **Supported breakpoints:**
- **Shared components location:**
- **Design tokens or theme location:**
- **Source-of-truth PRD or design references:**
- **Known demo assumptions:**
- **Output file:** `docs/prototype-audit-results.md`

---

## Agent Instruction

Read `docs/prototype-audit.md` and perform the complete audit described there.

This repository is a frontend product prototype with no backend or APIs.

Focus on:

- UI and UX
- User flows
- Navigation
- Routing
- Interaction completeness
- Missing screens and states
- Product logic represented in the interface
- Responsive behaviour
- Accessibility fundamentals
- Visual and terminology consistency
- Shared component usage
- Design-token usage
- Duplicated or hardcoded components and styles

Requirements:

- Run the prototype where possible.
- Follow actual clickable paths.
- Do not rely only on route files.
- Inspect every major route, module, role, and repeated interface pattern.
- Identify unreachable screens, dead ends, wrong destinations, incomplete flows, missing states, and contradictory product logic.
- Audit whether screens use shared components and tokens or recreate patterns locally.
- Do not modify any files.
- Support every finding with routes, screens, components, and file paths.
- Clearly label findings as Confirmed, Highly likely, Needs runtime verification, or Product decision required.
- Deduplicate findings that share the same root cause.
- Save the consolidated report to `docs/prototype-audit-results.md`.
- Do not declare completion until every route, major flow, and repeated component pattern has been classified.

If the repository is too large for one pass:

1. Audit one module at a time.
2. Append findings to the same master report.
3. Maintain a route, flow, screen, and component coverage checklist.
4. Reconcile duplicated findings before finalising.
5. End with the ten highest-impact fixes across the entire prototype.
