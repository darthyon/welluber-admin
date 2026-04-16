export default function EmployeeLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Vertical tabs skeleton */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Content area skeleton */}
        <div className="flex-1 min-w-0">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Card skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>

            {/* Table skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-64 bg-muted rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}