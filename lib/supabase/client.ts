import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // Return a stub when credentials aren't configured (local dev without .env.local)
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: {}, error: { message: "No Supabase credentials configured." } }),
        signOut: async () => ({}),
      },
    } as ReturnType<typeof createBrowserClient>
  }
  return createBrowserClient(url, key)
}
