"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useServiceTaxonomyStore } from "@/hooks/use-service-taxonomy-store";
import { CategoryWizardForm } from "@/components/host/services/category-wizard-form";
import type { CategoryEntry } from "@/hooks/use-service-taxonomy-store";

interface EditCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function EditServiceCategoryPage({ params }: EditCategoryPageProps) {
  const { category: encodedName } = use(params);
  const categoryName = decodeURIComponent(encodedName);
  const router = useRouter();
  const store = useServiceTaxonomyStore();

  const categoryEntry = store.categories.find((c) => c.category === categoryName);

  if (!categoryEntry) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-body text-muted-foreground">Category not found.</p>
      </div>
    );
  }

  const validateCategoryName = (name: string, excludeName?: string) =>
    store.validateUniqueName("category", name, { excludeName: excludeName ?? categoryName });

  const handleSave = (
    entry: CategoryEntry,
    specsByService: Record<string, string[]>
  ) => {
    store.saveWizardData(categoryName, entry, specsByService);
    router.push("/services");
  };

  return (
    <CategoryWizardForm
      mode="edit"
      initialCategory={categoryEntry}
      initialSpecs={store.specsByService}
      validateCategoryName={validateCategoryName}
      onSave={handleSave}
    />
  );
}
