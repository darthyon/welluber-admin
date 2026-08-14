"use client"

import { useRouter } from "next/navigation"
import { Buildings } from "@phosphor-icons/react"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export function OrgPortalNotFound() {
  const router = useRouter()

  return (
    <EmptyState
      isPageLevel
      icon={<Buildings size={48} weight="duotone" />}
      title="Organisation Not Found"
      description="This organisation portal is not available or the link is invalid."
      action={
        <Button className="rounded-4xl" onClick={() => router.push("/login/organisation")}>
          Return To Organisation Login
        </Button>
      }
    />
  )
}
