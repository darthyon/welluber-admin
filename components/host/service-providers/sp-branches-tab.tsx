"use client";

import { useState, useMemo } from "react";
import { Plus, GitBranch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailSection } from "@/components/shared/detail-section";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import { FilterItem } from "@/components/shared/filter-item";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { SpBranchCard } from "./sp-branch-card";
import { SpBranchDetailView } from "./sp-branch-detail-view";
import { SpBranchForm } from "./sp-branch-form";
import type { ServiceProvider, SpBranch } from "@/types/provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { SharedDataTable } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";

interface SpBranchesTabProps {
  sp: ServiceProvider;
}

type BranchView = "list" | "detail" | "add" | "edit";
type BranchStatusFilter = "all" | "active" | "inactive";

export function SpBranchesTab({ sp }: SpBranchesTabProps) {
  const [view, setView] = useQueryState("branchView", "list");
  const [selectedBranchId, setSelectedBranchId] = useQueryState("branchId");
  const updateQueryParams = useUpdateQueryParams();
  const [branchesView, setBranchesView] = useState<ViewMode>("grid");
  const [branchSearch, setBranchSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BranchStatusFilter>("all");

  const selectedBranch = sp.branches.find((b) => b.id === selectedBranchId);
  const filteredBranches = sp.branches.filter((branch) => {
    const matchesSearch =
      [branch.name, branch.address.city, branch.address.state, branch.services.map(s => s.service).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(branchSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.isActive) ||
      (statusFilter === "inactive" && !branch.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleView = (branch: SpBranch) => {
    updateQueryParams({
      branchView: "detail",
      branchId: branch.id
    });
  };

  const handleEdit = (branch: SpBranch) => {
    updateQueryParams({
      branchView: "edit",
      branchId: branch.id
    });
  };

  const handleAdd = () => {
    updateQueryParams({
      branchView: "add",
      branchId: null
    });
  };

  const handleBack = () => {
    updateQueryParams({
      branchView: "list",
      branchId: null
    });
  };

  if (view === "detail" && selectedBranch) {
    return (
      <SpBranchDetailView
        branch={selectedBranch}
        serviceCategories={sp.serviceCategories}
        onBack={handleBack}
        onEdit={() => setView("edit")}
      />
    );
  }

  if (view === "add" || (view === "edit" && selectedBranch)) {
    return (
      <div className="space-y-4">
        <SpBranchForm
          spId={sp.id}
          serviceCategories={sp.serviceCategories}
          portfolio={sp.commissionSchema}
          branch={view === "edit" ? selectedBranch : undefined}
          onSuccess={handleBack}
          onCancel={handleBack}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <DetailSection
        title="Branches"
        icon={<GitBranch size={18} weight="duotone" />}
        description="Manage branch locations, services, and local administrators."
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAdd}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 text-[12px] font-medium rounded-full h-8"
            >
              <Plus size={14} weight="bold" /> Add Branch
            </Button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <ViewToggle mode={branchesView} onChange={setBranchesView} />
          </div>
        }
      >
        <DataFilterBar
          searchQuery={branchSearch}
          onSearchChange={setBranchSearch}
          searchPlaceholder="Search branches..."
          className="mb-6"
          filters={
            <FilterItem
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as BranchStatusFilter)}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          }
        />

        {filteredBranches.length === 0 ? (
          <EmptyState
            icon={<GitBranch size={32} weight="light" />}
            title={sp.branches.length === 0 ? "No branches yet" : "No branches match your filters"}
            description={
              sp.branches.length === 0
                ? "Add branches to configure operating hours, administrators, and services at each location."
                : "Try a different search or clear the status filter."
            }
            action={
              sp.branches.length === 0 ? (
                <Button onClick={handleAdd} size="sm" className="gap-2">
                  <Plus size={14} /> Add First Branch
                </Button>
              ) : undefined
            }
          />
        ) : branchesView === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBranches.map((branch) => (
              <SpBranchCard
                key={branch.id}
                branch={branch}
                onView={() => handleView(branch)}
                onEdit={() => handleEdit(branch)}
              />
            ))}
          </div>
        ) : (
          <SharedDataTable
            data={filteredBranches}
            onRowClick={handleView}
            columns={[
              {
                header: "Branch",
                accessorKey: "name",
                sortable: true,
                render: (branch) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/60 text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                      <GitBranch size={18} weight="fill" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{branch.name}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">{branch.isActive ? "Active branch" : "Inactive branch"}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: "Location",
                render: (branch) => (
                  <span className="text-[13px] text-muted-foreground">
                    {branch.address.city}, {branch.address.state}
                  </span>
                ),
              },
              {
                header: "Services",
                render: (branch) => (
                  <div className="flex flex-wrap gap-1.5">
                    {branch.services.slice(0, 2).map((service) => (
                      <span key={service.service} className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground border border-border">
                        {service.service}
                      </span>
                    ))}
                    {branch.services.length > 2 && (
                      <span className="text-[11px] font-medium text-muted-foreground/60">
                        +{branch.services.length - 2} more
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: "Status",
                accessorKey: "isActive",
                sortable: true,
                render: (branch) => (
                  <StatusBadge status={branch.isActive ? "Active" : "Inactive"} variant={branch.isActive ? "emerald" : "zinc"} />
                ),
              },
              {
                header: "",
                align: "right",
                render: (branch) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ActionPopover
                      actions={[
                        { label: "View Details", onClick: () => handleView(branch) },
                        { label: "Edit Branch", onClick: () => handleEdit(branch) },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </DetailSection>
    </div>
  );
}
