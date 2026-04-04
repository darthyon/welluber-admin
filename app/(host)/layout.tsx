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
      <div className="flex h-svh bg-background text-foreground overflow-hidden w-full">
        <AppSidebar side="left" variant="sidebar" collapsible="icon" />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <div className="px-6 py-6 space-y-6 flex-grow overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
