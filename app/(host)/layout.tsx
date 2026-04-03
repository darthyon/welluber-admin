import { AppSidebar } from "@/components/shared/app-sidebar"
import { TopBar } from "@/components/shared/top-bar"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AppSidebar persona="host" />
      <main className="flex flex-col h-screen flex-1 overflow-hidden">
        <TopBar />
        <div className="p-8 space-y-6 flex-grow overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
