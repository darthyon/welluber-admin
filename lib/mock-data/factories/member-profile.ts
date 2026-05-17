import type { MemberProfile, AuthProvider } from "@/types/member-profile"

const NAMES: string[] = [
  "Alex Johnson", "Sarah Lim", "Michael Chen", "Priya Nair",
  "Kevin Tan", "Nurul Ain", "Robert Fox", "Mary Tan", "Ahmad Razif", "Jenny Wilson",
]

const PERSONAL_EMAILS: string[] = [
  "alex.johnson@gmail.com",
  "sarah.lim@gmail.com",
  "michael.chen@hotmail.com",
  "priya.nair@yahoo.com",
  "kevintanmy@gmail.com",
  "nurulain@icloud.com",
  "rfox.personal@gmail.com",
  "mary.tan88@gmail.com",
  "razif.ahmad@gmail.com",
  "jenny.wilson.kl@gmail.com",
]

const PROVIDERS: AuthProvider[] = [
  "google", "google", "email", "apple",
  "google", "apple", "google", "email", "google", "apple",
]

export function createMemberProfile(index: number): MemberProfile {
  const n = index + 1
  const now = "2026-01-15T10:00:00Z"
  // indices 0-7 are linked employees; 8-9 are public-only (no employee account yet)
  const isPublicOnly = index >= 8

  return {
    id: `MPR-20260115-${String(n).padStart(4, "0")}`,
    personalEmail: PERSONAL_EMAILS[index] ?? `member${n}@gmail.com`,
    authProvider: PROVIDERS[index] ?? "google",
    name: NAMES[index] ?? `Member ${n}`,
    phone: index % 3 === 0 ? `+60 1${String(1 + index).padStart(1, "0")}-${String(1234567 + index * 111)}` : undefined,
    isPublicOnly,
    status: index === 5 ? "deactivated" : "active",
    createdAt: now,
    updatedAt: now,
  }
}
