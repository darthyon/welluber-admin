import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import type { UserRole } from "@/lib/session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isLoginPage = pathname.startsWith("/login")
  const hasCredentials = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("auth-token"))

  if (!hasCredentials) {
    return NextResponse.next({ request })
  }

  if (!hasAuthCookie) {
    if (isLoginPage) {
      return NextResponse.next({ request })
    }

    const url = request.nextUrl.clone()
    url.pathname = "/login/host"
    return NextResponse.redirect(url)
  }

  const { supabaseResponse, user } = await updateSession(request)

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
