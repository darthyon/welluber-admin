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
      <TopBar />
      <SidebarInset className="bg-background min-w-0">
        <main className="flex-1 w-full mt-14 p-8 px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
