"use client";

import { Plus, DownloadSimple, MagnifyingGlass, FadersHorizontal } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { SpCard } from "@/components/host/service-providers/sp-card";
import { SpDataTable } from "@/components/host/service-providers/sp-data-table";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { AdvancedFilterSheet, AdvancedFilters, DEFAULT_ADVANCED_FILTERS } from "@/components/shared/advanced-filter-sheet";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryState } from "@/hooks/use-tab-persistence";
import { cn } from "@/lib/utils";
import { MOCK_SPS } from "@/features/providers/mock-data";
import { SP_STATUS_OPTIONS } from "@/features/providers/constants";
import { SERVICE_TAXONOMY } from "@/features/organizations/constants";

function ServiceProvidersContent() {
  const [viewMode, setViewMode] = useQueryState("view", "list");
  const [searchQuery, setSearchQuery] = useQueryState("search", "");
  const [statusFilter, setStatusFilter] = useQueryState("status", "all");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useQueryState("advancedFilter");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    ...DEFAULT_ADVANCED_FILTERS,
  });

  const activeAdvancedCount =
    (advancedFilters.services.length > 0 ? 1 : 0) +
    (advancedFilters.utilization[1] < 100 ? 1 : 0);

  const filteredSps = MOCK_SPS.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sp.status === statusFilter;

    const matchesServices =
      advancedFilters.services.length === 0 ||
      advancedFilters.services.some((s) => sp.mainServices?.includes(s));

    return matchesSearch && matchesStatus && matchesServices;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading font-semibold tracking-tight text-foreground">Service Providers</h1>
          <p className="text-muted-foreground text-nav mt-1 font-normal opacity-80">
            Manage wellness service providers on the Welluber platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode as ViewMode} onChange={setViewMode} />

          <Button variant="ghost" size="sm" className="h-9 text-nav font-medium hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-nav font-medium shadow-sm">
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
              options={SP_STATUS_OPTIONS as unknown as { label: string; value: string }[]}
            />
            <MultiSelectFilter
              label="Main Services"
              taxonomy={SERVICE_TAXONOMY}
              selected={advancedFilters.services}
              onChange={(services) => setAdvancedFilters({ ...advancedFilters, services })}
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
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                          setSearchQuery("");
                          setStatusFilter("all");
                          setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
                        }}
                      >
                        Clear All Filters
                      </Button>
                    }
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SpDataTable data={filteredSps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen === "true"}
        onClose={() => setIsFilterSheetOpen(null)}
        filters={advancedFilters}
        setFilters={setAdvancedFilters}
        onApply={() => setIsFilterSheetOpen(null)}
        showWorkforce={false}
        showWalletModel={false}
        showIndustry={false}
        description="Filter service providers by service categories and utilisation."
      />
    </div>
  );
}

export default function ServiceProvidersPage() {
  return (
    <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading service providers...</div>}>
      <ServiceProvidersContent />
    </Suspense>
  );
}
