"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, PencilSimpleLine, Trash, Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { OrgTierConfig } from "@/features/organizations/types";

interface OrgTiersConfigProps {
  orgId: string;
  initial?: OrgTierConfig[];
}

interface EditState {
  id: string | null; // null = adding new
  name: string;
  code: string;
  roles: string[];
}

const EMPTY_EDIT: EditState = { id: null, name: "", code: "", roles: [] };

export function OrgTiersConfig({ initial = [] }: OrgTiersConfigProps) {
  const [tiers, setTiers] = useState<OrgTierConfig[]>(initial);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrgTierConfig | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing !== null) nameRef.current?.focus();
  }, [editing]);

  const handleAdd = () => setEditing(EMPTY_EDIT);

  const handleEdit = (tier: OrgTierConfig) =>
    setEditing({ id: tier.id, name: tier.name, code: tier.code ?? "", roles: tier.roles ?? [] });

  const handleConfirm = () => {
    if (!editing || !editing.name.trim()) return;
    if (editing.id === null) {
      setTiers((prev) => [
        ...prev,
        { id: `tc-${Date.now()}`, name: editing.name.trim(), code: editing.code.trim() || undefined, roles: editing.roles.length > 0 ? editing.roles : undefined },
      ]);
    } else {
      setTiers((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? { ...t, name: editing.name.trim(), code: editing.code.trim() || undefined, roles: editing.roles.length > 0 ? editing.roles : undefined }
            : t
        )
      );
    }
    setEditing(null);
  };

  const handleDelete = (tier: OrgTierConfig) => setDeleteTarget(tier);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setTiers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lead font-semibold text-foreground">Employee Tiers</h3>
          <p className="text-label text-muted-foreground mt-0.5">
            Define position levels and their associated roles.
          </p>
        </div>
        {tiers.length > 0 && !editing && (
          <Button size="sm" variant="outline" onClick={handleAdd} className="gap-1.5">
            <Plus size={13} weight="bold" />
            Add tier
          </Button>
        )}
      </div>

      {/* Inline add/edit form */}
      {editing !== null && (
        <div className="space-y-3 p-3 rounded-lg border border-primary/30 bg-primary/[0.02]">
          <div className="flex items-center gap-2">
            <input
              value={editing.code}
              onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase().slice(0, 6) })}
              onKeyDown={handleKeyDown}
              placeholder="CODE"
              className="w-20 px-2 py-1.5 bg-background border border-border rounded-md text-label font-mono uppercase text-center outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
            />
            <input
              ref={nameRef}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Tier name (e.g. Senior Manager)"
              className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-md text-label outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
            />
            <button
              onClick={handleConfirm}
              disabled={!editing.name.trim()}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Check size={13} weight="bold" />
            </button>
            <button
              onClick={() => setEditing(null)}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-border-hover transition-colors"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
          <RolesEditor
            roles={editing.roles}
            onChange={(roles) => setEditing({ ...editing, roles })}
          />
        </div>
      )}

      {/* Tier list */}
      {tiers.length === 0 && !editing ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
          <p className="text-body font-medium text-muted-foreground mb-1">No tiers defined yet</p>
          <p className="text-label text-faint mb-4">Add position levels to enable tier-based policies.</p>
          <Button size="sm" variant="outline" onClick={handleAdd} className="gap-1.5">
            <Plus size={13} weight="bold" />
            Add first tier
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="flex flex-col gap-2 px-4 py-3 bg-card hover:bg-muted/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {tier.code && (
                  <span className="shrink-0 font-mono text-micro font-semibold text-faint bg-muted border border-border px-1.5 py-0.5 rounded">
                    {tier.code}
                  </span>
                )}
                <span className="flex-1 text-body font-medium text-foreground">{tier.name}</span>
                <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity")}>
                  <button
                    onClick={() => handleEdit(tier)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <PencilSimpleLine size={13} weight="bold" />
                  </button>
                  <button
                    onClick={() => handleDelete(tier)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash size={13} weight="bold" />
                  </button>
                </div>
              </div>
              {tier.roles && tier.roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-0 sm:pl-10">
                  {tier.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-muted border border-border text-label font-medium text-muted-foreground"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete tier"
        description={`Remove "${deleteTarget?.name}" from this organisation's tier list?`}
        impactPoints={["Employees already assigned this tier are unaffected.", "Policies referencing this tier name are unaffected."]}
        confirmLabel="Delete tier"
        tone="danger"
      />
    </div>
  );
}

function RolesEditor({
  roles,
  onChange,
}: {
  roles: string[];
  onChange: (roles: string[]) => void;
}) {
  const [newRole, setNewRole] = useState("");

  const addRole = () => {
    const trimmed = newRole.trim();
    if (trimmed && !roles.includes(trimmed)) {
      onChange([...roles, trimmed]);
      setNewRole("");
    }
  };

  const removeRole = (role: string) => {
    onChange(roles.filter((r) => r !== role));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRole();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-label font-medium text-subtle">Roles</label>
      <div className="flex flex-wrap gap-1.5">
        {roles.map((role) => (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-label font-medium text-primary"
          >
            {role}
            <button
              type="button"
              onClick={() => removeRole(role)}
              className="hover:text-destructive transition-colors"
            >
              <X size={12} weight="bold" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a role (e.g. Software Engineer)"
          className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-md text-label outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
        />
        <button
          type="button"
          onClick={addRole}
          disabled={!newRole.trim()}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-border-hover disabled:opacity-40 transition-colors"
        >
          <Plus size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}
