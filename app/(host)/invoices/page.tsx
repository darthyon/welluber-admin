import { Receipt } from "@phosphor-icons/react/dist/ssr"

export default function InvoicesPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-heading font-semibold text-foreground">Invoices</h1>
        <p className="text-body text-subtle">
          Review and manage organisation billing invoices.
        </p>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-center">
        <Receipt size={40} weight="light" className="mb-3 text-muted-foreground" />
        <p className="text-heading font-semibold text-foreground">Coming Soon</p>
        <p className="mt-1 max-w-sm text-body text-subtle">
          Invoice management is currently in development.
        </p>
      </div>
    </div>
  )
}
