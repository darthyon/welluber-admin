/**
 * (org) route group — Organization Admin Portal
 * Placeholder layout — to be built when org persona is ready.
 * Will share AppSidebar with orgNavigation config.
 */

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Will use: <AppSidebar navigation={orgNavigation} persona="org" /> */}
      <main className="flex flex-col h-screen flex-1 overflow-hidden">
        <div className="p-8 space-y-6 flex-grow overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
