import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import type { UserRole } from "@/lib/session"

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isLoginPage = pathname.startsWith("/login")

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/login/host"
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const role = user.user_metadata?.role as UserRole | undefined
    const orgSlug = user.user_metadata?.orgSlug as string | undefined
    const url = request.nextUrl.clone()

    if (role === "org" && orgSlug) {
      url.pathname = `/${orgSlug}/dashboard`
    } else if (role === "serviceprovider") {
      url.pathname = "/coming-soon"
    } else {
      url.pathname = "/dashboard"
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
