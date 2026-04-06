"use client";

import { useState } from "react";
import { Plus, Ticket } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSection } from "@/components/shared/detail-section";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { SpVoucherForm } from "./sp-voucher-form";
import type { ServiceProvider, SpVoucher, SpVoucherStatus } from "@/types/provider";
import { ActionPopover } from "@/components/shared/action-popover";
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
  const [voucherSearch, setVoucherSearch] = useState("");

  const selectedVoucher = sp.vouchers.find((v) => v.id === selectedVoucherId);

  const filteredVouchers = sp.vouchers.filter(
    (v) =>
      (statusTab === "all" || v.status === statusTab) &&
      [v.name, v.description, v.code].some((field) =>
        field.toLowerCase().includes(voucherSearch.toLowerCase())
      )
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
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
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
      <DetailSection
        title="Vouchers"
        icon={<Ticket size={16} weight="fill" />}
        description="Create and manage provider vouchers, publish states, and activation periods."
        action={
          <Button size="sm" variant="secondary" className="h-8 text-[12px] gap-2" onClick={handleAdd}>
            <Plus size={14} weight="bold" /> Add voucher
          </Button>
        }
      >
        <div className="space-y-4">
          <DataFilterBar
            searchQuery={voucherSearch}
            onSearchChange={setVoucherSearch}
            searchPlaceholder="Search vouchers..."
            filters={
              <FilterItem
                label="Status"
                value={statusTab}
                onChange={(value) => setStatusTab(value as SpVoucherStatus | "all")}
                options={STATUS_FILTER_TABS.map(({ label, value }) => ({
                  label: `${label}${value === "all" ? "" : ` (${sp.vouchers.filter((v) => v.status === value).length})`}`,
                  value,
                }))}
              />
            }
          />

          {filteredVouchers.length === 0 ? (
            <EmptyState
              icon={<Ticket size={32} weight="light" />}
              title={voucherSearch || statusTab !== "all" ? "No vouchers found" : "No vouchers yet"}
              description={voucherSearch || statusTab !== "all" ? "Try another search or clear the status filter." : "Create your first voucher to make services purchasable."}
              action={statusTab === "all" && !voucherSearch ? (
                <Button onClick={handleAdd} size="sm" className="gap-2">
                  <Plus size={14} /> Add First Voucher
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-[1.2fr_1.8fr_140px_110px_100px_48px] gap-4 px-5 py-3 bg-muted/40 border-b border-border">
                {["Voucher", "Description", "Period", "Price (RM)", "Status", ""].map((h) => (
                  <p key={h} className="text-[13px] font-semibold text-muted-foreground/80 tracking-tight">{h}</p>
                ))}
              </div>

              {filteredVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="grid grid-cols-[1.2fr_1.8fr_140px_110px_100px_48px] gap-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors items-center"
                >
                  <div className="space-y-1">
                    <p className="text-[13px] font-semibold text-foreground leading-none">{voucher.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded leading-none border border-border/50">
                      {voucher.code}
                    </p>
                  </div>

                  <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
                    {voucher.summary || voucher.description || "—"}
                    {voucher.bookingRequired && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary/70 uppercase tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                        Booking Required
                      </span>
                    )}
                  </p>

                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <p className="font-medium text-foreground/80">{new Date(voucher.activationPeriod.startDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</p>
                    {voucher.activationPeriod.endDate ? (
                      <p className="opacity-70">→ {new Date(voucher.activationPeriod.endDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 italic">Open-ended</p>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {voucher.initialPrice !== voucher.finalPrice && (
                      <p className="text-[10px] text-muted-foreground/60 line-through">RM {voucher.initialPrice}</p>
                    )}
                    <p className="text-[13px] font-semibold text-foreground font-mono">RM {voucher.finalPrice}</p>
                  </div>

                  <div className="flex">
                    <StatusBadge
                      status={voucher.status}
                      variant={STATUS_VARIANT[voucher.status]}
                      className="w-fit"
                    />
                  </div>

                  <div className="flex justify-end pr-1">
                    <ActionPopover
                      actions={[
                        { label: "View Voucher", onClick: () => handleEdit(voucher) }, // Placeholder for View
                        { label: "Edit Voucher", onClick: () => handleEdit(voucher) },
                        { label: "Suspend Voucher", onClick: () => console.log("Suspend", voucher.id) },
                        { label: "Remove Voucher", isDanger: true, onClick: () => console.log("Remove", voucher.id) },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailSection>
    </div>
  );
}
