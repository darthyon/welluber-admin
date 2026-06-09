import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const authStub = {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Supabase not configured" },
      }),
      signOut: async () => ({ error: null }),
    }
    return new Proxy({ auth: authStub } as Record<string, unknown>, {
      get(target, prop) {
        if (prop in target) return target[prop as string]
        // Never expose a `then` — otherwise `await createClient()` treats this
        // Proxy as a thenable and hangs forever (its callbacks are never called).
        if (prop === "then") return undefined
        return () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } })
      },
    }) as ReturnType<typeof createServerClient>
  }

  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie writes handled by middleware
          }
        },
      },
    }
  )
}
