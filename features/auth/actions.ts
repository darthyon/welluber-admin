"use server"

import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/session"

export type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string }

const ROLE_LABELS: Record<UserRole, string> = {
  host: "WellUber Admin",
  org: "Organisation Admin",
  serviceprovider: "Service Provider Admin",
}

export async function signIn(
  email: string,
  password: string,
  selectedRole: UserRole
): Promise<LoginResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { success: false, error: "Invalid email or password." }
  }

  const userRole = data.user.user_metadata?.role as UserRole | undefined

  if (!userRole) {
    await supabase.auth.signOut()
    return { success: false, error: "Account has no role assigned. Contact support." }
  }

  if (userRole !== selectedRole) {
    await supabase.auth.signOut()
    return {
      success: false,
      error: `Wrong role selected. This account is registered as ${ROLE_LABELS[userRole]}.`,
    }
  }

  const orgSlug = data.user.user_metadata?.orgSlug as string | undefined
  let redirectTo: string
  if (userRole === "org" && orgSlug) {
    redirectTo = `/${orgSlug}/dashboard`
  } else if (userRole === "serviceprovider") {
    redirectTo = "/coming-soon"
  } else {
    redirectTo = "/dashboard"
  }

  return { success: true, redirectTo }
}
