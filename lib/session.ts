/**
 * Stub session hook — replace with real auth when ready.
 * Provides a consistent interface for accessing current user context.
 */

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

// Stub user for development — host admin by default
const STUB_USER: SessionUser = {
  id: "usr_dev_001",
  name: "Yon Yusuf",
  email: "yon@welluber.com",
  image: "https://github.com/shadcn.png",
  role: "host",
  initials: "YY",
  orgSlug: "acme-corporation",
}

/**
 * Returns the current session user.
 * In development, returns a stub Host Admin user.
 * Replace this with real auth (NextAuth, Clerk, etc.) when ready.
 */
export function getSessionUser(): SessionUser {
  return STUB_USER
}

/**
 * Client-side hook for accessing session in client components.
 */
export function useSession(): { user: SessionUser; isAuthenticated: boolean } {
  return {
    user: STUB_USER,
    isAuthenticated: true,
  }
}
