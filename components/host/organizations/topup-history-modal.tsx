"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ClockCounterClockwise, 
  DownloadSimple, 
  CheckCircle, 
  Clock, 
  WarningCircle,
  MagnifyingGlass,
  Funnel,
  ArrowRight
} from "@phosphor-icons/react";
import { getTopupHistory } from "@/features/manual-topup/actions";
import { TopupTransaction } from "@/features/manual-topup/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";

interface TopUpHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
}

export function TopUpHistoryModal({ isOpen, onClose, branchId, branchName }: TopUpHistoryModalProps) {
  const [history, setHistory] = useState<TopupTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getTopupHistory(branchId).then((data) => {
        setHistory(data);
        setIsLoading(false);
      });
    }
  }, [isOpen, branchId]);

  if (!isOpen) return null;

  const getStatusVariant = (status: string): "emerald" | "amber" | "rose" | "zinc" => {
    switch (status) {
      case "completed": return "emerald";
      case "pending": return "amber";
      case "failed":
      case "rejected": return "rose";
      default: return "zinc";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "bank_transfer": return "Bank Transfer";
      case "cheque": return "Cheque";
      case "cash": return "Cash";
      case "credit_card": return "Credit Card";
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-lg shadow-lg border border-border flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ClockCounterClockwise size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground tracking-tight leading-tight">Top-Up History</h3>
              <p className="text-label text-muted-foreground font-medium tracking-wider mt-0.5">
                {branchName} Wallet Transactions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/5">
          <div className="relative w-64">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-body outline-none transition-colors focus:border-border focus:ring-1 focus:ring-ring"
              placeholder="Search by ref number..."
            />
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-label flex items-center gap-1.5">
            <Funnel size={14} /> Filter
          </Button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-body font-medium">Fetching history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Clock size={24} weight="duotone" />
              </div>
              <p className="text-body font-medium">No top-up history found</p>
              <p className="text-label">Completed transactions will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-label font-semibold text-subtle">Paid Date</th>
                  <th className="px-4 py-3 text-label font-semibold text-subtle">Amount</th>
                  <th className="px-4 py-3 text-label font-semibold text-subtle">Method</th>
                  <th className="px-4 py-3 text-label font-semibold text-subtle">Reference</th>
                  <th className="px-4 py-3 text-label font-semibold text-subtle text-right">Status</th>
                  <th className="px-4 py-3 text-label font-semibold text-subtle text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {history.map((txn) => (
                  <tr key={txn.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-4 py-3 text-body font-medium text-foreground">
                      {format(new Date(txn.paidDate), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-body font-medium text-foreground">
                      RM {txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-label text-muted-foreground">
                      {getMethodLabel(txn.method)}
                    </td>
                    <td className="px-4 py-3 text-label text-muted-foreground font-mono">
                      {txn.referenceNo || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={txn.status} variant={getStatusVariant(txn.status)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted" title="View Attachment">
                        <DownloadSimple size={14} className="text-muted-foreground group-hover:text-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between text-label text-muted-foreground bg-muted/10">
          <div>Showing {history.length} records</div>
          <div className="flex items-center gap-1">
            Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
}
