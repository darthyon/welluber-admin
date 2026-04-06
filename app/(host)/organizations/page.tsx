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
import { Organization } from "@/features/organizations/types";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { AdvancedFilterSheet, DEFAULT_ADVANCED_FILTERS, AdvancedFilters } from "@/components/shared/advanced-filter-sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock Data matching the PRD
const MOCK_ORGS: Organization[] = [
  {
    id: "ORG-20260115-0001",
    name: "Acme Corporation Sdn Bhd",
    registrationNumber: "1234567-T",
    industry: "Technology",
    subIndustry: "SaaS / Enterprise Software",
    type: "enterprise",
    financialYearStart: "2026-01-01T00:00:00Z",
    subscription: {
      plan: "enterprise",
      billingInformation: "Acme Finance Dept",
      paymentMethod: "bank_transfer",
      startDate: "2026-01-15T10:00:00Z",
      status: "active",
    },
    status: "active",
    tinNumber: "TR-882910-01",
    bankAccountDetails: {
      bankName: "Maybank Berhad",
      accountNumber: "5140 1234 5678",
      accountName: "Acme Corporation Sdn Bhd",
    },
    employeeCount: 450,
    picId: "USER-ADMIN-001",
    utilizationRate: 68,
    totalWalletBalance: 45200,
    walletLimit: 60000,
    needsAction: [],
    services: ["Health Screenings", "Clinical Therapy"],
    policies: ["Comprehensive Health", "Mental Health Support"],
    branches: ["Kuala Lumpur HQ", "Subang Jaya", "Penang Office"],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "ORG-20260301-0002",
    name: "Global Tech Solutions",
    registrationNumber: "9876543-K",
    industry: "Logistics",
    subIndustry: "Supply Chain",
    type: "sme",
    financialYearStart: "2026-04-01T00:00:00Z",
    subscription: {
      plan: "standard",
      billingInformation: "GT Logistics Finance",
      paymentMethod: "credit_card",
      startDate: "2026-03-01T10:00:00Z",
      status: "active",
    },
    status: "pending",
    tinNumber: "TR-993021-02",
    bankAccountDetails: {
      bankName: "CIMB Bank",
      accountNumber: "8001 2233 4455",
      accountName: "Global Tech Solutions",
    },
    employeeCount: 120,
    picId: null,
    utilizationRate: 15,
    totalWalletBalance: 12500,
    walletLimit: 85000,
    needsAction: ["Missing PIC"],
    services: ["General Practice", "Health Screenings"],
    policies: ["Basic GP", "Group Term Life"],
    branches: ["Petaling Jaya Branch"],
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "ORG-20260310-0003",
    name: "Nexus Innovations",
    registrationNumber: "5544332-M",
    industry: "Finance",
    subIndustry: "FinTech",
    type: "enterprise",
    financialYearStart: "2026-01-01T00:00:00Z",
    subscription: {
      plan: "premium",
      billingInformation: "Nexus Accounts",
      paymentMethod: "bank_transfer",
      startDate: "2026-02-10T10:00:00Z",
      status: "suspended",
    },
    status: "suspended",
    tinNumber: "TR-554433-03",
    bankAccountDetails: {
      bankName: "Public Bank",
      accountNumber: "3112 5544 3322",
      accountName: "Nexus Innovations",
    },
    employeeCount: 850,
    picId: "USER-ADMIN-002",
    utilizationRate: 92,
    totalWalletBalance: 4800,
    walletLimit: 5000,
    needsAction: ["Wallet low", "No policies"],
    services: ["Clinical Therapy", "Specialist Care"],
    policies: [],
    branches: ["Singapore HQ", "KL Office"],
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `ORG-20260401-001${i + 4}`,
    name: `Enterprise Partner ${i + 1} Sdn Bhd`,
    registrationNumber: `${1000000 + i}-X`,
    industry: "Manufacturing",
    subIndustry: "Industrial Goods",
    type: "enterprise",
    financialYearStart: "2026-01-01T00:00:00Z",
    subscription: {
      plan: "standard",
      billingInformation: "Finance Dept",
      paymentMethod: "bank_transfer",
      startDate: "2026-04-01T10:00:00Z",
      status: "active",
    },
    status: "active",
    tinNumber: `TR-000${i}-04`,
    bankAccountDetails: {
      bankName: "Maybank Berhad",
      accountNumber: `5140 ${1000 + i} 5678`,
      accountName: `Enterprise Partner ${i + 1} Sdn Bhd`,
    },
    employeeCount: 200 + (i * 50),
    picId: "USER-ADMIN-001",
    utilizationRate: 45 + (i * 2),
    totalWalletBalance: 35000 + (i * 1000),
    walletLimit: 80000,
    needsAction: i % 4 === 0 ? ["No branches"] : [],
    services: ["Occupational Health", "Gymnasium Facilities"],
    policies: ["Standard Medical"],
    branches: ["Main Plant"],
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
  } as Organization))
];

export default function OrganizationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
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
    (advancedFilters.walletModel !== "all" ? 1 : 0);

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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Organisations</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal opacity-80">Manage B2B corporate clients on the Welluber platform.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          
          <Button variant="outline" size="sm" className="h-9 text-[13px] font-medium border-border/60 hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-[13px] font-medium shadow-sm">
            <Link href="/organizations/new">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add Organisation
            </Link>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <DataToolbarContainer 
        search={
          <SearchBar 
            placeholder="Search organizations..." 
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-sm"
          />
        }
        filters={
          <>
            <FilterItem 
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Suspended", value: "suspended" },
                { label: "Removed", value: "removed" },
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
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-9 text-[13px] gap-2 rounded-lg border border-border/60 hover:bg-muted/50 transition-all",
                activeAdvancedCount > 0 && "bg-indigo-50/50 border-indigo-200 text-indigo-600 hover:bg-indigo-100/50"
              )}
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <FadersHorizontal size={16} weight={activeAdvancedCount > 0 ? "fill" : "bold"} />
              Advanced Filters
              {activeAdvancedCount > 0 && (
                <Badge className="h-4 min-w-[16px] px-1 bg-indigo-600 text-white border-0 text-[10px]">
                  {activeAdvancedCount}
                </Badge>
              )}
            </Button>
          </>
        }
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
                    title="No organizations match your filters"
                    description="Try adjusting your search or filters to find what you're looking for."
                    action={
                      <Button variant="outline" onClick={() => {
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
