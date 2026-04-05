import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { TopBar } from "@/components/shared/top-bar"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        {/* Add mt-14 to account for fixed TopBar */}
        <main className="flex flex-1 flex-col gap-6 p-8 pt-6 mt-14">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
