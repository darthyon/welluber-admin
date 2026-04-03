"use client";

import { useState } from "react";
import { Plus, GitBranch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { SpBranchCard } from "./sp-branch-card";
import { SpBranchDetailView } from "./sp-branch-detail-view";
import { SpBranchForm } from "./sp-branch-form";
import type { ServiceProvider, SpBranch } from "@/types/provider";

interface SpBranchesTabProps {
  sp: ServiceProvider;
}

type BranchView = "list" | "detail" | "add" | "edit";

export function SpBranchesTab({ sp }: SpBranchesTabProps) {
  const [view, setView] = useState<BranchView>("list");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const selectedBranch = sp.branches.find((b) => b.id === selectedBranchId);

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
        onBack={handleBack}
        onEdit={() => setView("edit")}
      />
    );
  }

  if (view === "add" || (view === "edit" && selectedBranch)) {
    return (
      <div className="space-y-4">
        <h3 className="text-[15px] font-semibold text-foreground">
          {view === "edit" ? `Edit — ${selectedBranch?.name}` : "Add New Branch"}
        </h3>
        <SpBranchForm
          spId={sp.id}
          serviceCategories={sp.serviceCategories}
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
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">{sp.branches.length} branch{sp.branches.length !== 1 ? "es" : ""}</p>
        <Button size="sm" className="h-9 text-[13px] gap-2" onClick={handleAdd}>
          <Plus size={15} weight="bold" /> Add Branch
        </Button>
      </div>

      {sp.branches.length === 0 ? (
        <EmptyState
          icon={<GitBranch size={32} weight="light" />}
          title="No branches yet"
          description="Add branches to configure operating hours, contacts, and services at each location."
          action={
            <Button onClick={handleAdd} size="sm" className="gap-2">
              <Plus size={14} /> Add First Branch
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sp.branches.map((branch) => (
            <SpBranchCard
              key={branch.id}
              branch={branch}
              onView={() => handleView(branch)}
              onEdit={() => handleEdit(branch)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
