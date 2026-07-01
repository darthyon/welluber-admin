"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, PencilSimpleLine, Trash, Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { OrgTierConfig, OrgDepartmentConfig } from "@/features/organizations/types";

interface OrgStructureConfigProps {
  orgId: string;
  initialTiers?: OrgTierConfig[];
  initialDepts?: OrgDepartmentConfig[];
  employeesByTier?: Record<string, number>;
  employeesByDept?: Record<string, number>;
}

type TabKey = "tiers" | "departments";

interface EditState {
  id: string | null;
  name: string;
  code: string;
}

const EMPTY_EDIT: EditState = { id: null, name: "", code: "" };

function PaxBadge({ count }: { count: number | undefined }) {
  if (!count) return null;
  return (
    <span className="text-label text-muted-foreground shrink-0">
      {count} pax
    </span>
  );
}

interface StructurePanelProps<T extends OrgTierConfig | OrgDepartmentConfig> {
  items: T[];
  editing: EditState | null;
  codePlaceholder: string;
  namePlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel: string;
  addLabel: string;
  employeeCounts: Record<string, number>;
  nameRef: React.RefObject<HTMLInputElement | null>;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onEditingChange: (state: EditState) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function StructurePanel<T extends OrgTierConfig | OrgDepartmentConfig>({
  items,
  editing,
  codePlaceholder,
  namePlaceholder,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  addLabel,
  employeeCounts,
  nameRef,
  onAdd,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onEditingChange,
  onKeyDown,
}: StructurePanelProps<T>) {
  return (
    <div className="space-y-3">
      {items.length > 0 && !editing && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5">
            <Plus size={13} weight="bold" />
            {addLabel}
          </Button>
        </div>
      )}

      {editing !== null && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/30 bg-primary/[0.02]">
          <input
            value={editing.code}
            onChange={(e) =>
              onEditingChange({
                ...editing,
                code: e.target.value.toUpperCase().slice(0, 6),
              })
            }
            onKeyDown={onKeyDown}
            placeholder={codePlaceholder}
            className="w-20 px-2 py-1.5 bg-background border border-border rounded-md text-label font-mono uppercase text-center outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
          />
          <input
            ref={nameRef}
            value={editing.name}
            onChange={(e) => onEditingChange({ ...editing, name: e.target.value })}
            onKeyDown={onKeyDown}
            placeholder={namePlaceholder}
            className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-md text-label outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
          />
          <button
            onClick={onConfirm}
            disabled={!editing.name.trim()}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Check size={13} weight="bold" />
          </button>
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-border-hover transition-colors"
          >
            <X size={13} weight="bold" />
          </button>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
          <p className="text-body font-medium text-muted-foreground mb-1">{emptyTitle}</p>
          <p className="text-label text-faint mb-4">{emptyDescription}</p>
          <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5">
            <Plus size={13} weight="bold" />
            {emptyCtaLabel}
          </Button>
        </div>
      ) : (
        items.length > 0 && (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/20 transition-colors group"
              >
                {item.code && (
                  <span className="shrink-0 font-mono text-micro font-semibold text-faint bg-muted border border-border px-1.5 py-0.5 rounded">
                    {item.code}
                  </span>
                )}
                <span className="flex-1 text-body font-medium text-foreground">
                  {item.name}
                </span>
                <PaxBadge count={employeeCounts[item.id]} />
                <div
                  className={cn(
                    "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                >
                  <button
                    onClick={() => onEdit(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <PencilSimpleLine size={13} weight="bold" />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash size={13} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export function OrgStructureConfig({
  initialTiers = [],
  initialDepts = [],
  employeesByTier = {},
  employeesByDept = {},
}: OrgStructureConfigProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("tiers");

  const [tiers, setTiers] = useState<OrgTierConfig[]>(initialTiers);
  const [tierEditing, setTierEditing] = useState<EditState | null>(null);
  const [tierDeleteTarget, setTierDeleteTarget] = useState<OrgTierConfig | null>(null);
  const tierNameRef = useRef<HTMLInputElement>(null);

  const [depts, setDepts] = useState<OrgDepartmentConfig[]>(initialDepts);
  const [deptEditing, setDeptEditing] = useState<EditState | null>(null);
  const [deptDeleteTarget, setDeptDeleteTarget] = useState<OrgDepartmentConfig | null>(null);
  const deptNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tierEditing !== null) tierNameRef.current?.focus();
  }, [tierEditing]);

  useEffect(() => {
    if (deptEditing !== null) deptNameRef.current?.focus();
  }, [deptEditing]);

  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === "#employee-tiers") {
        setActiveTab("tiers");
        requestAnimationFrame(() => {
          document.getElementById("employee-tiers")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const handleTierAdd = () => setTierEditing(EMPTY_EDIT);
  const handleTierEdit = (tier: OrgTierConfig) =>
    setTierEditing({ id: tier.id, name: tier.name, code: tier.code ?? "" });
  const handleTierConfirm = () => {
    if (!tierEditing || !tierEditing.name.trim()) return;
    if (tierEditing.id === null) {
      setTiers((prev) => [
        ...prev,
        {
          id: `tc-${Date.now()}`,
          name: tierEditing.name.trim(),
          code: tierEditing.code.trim() || undefined,
        },
      ]);
    } else {
      setTiers((prev) =>
        prev.map((t) =>
          t.id === tierEditing.id
            ? { ...t, name: tierEditing.name.trim(), code: tierEditing.code.trim() || undefined }
            : t
        )
      );
    }
    setTierEditing(null);
  };
  const handleTierDelete = (tier: OrgTierConfig) => setTierDeleteTarget(tier);
  const confirmTierDelete = () => {
    if (!tierDeleteTarget) return;
    setTiers((prev) => prev.filter((t) => t.id !== tierDeleteTarget.id));
    setTierDeleteTarget(null);
  };
  const handleTierKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTierConfirm();
    if (e.key === "Escape") setTierEditing(null);
  };

  const handleDeptAdd = () => setDeptEditing(EMPTY_EDIT);
  const handleDeptEdit = (dept: OrgDepartmentConfig) =>
    setDeptEditing({ id: dept.id, name: dept.name, code: dept.code ?? "" });
  const handleDeptConfirm = () => {
    if (!deptEditing || !deptEditing.name.trim()) return;
    if (deptEditing.id === null) {
      setDepts((prev) => [
        ...prev,
        {
          id: `dc-${Date.now()}`,
          name: deptEditing.name.trim(),
          code: deptEditing.code.trim() || undefined,
        },
      ]);
    } else {
      setDepts((prev) =>
        prev.map((d) =>
          d.id === deptEditing.id
            ? { ...d, name: deptEditing.name.trim(), code: deptEditing.code.trim() || undefined }
            : d
        )
      );
    }
    setDeptEditing(null);
  };
  const handleDeptDelete = (dept: OrgDepartmentConfig) => setDeptDeleteTarget(dept);
  const confirmDeptDelete = () => {
    if (!deptDeleteTarget) return;
    setDepts((prev) => prev.filter((d) => d.id !== deptDeleteTarget.id));
    setDeptDeleteTarget(null);
  };
  const handleDeptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleDeptConfirm();
    if (e.key === "Escape") setDeptEditing(null);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "tiers", label: "Tiers" },
    { key: "departments", label: "Departments" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lead font-semibold text-foreground">Organisation Structure</h3>
          <p className="text-label text-muted-foreground mt-0.5">
            Define employee tiers and departments that govern benefit targeting.
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-3 py-1 text-label font-medium rounded-md border transition-colors",
                activeTab === key
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "tiers" && (
        <div id="employee-tiers">
          <StructurePanel<OrgTierConfig>
            items={tiers}
            editing={tierEditing}
            codePlaceholder="CODE"
            namePlaceholder="Tier name (e.g. Senior Manager)"
            emptyTitle="No tiers defined yet"
            emptyDescription="Add position levels to enable tier-based policies."
            emptyCtaLabel="Add first tier"
            addLabel="Add tier"
            employeeCounts={employeesByTier}
            nameRef={tierNameRef}
            onAdd={handleTierAdd}
            onEdit={handleTierEdit}
            onDelete={handleTierDelete}
            onConfirm={handleTierConfirm}
            onCancel={() => setTierEditing(null)}
            onEditingChange={setTierEditing}
            onKeyDown={handleTierKeyDown}
          />
        </div>
      )}

      {activeTab === "departments" && (
        <StructurePanel<OrgDepartmentConfig>
          items={depts}
          editing={deptEditing}
          codePlaceholder="DEPT"
          namePlaceholder="e.g. Engineering"
          emptyTitle="No departments defined yet"
          emptyDescription="Add departments to enable department-based policies."
          emptyCtaLabel="Add first department"
          addLabel="Add department"
          employeeCounts={employeesByDept}
          nameRef={deptNameRef}
          onAdd={handleDeptAdd}
          onEdit={handleDeptEdit}
          onDelete={handleDeptDelete}
          onConfirm={handleDeptConfirm}
          onCancel={() => setDeptEditing(null)}
          onEditingChange={setDeptEditing}
          onKeyDown={handleDeptKeyDown}
        />
      )}

      <ConfirmationModal
        isOpen={!!tierDeleteTarget}
        onClose={() => setTierDeleteTarget(null)}
        onConfirm={confirmTierDelete}
        title="Delete tier"
        description={`Remove "${tierDeleteTarget?.name}" from this organisation's tier list?`}
        impactPoints={[
          "Employees already assigned this tier are unaffected.",
          "Policies referencing this tier name are unaffected.",
        ]}
        confirmLabel="Delete tier"
        tone="danger"
      />

      <ConfirmationModal
        isOpen={!!deptDeleteTarget}
        onClose={() => setDeptDeleteTarget(null)}
        onConfirm={confirmDeptDelete}
        title="Delete department"
        description={`Remove "${deptDeleteTarget?.name}" from this organisation's department list?`}
        impactPoints={[
          "Employees already assigned this department are unaffected.",
          "Policies referencing this department name are unaffected.",
        ]}
        confirmLabel="Delete department"
        tone="danger"
      />
    </div>
  );
}
