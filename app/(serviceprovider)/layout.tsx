/**
 * (serviceprovider) route group — Service Provider Portal
 * Placeholder layout — to be built when SP persona is ready.
 * Will share AppSidebar with spNavigation config.
 */

export default function ServiceProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Will use: <AppSidebar navigation={spNavigation} persona="serviceprovider" /> */}
      <main className="flex flex-col h-screen flex-1 overflow-hidden">
        <div className="p-8 space-y-6 flex-grow overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
