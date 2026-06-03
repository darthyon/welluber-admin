"use client";

import * as React from "react";
import { CheckCircle, DownloadSimple, IdentificationCard, MagnifyingGlass, TreeStructure, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterItem } from "@/components/shared/filter-item";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { PolicyCreationLauncher } from "@/components/host/policies/policy-creation-launcher";
import type { PolicyListItem } from "@/features/policies/types";
import { cn, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionPopover, type ActionItem } from "@/components/shared/action-popover";

export type StatusFilter = "all" | "draft" | "active" | "deactivated";

interface ClonePolicyDialogProps {
  isOpen: boolean;
  original: PolicyListItem | null;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  isDanger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface PoliciesPageToolbarProps {
  onCreateNew: () => void;
  onCreateFromTemplate: (templateId: string) => void;
  orgFilter: string;
  orgFilterOptions: { label: string; value: string }[];
  onOrgFilterChange: (value: string) => void;
  searchQuery: string;
  statusCounts: Record<StatusFilter, number>;
  statusFilter: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
}

interface PoliciesPageTableSectionProps {
  columns: Column<PolicyListItem>[];
  data: PolicyListItem[];
  onCreateNew: () => void;
  onRowClick: (row: PolicyListItem) => void;
}

export function ClonePolicyDialog({ isOpen, original, onClose, onConfirm }: ClonePolicyDialogProps) {
  const defaultName = original ? `${original.name} — Copy` : "";
  if (!isOpen || !original) return null;

  return <ClonePolicyDialogInner defaultName={defaultName} original={original} onClose={onClose} onConfirm={onConfirm} />;
}

function ClonePolicyDialogInner({ defaultName, original, onClose, onConfirm }: { defaultName: string; original: PolicyListItem; onClose: () => void; onConfirm: (name: string) => void; }) {
  const [name, setName] = React.useState(defaultName);
  return (
    <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] duration-300 fade-in">
      <div className="w-full max-w-md animate-in overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl duration-300 zoom-in-95">
        <div className="p-8 pb-4">
          <h3 className="text-heading font-semibold text-foreground text-balance">Clone Policy</h3>
          <p className="mt-1 text-body font-medium text-subtle">
            Create a deep copy of <span className="font-semibold text-foreground">{original.name}</span>.
          </p>
        </div>
        <div className="px-8 pb-2">
          <label className="text-label font-medium text-subtle">New policy name</label>
          <input
            type="text"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-body font-semibold text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="mt-6 flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
          <Button variant="ghost" className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted" onClick={onClose}>Cancel</Button>
          <Button className="h-12 flex-1 rounded-lg font-semibold shadow-lg shadow-primary/20" disabled={!name.trim()} onClick={() => onConfirm(name.trim())}>Clone Policy</Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ isOpen, title, description, warning, confirmLabel, isDanger, onClose, onConfirm }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] duration-300 fade-in">
      <div className="w-full max-w-md animate-in overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl duration-300 zoom-in-95">
        <div className="p-8 pb-4">
          <h3 className="text-heading font-semibold text-foreground text-balance">{title}</h3>
          <p className="mt-1 text-body font-medium text-subtle">{description}</p>
          {warning ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <Warning size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-label text-amber-700 dark:text-amber-300">{warning}</p>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
          <Button variant="ghost" className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted" onClick={onClose}>Cancel</Button>
          <Button className={cn("h-12 flex-1 rounded-lg font-semibold shadow-lg", isDanger ? "bg-destructive text-primary-foreground shadow-rose-500/20 hover:bg-destructive/90" : "shadow-primary/20")} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export function PoliciesPageToolbar({
  onCreateNew,
  onCreateFromTemplate,
  orgFilter,
  orgFilterOptions,
  onOrgFilterChange,
  searchQuery,
  statusCounts,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: PoliciesPageToolbarProps) {
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Benefit Policies</h1>
          <p className="mt-1 text-body font-normal text-subtle">
            Design and oversee flexible benefit structures for your workforce. Define eligibility, pool strategies, and individual service rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 text-body font-medium hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>
          <div className="mx-1 h-4 w-[1px] bg-border" />
          <PolicyCreationLauncher onManual={onCreateNew} onTemplate={onCreateFromTemplate} />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search policies or benefit IDs..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-body font-medium outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <FilterItem label="Organisation" value={orgFilter} onChange={onOrgFilterChange} options={orgFilterOptions} />
        <FilterItem
          label="Status"
          value={statusFilter}
          onChange={(value) => onStatusFilterChange(value as StatusFilter)}
          options={[
            { label: `All (${statusCounts.all})`, value: "all" },
            { label: `Draft (${statusCounts.draft})`, value: "draft" },
            { label: `Active (${statusCounts.active})`, value: "active" },
            { label: `Deactivated (${statusCounts.deactivated})`, value: "deactivated" },
          ]}
        />
      </div>
    </>
  );
}

export function PoliciesPageTableSection({ columns, data, onCreateNew, onRowClick }: PoliciesPageTableSectionProps) {
  return data.length === 0 ? (
    <EmptyState
      isPageLevel
      icon={<TreeStructure size={48} weight="duotone" />}
      title="No policies found"
      description="Design and oversee flexible benefit structures for your workforce. Adjust your filters or create a new policy to get started."
      action={<Button variant="default" onClick={onCreateNew} className="mt-8 h-10 px-6 font-medium shadow-sm">Add Benefit Policy</Button>}
    />
  ) : (
    <SharedDataTable data={data} columns={columns} freezeFirst freezeLast rowsPerPage={10} onRowClick={onRowClick} />
  );
}

export function PoliciesPageToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 bottom-6 z-[200] animate-in duration-300 fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3 shadow-xl">
        <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-body font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}

export function buildPoliciesColumns({
  onClone,
  onDeactivate,
  onDelete,
  onEdit,
  onView,
}: {
  onClone: (policy: PolicyListItem) => void;
  onDeactivate: (policy: PolicyListItem) => void;
  onDelete: (policy: PolicyListItem) => void;
  onEdit: (policy: PolicyListItem) => void;
  onView: (policy: PolicyListItem) => void;
}): Column<PolicyListItem>[] {
  return [
    {
      header: "Policy Name",
      accessorKey: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 bg-primary/10 text-primary">
            <IdentificationCard size={20} weight="duotone" />
          </div>
          <div>
            <p className="text-body font-medium text-foreground">{row.name}</p>
            <p className="mt-0.5 text-label font-mono leading-none tracking-tight text-subtle">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => <StatusBadge status={row.status} variant={row.status === "active" ? "emerald" : row.status === "draft" ? "amber" : "rose"} dot />,
    },
    {
      header: "Version",
      render: (row) => row.version ? <Badge variant="outline" className="text-label font-mono">{row.version}</Badge> : <span className="text-label text-faint">—</span>,
    },
    {
      header: "Organisation",
      render: (row) => <span className="text-body font-medium text-subtle">{row.orgName || row.organizationId || "—"}</span>,
    },
    {
      header: "Last Updated",
      accessorKey: "createdAt",
      render: (row) => <span className="whitespace-nowrap text-label font-medium text-subtle">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "",
      headerClassName: "text-right",
      align: "right",
      render: (row) => {
        const actions: ActionItem[] = [
          { label: "View policy details", onClick: (event: React.MouseEvent) => { event.stopPropagation(); onView(row); } },
          { label: "Edit policy", onClick: (event: React.MouseEvent) => { event.stopPropagation(); onEdit(row); } },
          { label: "Clone policy", onClick: (event: React.MouseEvent) => { event.stopPropagation(); onClone(row); }, className: "font-semibold text-primary" },
        ];

        if (row.status === "active") {
          actions.push({ label: "Management", isSectionTitle: true }, { label: "Deactivate policy", onClick: (event: React.MouseEvent) => { event.stopPropagation(); onDeactivate(row); }, isDanger: true });
        }
        if (row.status === "draft" || row.status === "deactivated") {
          actions.push({ label: "Management", isSectionTitle: true }, { label: "Delete policy", onClick: (event: React.MouseEvent) => { event.stopPropagation(); onDelete(row); }, isDanger: true });
        }

        return <div className="flex justify-end" onClick={(event) => event.stopPropagation()}><ActionPopover actions={actions} /></div>;
      },
    },
  ];
}
