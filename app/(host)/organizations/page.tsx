"use client";

import { Plus, DownloadSimple, MagnifyingGlass, FadersHorizontal, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrganizationsDataTable } from "@/components/host/organizations/organizations-data-table";
import { OrganizationCard } from "@/components/host/organizations/organization-card";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { MultiSelectFilter } from "@/components/shared/multi-select-filter";
import { ALL_SERVICES, SERVICE_TAXONOMY, WORKFORCE_RANGES, INDUSTRIES } from "@/features/organizations/constants";
import { MOCK_ORGS } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { EmptyState } from "@/components/shared/empty-state";
import { AdvancedFilterSheet, DEFAULT_ADVANCED_FILTERS, AdvancedFilters } from "@/components/shared/advanced-filter-sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function OrganizationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [triageFilter, setTriageFilter] = useState<string>("all");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);

  const activeAdvancedCount = 
    (advancedFilters.services.length > 0 ? 1 : 0) +
    (advancedFilters.utilization[1] < 100 ? 1 : 0) +
    (advancedFilters.employees[1] < 5000 ? 1 : 0) +
    (advancedFilters.industry !== "all" ? 1 : 0) +
    (advancedFilters.accountModel !== "all" ? 1 : 0);

  const filteredOrgs = MOCK_ORGS.filter(org => {
    // 1. Search
    const matchesSearch = 
      (org.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (org.registrationNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (org.id?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    // 2. Status Filter
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;

    // 3. Triage / Setup Filter
    let matchesTriage = true;
    if (triageFilter === "missing_pic") matchesTriage = !org.picId;
    else if (triageFilter === "no_policies") matchesTriage = org.policies.length === 0;
    else if (triageFilter === "no_branches") matchesTriage = org.branches.length === 0;
    else if (triageFilter === "needs_action") matchesTriage = !org.picId || org.policies.length === 0 || org.branches.length === 0;
    
    // 4. Service Taxonomy Filter
    const matchesServices = 
      advancedFilters.services.length === 0 || 
      advancedFilters.services.every(s => org.services.includes(s));

    // 4. Analytics Filters
    const matchesUtilization = org.utilizationRate <= advancedFilters.utilization[1];
    const matchesWorkforce = org.employeeCount <= advancedFilters.employees[1];
    
    // 5. Infrastructure Filters
    const matchesIndustry = advancedFilters.industry === "all" || org.industry === advancedFilters.industry;
    
    return matchesSearch && matchesStatus && matchesTriage && matchesServices && matchesUtilization && matchesWorkforce && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title font-semibold text-foreground text-balance">Organisations</h1>
          <p className="text-subtle text-body mt-1">Manage B2B corporate clients on the Welluber platform.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          
          <Button variant="ghost" size="sm" className="h-9 text-body font-medium hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-body font-medium shadow-sm">
            <Link href="/organizations/new">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add Organisation
            </Link>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search organisations..."
        filters={
          <>
            <FilterItem 
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Draft", value: "draft" },
                { label: "Deactivated", value: "deactivated" },
                { label: "Suspended", value: "suspended" },
              ]}
            />
            <FilterItem 
              label="Needs Action"
              value={triageFilter}
              onChange={setTriageFilter}
              options={[
                { label: "None", value: "all" },
                { label: "🚨 All Actions", value: "needs_action" },
                { label: "Missing PIC", value: "missing_pic" },
                { label: "No Policies", value: "no_policies" },
                { label: "No Branches", value: "no_branches" },
              ]}
            />
            <MultiSelectFilter 
              label="Service Category"
              taxonomy={SERVICE_TAXONOMY}
              selected={advancedFilters.services}
              onChange={(services) => setAdvancedFilters({ ...advancedFilters, services })}
            />
          </>
        }
        advancedFilter={{
          isOpen: isFilterSheetOpen,
          onToggle: () => setIsFilterSheetOpen(true),
          activeCount: activeAdvancedCount,
        }}
      />

      {/* Main Content Area */}
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
              {filteredOrgs.map((org) => (
                <OrganizationCard key={org.id} org={org} />
              ))}
              {filteredOrgs.length === 0 && (
                <div className="col-span-full py-12">
                  <EmptyState 
                    icon={<MagnifyingGlass size={32} weight="light" />}
                    title="No organisations match your filters"
                    description="Try adjusting your search or filters to find what you're looking for."
                    action={
                      <Button variant="ghost" onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setTriageFilter("all");
                        setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
                      }}>
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
              <OrganizationsDataTable data={filteredOrgs} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdvancedFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={advancedFilters}
        setFilters={setAdvancedFilters}
        onApply={() => setIsFilterSheetOpen(false)}
        workforceRanges={WORKFORCE_RANGES}
        industries={INDUSTRIES}
        description="Detailed reporting and company attribute selection."
      />
    </div>
  );
}
