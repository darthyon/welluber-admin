"use client";

import { useCallback } from "react";
import { useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import { Tag, WarningCircle, Trash } from "@phosphor-icons/react";
import { z } from "zod";
import { createSpSchema } from "@/features/providers/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";

type BaseSpFormData = z.input<typeof createSpSchema>;
type TaxonomyCategory = { category: string; services: string[] };

interface ServicePortfolioSectionProps {
  control: Control<BaseSpFormData>;
  selectedMainServices: string[];
  brandCategories: string[];
  handleServicesChange: (services: string[]) => void;
  errors: FieldErrors<BaseSpFormData>;
  servicePortfolioTaxonomy: TaxonomyCategory[];
}

export function ServicePortfolioSection({
  control,
  selectedMainServices,
  brandCategories,
  handleServicesChange,
  errors,
  servicePortfolioTaxonomy,
}: ServicePortfolioSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "commissionSchema",
  });

  const syncAndNotify = useCallback(
    (nextServices: string[]) => {
      const prevServices = selectedMainServices;

      const added = nextServices.filter((s) => !prevServices.includes(s));
      const removed = prevServices.filter((s) => !nextServices.includes(s));

      added.forEach((service) => {
        append({
          mainService: service,
          firstLevelQty: 0,
          firstLevelRate: 0.1,
          subsequentLevelQty: 1,
          subsequentLevelRate: 0.1,
        });
      });

      removed.forEach((service) => {
        const idx = fields.findIndex((f) => f.mainService === service);
        if (idx !== -1) remove(idx);
      });

      handleServicesChange(nextServices);
    },
    [selectedMainServices, fields, append, remove, handleServicesChange]
  );

  return (
    <div id="service-portfolio" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag size={16} weight="fill" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">Service Portfolio</h3>
            <p className="text-label text-muted-foreground">Select main services and configure commission rates.</p>
          </div>
        </div>

        <div className="space-y-4">
          {brandCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-label font-medium text-faint w-full mb-1 uppercase tracking-wider">Allowed Categories</span>
              {brandCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-label font-medium bg-muted/40">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <SearchableMultiSelect
            taxonomy={servicePortfolioTaxonomy}
            selected={selectedMainServices}
            onChange={syncAndNotify}
            placeholder="Search services..."
          />
          {errors.mainServices && (
            <p className="text-label text-destructive flex items-center gap-1 font-medium">
              <WarningCircle size={12} weight="fill" /> {errors.mainServices.message}
            </p>
          )}
        </div>

        {/* Commission Rates */}
        {fields.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-label font-medium text-faint uppercase tracking-wider">Commission Rates</p>
            <div className="border border-border rounded-lg overflow-hidden bg-background">
              <div className="grid grid-cols-[1fr_100px_100px_100px_100px_48px] gap-3 px-4 py-2.5 bg-muted/20 border-b border-border items-center">
                <p className="text-label font-semibold text-faint">Main Service</p>
                <p className="text-label font-semibold text-faint text-right">First Level Qty</p>
                <p className="text-label font-semibold text-faint text-right">First Level Rate</p>
                <p className="text-label font-semibold text-faint text-right">Subsequent Qty</p>
                <p className="text-label font-semibold text-faint text-right">Subsequent Rate</p>
                <div />
              </div>
              <div className="divide-y divide-border/50">
                {fields.map((field, index) => {
                  const rowError = errors.commissionSchema?.[index];
                  return (
                    <div key={field.id} className="grid grid-cols-[1fr_100px_100px_100px_100px_48px] gap-3 px-4 py-3 items-center">
                      <p className="text-body font-medium text-foreground truncate">{field.mainService}</p>
                      <div className="space-y-1">
                        <input
                          type="number"
                          {...control.register(`commissionSchema.${index}.firstLevelQty`, { valueAsNumber: true })}
                          className="w-full h-9 px-2 text-right text-body font-mono bg-background border border-border rounded-md focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none"
                        />
                        {rowError?.firstLevelQty && (
                          <p className="text-label text-destructive text-right">{rowError.firstLevelQty.message}</p>
                        )}
                      </div>
                      <div className="space-y-1 relative">
                        <input
                          type="number"
                          step="0.01"
                          {...control.register(`commissionSchema.${index}.firstLevelRate`, { valueAsNumber: true })}
                          className="w-full h-9 px-2 pr-6 text-right text-body font-mono bg-background border border-border rounded-md focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-label text-muted-foreground pointer-events-none">%</span>
                        {rowError?.firstLevelRate && (
                          <p className="text-label text-destructive text-right">{rowError.firstLevelRate.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <input
                          type="number"
                          {...control.register(`commissionSchema.${index}.subsequentLevelQty`, { valueAsNumber: true })}
                          className="w-full h-9 px-2 text-right text-body font-mono bg-background border border-border rounded-md focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none"
                        />
                        {rowError?.subsequentLevelQty && (
                          <p className="text-label text-destructive text-right">{rowError.subsequentLevelQty.message}</p>
                        )}
                      </div>
                      <div className="space-y-1 relative">
                        <input
                          type="number"
                          step="0.01"
                          {...control.register(`commissionSchema.${index}.subsequentLevelRate`, { valueAsNumber: true })}
                          className="w-full h-9 px-2 pr-6 text-right text-body font-mono bg-background border border-border rounded-md focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-label text-muted-foreground pointer-events-none">%</span>
                        {rowError?.subsequentLevelRate && (
                          <p className="text-label text-destructive text-right">{rowError.subsequentLevelRate.message}</p>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            syncAndNotify(selectedMainServices.filter((s) => s !== field.mainService));
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
