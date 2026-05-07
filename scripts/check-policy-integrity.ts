#!/usr/bin/env tsx
/**
 * Policy data integrity check.
 *
 * Run: `pnpm check:policy`
 *
 * Walks every seeded BenefitPolicy and asserts FK linkage + taxonomy validity.
 * Exits 1 on any drift so CI can fail loud.
 */
import { verifyPolicyIntegrity } from "@/lib/policy/integrity"

const issues = verifyPolicyIntegrity()

if (issues.length === 0) {
  console.log("✓ Policy integrity OK — no drift found.")
  process.exit(0)
}

console.error(`✗ Policy integrity check failed with ${issues.length} issue(s):\n`)
for (const i of issues) {
  console.error(`  [${i.kind}] policy ${i.policyId} — ${i.detail}`)
}
process.exit(1)
