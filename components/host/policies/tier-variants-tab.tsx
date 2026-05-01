"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Check,
  X,
  WarningCircle,
  Users,
  TreeStructure,
  IdentificationCard,
  Trash,
  NotePencil,
  CheckCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { BenefitPolicy, BenefitGroup, Benefit, TierVariant, TierOverride } from "@/types/policy";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TierVariantsTabProps {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  tiers: TierVariant[];
}

interface TierNavItem {
  id: string;
  name: string;
  subtitle: string;
  isIncomplete: boolean;
  isBase: boolean;
}

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];

// ─── TierNav Component ───────────────────────────────────────────────────────

function TierNav({
  items,
  activeId,
  onSelect,
  onAddTier,
  adding,
  onConfirmAdd,
  onCancelAdd,
  disabled,
}: {
  items: TierNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onAddTier: () => void;
  adding: boolean;
  onConfirmAdd: (name: string) => void;
  onCancelAdd: () => void;
  disabled?: boolean;
}) {
  const [newName, setNewName] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newName.trim()) {
      onConfirmAdd(newName.trim());
      setNewName("");
    } else if (e.key === "Escape") {
      setNewName("");
      onCancelAdd();
    }
  };

  return (
    <div className="w-[220px] shrink-0 flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex flex-col items-start px-3 py-2.5 text-left transition-all border-l-2",
              isActive
                ? "bg-primary/5 border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-body font-semibold truncate flex-1">{item.name}</span>
              {item.isIncomplete && !item.isBase && (
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
              )}
            </div>
            {!item.isBase && (
              <span className={cn("text-label mt-0.5", isActive ? "text-primary/70" : "text-faint")}>
                {item.subtitle}
              </span>
            )}
          </button>
        );
      })}

      {adding ? (
        <div className="px-3 py-2 border-l-2 border-primary bg-primary/5">
          <input
            autoFocus
            type="text"
            placeholder="Tier name..."
            className="w-full text-body font-semibold bg-transparent outline-none text-primary placeholder:text-primary/40"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newName.trim()) onCancelAdd();
            }}
          />
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => {
                if (newName.trim()) {
                  onConfirmAdd(newName.trim());
                  setNewName("");
                }
              }}
              className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check size={12} weight="bold" />
            </button>
            <button
              onClick={() => { setNewName(""); onCancelAdd(); }}
              className="p-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        </div>
      ) : (
        <button
          disabled={disabled}
          onClick={onAddTier}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 text-left text-label font-semibold transition-all border-l-2 border-transparent",
            disabled
              ? "text-faint cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          title={disabled ? "Activate this policy to configure tier variants" : undefined}
        >
          <Plus size={14} weight="bold" />
          Add tier
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TierVariantsTab({ policy, groups, benefits, tiers: initialTiers }: TierVariantsTabProps) {
  const [tiers, setTiers] = useState<TierVariant[]>(initialTiers);
  const [activeTierId, setActiveTierId] = useState<string>("base");
  const [adding, setAdding] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);

  const isDraft = policy.status === "draft";

  const navItems: TierNavItem[] = [
    { id: "base", name: "Base", subtitle: "Inherited amounts", isIncomplete: false, isBase: true },
    ...tiers.map((tier) => {
      const overrideCount = tier.overrides.filter((o) => o.amount !== undefined).length;
      const totalBenefits = benefits.length;
      return {
        id: tier.id,
        name: tier.name,
        subtitle: tier.status === "incomplete"
          ? "incomplete"
          : overrideCount === 0
            ? "inherits all"
            : `${overrideCount} override${overrideCount !== 1 ? "s" : ""}`,
        isIncomplete: tier.status === "incomplete",
        isBase: false,
      };
    }),
  ];

  const handleAddTier = () => {
    if (isDraft) return;
    setAdding(true);
  };

  const handleConfirmAdd = (name: string) => {
    const newTier: TierVariant = {
      id: `tier-${Date.now()}`,
      policyId: policy.id,
      organizationId: policy.organizationId,
      name,
      status: "incomplete",
      eligibleEmploymentTypes: [],
      departmentIds: [],
      overrides: [],
    };
    setTiers((prev) => [...prev, newTier]);
    setActiveTierId(newTier.id);
    setAdding(false);
  };

  const handleCancelAdd = () => {
    setAdding(false);
  };

  const handleRemoveTier = (tierId: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
    if (activeTierId === tierId) setActiveTierId("base");
    setShowRemoveConfirm(null);
  };

  const handleUpdateTier = (tierId: string, updates: Partial<TierVariant>) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, ...updates } : t))
    );
  };

  const handleSetOverride = (tierId: string, benefitId: string, amount?: number) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== tierId) return t;
        const existing = t.overrides.find((o) => o.benefitId === benefitId);
        let newOverrides: TierOverride[];
        if (existing) {
          if (amount === undefined) {
            newOverrides = t.overrides.filter((o) => o.benefitId !== benefitId);
          } else {
            newOverrides = t.overrides.map((o) =>
              o.benefitId === benefitId ? { ...o, amount } : o
            );
          }
        } else if (amount !== undefined) {
          newOverrides = [
            ...t.overrides,
            { id: `ovr-${Date.now()}`, tierId, benefitId, amount },
          ];
        } else {
          newOverrides = t.overrides;
        }
        return {
          ...t,
          overrides: newOverrides,
          status: newOverrides.length > 0 && t.eligibleEmploymentTypes.length > 0 ? "complete" : "incomplete",
        };
      })
    );
  };

  const activeTier = tiers.find((t) => t.id === activeTierId);

  return (
    <div className="flex gap-6 h-full">
      {/* Left nav */}
      <div className="shrink-0">
        <TierNav
          items={navItems}
          activeId={activeTierId}
          onSelect={setActiveTierId}
          onAddTier={handleAddTier}
          adding={adding}
          onConfirmAdd={handleConfirmAdd}
          onCancelAdd={handleCancelAdd}
          disabled={isDraft}
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 max-w-[640px]">
        <AnimatePresence mode="wait">
          {activeTierId === "base" ? (
            <BasePanel key="base" policy={policy} groups={groups} benefits={benefits} />
          ) : activeTier ? (
            <TierPanel
              key={activeTier.id}
              tier={activeTier}
              policy={policy}
              groups={groups}
              benefits={benefits}
              onUpdate={handleUpdateTier}
              onSetOverride={handleSetOverride}
              onRemove={() => setShowRemoveConfirm(activeTier.id)}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Remove confirmation */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl"
            >
              <div className="p-8 pb-4">
                <h3 className="text-heading font-semibold text-foreground text-balance">
                  Remove {tiers.find((t) => t.id === showRemoveConfirm)?.name}?
                </h3>
                <p className="text-body font-medium text-subtle mt-1">
                  Employees on this tier will revert to base amounts at the next assignment refresh.
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
                <Button
                  variant="ghost"
                  className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted"
                  onClick={() => setShowRemoveConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="h-12 flex-1 rounded-lg font-semibold shadow-lg shadow-rose-500/20 bg-destructive text-primary-foreground hover:bg-destructive/90"
                  onClick={() => handleRemoveTier(showRemoveConfirm)}
                >
                  Remove Tier
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Base Panel ──────────────────────────────────────────────────────────────

function BasePanel({
  policy,
  groups,
  benefits,
}: {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">Base Amounts</h3>
          <p className="text-body text-muted-foreground mt-1">
            These are the default benefit amounts. Tiers override specific values.
          </p>
        </div>
      </div>

      {groups.map((group) => {
        const groupBenefits = benefits.filter((b) => b.groupId === group.id);
        return (
          <div key={group.id} className="rounded-lg border border-border bg-card/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <TreeStructure size={18} weight="duotone" className="text-primary" />
                <span className="text-body font-semibold text-foreground">{group.name}</span>
              </div>
              <span className="text-label text-muted-foreground">
                {group.distributionType === "SharedAmount" ? "Shared Pool" : "Individual"}
              </span>
            </div>
            <div className="divide-y divide-border/60">
              {groupBenefits.map((benefit) => (
                <div key={benefit.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <IdentificationCard size={16} className="text-faint" />
                    <span className="text-body text-foreground">Service {benefit.serviceId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {benefit.coPayment.required && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label font-medium">
                        Co-pay {benefit.coPayment.type === "Percentage" ? `${benefit.coPayment.value}%` : `RM ${benefit.coPayment.value}`}
                      </span>
                    )}
                    <span className="text-body font-semibold text-foreground font-mono tabular-nums">
                      RM {benefit.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {groupBenefits.length === 0 && (
                <div className="px-4 py-3 text-label text-faint italic">No services configured.</div>
              )}
            </div>
          </div>
        );
      })}

      {policy.status === "draft" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <WarningCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-semibold text-amber-700 dark:text-amber-300">Policy is Draft</p>
            <p className="text-label text-amber-600 dark:text-amber-400 mt-0.5">
              Activate this policy to configure tier variants.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Tier Panel ──────────────────────────────────────────────────────────────

function TierPanel({
  tier,
  policy,
  groups,
  benefits,
  onUpdate,
  onSetOverride,
  onRemove,
}: {
  tier: TierVariant;
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  onUpdate: (tierId: string, updates: Partial<TierVariant>) => void;
  onSetOverride: (tierId: string, benefitId: string, amount?: number) => void;
  onRemove: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleEmploymentType = (type: string) => {
    const current = tier.eligibleEmploymentTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onUpdate(tier.id, {
      eligibleEmploymentTypes: next,
      status: next.length > 0 && tier.overrides.length > 0 ? "complete" : "incomplete",
    });
  };

  const toggleDepartment = (dept: string) => {
    const current = tier.departmentIds || [];
    const next = current.includes(dept)
      ? current.filter((d) => d !== dept)
      : [...current, dept];
    onUpdate(tier.id, { departmentIds: next });
  };

  const getBaseAmount = (benefitId: string): number => {
    const b = benefits.find((b) => b.id === benefitId);
    return b?.amount || 0;
  };

  const getOverrideAmount = (benefitId: string): number | undefined => {
    return tier.overrides.find((o) => o.benefitId === benefitId)?.amount;
  };

  const handleSave = () => {
    const invalidTypes = tier.eligibleEmploymentTypes.filter(
      (t) => !policy.eligibleEmploymentTypes.includes(t)
    );
    if (invalidTypes.length > 0) {
      setValidationError(
        `${invalidTypes.join(", ")} is not eligible for this policy`
      );
      return;
    }
    if (tier.eligibleEmploymentTypes.length === 0) {
      setValidationError("Select at least one employment type");
      return;
    }
    setValidationError(null);
    onUpdate(tier.id, { status: "complete" });
    setMode("view");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-heading font-semibold text-foreground">{tier.name}</h3>
          <p className="text-body text-muted-foreground mt-1">
            {mode === "edit"
              ? "Configure eligibility rules and benefit overrides for this tier."
              : "Eligibility rules and benefit overrides for this tier."}
          </p>
        </div>
        {mode === "edit" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 px-3 text-label font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0"
          >
            <Trash size={14} weight="bold" className="mr-1.5" />
            Remove Tier
          </Button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {tier.status === "complete" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 text-label font-medium">
                <CheckCircle size={12} weight="fill" />
                Complete
              </span>
            )}
            {tier.status === "incomplete" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20 text-label font-medium">
                <WarningCircle size={12} weight="fill" />
                Incomplete
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("edit")}
              className="h-8 px-3 rounded-4xl text-label font-semibold"
            >
              <NotePencil size={14} weight="bold" className="mr-1" />
              Edit Tier
            </Button>
          </div>
        )}
      </div>

      {/* Validation error — edit mode only */}
      <AnimatePresence>
        {mode === "edit" && validationError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20"
          >
            <WarningCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-label text-rose-700 dark:text-rose-300 font-medium">{validationError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eligibility */}
      <div className="space-y-3">
        <h4 className="text-body font-semibold text-foreground">Eligibility Rules</h4>

        <div className="space-y-1.5">
          <label className="text-label font-medium text-subtle">
            Employment Types <span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
          {mode === "edit" ? (
            <>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((type) => {
                  const selected = tier.eligibleEmploymentTypes.includes(type.id);
                  const isValid = policy.eligibleEmploymentTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      disabled={!isValid}
                      onClick={() => toggleEmploymentType(type.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-body font-semibold border transition-all",
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : isValid
                            ? "bg-background text-muted-foreground border-border hover:border-primary/30"
                            : "bg-muted text-faint border-border cursor-not-allowed"
                      )}
                      title={!isValid ? `${type.label} is not eligible for this policy` : undefined}
                    >
                      {selected && <Check size={12} weight="bold" className="inline mr-1.5" />}
                      {type.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-micro text-faint">
                Only types selected in the policy basics are available.
              </p>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tier.eligibleEmploymentTypes.length > 0 ? (
                EMPLOYMENT_TYPES.filter((t) => tier.eligibleEmploymentTypes.includes(t.id)).map((type) => (
                  <span
                    key={type.id}
                    className="px-3 py-1.5 rounded-full text-body font-semibold border bg-primary/10 text-primary border-primary/20"
                  >
                    {type.label}
                  </span>
                ))
              ) : (
                <span className="text-body text-faint italic">None selected</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-label font-medium text-subtle">Departments</label>
          {mode === "edit" ? (
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => {
                const selected = (tier.departmentIds || []).includes(dept);
                return (
                  <button
                    key={dept}
                    onClick={() => toggleDepartment(dept)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-body font-semibold border transition-all",
                      selected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {selected && <Check size={12} weight="bold" className="inline mr-1.5" />}
                    {dept}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tier.departmentIds && tier.departmentIds.length > 0 ? (
                tier.departmentIds.map((dept) => (
                  <span
                    key={dept}
                    className="px-3 py-1.5 rounded-full text-body font-semibold border bg-primary/10 text-primary border-primary/20"
                  >
                    {dept}
                  </span>
                ))
              ) : (
                <span className="text-body text-faint italic">All departments</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Overrides */}
      <div className="space-y-4">
        <h4 className="text-body font-semibold text-foreground">Benefit Overrides</h4>
        {mode === "edit" && (
          <p className="text-body text-muted-foreground">
            Leave empty to inherit the base amount. Enter a value to override.
          </p>
        )}

        {groups.map((group) => {
          const groupBenefits = benefits.filter((b) => b.groupId === group.id);
          return (
            <div key={group.id} className="rounded-lg border border-border bg-card/40 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <TreeStructure size={18} weight="duotone" className="text-primary" />
                <span className="text-body font-semibold text-foreground">{group.name}</span>
              </div>
              <div className="divide-y divide-border/60">
                {groupBenefits.map((benefit) => {
                  const baseAmount = getBaseAmount(benefit.id);
                  const overrideAmount = getOverrideAmount(benefit.id);
                  const hasOverride = overrideAmount !== undefined;

                  return (
                    <div key={benefit.id} className="flex items-center justify-between px-4 py-3 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <IdentificationCard size={16} className="text-faint shrink-0" />
                        <span className="text-body text-foreground truncate">Service {benefit.serviceId}</span>
                      </div>
                      {mode === "edit" ? (
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-label text-faint font-mono tabular-nums">
                            Base: RM {baseAmount.toFixed(2)}
                          </span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label text-muted-foreground font-mono">
                              RM
                            </span>
                            <input
                              type="number"
                              placeholder={baseAmount.toFixed(2)}
                              className={cn(
                                "w-28 pl-9 pr-3 py-1.5 bg-background border rounded-lg text-label font-mono text-right outline-none focus:ring-2 transition-all",
                                hasOverride
                                  ? "border-primary focus:ring-primary/20 text-primary font-semibold"
                                  : "border-border focus:ring-primary/10 text-foreground placeholder:text-faint"
                              )}
                              value={hasOverride ? overrideAmount : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  onSetOverride(tier.id, benefit.id, undefined);
                                } else {
                                  const num = parseFloat(val);
                                  if (!isNaN(num) && num > 0) {
                                    onSetOverride(tier.id, benefit.id, num);
                                  }
                                }
                              }}
                            />
                          </div>
                          {hasOverride && (
                            <button
                              onClick={() => onSetOverride(tier.id, benefit.id, undefined)}
                              className="p-1 rounded text-faint hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              title="Clear override"
                            >
                              <X size={14} weight="bold" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-label text-faint font-mono tabular-nums">
                            Base: RM {baseAmount.toFixed(2)}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-lg text-label font-mono tabular-nums font-semibold min-w-[6rem] justify-end",
                              hasOverride
                                ? "bg-primary/10 text-primary"
                                : "text-faint"
                            )}
                          >
                            {hasOverride ? `RM ${overrideAmount!.toFixed(2)}` : "Inherits base"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {groupBenefits.length === 0 && (
                  <div className="px-4 py-3 text-label text-faint italic">No services configured.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save — edit mode only */}
      {mode === "edit" && (
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            className="h-10 px-6 rounded-4xl text-body font-medium shadow-sm"
          >
            <Check size={16} weight="bold" className="mr-1.5" />
            Save Tier
          </Button>
          {tier.status === "complete" && (
            <span className="flex items-center gap-1.5 text-label font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={14} weight="fill" />
              Saved
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
