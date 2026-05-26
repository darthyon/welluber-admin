import Link from "next/link"
import type { Metadata } from "next"
import { WelluberLogo } from "@/components/shared/welluber-logo"

export const metadata: Metadata = {
  title: "Coming Soon · WellUber",
}

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <WelluberLogo width={160} height={42} className="mb-10 text-primary" />

      <h1 className="text-display font-semibold text-foreground">
        We&apos;re working on it.
      </h1>
      <p className="mt-3 max-w-sm text-body text-subtle">
        The Service Provider portal is coming soon. Check back later or reach out to
        your WellUber contact.
      </p>

      <Link
        href="/login/serviceprovider"
        className="mt-10 text-label font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
      >
        Back to login
      </Link>
    </div>
  )
}
