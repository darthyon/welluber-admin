import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/lib/session"

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const role = user.user_metadata?.role as UserRole | undefined
  const orgSlug = user.user_metadata?.orgSlug as string | undefined

  if (role === "org" && orgSlug) {
    redirect(`/${orgSlug}/dashboard`)
  }

  redirect("/dashboard")
}
