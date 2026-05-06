export default function AccountsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md opacity-60" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-lg" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 flex-1 max-w-sm bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 w-full bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
