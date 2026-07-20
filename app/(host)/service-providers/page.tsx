"use client"

import { Plus, DownloadSimple, MagnifyingGlass } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { SpCard } from "@/components/host/service-providers/sp-card"
import { SpDataTable } from "@/components/host/service-providers/sp-data-table"
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { MultiSelectFilter } from "@/components/shared/multi-select-filter"
import { EmptyState } from "@/components/shared/empty-state"
import {
  AdvancedFilterSheet,
  AdvancedFilters,
  DEFAULT_ADVANCED_FILTERS,
} from "@/components/shared/advanced-filter-sheet"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { MOCK_SPS } from "@/lib/mock-data"
import { SP_STATUS_OPTIONS } from "@/features/providers/constants"
import { SERVICE_TAXONOMY } from "@/features/organizations/constants"

function ServiceProvidersContent() {
  const [viewMode, setViewMode] = useQueryState("view", "list")
  const [searchQuery, setSearchQuery] = useQueryState("search", "")
  const [statusFilter, setStatusFilter] = useQueryState("status", "all")
  const [isFilterSheetOpen, setIsFilterSheetOpen] =
    useQueryState("advancedFilter")
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    ...DEFAULT_ADVANCED_FILTERS,
  })

  const activeAdvancedCount =
    (advancedFilters.services.length > 0 ? 1 : 0) +
    (advancedFilters.utilization[1] < 100 ? 1 : 0)

  const filteredSps = MOCK_SPS.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || sp.status === statusFilter

    const matchesServices =
      advancedFilters.services.length === 0 ||
      advancedFilters.services.some((s) => sp.mainServices?.includes(s))

    return matchesSearch && matchesStatus && matchesServices
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-heading font-semibold text-balance text-foreground">
            Service Providers
          </h1>
          <p className="mt-1 text-body font-normal text-subtle">
            Manage wellness service providers on the Welluber platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode as ViewMode} onChange={setViewMode} />

          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-body font-medium hover:bg-muted/50"
          >
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="mx-1 h-4 w-[1px] bg-border" />

          <Button asChild className="h-9 text-body font-medium shadow-sm">
            <Link href="/service-providers/new">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add Service Provider
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search service providers..."
        filters={
          <>
            <FilterItem
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={
                SP_STATUS_OPTIONS as unknown as {
                  label: string
                  value: string
                }[]
              }
            />
            <MultiSelectFilter
              label="Main Services"
              taxonomy={SERVICE_TAXONOMY}
              selected={advancedFilters.services}
              onChange={(services) =>
                setAdvancedFilters({ ...advancedFilters, services })
              }
              singularLabel="service"
              pluralLabel="services"
            />
          </>
        }
        advancedFilter={{
          isOpen: isFilterSheetOpen === "true",
          onToggle: () => setIsFilterSheetOpen("true"),
          activeCount: activeAdvancedCount,
        }}
      />

      {/* Content */}
      <div className="min-h-[400px]">
        {viewMode === "grid" ? (
          <div
            key="grid"
            className="grid animate-in grid-cols-1 gap-6 duration-200 fade-in slide-in-from-bottom-2 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredSps.map((sp) => (
              <SpCard key={sp.id} sp={sp} />
            ))}
            {filteredSps.length === 0 && (
              <div className="col-span-full py-12">
                <EmptyState
                  icon={<MagnifyingGlass size={32} weight="light" />}
                  title="No service providers match your filters"
                  description="Try adjusting your search or filters."
                  action={
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                        setAdvancedFilters(DEFAULT_ADVANCED_FILTERS)
                      }}
                    >
                      Clear All Filters
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <div
            key="table"
            className="animate-in duration-200 fade-in slide-in-from-bottom-2"
          >
            <SpDataTable data={filteredSps} />
          </div>
        )}
      </div>

      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen === "true"}
        onClose={() => setIsFilterSheetOpen(null)}
        filters={advancedFilters}
        setFilters={setAdvancedFilters}
        onApply={() => setIsFilterSheetOpen(null)}
        showWorkforce={false}
        showAccountModel={false}
        showIndustry={false}
        description="Filter service providers by service categories and utilisation."
      />
    </div>
  )
}

export default function ServiceProvidersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[400px] animate-pulse items-center justify-center text-muted-foreground">
          Loading service providers...
        </div>
      }
    >
      <ServiceProvidersContent />
    </Suspense>
  )
}
