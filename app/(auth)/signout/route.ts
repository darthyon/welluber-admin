import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const to = request.nextUrl.searchParams.get("to")
  redirect(to ?? "/login")
}
