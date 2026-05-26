import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    const authStub = {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
      signOut: async () => ({}),
    }
    return new Proxy({ auth: authStub } as Record<string, unknown>, {
      get(target, prop) {
        if (prop in target) return target[prop as string]
        return () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } })
      },
    }) as ReturnType<typeof createBrowserClient>
  }
  return createBrowserClient(url, key)
}
