/**
 * Creates demo accounts in Supabase for HR demos.
 * Run with: npx tsx scripts/create-demo-accounts.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ACCOUNTS = [
  // Host admin
  {
    email: "admin@welluber.com",
    password: "WellAdmin2024!",
    metadata: { role: "host", name: "Alex Chen" },
  },
  // Org admin — Acme Corporation
  {
    email: "hr@acme.welluber.com",
    password: "OrgAdmin2024!",
    metadata: { role: "org", name: "Priya Menon", orgSlug: "acme-corporation" },
  },
  // Service provider admin
  {
    email: "ops@peakfit.welluber.com",
    password: "SPAdmin2024!",
    metadata: { role: "serviceprovider", name: "Faiz Hakim" },
  },
]

async function createAccount(account: (typeof ACCOUNTS)[number]) {
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    user_metadata: account.metadata,
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log(`  ↳ already exists: ${account.email}`)
    } else {
      console.error(`  ✗ failed: ${account.email} — ${error.message}`)
    }
    return
  }

  console.log(`  ✓ created: ${account.email} [${account.metadata.role}]`)
  if ("orgSlug" in account.metadata) {
    console.log(`    org: ${account.metadata.orgSlug}`)
  }
  void data
}

async function main() {
  console.log("\nCreating demo accounts...\n")
  for (const account of ACCOUNTS) {
    await createAccount(account)
  }
  console.log("\nDone.\n")
  console.log("Credentials:")
  console.log("  admin@welluber.com          / WellAdmin2024!  → Host Admin (Alex Chen)")
  console.log("  hr@acme.welluber.com        / OrgAdmin2024!   → Org Admin (Priya Menon, acme-corporation)")
  console.log("  ops@peakfit.welluber.com    / SPAdmin2024!    → Service Provider Admin (Faiz Hakim)")
}

main()
