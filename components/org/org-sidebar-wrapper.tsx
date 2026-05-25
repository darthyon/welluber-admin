"use client"

import { usePathname } from "next/navigation"
import { OrgSidebar } from "@/components/org/org-sidebar"

export function OrgSidebarWrapper() {
  const pathname = usePathname()
  // First segment after "/" is the orgSlug in (org) routes: /[orgSlug]/...
  const orgSlug = pathname.split("/")[1] ?? ""
  return <OrgSidebar orgSlug={orgSlug} />
}
