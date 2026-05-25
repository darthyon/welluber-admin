"use client";

import { useRouter } from "next/navigation";
import { useServiceTaxonomyStore } from "@/hooks/use-service-taxonomy-store";
import { CategoryWizardForm } from "@/components/host/services/category-wizard-form";
import type { CategoryEntry } from "@/hooks/use-service-taxonomy-store";

export default function NewServiceCategoryPage() {
  const router = useRouter();
  const store = useServiceTaxonomyStore();

  const validateCategoryName = (name: string) =>
    store.validateUniqueName("category", name);

  const handleSave = (
    entry: CategoryEntry,
    specsByService: Record<string, string[]>
  ) => {
    store.saveWizardData(null, entry, specsByService);
    router.push("/services");
  };

  return (
    <CategoryWizardForm
      mode="create"
      validateCategoryName={validateCategoryName}
      onSave={handleSave}
    />
  );
}
