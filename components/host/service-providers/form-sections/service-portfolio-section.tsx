"use client";

import { Tag, WarningCircle } from "@phosphor-icons/react";
import type { FieldErrors } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";
import { z } from "zod";
import { createSpSchema } from "@/features/providers/schemas";

type SpFormData = z.input<typeof createSpSchema> & { brandName?: string; brandLogo?: File | string | null };
type TaxonomyCategory = { category: string; services: string[] };

interface ServicePortfolioSectionProps {
  selectedMainServices: string[];
  brandCategories: string[];
  handleServicesChange: (services: string[]) => void;
  errors: FieldErrors<SpFormData>;
  servicePortfolioTaxonomy: TaxonomyCategory[];
}

export function ServicePortfolioSection({
  selectedMainServices,
  brandCategories,
  handleServicesChange,
  errors,
  servicePortfolioTaxonomy,
}: ServicePortfolioSectionProps) {
  return (
    <div id="service-portfolio" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag size={16} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">Service Portfolio</h3>
            <p className="text-label text-muted-foreground">Select main services offered by this provider.</p>
          </div>
        </div>

        <div className="space-y-4">
          {brandCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-label font-medium text-faint w-full mb-1 uppercase tracking-wider">Allowed Categories</span>
              {brandCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="text-label font-medium bg-muted/40">{cat}</Badge>
              ))}
            </div>
          )}

          <SearchableMultiSelect
            taxonomy={servicePortfolioTaxonomy}
            selected={selectedMainServices}
            onChange={handleServicesChange}
            placeholder="Search services..."
          />
          {errors.mainServices && (
            <p className="text-label text-destructive flex items-center gap-1 font-medium">
              <WarningCircle size={12} weight="fill" /> {errors.mainServices.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
