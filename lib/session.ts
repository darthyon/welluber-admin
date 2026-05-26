"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export type UserRole = "host" | "org" | "serviceprovider"

export interface SessionUser {
  id: string
  name: string
  email: string
  image?: string
  role: UserRole
  initials: string
  orgSlug?: string
  spSlug?: string
}

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function mapUser(user: User): SessionUser {
  const meta = user.user_metadata ?? {}
  const name = (meta.name as string) ?? user.email?.split("@")[0] ?? "User"
  return {
    id: user.id,
    name,
    email: user.email!,
    image: meta.image as string | undefined,
    role: meta.role as UserRole,
    initials: computeInitials(name),
    orgSlug: meta.orgSlug as string | undefined,
    spSlug: meta.spSlug as string | undefined,
  }
}

export function useSession(): { user: SessionUser | null; isAuthenticated: boolean } {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(mapUser(data.user))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? mapUser(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, isAuthenticated: !!user }
}
