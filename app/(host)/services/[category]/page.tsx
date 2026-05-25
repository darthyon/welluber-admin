"use client";

import { use, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  PencilSimpleLine,
  Trash,
  Tag,
  Wrench,
  Gear,
} from "@phosphor-icons/react";
import { useServiceTaxonomyStore, ICON_LIBRARY } from "@/hooks/use-service-taxonomy-store";
import { useTabPersistence } from "@/hooks/use-tab-persistence";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Service Category Details", icon: Tag },
  { id: "services", label: "Main Services", icon: Wrench },
  { id: "settings", label: "Settings", icon: Gear },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ServiceCategoryPageProps {
  params: Promise<{ category: string }>;
}

function ServiceCategoryContent({ categoryName }: { categoryName: string }) {
  const router = useRouter();
  const store = useServiceTaxonomyStore();
  const [activeTab, setActiveTab] = useTabPersistence<TabId>("profile");

  const category = store.categories.find((c) => c.category === categoryName);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-body text-muted-foreground">Category not found.</p>
        <Button variant="ghost" onClick={() => router.push("/services")}>
          Back to Services
        </Button>
      </div>
    );
  }

  const IconComp = ICON_LIBRARY.find((ic) => ic.name === category.icon)?.icon;
  const accentColor = category.color;

  return (
    <div className="pb-12">
      {/* Full-bleed header — matches org detail page pattern */}
      <div className="relative z-30 -mx-6 -mt-6 bg-card px-6 pt-6">
        <div className="py-6 lg:px-2">
          <Breadcrumbs
            items={[
              { label: "Services", href: "/services" },
              { label: category.category },
            ]}
            className="mb-4"
          />

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-5">
              {/* Category icon avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
                style={
                  accentColor
                    ? { backgroundColor: `${accentColor}1a`, color: accentColor, borderColor: `${accentColor}30` }
                    : { backgroundColor: "hsl(var(--primary)/0.08)", color: "hsl(var(--primary))", borderColor: "hsl(var(--primary)/0.15)" }
                }
              >
                {IconComp ? (
                  <IconComp size={26} weight="duotone" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-current opacity-40" />
                )}
              </div>

              <div className="space-y-1">
                <h1 className="tracking-tight text-display font-semibold text-foreground">
                  {category.category}
                </h1>
                <p className="text-body text-subtle">
                  {category.services.length} service{category.services.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="rounded-full text-body font-medium transition-all"
              onClick={() => router.push(`/services/${encodeURIComponent(categoryName)}/edit`)}
            >
              <PencilSimpleLine size={16} weight="bold" className="mr-1.5" />
              Edit Category
            </Button>
          </div>

          {/* Tab bar */}
          <div className="mt-8 flex items-center gap-6 border-b border-border">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 py-3 text-body font-medium transition-all duration-300",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 lg:p-8">

        {/* Service Category Details */}
        {activeTab === "profile" && (
          <div className="animate-in fade-in space-y-6">
            <DetailSection
              title="Category Profile"
              icon={<Tag size={18} weight="duotone" />}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                <DetailField label="Name" value={category.category} />
                <DetailField label="Description" value={category.description} />
                <DetailField
                  label="Icon"
                  value={
                    IconComp ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={
                            accentColor
                              ? { backgroundColor: `${accentColor}1a`, color: accentColor }
                              : { backgroundColor: "hsl(var(--primary)/0.1)", color: "hsl(var(--primary))" }
                          }
                        >
                          <IconComp size={15} weight="duotone" />
                        </div>
                        <span>{category.icon}</span>
                      </div>
                    ) : undefined
                  }
                />
                <DetailField
                  label="Accent Color"
                  value={
                    accentColor ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                        <span className="font-mono text-label">{accentColor}</span>
                      </div>
                    ) : undefined
                  }
                />
              </div>
            </DetailSection>
          </div>
        )}

        {/* Main Services */}
        {activeTab === "services" && (
          <div className="animate-in fade-in space-y-3">
            {category.services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-border rounded-lg text-center gap-3">
                <p className="text-body text-muted-foreground">No services in this category.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/services/${encodeURIComponent(categoryName)}/edit`)}
                >
                  Add Services
                </Button>
              </div>
            ) : (
              category.services.map((serviceName) => {
                const specs = store.specsByService[serviceName] ?? [];
                return (
                  <div
                    key={serviceName}
                    className="bg-card border border-border rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                      <p className="text-body font-medium text-foreground">{serviceName}</p>
                      {specs.length > 0 && (
                        <span className="text-label text-muted-foreground">
                          {specs.length} sub-service{specs.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {specs.length > 0 && (
                      <div className="px-5 py-3 flex flex-wrap gap-1.5">
                        {specs.map((spec) => (
                          <span
                            key={spec}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted border border-border text-label text-muted-foreground"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="animate-in fade-in space-y-6">
            <DetailSection
              title="Danger Zone"
              icon={<Gear size={18} weight="duotone" />}
              description="Irreversible actions for this service category."
            >
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-body font-medium text-foreground">Delete Category</p>
                      <p className="text-label text-muted-foreground">
                        Permanently removes &ldquo;{category.category}&rdquo; and all its services. Cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="h-9 text-label shrink-0"
                      onClick={() => {
                        if (confirm(`Delete "${category.category}" and all its services?`)) {
                          store.deleteCategory(categoryName);
                          router.push("/services");
                        }
                      }}
                    >
                      <Trash size={14} weight="duotone" className="mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </DetailSection>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceCategoryPage({ params }: ServiceCategoryPageProps) {
  const { category: encodedName } = use(params);
  const categoryName = decodeURIComponent(encodedName);

  return (
    <Suspense
      fallback={
        <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">
          Loading...
        </div>
      }
    >
      <ServiceCategoryContent categoryName={categoryName} />
    </Suspense>
  );
}
