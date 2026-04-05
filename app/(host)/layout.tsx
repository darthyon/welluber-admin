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
      <div className="flex flex-col min-h-screen w-full">
        <TopBar />
        <SidebarInset className="bg-slate-50/50">
          <main className="flex-1 w-full mt-14">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
