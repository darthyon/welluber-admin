"use client";

import { useState, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash,
  X,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ICON_LIBRARY, CATEGORY_COLORS } from "@/hooks/use-service-taxonomy-store";
import type { CategoryEntry } from "@/hooks/use-service-taxonomy-store";

interface ServiceItem {
  localId: string;
  name: string;
  specs: string[];
}

interface CategoryWizardFormProps {
  mode: "create" | "edit";
  initialCategory?: CategoryEntry;
  initialSpecs?: Record<string, string[]>;
  validateCategoryName: (name: string, excludeName?: string) => boolean;
  onSave: (
    entry: CategoryEntry,
    specsByService: Record<string, string[]>
  ) => void;
}

function buildInitialServices(
  category: CategoryEntry | undefined,
  specs: Record<string, string[]>
): ServiceItem[] {
  if (!category) return [];
  return category.services.map((name, i) => ({
    localId: `init-${i}`,
    name,
    specs: specs[name] ?? [],
  }));
}

const labelCls = "text-body font-semibold text-subtle mb-1.5 block";

const inputCls = (hasError?: boolean) =>
  cn(
    "w-full h-10 px-3 py-2 bg-background border rounded-lg text-body outline-none transition-all duration-200",
    hasError
      ? "border-destructive focus:ring-2 focus:ring-destructive/10"
      : "border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-muted/10"
  );

const ANCHOR_ITEMS = [
  { id: "category-details", label: "Service Category Details" },
  { id: "main-services", label: "Main Services" },
];

let _counter = 0;
function nextId() {
  return `svc-${++_counter}`;
}

export function CategoryWizardForm({
  mode,
  initialCategory,
  initialSpecs = {},
  validateCategoryName,
  onSave,
}: CategoryWizardFormProps) {
  const router = useRouter();
  const uid = useId();

  const [categoryName, setCategoryName] = useState(initialCategory?.category ?? "");
  const [description, setDescription] = useState(initialCategory?.description ?? "");
  const [categoryIcon, setCategoryIcon] = useState(initialCategory?.icon ?? "");
  const [categoryColor, setCategoryColor] = useState(initialCategory?.color ?? "");
  const [nameError, setNameError] = useState("");

  const [services, setServices] = useState<ServiceItem[]>(() =>
    buildInitialServices(initialCategory, initialSpecs)
  );
  const addServiceBtnRef = useRef<HTMLButtonElement>(null);

  const addService = () => {
    setServices((prev) => [
      ...prev,
      { localId: nextId(), name: "", specs: [] },
    ]);
    setTimeout(() => {
      const cards = document.querySelectorAll("[data-service-card]");
      const last = cards[cards.length - 1];
      if (last) {
        const input = last.querySelector("input");
        input?.focus();
        last.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const updateService = (localId: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, ...updates } : s))
    );
  };

  const removeService = (localId: string) => {
    setServices((prev) => prev.filter((s) => s.localId !== localId));
  };

  const addSpec = (localId: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.localId === localId ? { ...s, specs: [...s.specs, ""] } : s
      )
    );
  };

  const updateSpec = (localId: string, specIdx: number, value: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.localId === localId
          ? { ...s, specs: s.specs.map((sp, i) => (i === specIdx ? value : sp)) }
          : s
      )
    );
  };

  const removeSpec = (localId: string, specIdx: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.localId === localId
          ? { ...s, specs: s.specs.filter((_, i) => i !== specIdx) }
          : s
      )
    );
  };

  const handleSave = () => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      setNameError("Category name is required.");
      document.getElementById("category-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const isUnique = validateCategoryName(trimmed, initialCategory?.category);
    if (!isUnique) {
      setNameError("A category with this name already exists.");
      document.getElementById("category-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setNameError("");

    const entry: CategoryEntry = {
      category: trimmed,
      description: description.trim() || undefined,
      icon: categoryIcon || undefined,
      color: categoryColor || undefined,
      services: services.map((s) => s.name.trim()).filter(Boolean),
    };

    const specsByService: Record<string, string[]> = {};
    services.forEach((s) => {
      const name = s.name.trim();
      if (!name) return;
      specsByService[name] = s.specs.map((sp) => sp.trim()).filter(Boolean);
    });

    onSave(entry, specsByService);
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

        {/* Left: Anchor Nav */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex flex-col gap-4">
              <Breadcrumbs
                items={
                  mode === "create"
                    ? [{ label: "Services", href: "/services" }, { label: "New Service Category" }]
                    : [
                        { label: "Services", href: "/services" },
                        {
                          label: initialCategory?.category ?? "",
                          href: `/services/${encodeURIComponent(initialCategory?.category ?? "")}`,
                        },
                        { label: "Edit" },
                      ]
                }
              />
              <div>
                <h1 className="tracking-tight text-display font-semibold text-foreground text-balance">
                  {mode === "create" ? "New Service Category" : "Edit Service Category"}
                </h1>
                <p className="text-subtle text-body mt-1">
                  {mode === "create"
                    ? "Define the category profile and add the services within it."
                    : `Editing ${initialCategory?.category ?? "this category"}.`}
                </p>
              </div>
            </div>

            {/* ── Section 1: Category Details ── */}
            <div
              id="category-details"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24"
            >
              <div className="p-6 space-y-6">
                {/* Section heading — static, no live icon preview */}
                <div className="pb-2">
                  <h2 className="text-lead font-semibold text-foreground">Service Category Details</h2>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor={`${uid}-name`} className={labelCls}>
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id={`${uid}-name`}
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder="e.g. Fitness & Exercise"
                    className={inputCls(!!nameError)}
                    autoFocus
                  />
                  {nameError && (
                    <p className="mt-1 text-label text-destructive">{nameError}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor={`${uid}-desc`} className={labelCls}>
                    Description{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id={`${uid}-desc`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this category covers"
                    className={inputCls()}
                  />
                </div>

                {/* Category Icon */}
                <div className="space-y-1.5">
                  <label className={labelCls}>
                    Category Icon{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ICON_LIBRARY.map(({ name, icon: IconComp }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setCategoryIcon(categoryIcon === name ? "" : name)}
                        title={name}
                        className={cn(
                          "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                          categoryIcon === name
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                            : "bg-muted border-border text-faint hover:border-primary/30 hover:bg-background hover:text-primary"
                        )}
                      >
                        <IconComp
                          size={20}
                          weight={categoryIcon === name ? "fill" : "duotone"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5">
                  <label className={labelCls}>
                    Accent Color{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map(({ name, hex }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setCategoryColor(categoryColor === hex ? "" : hex)}
                        title={name}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                          categoryColor === hex
                            ? "border-foreground scale-110 shadow-md"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: hex }}
                      >
                        {categoryColor === hex && (
                          <Check size={14} weight="bold" className="text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Main Services ── */}
            <div id="main-services" className="scroll-mt-24 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lead font-semibold text-foreground">Main Services</h2>
                  <p className="text-label text-muted-foreground mt-0.5">
                    {services.length === 0
                      ? "No services added yet."
                      : `${services.length} service${services.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button
                  ref={addServiceBtnRef}
                  variant="outline"
                  size="sm"
                  className="h-9 text-body font-medium"
                  onClick={addService}
                >
                  <Plus size={14} weight="bold" className="mr-1.5" />
                  Add Service
                </Button>
              </div>

              {services.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-border rounded-lg text-center gap-3">
                  <p className="text-body text-muted-foreground">No services added yet.</p>
                  <Button variant="outline" size="sm" onClick={addService}>
                    <Plus size={14} weight="bold" className="mr-1.5" />
                    Add your first service
                  </Button>
                </div>
              )}

              {services.map((svc) => (
                <div
                  key={svc.localId}
                  data-service-card
                  className="bg-card border border-border rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  {/* Service name row */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
                    <input
                      value={svc.name}
                      onChange={(e) => updateService(svc.localId, { name: e.target.value })}
                      placeholder="Service name (e.g. Gym Access)"
                      className={cn(inputCls(), "flex-1")}
                    />
                    <button
                      type="button"
                      onClick={() => removeService(svc.localId)}
                      className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      title="Remove service"
                    >
                      <Trash size={15} weight="duotone" />
                    </button>
                  </div>

                  {/* Specs */}
                  <div className="px-5 py-4 space-y-3">
                    {svc.specs.length > 0 && (
                      <p className="text-label font-semibold text-muted-foreground">Sub-services</p>
                    )}
                    <div className="space-y-2">
                      {svc.specs.map((spec, specIdx) => (
                        <div
                          key={specIdx}
                          className="flex items-center gap-2 animate-in fade-in duration-200"
                        >
                          <input
                            value={spec}
                            onChange={(e) => updateSpec(svc.localId, specIdx, e.target.value)}
                            placeholder="Sub-service name (e.g. Monthly Membership)"
                            className={cn(inputCls(), "flex-1")}
                            autoFocus={spec === ""}
                          />
                          <button
                            type="button"
                            onClick={() => removeSpec(svc.localId, specIdx)}
                            className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <X size={13} weight="bold" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addSpec(svc.localId)}
                      className="flex items-center gap-1.5 text-label font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus size={13} weight="bold" />
                      Add Sub-service
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
        <Button
          variant="ghost"
          size="lg"
          className="text-body font-semibold px-6 transition-colors"
          onClick={() =>
            mode === "edit" && initialCategory?.category
              ? router.push(`/services/${encodeURIComponent(initialCategory.category)}`)
              : router.push("/services")
          }
        >
          Cancel
        </Button>
        <div className="w-px h-6 bg-border/40" />
        <Button
          size="lg"
          className="text-body font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleSave}
        >
          Save Category
        </Button>
      </div>
    </div>
  );
}
