---
type: Note
---
# Benefit Policy Use Cases

**Four real-world orgs on Welluber. How many policies each.**

***

**1. MNC — e.g. a tech company, 500 employees, KL HQ + Penang office**

Typical structure: global benefits framework localised for Malaysia. Tiers are real and meaningful — C-suite gets significantly more. Internships and contractors are usually excluded or get a stripped-down version.

Benefits they'd run on Welluber (flexi, no healthcare):

- Wellness (gym, fitness, massage)
- Mental health (therapy, counselling)
- Learning & development (courses, certifications)
- Lifestyle (optical, dental top-up, travel)

Tier structure:

- Band 1: VP and above
- Band 2: Manager / Senior
- Band 3: Executive / Associate
- Band 4: Intern / Contract

Same categories across all bands, wildly different amounts. Band 1 might get RM 5,000/year wellness, Band 4 gets RM 500. **Same cadence** — annual refresh, Jan FY start.

**Policies needed: 1** One policy, 4 tiers. Categories and cadence identical. Only amounts differ. This is the exact use case tiers solve.

Edge case: Penang office is manufacturing-side, different employment contract, slightly different eligible services. **Add 1 policy** — clone of main, different services allowlist.

**Total: 2 policies**

***

**2. GLC — e.g. Telekom Malaysia or TNB subsidiary, 2,000 employees**

GLCs are grade-heavy. They run JPA-influenced grading (Grade A–F or equivalent). Benefits are tied strictly to grade. Very formal. HR doesn't improvise.

They'd also have a sharp divide between:

- Permanent staff (full benefits)
- Contract staff (basic only)
- Outsourced/vendor staff (not on Welluber at all)

Benefits on Welluber:

- Wellness (gym, massage)
- Mental health (lighter — GLCs are still warming up to this)
- Sports & recreation
- Optical top-up

Grade structure: typically 4–6 meaningful bands for flexi purposes. But cadence is the same — annual, tied to company FY (April in many GLCs).

**Policies needed: 1** One policy, 4–5 tiers. Same cadence.

Edge case: They have a subsidiary with a separate legal entity and slightly different T&Cs. That subsidiary is a **different org on Welluber** — different org account, but they'd reuse the same policy (Host assigns same policy to both orgs). **No new policy needed.**

Edge case: Permanent vs contract staff. Contract staff get a subset of benefits — fewer groups, lower amounts. **Add 1 policy** — same cadence, different groups.

**Total: 2 policies**

***

**3. SME — e.g. a 80-person digital agency, KL**

SMEs in Malaysia typically have flat structures. Maybe 3 tiers at most: Leadership, Senior, Junior. Budget-conscious — total spend matters more than per-category granularity.

They'd likely run a single pool across all wellness categories rather than per-group buckets. But Welluber's model can handle that — one benefit group, broad services allowlist.

Benefits:

- Wellness (gym, massage, mental health bundled together)
- Learning (courses, books)

Maybe they want **quarterly refresh** because annual feels too abstract for a small team — people forget they have budget. This is where cadence preference differs from the MNC.

But again — all tiers on the same quarterly cadence. Leadership just gets more per quarter.

**Policies needed: 1** One policy, 2–3 tiers, quarterly refresh.

Edge case: They hire contractors occasionally and want to give them a token wellness benefit. Different employment type, same policy but different tier. Already handled by tier + employment type filter.

**Total: 1 policy**

***

**4. Startup — e.g. 25-person fintech, post-Series A**

Flat. No real tiers — founders vs everyone else, basically. They care about moving fast and not over-engineering HR.

They'd want: one pool, everyone gets the same, quarterly or monthly refresh. Simple.

No tiers. Just one policy, base amounts only.

Benefits: wellness, mental health, L&D. Broad services allowlist.

Edge case: They raise Series B, headcount doubles, they now have proper seniority bands. They clone the existing policy, add tiers. **No new policy** — clone + configure.

**Total: 1 policy**

***

**Summary table**

| Org type | Policies | Tiers          | Why                                                |
| -------- | -------- | -------------- | -------------------------------------------------- |
| MNC      | 2        | 4 per policy   | 1 for HQ, 1 for manufacturing — different services |
| GLC      | 2        | 4–5 per policy | 1 for permanent, 1 for contract — different groups |
| SME      | 1        | 2–3            | Same cadence, just amounts differ                  |
| Startup  | 1        | 0 (base only)  | Flat structure, no tier needed yet                 |

***

**The verdict for your model:**

The "different cadence = new policy" rule holds cleanly across all four archetypes. The only reason to create a second policy is **different services allowlist** or **different employment type eligibility** — not different amounts. Tiers handle amounts within the same policy cleanly.

The one thing worth flagging: **GLCs and MNCs will stress-test your tier mapping UX** because their grade systems have 5–6 levels with specific names (Grade C, Band 3, etc.) that don't map cleanly to generic tier labels. The tier name input being free-text (which we already have in the design) is the right call.
