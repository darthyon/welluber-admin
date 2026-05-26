import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { UsersThree, Shield, Storefront } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { VisualPanel } from "@/features/auth/visual-panel"
import { LoginForm } from "@/features/auth/login-form"
import type { UserRole } from "@/lib/session"

// Map URL slug → UserRole
const ROLE_MAP: Record<string, UserRole> = {
  organisation: "org",
  host: "host",
  serviceprovider: "serviceprovider",
}

const ROLE_LABELS: Record<UserRole, string> = {
  org: "Organisation Admin",
  host: "WellUber Admin",
  serviceprovider: "Service Provider Admin",
}

const ROLE_ICONS: Record<UserRole, Icon> = {
  org: UsersThree,
  host: Shield,
  serviceprovider: Storefront,
}

interface Props {
  params: Promise<{ role: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role: slug } = await params
  const role = ROLE_MAP[slug]
  if (!role) return { title: "Sign in" }
  return { title: `Sign in · ${ROLE_LABELS[role]}` }
}

export default async function LoginRolePage({ params }: Props) {
  const { role: slug } = await params
  const role = ROLE_MAP[slug]

  if (!role) notFound()

  const RoleIcon = ROLE_ICONS[role]

  return (
    <div className="flex min-h-screen">
      {/* Left — visual */}
      <VisualPanel role={role} />

      {/* Right — form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-14 lg:py-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
              <RoleIcon size={13} weight="duotone" className="text-primary" />
              <span className="text-label font-medium text-foreground">{ROLE_LABELS[role]}</span>
            </div>
            <h1 className="text-title font-semibold text-foreground">Welcome back</h1>
          </div>

          <LoginForm role={role} />

          <p className="mt-8 text-label text-subtle">
            By signing in, you agree to WellUber&apos;s{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
