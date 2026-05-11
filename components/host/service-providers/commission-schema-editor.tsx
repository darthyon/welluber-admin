"use client";

import { useMemo } from "react";
import type { CommissionSchemaRow } from "@/types/provider";

interface CommissionSchemaEditorProps {
  spId: string;
  serviceCategories: string[];
  initialRows: CommissionSchemaRow[];
}

export function CommissionSchemaEditor({ spId, serviceCategories, initialRows }: CommissionSchemaEditorProps) {
  void spId;
  const portfolioRows = useMemo(() => initialRows || [], [initialRows]);

  if (serviceCategories.length === 0) {
    return (
        <p className="text-body text-subtle italic">
          No service categories assigned to the brand. Contact support to update the brand&apos;s allowed categories.
        </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <div className="grid grid-cols-[1fr_120px_120px_120px_120px] gap-4 px-4 py-3 bg-muted/20 border-b border-border">
          <p className="text-label font-semibold text-faint text-left">Main Service</p>
          <p className="text-label font-semibold text-faint text-right">First Level Qty</p>
          <p className="text-label font-semibold text-faint text-right">First Level Rate</p>
          <p className="text-label font-semibold text-faint text-right">Subsequent Level Qty</p>
          <p className="text-label font-semibold text-faint text-right">Subsequent Level Rate</p>
        </div>

        <div className="divide-y divide-border/50">
          {portfolioRows.length === 0 ? (
            <div className="p-8 text-center bg-muted/5">
              <p className="text-body text-subtle italic">No services added to portfolio yet.</p>
            </div>
          ) : (
            portfolioRows.map((row: CommissionSchemaRow) => (
              <div key={row.mainService} className="grid grid-cols-[1fr_120px_120px_120px_120px] gap-4 items-center px-4 py-4 hover:bg-muted/5 transition-colors">
                <p className="text-body font-medium text-foreground">{row.mainService}</p>
                <p className="text-body font-medium text-foreground text-right font-mono">{row.firstLevelQty}</p>
                <p className="text-body font-medium text-foreground text-right font-mono">{(row.firstLevelRate * 100).toFixed(1)}%</p>
                <p className="text-body font-medium text-foreground text-right font-mono">{row.subsequentLevelQty}</p>
                <p className="text-body font-medium text-foreground text-right font-mono">{(row.subsequentLevelRate * 100).toFixed(1)}%</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
