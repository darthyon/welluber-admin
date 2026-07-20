import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TopBar } from "@/components/shared/top-bar"
import { OrgSidebarWrapper } from "@/components/org/org-sidebar-wrapper"
import { PortalBreadcrumbs } from "@/components/shared/portal-breadcrumbs"

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <OrgSidebarWrapper />
      <TopBar />
      <SidebarInset className="min-w-0 bg-background">
        <main className="mt-14 w-full flex-1 p-8 px-6">
          <PortalBreadcrumbs portal="org" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
