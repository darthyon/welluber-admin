"use client";

import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle, PencilSimpleLine, Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CommissionSchemaSheet } from "./commission-schema-sheet";
import type { CommissionSchemaRow } from "@/types/provider";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";

interface CommissionSchemaEditorProps {
  spId: string;
  serviceCategories: string[];
  initialRows: CommissionSchemaRow[];
}

export function CommissionSchemaEditor({ spId, serviceCategories, initialRows }: CommissionSchemaEditorProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // The portfolio is exactly what is stored in initialRows
  const portfolioRows = useMemo(() => initialRows || [], [initialRows]);

  if (serviceCategories.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground italic">
        No service categories assigned. Add categories to define your service portfolio.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-help transition-colors">
                <Info size={18} weight="fill" className="text-amber-500" />
                <span className="text-[13px] font-medium leading-none">Portfolio Info</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[280px]">
              <p className="text-[12px] leading-relaxed">
                Define your service portfolio and configure tiered commission rates.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} size="sm" variant="outline" className="shrink-0 h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 text-primary">
          <PencilSimpleLine size={16} />
          Edit Portfolio
        </Button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-background">
        <div className="grid grid-cols-[200px_1fr_120px] gap-4 px-4 py-3 bg-muted/20 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">Main Service</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">Commission Tiers</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Status</p>
        </div>

        <div className="divide-y divide-border/50">
          {portfolioRows.length === 0 ? (
            <div className="p-8 text-center bg-muted/5">
              <p className="text-[13px] text-muted-foreground italic">No services added to portfolio yet.</p>
            </div>
          ) : (
            portfolioRows.map((row: CommissionSchemaRow) => (
              <div key={row.mainService} className="grid grid-cols-[200px_1fr_120px] gap-4 items-center px-4 py-4 hover:bg-muted/5 transition-colors">
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-foreground">{row.mainService}</p>
                  <p className="text-[10px] text-muted-foreground">Tiered % Rate</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {row.tiers.map((tier: any, idx: number) => (
                    <div key={idx} className="flex flex-col px-3 py-1.5 bg-muted/30 border border-border/50 rounded-lg min-w-[100px]">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        {idx === 0 ? "Base" : `Qty: ${tier.limit}+`}
                      </span>
                      <span className="text-[13px] font-bold text-foreground">
                        {(tier.rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end items-center gap-1.5 text-emerald-600 text-[12px] font-medium">
                  <CheckCircle size={14} weight="fill" />
                  Active
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CommissionSchemaSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        spId={spId}
        serviceCategories={serviceCategories}
        initialRows={portfolioRows}
      />
    </div>
  );
}
