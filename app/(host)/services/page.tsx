"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionPopover } from "@/components/shared/action-popover";
import { OverflowTags } from "@/components/shared/overflow-tags";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useServiceTaxonomyStore, ICON_LIBRARY } from "@/hooks/use-service-taxonomy-store";
import { cn } from "@/lib/utils";

function ServicesContent() {
  const router = useRouter();
  const store = useServiceTaxonomyStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return store.categories;
    return store.categories.filter((cat) => {
      const matchesCategory = cat.category.toLowerCase().includes(q);
      const matchesServices = cat.services.some((s) => {
        const matchesService = s.toLowerCase().includes(q);
        const matchesSpecs = (store.specsByService[s] ?? []).some((sp) =>
          sp.toLowerCase().includes(q)
        );
        return matchesService || matchesSpecs;
      });
      return matchesCategory || matchesServices;
    });
  }, [searchQuery, store.categories, store.specsByService]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Services</h1>
          <p className="text-subtle text-body mt-1 font-normal">
            Define and manage the global service taxonomy. Group services into categories and link them to brands and providers.
          </p>
        </div>
        <Button
          className="h-9 text-body font-medium shadow-sm transition-all hover:scale-[1.02]"
          onClick={() => router.push("/services/new")}
        >
          <Plus size={16} weight="bold" className="mr-1.5" />
          Add Service Category
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={16} />
          <Input
            placeholder="Search categories, services or specs..."
            className="pl-9 h-10 text-body bg-background/50 focus:bg-background transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-label font-medium text-subtle ml-auto">
          <span>{filteredCategories.length} Categories</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>
            {filteredCategories.reduce((acc, cat) => acc + cat.services.length, 0)} Main Services
          </span>
        </div>
      </div>

      {/* Category Grid */}
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const IconComp = ICON_LIBRARY.find((ic) => ic.name === category.icon)?.icon;
            const accentColor = category.color;

            const actions: { label: string; icon?: ReactNode; isDanger?: boolean; onClick: () => void }[] = [
              {
                label: "Edit Category",
                icon: <PencilSimple size={15} weight="duotone" />,
                onClick: () =>
                  router.push(
                    `/services/${encodeURIComponent(category.category)}/edit`
                  ),
              },
              {
                label: "Delete Category",
                isDanger: true,
                icon: <Trash size={15} weight="duotone" />,
                onClick: () => {
                  if (
                    confirm(`Delete "${category.category}" and all its services?`)
                  ) {
                    store.deleteCategory(category.category);
                  }
                },
              },
            ];

            return (
              <div
                key={category.category}
                onClick={() =>
                  router.push(
                    `/services/${encodeURIComponent(category.category)}`
                  )
                }
                className="group relative bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Decorative accent */}
                <div
                  className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl group-hover:w-32 group-hover:h-32 transition-all duration-500 pointer-events-none"
                  style={{
                    backgroundColor: accentColor
                      ? `${accentColor}14`
                      : undefined,
                  }}
                  aria-hidden
                />
                {!accentColor && (
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" aria-hidden />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        accentColor ? "" : "bg-primary/10 text-primary"
                      )}
                      style={
                        accentColor
                          ? { backgroundColor: `${accentColor}1a`, color: accentColor }
                          : undefined
                      }
                    >
                      {IconComp ? (
                        <IconComp size={16} weight="duotone" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-current opacity-50" />
                      )}
                    </div>
                    <div>
                      <p className="text-body font-medium text-foreground leading-tight">
                        {category.category}
                      </p>
                      <p className="text-label text-muted-foreground">
                        {category.services.length} service
                        {category.services.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="relative z-20">
                    <ActionPopover actions={actions} />
                  </div>
                </div>

                {/* Services preview */}
                <div className="relative z-10 h-7 flex items-center">
                  {category.services.length === 0 ? (
                    <span className="text-label text-muted-foreground italic">No services yet</span>
                  ) : (
                    <OverflowTags items={category.services} className="w-full" />
                  )}
                </div>

                {/* Description */}
                {category.description && (
                  <p className="relative z-10 mt-2 text-label text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </TooltipProvider>

      {filteredCategories.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <p className="text-body text-muted-foreground">
            No categories match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            className="text-label text-primary font-medium hover:underline"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">
          Loading service taxonomy...
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
