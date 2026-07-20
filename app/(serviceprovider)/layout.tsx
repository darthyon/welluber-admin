/**
 * (serviceprovider) route group — Service Provider Portal
 * Placeholder layout — to be built when SP persona is ready.
 * Will share AppSidebar with spNavigation config.
 */

import { PortalBreadcrumbs } from "@/components/shared/portal-breadcrumbs"

export default function ServiceProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Will use: <AppSidebar navigation={spNavigation} persona="serviceprovider" /> */}
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="flex-grow space-y-6 overflow-y-auto bg-background p-8">
          <PortalBreadcrumbs portal="serviceprovider" />
          {children}
        </div>
      </main>
    </div>
  )
}
