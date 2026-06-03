"use client";

import { useState } from "react";
import { Plus, Ticket } from "@phosphor-icons/react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { FilterItem } from "@/components/shared/filter-item";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { SpVoucherForm } from "./sp-voucher-form";
import { SpVoucherDetailView } from "./sp-voucher-detail-view";
import type { ServiceProvider, SpVoucher, SpVoucherStatus } from "@/types/provider";
import { ActionPopover } from "@/components/shared/action-popover";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import { SharedDataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface SpVouchersTabProps {
  sp: ServiceProvider;
}

const STATUS_FILTER_TABS: { label: string; value: SpVoucherStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Expired", value: "expired" },
];

const STATUS_VARIANT: Record<SpVoucherStatus, "emerald" | "zinc" | "rose"> = {
  draft: "zinc",
  published: "emerald",
  expired: "rose",
};

export function SpVouchersTab({ sp }: SpVouchersTabProps) {
  const [view, setView] = useQueryState("voucherView", "list");
  const [selectedVoucherId] = useQueryState("voucherId");
  const updateQueryParams = useUpdateQueryParams();
  
  const [statusTab, setStatusTab] = useState<SpVoucherStatus | "all">("all");
  const [voucherSearch, setVoucherSearch] = useState("");

  const selectedVoucher = sp.vouchers.find((v) => v.id === selectedVoucherId);
  const branchNames = sp.branches.map((b) => ({ id: b.id, name: b.name }));

  const filteredVouchers = sp.vouchers.filter(
    (v) =>
      (statusTab === "all" || v.status === statusTab) &&
      [v.name, v.description, v.code].some((field) =>
        field.toLowerCase().includes(voucherSearch.toLowerCase())
      )
  );

  const handleView = (voucher: SpVoucher) => {
    updateQueryParams({
      voucherView: "detail",
      voucherId: voucher.id,
      voucherReadOnly: null,
    });
  };

  const handleEdit = (voucher: SpVoucher) => {
    updateQueryParams({
      voucherView: "edit",
      voucherId: voucher.id,
      voucherReadOnly: null,
    });
  };

  const handleAdd = () => {
    updateQueryParams({
      voucherView: "add",
      voucherId: null,
      voucherReadOnly: null,
    });
  };

  const handleBack = () => {
    updateQueryParams({
      voucherView: "list",
      voucherId: null,
      voucherReadOnly: null,
    });
  };

  if (view === "detail" && selectedVoucher) {
    return (
      <SpVoucherDetailView
        voucher={selectedVoucher}
        serviceCategories={sp.serviceCategories}
        branchNames={branchNames}
        onBack={handleBack}
        onEdit={() => setView("edit")}
      />
    );
  }

  if ((view === "add" || view === "edit") && (view === "add" || selectedVoucher)) {

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <SpVoucherForm
          spId={sp.id}
          spServiceCategories={sp.serviceCategories}
          spBranches={branchNames}
          voucher={view === "edit" ? selectedVoucher : undefined}
          onSuccess={handleBack}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-semibold text-foreground">Voucher Package</h2>
          <p className="text-body text-subtle">Create and manage provider vouchers, publish states, and activation periods.</p>
        </div>
        <Button size="sm" variant="secondary" className="h-8 text-label gap-2" onClick={handleAdd}>
          <Plus size={14} weight="bold" /> Add voucher
        </Button>
      </div>
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
              freezeFirst
              freezeLast
              columns={[
                {
                  header: "Voucher",
                  accessorKey: "name",
                  sortable: true,
                  render: (voucher) => (
                    <div className="space-y-1">
                      <p className="text-body font-medium text-foreground leading-none">{voucher.name}</p>
                      <p className="text-label font-mono text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded leading-none border border-border/50">
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
                        <Badge variant="secondary" className="ml-2 text-label font-medium">
                          Booking Required
                        </Badge>
                      )}
                    </p>
                  ),
                },
                {
                  header: "Period",
                  render: (voucher) => (
                    <div className="text-label space-y-0.5">
                      <p className="font-medium text-subtle whitespace-nowrap">{formatDate(voucher.activationPeriod.startDate)}</p>
                      {voucher.activationPeriod.endDate ? (
                        <p className="text-subtle whitespace-nowrap">→ {formatDate(voucher.activationPeriod.endDate)}</p>
                      ) : (
                        <p className="text-faint italic">Open-ended</p>
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
                        <p className="text-label text-faint line-through">RM {voucher.initialPrice}</p>
                      )}
                      <p className="text-body font-medium text-foreground font-mono">RM {voucher.finalPrice}</p>
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
                          { label: "View Voucher Package", onClick: () => handleView(voucher) },
                          { label: "Edit Voucher Package", onClick: () => handleEdit(voucher) },
                          { label: "Suspend Voucher", onClick: () => {} },
                          { label: "Remove Voucher", isDanger: true, onClick: () => {} },
                        ]}
                      />
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
    </div>
  );
}
