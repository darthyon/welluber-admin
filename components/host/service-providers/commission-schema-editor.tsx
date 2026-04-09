"use client";

import { useMemo } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import type { CommissionSchemaRow } from "@/types/provider";

interface CommissionSchemaEditorProps {
  spId: string;
  serviceCategories: string[];
  initialRows: CommissionSchemaRow[];
}

export function CommissionSchemaEditor({ spId, serviceCategories, initialRows }: CommissionSchemaEditorProps) {
  const portfolioRows = useMemo(() => initialRows || [], [initialRows]);

  if (serviceCategories.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground italic">
        No service categories assigned to the brand. Contact support to update the brand's allowed categories.
      </p>
    );
  }

  return (
    <div className="space-y-4">
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

    </div>
  );
}
