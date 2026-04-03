"use client";

import { useState } from "react";
import { Plus, Ticket } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { SpVoucherForm } from "./sp-voucher-form";
import type { ServiceProvider, SpVoucher, SpVoucherStatus } from "@/types/provider";
import { cn } from "@/lib/utils";

interface SpVouchersTabProps {
  sp: ServiceProvider;
}

type VoucherView = "list" | "form";

const STATUS_FILTER_TABS: { label: string; value: SpVoucherStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Activated", value: "activated" },
  { label: "Paused", value: "paused" },
  { label: "Ended", value: "ended" },
];

const STATUS_VARIANT: Record<SpVoucherStatus, "emerald" | "amber" | "indigo" | "zinc" | "rose"> = {
  draft: "zinc",
  published: "amber",
  activated: "emerald",
  paused: "rose",
  ended: "zinc",
};

export function SpVouchersTab({ sp }: SpVouchersTabProps) {
  const [view, setView] = useState<VoucherView>("list");
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<SpVoucherStatus | "all">("all");

  const selectedVoucher = sp.vouchers.find((v) => v.id === selectedVoucherId);

  const filteredVouchers = sp.vouchers.filter(
    (v) => statusTab === "all" || v.status === statusTab
  );

  const handleEdit = (voucher: SpVoucher) => {
    setSelectedVoucherId(voucher.id);
    setView("form");
  };

  const handleAdd = () => {
    setSelectedVoucherId(null);
    setView("form");
  };

  const handleBack = () => {
    setSelectedVoucherId(null);
    setView("list");
  };

  if (view === "form") {
    return (
      <div className="space-y-4">
        <h3 className="text-[15px] font-semibold text-foreground">
          {selectedVoucher ? `Edit — ${selectedVoucher.name}` : "Create New Voucher"}
        </h3>
        <SpVoucherForm
          spId={sp.id}
          spServiceCategories={sp.serviceCategories}
          spBranches={sp.branches.map((b) => ({ id: b.id, name: b.name }))}
          voucher={selectedVoucher}
          onSuccess={handleBack}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted/40 border border-border rounded-lg p-1">
          {STATUS_FILTER_TABS.map(({ label, value }) => {
            const count = value === "all" ? sp.vouchers.length : sp.vouchers.filter((v) => v.status === value).length;
            return (
              <button
                key={value}
                onClick={() => setStatusTab(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors",
                  statusTab === value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                {count > 0 && (
                  <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center", statusTab === value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <Button size="sm" className="h-9 text-[13px] gap-2" onClick={handleAdd}>
          <Plus size={15} weight="bold" /> Create Voucher
        </Button>
      </div>

      {/* Voucher list */}
      {filteredVouchers.length === 0 ? (
        <EmptyState
          icon={<Ticket size={32} weight="light" />}
          title={statusTab === "all" ? "No vouchers yet" : `No ${statusTab} vouchers`}
          description={statusTab === "all" ? "Create your first voucher to make services purchasable." : ""}
          action={statusTab === "all" ? (
            <Button onClick={handleAdd} size="sm" className="gap-2">
              <Plus size={14} /> Create First Voucher
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_140px_120px_100px_80px] gap-3 px-4 py-2.5 bg-muted/30 border-b border-border">
            {["Voucher", "Code", "Activation", "Price (RM)", "Status", ""].map((h) => (
              <p key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</p>
            ))}
          </div>

          {filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              onClick={() => handleEdit(voucher)}
              className="grid grid-cols-[1fr_120px_140px_120px_100px_80px] gap-3 px-4 py-3.5 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer items-center"
            >
              <div>
                <p className="text-[13px] font-semibold text-foreground">{voucher.name}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{voucher.description}</p>
              </div>

              <span className="text-[11px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded truncate">
                {voucher.code}
              </span>

              <div className="text-[11px] text-muted-foreground">
                <p>{new Date(voucher.activationPeriod.startDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</p>
                {voucher.activationPeriod.endDate ? (
                  <p>→ {new Date(voucher.activationPeriod.endDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</p>
                ) : (
                  <p className="text-muted-foreground/60 italic">Open-ended</p>
                )}
              </div>

              <div>
                {voucher.initialPrice !== voucher.finalPrice && (
                  <p className="text-[10px] text-muted-foreground line-through">RM {voucher.initialPrice}</p>
                )}
                <p className="text-[13px] font-bold text-foreground font-mono">RM {voucher.finalPrice}</p>
              </div>

              <StatusBadge
                status={voucher.status}
                variant={STATUS_VARIANT[voucher.status]}
              />

              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(voucher); }}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
