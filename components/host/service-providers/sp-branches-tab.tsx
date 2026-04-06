"use client";

import { useState, useMemo } from "react";
import { Plus, GitBranch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailSection } from "@/components/shared/detail-section";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { SpBranchCard } from "./sp-branch-card";
import { SpBranchDetailView } from "./sp-branch-detail-view";
import { SpBranchForm } from "./sp-branch-form";
import type { ServiceProvider, SpBranch } from "@/types/provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover } from "@/components/shared/action-popover";
import { cn } from "@/lib/utils";

interface SpBranchesTabProps {
  sp: ServiceProvider;
}

type BranchView = "list" | "detail" | "add" | "edit";
type BranchStatusFilter = "all" | "active" | "inactive";

export function SpBranchesTab({ sp }: SpBranchesTabProps) {
  const [view, setView] = useState<BranchView>("list");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
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
    setSelectedBranchId(branch.id);
    setView("detail");
  };

  const handleEdit = (branch: SpBranch) => {
    setSelectedBranchId(branch.id);
    setView("edit");
  };

  const handleAdd = () => {
    setSelectedBranchId(null);
    setView("add");
  };

  const handleBack = () => {
    setSelectedBranchId(null);
    setView("list");
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
        <DataToolbarContainer
          search={
            <SearchBar
              placeholder="Search branches..."
              value={branchSearch}
              onChange={setBranchSearch}
            />
          }
          filters={
            <FilterItem
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as BranchStatusFilter)}
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          }
          className="mb-6 px-0"
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
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="font-semibold text-muted-foreground/80 text-[13px] tracking-tight p-4">Branch</th>
                  <th className="font-semibold text-muted-foreground/80 text-[13px] tracking-tight p-4">Location</th>
                  <th className="font-semibold text-muted-foreground/80 text-[13px] tracking-tight p-4">Services</th>
                  <th className="font-semibold text-muted-foreground/80 text-[13px] tracking-tight p-4">Status</th>
                  <th className="font-semibold text-muted-foreground/80 text-[13px] tracking-tight p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredBranches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => handleView(branch)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/60 text-muted-foreground flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                          <GitBranch size={18} weight="fill" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{branch.name}</p>
                          <p className="text-[11px] font-medium text-muted-foreground">{branch.isActive ? "Active branch" : "Inactive branch"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[13px] text-muted-foreground">
                      {branch.address.city}, {branch.address.state}
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      <StatusBadge status={branch.isActive ? "Active" : "Inactive"} variant={branch.isActive ? "emerald" : "zinc"} />
                    </td>
                    <td className="p-4 text-right">
                      <ActionPopover
                        actions={[
                          { label: "View Details", onClick: () => handleView(branch) },
                          { label: "Edit Branch", onClick: () => handleEdit(branch) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailSection>
    </div>
  );
}
