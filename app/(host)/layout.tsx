import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { TopBar } from "@/components/shared/top-bar"
import { PortalBreadcrumbs } from "@/components/shared/portal-breadcrumbs"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <TopBar />
      <SidebarInset className="min-w-0 bg-background">
        {/* Full-width shell — pages and subpages render edge-to-edge. Never add max-w constraints here or in page wrappers. Use column grids or form layouts to manage internal line length where needed. */}
        <main className="mt-14 w-full flex-1 p-8 px-6">
          <PortalBreadcrumbs portal="host" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
