# Plan: Benefit Policy E2E — HR Self-Serve Readiness + AI Assist

## Status Snapshot (as of 2026-05-08)

This section reflects what is already implemented in the current codebase and what remains.

- Phase 0 — Data model alignment: **Done**
- Phase 1 — Guardrails: **Done**
- Phase 2 — Velocity: **In Progress**
- Phase 3 — Confidence: **Not Started**
- Phase 4 — AI Assist mode: **Deferred / Not Started**

### Detailed progress vs original plan

- 0.1 Lock vocabulary: **Done**
- 0.2 Sub-service scope boundary: **Done**
- 0.3 MainServiceId typing: **Done**
- 0.4 Legacy seed normalization + FK alignment: **Done**
- 0.5 Validation rules centralized: **Done**
- 0.6 Integrity smoke checks: **Done**

- 1.0 Pre-Phase cleanup (POL-LEGACY): **Done**
- 1.1 Inline glossary: **Done** (`components/shared/field-help.tsx`, `lib/policy-glossary.ts`)
- 1.2 Smarter defaults: **Done**
- 1.3 Pre-submit consequence summary modal: **Done** (`components/host/policies/policy-launch-confirm-modal.tsx`)
- 1.4 Validation wiring with actionable errors: **Done**
- 1.5 Draft autosave + resume/discard: **Done** (`hooks/use-policy-draft.ts`)

- 2.1 Clone/template launcher: **Partially Done**
  - Done: launcher and clone flow wiring (`components/host/policies/policy-creation-launcher.tsx`)
  - Pending: dedicated `lib/mock-data/policy-templates.ts` and fully-curated template set
- 2.2 Assignment flow unification: **Partially Done**
  - Done: `link-policy-modal` replaced by `assign-policy-modal`, naming aligned to Assign/Unassign in touched surfaces
  - Pending: full parity across remaining employee/detail entry points and complete follow-through states
- 2.3 Persistent setup checklist: **Not Started** (`org-setup-checklist.tsx` missing)
- 2.4 Smarter Add Employee defaults: **Not Started**
- 2.5 Naming cleanup: **Partially Done**
  - Done: `Add Benefit Policy` and `Assign Policy` labels in touched policy/org flows
  - Pending: verify and align any remaining non-touched surfaces to final verb model

- 3.1 Eligibility conflict warnings: **Not Started**
- 3.2 Edit-mode diff on review step: **Not Started**
- 3.3 Lifecycle clarity + ownership tooltip: **Not Started**
- 3.4 Post-create activation-first flow: **Not Started**

- 4.x AI Assist mode: **Deferred / Not Started**
  - Missing today: `components/host/policies/ai-assist/`, `lib/policy-ai/generate.ts`, `lib/policy-ai/templates.ts`

---

## Context

**Goal**: take benefit policy creation flow from "host admin assisted" (current 3/10 self-serve readiness) to "org admin (HR) does it alone" (target 9/10), and add AI Assist mode that lets HR answer 4-6 questions and get a fully drafted policy.

**Why now**:
- PRODUCT.md states org admins (HR) are a primary persona. Current wizard built for benefits experts. Self-serve readiness blocks scale — every new org needs Welluber ops handholding.
- Bulk upload preview just shipped. Wizard surface is the next-largest friction surface.
- AI Assist short-circuits the tutorial-heavy approach: instead of teaching pool types and proration, ask outcomes ("medical only or full wellness?"), generate the config.

**Audience**: org admin (HR rep) on desktop, mock-data console first. Real backend wiring deferred.

**Source review**: prior audit found 16 prioritized gaps (jargon, defaults, link-vs-create confusion, no template, no draft autosave, etc.) — see end of file for full list.

---

## Architecture

Five phases, sequenced. Phase 4 (AI Assist) can ship in parallel with Phase 2 since it bypasses most of the manual wizard. **Phase 0 first — downstream phases depend on aligned data model.** Phase 4 currently deferred per direction.

```text
Phase 0 — Data model alignment  (3-5d)  → fix drift, lock vocabulary
Phase 1 — Guardrails            (1-2w)  → make HR not break things
Phase 2 — Velocity              (2-3w)  → make HR fast
Phase 3 — Confidence            (1-2w)  → make HR sure
Phase 4 — AI Assist mode        (1-2w)  → DEFERRED
```

---

## Phase 0 — Data model alignment ✅ DONE

**Goal**: lock the canonical hierarchy `Policy → Group → Benefit (= main service allocation)`, remove drift between code, UI labels, and mock seeds. Everything downstream depends on this being right.

**Status**: shipped. Below is what landed — Codex can take Phase 1 from here.

### Shipped artifacts
- **Vocabulary swap** in [components/host/policies/benefit-policy-wizard.tsx](components/host/policies/benefit-policy-wizard.tsx), [policy-wizard-content.tsx](components/host/policies/policy-wizard-content.tsx), [policy-detail-view.tsx](components/host/policies/policy-detail-view.tsx), [sub-policy-wizard.tsx](components/host/policies/sub-policy-wizard.tsx). All "Service" wording replaced with "Benefit" in policy surfaces. Step 3 title "Groups & Benefits". Picker checkbox list labeled "Benefits". Detail view resolves `benefit.serviceId` → name via SERVICES catalog.
- **Sub-service boundary**: confirmed clean — no leak into policy surfaces. Catalog kept intact for service-provider use.
- **MainServiceId typing** in [lib/mock-data/service-catalog.ts](lib/mock-data/service-catalog.ts): added `MainServiceId` literal union, `MAIN_SERVICE_IDS`, `isMainServiceId()`, `getMainServiceName()`. `ServiceId` aliased + deprecated. `Benefit.serviceId: MainServiceId` ([types/policy.ts](types/policy.ts)).
- **Legacy seed FK fields**: [features/employees/types.ts](features/employees/types.ts) `EmployeeDirectoryItem.benefitPolicies` now requires `policyId` + `assignedGroupIds`. Seed entries updated via mass edit. `benefitGroups: string[]` retained as denormalized display-only with JSDoc warning. **Follow-up**: real `policyId` values use placeholder `"POL-LEGACY"` — Phase 1.X (or pre-Phase 1) should map to actual seeded policy IDs.
- **Validation lib** [lib/policy/validation.ts](lib/policy/validation.ts): exports `validateBenefitInsert`, `validateGroupInsert`, `validateCoPayment`, `validateBenefit`. **Not yet wired into wizard** — Phase 1.4 task.
- **Integrity check** [lib/policy/integrity.ts](lib/policy/integrity.ts) + [scripts/check-policy-integrity.ts](scripts/check-policy-integrity.ts). Run via `pnpm check:policy`. Currently green.

### Codex hand-off notes
- Run `pnpm exec tsc --noEmit && pnpm check:policy` before any change to confirm clean baseline.
- Internal symbols `toggleService`, `isServiceInGroup`, `getServiceName`, `serviceId` field — these are code-level, not user-facing. Keep them. Plan rule applies only to UI strings.
- The `mockBenefits` block in [app/(host)/organizations/[id]/page.tsx:296](app/(host)/organizations/[id]/page.tsx) is now typed `Benefit[]`. Future writes must satisfy `MainServiceId`.
- POL-LEGACY ids must be replaced before Phase 2's "Clone existing policy" feature ships, or clone will reference dead policies.

### 0.1 Lock vocabulary
- Canonical chain: **Benefit Policy → Benefit Group → Benefit**.
- Each `Benefit` = allocation under a Group with `amount` + `coPayment`. It binds to one taxonomy entry internally, but in the policy context it is always called a **Benefit** in the UI — never "Main Service" or "Service".
- "Main Service" terminology is allowed **only** on service-provider surfaces (where it maps to the provider's taxonomy). Never on benefit-policy surfaces.
- UI rule:
  - In policy/group/benefit context: label is always "Benefit". Picker label = "Select Benefit". List heading = "Benefits".
  - In service-provider context: label can stay "Main Service" if already used.
  - Internally, `Benefit.serviceId` still references the shared taxonomy id (MainServiceId in 0.3) — that's data plumbing, never user-facing in policy screens.
- Fix surface:
  - [components/host/policies/benefit-policy-wizard.tsx:814](components/host/policies/benefit-policy-wizard.tsx) — Step 3 heading "Benefit Groups & Services" → "Benefit Groups". Action button "Add Service" → "Add Benefit". Picker labeled "Select Benefit".
  - Cross-check all wizard / detail / list views for the same swap. No "Main Service" or "Service" wording in policy surfaces.

### 0.2 Sub-service scope (decision locked)
- **Sub-services are service-provider territory only** — used when SPs create packages. Never surfaced in benefit policy UI.
- Catalog `subServices[]` stays as-is (providers depend on it).
- `Benefit.serviceId` stays Tier 2 (Main Service) only.
- Wizard / policy detail / employee policy views must NOT render sub-service pickers, lists, or filters.
- Audit pass: grep for `subServices` references outside provider surfaces — flag any leak into policy/employee/org screens.

### 0.3 Shared `MainServiceId` taxonomy
- New const + type in `lib/taxonomy/main-services.ts` exporting both `MAIN_SERVICES` data and `MainServiceId` literal union.
- Update `Benefit.serviceId: string` → `Benefit.serviceId: MainServiceId`.
- Update `ServiceProvider.mainServices: string[]` → `MainServiceId[]`.
- Catches typo drift at compile time.

### 0.4 Kill legacy seed shape
- [lib/mock-data/seed.ts:165](lib/mock-data/seed.ts) has `employee.benefitPolicies: [{ policyName, benefitGroups: string[], utilisation }]` — strings not FKs.
- Replace with normalized refs: `benefitPolicies: [{ policyId, assignedGroupIds?: string[], utilisation }]`. Resolve names via lookup.
- Same drift exists in similar seeds — sweep for `benefitGroups: [...]` string arrays and replace.

### 0.5 Validation rules in factory + writes
- `Benefit` insert: reject duplicate `serviceId` within same `groupId`.
- `BenefitGroup` insert: reject duplicate `name` within same `policyId`.
- Co-payment: if `type === "Percentage"`, value 0-100. If `Fixed`, value <= benefit amount.
- Centralize in `lib/policy/validation.ts`. Wizard reuses these.

### 0.6 Type test / smoke ✅
- Smoke test green via `pnpm check:policy`.

**Phase 0 verification (all passing)**:
- ✅ `pnpm exec tsc --noEmit` clean.
- ✅ `pnpm check:policy` → "Policy integrity OK — no drift found".
- ✅ Wizard headings + buttons read "Benefit Groups" / "Add Benefit" / "Benefits" picker. No "Service" wording in policy UI.
- ⚠️ Legacy `benefitGroups: string[]` retained as denormalized display field — typing now enforces FK fields beside it.

---

## Phase 1 — Guardrails (next up — Codex actionable)

**Goal**: HR can complete wizard without silent under-coverage or jargon paralysis.

**Pre-flight**: `pnpm exec tsc --noEmit && pnpm check:policy` must be green (Phase 0 baseline).

### 1.0 Pre-Phase-1 cleanup (~30 min)
Resolve POL-LEGACY drift before adding new features on top.
- Open [lib/mock-data/seed.ts:165](lib/mock-data/seed.ts) (search "POL-LEGACY").
- For each `EmployeeDirectoryItem.benefitPolicies` entry, set `policyId` to a real id from `MOCK_POLICIES` whose name matches the `policyName` string. If none matches, pick the closest seeded policy (e.g. "Wellness Allocation" → `POL-20260115-0001`). Document mapping in commit.
- For each entry, populate `assignedGroupIds` with real group ids from `MOCK_POLICY_BUNDLES` bundle for that policy. Empty array OK if employee just linked at policy level.
- Run `pnpm check:policy` to confirm still green. Currently the check doesn't validate employee→policy linkage; consider extending [lib/policy/integrity.ts](lib/policy/integrity.ts) to walk `MOCK_EMPLOYEES.benefitPolicies` and verify `policyId` resolves.

### 1.1 Inline glossary (~3-4 hr)
- New [components/shared/field-help.tsx](components/shared/field-help.tsx) — small Radix Tooltip with `?` icon next to a label. Existing `<Tooltip>` primitive lives at [components/ui/tooltip.tsx](components/ui/tooltip.tsx); reuse it.
- New [lib/policy-glossary.ts](lib/policy-glossary.ts) exporting a typed dictionary:
  ```ts
  export const POLICY_GLOSSARY: Record<string, { title: string; body: string }> = {
    poolType: { title: "Benefit Pool", body: "..." },
    dependentsPooling: { ... },
    utilisationMode: { ... },
    prorateUnit: { ... },
    refreshCycle: { ... },
    activationMode: { ... },
    groupCap: { ... },
    coPayment: { ... },
    spendingCap: { ... },
  }
  ```
  Content keep to 2-3 sentences each. Plain HR-friendly language. No jargon. Use one example per term.
- Wire `<FieldHelp termKey="poolType" />` next to existing labels in:
  - [components/host/policies/benefit-policy-wizard.tsx](components/host/policies/benefit-policy-wizard.tsx) — Steps 1, 2, 3 field labels
  - [components/host/policies/policy-wizard-content.tsx](components/host/policies/policy-wizard-content.tsx) (mirror surface, same fields)
- Acceptance: hovering `?` next to "Benefit Pool" reveals tooltip with the glossary body.

### 1.2 Smarter defaults (~1 hr)
- Open [components/host/policies/benefit-policy-wizard.tsx](components/host/policies/benefit-policy-wizard.tsx). Search for `useState<Partial<BenefitPolicy>>` (line ~191). Update default `eligibleEmploymentTypes`:
  - Was: `["full-time"]`
  - New: `["full-time", "part-time", "contract", "internship"]` (all on by default).
- Search for `prorateUnit` default — when `utilisationMode` flips to `"Prorated"`, set `prorateUnit = "Monthly"` if undefined. Add small helper or inline `useEffect`.
- Search for `activationMode` default — keep `"after_join"` but rename UI hint to "Immediately on join (most common)".
- Mirror in [components/host/policies/policy-wizard-content.tsx](components/host/policies/policy-wizard-content.tsx) if it has its own state.
- Acceptance: open new wizard cold → all 4 employment types pre-checked. Pick Prorated → Monthly auto-selected.

### 1.3 Pre-submit consequence summary (~4-6 hr)
- New [components/host/policies/policy-launch-confirm-modal.tsx](components/host/policies/policy-launch-confirm-modal.tsx).
- Props: `policy: Partial<BenefitPolicy>`, `assignedEmployeeIds: string[]`, `groups: BenefitGroup[]`, `benefits: Benefit[]`, `onConfirm()`, `onCancel()`.
- Body shows:
  - Coverage line: "Covers {N} employees · excludes {M}" — compute via `MOCK_EMPLOYEES.filter(e => e.orgId === policy.organizationId)` filtered by eligibility (employmentType, tier).
  - Reassignment line: "Will reassign {K} employees from {policy names list}" — query existing `benefitPolicies[*].policyId` on the assigned employees.
  - Activation line: based on `activationMode` + `activationCustomDate`.
- Trigger from wizard submit handler — replace direct submit with modal open. On confirm, call existing submit. On cancel, return to wizard.
- Wire same modal in [components/host/policies/policy-wizard-content.tsx](components/host/policies/policy-wizard-content.tsx) if it has its own submit path.
- Acceptance: hit Launch on Step 5 → modal shows real counts → confirm proceeds → cancel returns to Step 5.

### 1.4 Validation with suggested fixes (~2-3 hr)
- Wire [lib/policy/validation.ts](lib/policy/validation.ts) (already exists from Phase 0) into the wizard's `validateStep()`:
  - Step 3: replace bespoke benefit/co-pay checks with `validateBenefit()` calls. Iterate every benefit, collect issues into existing `errors` map.
  - Group dup check: call `validateGroupInsert(policyId, name, groups, ignoreId=group.id)` on each group, surface message inline next to group name field.
- Replace any remaining "Required" generic strings with action-oriented variants:
  - Prorate unit empty → "Pick a prorate unit (Monthly is most common)"
  - Refresh start ref empty → "Pick when this policy resets each cycle"
  - Group cap missing on Shared pool → "Shared pools need a cap (e.g. RM 1000)"
- Co-payment messaging: validation lib already enforces `Fixed > amount` rejection. UI just needs to render the returned `ValidationIssue.message`.
- Acceptance: enter co-payment of RM 200 on RM 100 benefit → inline error: "Fixed co-payment (RM 200) cannot exceed benefit amount (RM 100)".

### 1.5 Draft auto-save (~3-4 hr)
- New [hooks/use-policy-draft.ts](hooks/use-policy-draft.ts):
  ```ts
  export function usePolicyDraft(orgId: string | undefined, state: PolicyDraftState) {
    const key = `policy-draft-${orgId || "global"}`
    // Debounced write (1s) on state change
    // On mount: read; if exists return { hasDraft: true, savedAt, restore() }
    // Expose clear() to wipe on success
  }
  ```
  Use `setTimeout` debounce or `useDebounce` if a hook lib exists.
- Banner UI: render at top of wizard when `hasDraft && !restored`. Two buttons: "Resume" (calls restore() and hydrates state) / "Discard" (calls clear()).
- Clear draft on successful policy create (existing onSuccess handler).
- Acceptance: half-fill wizard → close tab → reopen → banner appears → Resume rehydrates fields.

**Phase 1 verification**:
- Walk wizard cold as new HR user, no benefits domain knowledge.
- Every jargon term has hover `?` with plain explanation.
- All employment types pre-checked.
- Bad co-payment blocked with actionable error.
- Close + reopen → draft banner restores fields.
- Submit → confirm modal shows coverage + reassignment + activation summary.
- `pnpm exec tsc --noEmit && pnpm check:policy && pnpm lint` green.

---

## Phase 2 — Velocity

**Goal**: HR completes common tasks in 1/3 the clicks.

### 2.1 Clone / template
- "Create Policy" entry → split menu:
  - **Manual** (existing wizard, blank)
  - **Clone existing** → modal lists policies (org-scoped + global), pick → wizard opens pre-filled with everything except name + assignments.
  - **AI Assist** (Phase 4)
  - **From template** (curated 3-5 starting points: "Standard Health", "Executive Wellness", "Contractor Lite", "Mental Health Add-on")
- Templates live in `lib/mock-data/policy-templates.ts`.
- Files: new `<PolicyCreationLauncher>` component, new templates file.

### 2.2 Unify assignment flows
- Today: wizard Step 4 / LinkPolicyModal / bulk CSV / employee detail = 4 places to assign.
- Single verb across all surfaces: **Assign Policy**. Works at org-level (assign policy to org) and employee-level (assign policy to employees) — same word, two scopes.
- Replace LinkPolicyModal with **Assign Policy** modal: pick policy → org-level assignment confirmed → immediately offered "Assign to employees now? [tier-match auto-suggest] [pick manually] [later]".
- Wizard Step 4 simplified: just "Assign all eligible (N)" / "Customize" / "Skip".
- Bulk CSV preview (just shipped) keeps inline policy resolver — already aligned.
- Employee detail: link to "Manage policy via {policy name} →" rather than allowing direct edit.
- Files: [components/host/organizations/link-policy-modal.tsx](components/host/organizations/link-policy-modal.tsx) (rename to assign-policy-modal.tsx), [components/host/policies/benefit-policy-wizard.tsx](components/host/policies/benefit-policy-wizard.tsx) step 4.

### 2.3 Persistent setup checklist
- For org status === "pending" or "draft": show floating checklist banner on org detail page until all complete.
- Steps: Organization details · Tier configs · Employees · Policies assigned · Activated.
- Each step links to its tab; check turns green on completion.
- Replaces "Do this later" dead end from `OrgSetupGuide`.
- Files: new [components/host/organizations/org-setup-checklist.tsx](components/host/organizations/org-setup-checklist.tsx), wire into [app/(host)/organizations/[id]/page.tsx](app/(host)/organizations/[id]/page.tsx).

### 2.4 Smarter "Add Employee" behavior (label unchanged)
- Keep "Add Employee" label across empty + populated states (consistent verb, scales to new hire / contractor / transfer / re-hire).
- Behavior becomes context-aware:
  - 0 employees → opens bulk upload, blank.
  - Existing employees + linked policies → opens bulk upload with "policies = auto-match by tier" pre-selected.
- Single button surface, smarter defaults inside.
- File: [app/(host)/organizations/[id]/page.tsx](app/(host)/organizations/[id]/page.tsx).

### 2.5 Naming cleanup (policy term preserved — agreed business/tech glossary)
- "Benefit Policy" tab → unchanged.
- "Create Policy" → "New Policy" (verb cleanup only).
- "Link Policy" → "Assign Policy" (merged into 2.2 flow). Org-level + employee-level both use "Assign".
- "Assign Policy" CSV column → unchanged.
- Verb set collapses to two: **Create** (new policy) + **Assign** (existing policy → org → employees).
- Rule: never rename the noun "policy". Verbs reduced to Create / Assign for clarity.

**Phase 2 verification**: clone existing policy in <30s, link-and-assign in one modal, new org shows checklist until activated, existing org "Add Employee" defaults to tier-auto-match.

---

## Phase 3 — Confidence

**Goal**: HR trusts what they're doing because system shows them.

### 3.1 Real-time eligibility conflict check
- Wizard Step 1 + 4: if eligibility filters exclude any currently-selected employees, banner: "3 part-time employees will be removed by this filter [Show] [Adjust filter]".
- Reverse: bulk upload of part-timers when only full-time policies exist → banner with link to widen policy.
- File: extend wizard, add `useEligibilityConflicts` hook.

### 3.2 Edit-mode diff
- Step 5 in edit mode → diff card: "Changed: pool cap RM 1500 → RM 2000, added Mental Health group, removed 2 services".
- File: extend wizard step 5 render, new `diffPolicy()` util.

### 3.3 Lifecycle clarity
- Status badges throughout: Draft (gray) · Pending Activation (amber) · Active (emerald) · Suspended (rose).
- Tooltip on each: "Only host admins can activate. Org admins see active policies only."
- Inline alert on draft policy detail: "This policy is in draft. Employees won't be covered until activated."
- Files: extend [components/shared/status-badge.tsx](components/shared/status-badge.tsx) variants, policy detail pages.

### 3.4 Activation flow
- Post-creation modal → primary action "Activate now" inline (not buried in policy detail). Secondary "Save as draft, activate later".
- File: post-creation modal in wizard.

**Phase 3 verification**: edit existing policy → review shows diff, draft policies clearly labeled, activation surfaced post-create.

---

## Phase 4 — AI Assist mode

**Goal**: HR with no benefits expertise answers 4-6 questions → full draft policy. Wizard becomes the "review + adjust" surface, not the "build from scratch" surface.

### 4.1 Entry point
- "New policy" launcher (from 2.1) → AI Assist option, flagged with sparkle icon.
- Opens dedicated full-screen flow (not a modal — feels like a co-worker conversation).

### 4.2 Question set (4-6 max)
Tuned so each answer maps to multiple downstream config decisions:

1. **Org context**: industry + size + employment mix (chip select). → eligibility filters, pool defaults.
2. **Coverage scope**: pick areas (Medical · Dental · Vision · Mental Health · Wellness · Executive perks). Multi-select. → groups + service skeleton.
3. **Budget posture**: per-employee annual ceiling (slider RM 500-RM 20k or "I don't know — suggest"). → caps, pool sizes.
4. **Tier strategy**: flat / tiered. If tiered, pick mapping (Executive 2x, Manager 1.5x, Staff 1x). → eligibility + cap multipliers.
5. **Dependents**: covered or not. If yes, "shared with employee" or separate pool. → dependent pool config.
6. **Refresh & activation**: annual / fiscal-year / start date custom. Activation: now / probation-end / specific date.

Each question = single screen, large clear input, "Why we ask" tooltip, "Skip — use sensible default" option.

### 4.3 Generation
**Mock-first** (this plan):
- Deterministic template engine: `lib/policy-ai/generate.ts` takes answer object → returns full `PolicyDraft` (groups, services, amounts, pool config).
- Templates indexed by industry × scope × budget bucket.
- Output is a fully-populated wizard state.

**Real later** (separate plan, flagged not-now):
- Claude API (claude-sonnet-4-6) with prompt cache + structured output via Zod schema.
- Schema validates returned policy. Retry on validation failure.

### 4.4 Review surface
- Post-generation: drop user into wizard at Step 5 (Review) with everything pre-filled.
- Each section shows "AI suggested · edit" affordance.
- Banner: "Generated from your answers. Review each section before launch."
- User can jump back to any step to tweak, or accept and launch.

### 4.5 Feedback loop
- "Regenerate this section" buttons (e.g. regenerate just the services list with a one-line tweak: "more focus on mental health").
- Mock: re-runs deterministic engine with adjusted weights.
- Real: scoped LLM call.

### 4.6 Trust signals
- "Generated · review carefully" pill on AI-drafted policies.
- Audit log entry: "Created via AI Assist, reviewed by {user} on {date}".
- Activation explicitly requires human review checkbox: "I've reviewed every section".

**Phase 4 verification**: HR with zero benefits knowledge answers 6 questions, lands on Review with realistic policy, edits one group, launches successfully. No jargon encountered until they choose to dig in.

---

## Critical files

**Existing (will modify)**:
- [components/host/policies/benefit-policy-wizard.tsx](components/host/policies/benefit-policy-wizard.tsx) — wizard core, Phase 1 + 2 + 3
- [components/host/organizations/link-policy-modal.tsx](components/host/organizations/link-policy-modal.tsx) — merged into Adopt+Assign in 2.2
- [components/host/organizations/org-setup-guide.tsx](components/host/organizations/org-setup-guide.tsx) — replaced by checklist in 2.3
- [app/(host)/organizations/[id]/page.tsx](app/(host)/organizations/[id]/page.tsx) — checklist + CTA wiring
- [components/shared/status-badge.tsx](components/shared/status-badge.tsx) — lifecycle variants

**New**:
- [components/shared/field-help.tsx](components/shared/field-help.tsx) — glossary tooltip
- [lib/policy-glossary.ts](lib/policy-glossary.ts) — content
- [hooks/use-policy-draft.ts](hooks/use-policy-draft.ts) — autosave
- [components/host/policies/policy-creation-launcher.tsx](components/host/policies/policy-creation-launcher.tsx) — Manual/Clone/Template/AI split
- [lib/mock-data/policy-templates.ts](lib/mock-data/policy-templates.ts) — curated templates
- [components/host/organizations/org-setup-checklist.tsx](components/host/organizations/org-setup-checklist.tsx)
- [components/host/policies/policy-launch-confirm-modal.tsx](components/host/policies/policy-launch-confirm-modal.tsx)
- [components/host/policies/ai-assist/](components/host/policies/ai-assist/) — flow screens (1 per question + review)
- [lib/policy-ai/generate.ts](lib/policy-ai/generate.ts) — mock generator
- [lib/policy-ai/templates.ts](lib/policy-ai/templates.ts) — templates indexed by industry/scope/budget

---

## Sequencing decision

**Phase 0 first**, then Phase 1, then Phase 2 (Phase 4 deferred), then Phase 3. Reasoning:
- Phase 0 locks the data model. Anything Phase 1+ does (glossary, defaults, autosave, conflict checks) needs the model to be honest first.
- Phase 1 protects HR from breaking themselves once model is solid.
- Phase 2 unlocks velocity (clone/templates/checklist).
- Phase 3 is polish on a flow that should already work.
- Phase 4 deferred — revisit after Phase 2 ships.

---

## Out of scope (explicit, flag as follow-ups)

- **Real LLM wiring** for AI Assist (mock generator only this round). Separate plan needed when ready, will use claude-sonnet-4-6 with prompt cache + structured output.
- **Server-side policy storage** — still mock-data.
- **Multi-org policy templates from real data** — will need backend.
- **Audit log persistence** — UI surface only, no backend log.
- **Localisation of glossary content** — English only.
- **Mobile layouts** — desktop only per PRODUCT.md.
- **Tier config code auto-suggest** (mentioned earlier but lives in tier-config screen, not policy flow).

---

## Verification — full E2E for HR persona (Phase 0-3, AI Assist deferred)

1. Brand new HR user, fresh org, no policies.
2. Hit "New Policy" → see launcher with Manual / Clone / Template options.
3. Pick Template → wizard pre-filled → tweak → "Launch" → consequence summary modal → confirm.
4. Org detail shows setup checklist 4/5 done → click "Activate" → status flips to Active.
5. Bulk upload 50 employees → tier-match auto-resolves policy → import.
6. Employees tab shows 50 covered. Benefit Policy tab shows 1 active policy.
7. Edit policy → change cap → Review shows diff → relaunch.
8. Close tab mid-wizard → reopen → "Resume draft?" banner → restored.
9. Wizard heading shows "Benefit Groups", "Add Benefit", picker labeled "Select Benefit". No "Main Service" or "Service" wording anywhere in policy surfaces.
10. Run `pnpm lint && pnpm exec tsc --noEmit && pnpm test` if tests exist.

---

## Reference: 16-gap inventory (from prior audit)

🔴 Blockers
1. Jargon throughout — Phase 1.1
2. Defaults bias to full-time — Phase 1.2
3. Create vs Link Policy semantics — Phase 2.2
4. 3 employee-assignment paths — Phase 2.2

🟠 High
5. No draft auto-save — Phase 1.5
6. No template/clone — Phase 2.1
7. No pre-submit consequence summary — Phase 1.3
8. Post-creation flow → activation gap — Phase 3.4

🟡 Mid
9. Setup guide dead-end — Phase 2.3
10. Wizard step 4 overload — Phase 2.2
11. Verb sprawl — Phase 2.5 (verbs only; "policy" noun preserved)
12. No early eligibility conflict check — Phase 3.1
13. Existing-org Add Employee context-aware behavior — Phase 2.4

🟢 Low
14. Validation messages don't suggest fixes — Phase 1.4
15. No diff in Review — Phase 3.2
16. Activation ownership unclear — Phase 3.3

**Plus 6 data-model gaps in Phase 0**: vocabulary lock, sub-service scope, shared `MainServiceId` typing, legacy seed shape, validation rules, integrity smoke test.

AI Assist (Phase 4) deferred — would have addressed gaps 1, 2, 7, 14 implicitly by skipping them. Revisit after Phase 2.
