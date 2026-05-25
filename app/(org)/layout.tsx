import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TopBar } from "@/components/shared/top-bar"
import { OrgSidebarWrapper } from "@/components/org/org-sidebar-wrapper"

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <OrgSidebarWrapper />
      <TopBar />
      <SidebarInset className="bg-background min-w-0">
        <main className="flex-1 w-full mt-14 p-8 px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
