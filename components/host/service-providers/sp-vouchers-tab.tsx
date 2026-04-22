"use client";

import { useState } from "react";
import { Plus, Ticket } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSection } from "@/components/shared/detail-section";
import { FilterItem } from "@/components/shared/filter-item";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { SpVoucherForm } from "./sp-voucher-form";
import type { ServiceProvider, SpVoucher, SpVoucherStatus } from "@/types/provider";
import { ActionPopover } from "@/components/shared/action-popover";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import { SharedDataTable } from "@/components/shared/data-table";
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

const STATUS_VARIANT: Record<SpVoucherStatus, "emerald" | "amber" | "zinc" | "rose" | "primary"> = {
  draft: "zinc",
  published: "amber",
  activated: "emerald",
  paused: "rose",
  ended: "zinc",
};

export function SpVouchersTab({ sp }: SpVouchersTabProps) {
  const [view, setView] = useQueryState("voucherView", "list");
  const [isReadOnly, setIsReadOnly] = useQueryState("voucherReadOnly", "false");
  const [selectedVoucherId, setSelectedVoucherId] = useQueryState("voucherId");
  const updateQueryParams = useUpdateQueryParams();
  
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

  const handleView = (voucher: SpVoucher) => {
    updateQueryParams({
      voucherView: "form",
      voucherId: voucher.id,
      voucherReadOnly: "true"
    });
  };

  const handleEdit = (voucher: SpVoucher) => {
    updateQueryParams({
      voucherView: "form",
      voucherId: voucher.id,
      voucherReadOnly: "false"
    });
  };

  const handleAdd = () => {
    updateQueryParams({
      voucherView: "form",
      voucherId: null,
      voucherReadOnly: "false"
    });
  };

  const handleBack = () => {
    updateQueryParams({
      voucherView: "list",
      voucherId: null,
      voucherReadOnly: null
    });
  };

  if (view === "form") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <SpVoucherForm
          spId={sp.id}
          spServiceCategories={sp.serviceCategories}
          spBranches={sp.branches.map((b) => ({ id: b.id, name: b.name }))}
          voucher={selectedVoucher}
          isReadOnly={isReadOnly === "true"}
          onEdit={() => setIsReadOnly("false")}
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
          <Button size="sm" variant="secondary" className="h-8 text-label gap-2" onClick={handleAdd}>
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
            <SharedDataTable
              data={filteredVouchers}
              columns={[
                {
                  header: "Voucher",
                  accessorKey: "name",
                  sortable: true,
                  render: (voucher) => (
                    <div className="space-y-1">
                      <p className="text-nav font-semibold text-foreground leading-none">{voucher.name}</p>
                      <p className="text-caption font-mono text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded leading-none border border-border/50">
                        {voucher.code}
                      </p>
                    </div>
                  ),
                },
                {
                  header: "Description",
                  accessorKey: "description",
                  render: (voucher) => (
                    <p className="text-label text-muted-foreground leading-relaxed line-clamp-2 max-w-[300px]">
                      {voucher.description || "—"}
                      {voucher.bookingRequired && (
                        <span className="ml-2 inline-flex items-center gap-1 text-micro font-semibold text-primary/70 tracking-tighter bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                          Booking Required
                        </span>
                      )}
                    </p>
                  ),
                },
                {
                  header: "Period",
                  render: (voucher) => (
                    <div className="text-caption text-muted-foreground space-y-0.5">
                      <p className="font-medium text-foreground/80">{new Date(voucher.activationPeriod.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      {voucher.activationPeriod.endDate ? (
                        <p className="opacity-70">→ {new Date(voucher.activationPeriod.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      ) : (
                        <p className="text-micro text-muted-foreground/60 italic">Open-ended</p>
                      )}
                    </div>
                  ),
                },
                {
                  header: "Price (RM)",
                  accessorKey: "finalPrice",
                  sortable: true,
                  render: (voucher) => (
                    <div className="space-y-0.5">
                      {voucher.initialPrice !== voucher.finalPrice && (
                        <p className="text-micro text-muted-foreground/60 line-through">RM {voucher.initialPrice}</p>
                      )}
                      <p className="text-nav font-semibold text-foreground font-mono">RM {voucher.finalPrice}</p>
                    </div>
                  ),
                },
                {
                  header: "Status",
                  accessorKey: "status",
                  sortable: true,
                  render: (voucher) => (
                    <StatusBadge
                      status={voucher.status}
                      variant={STATUS_VARIANT[voucher.status]}
                      className="w-fit"
                    />
                  ),
                },
                {
                  header: "",
                  align: "right",
                  render: (voucher) => (
                    <div className="flex justify-end pr-1">
                      <ActionPopover
                        actions={[
                          { label: "View Voucher", onClick: () => handleView(voucher) },
                          { label: "Edit Voucher", onClick: () => handleEdit(voucher) },
                          { label: "Suspend Voucher", onClick: () => console.log("Suspend", voucher.id) },
                          { label: "Remove Voucher", isDanger: true, onClick: () => console.log("Remove", voucher.id) },
                        ]}
                      />
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </DetailSection>
    </div>
  );
}
