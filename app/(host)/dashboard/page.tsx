export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Placeholder — will be built out with stat cards, charts, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Organizations", value: "—" },
          { label: "Active Providers", value: "—" },
          { label: "Total Users", value: "—" },
          { label: "Active Policies", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-2 text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
