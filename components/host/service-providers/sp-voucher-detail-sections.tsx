"use client";

import { ListBullets, PencilSimpleLine, Ticket } from "@phosphor-icons/react";
import { BackButton } from "@/components/shared/back-button";
import { EntityHeader } from "@/components/shared/entity-header";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SpVoucher, SpVoucherStatus } from "@/types/provider";

export const SP_VOUCHER_ANCHOR_ITEMS = [
  { id: "voucher-details", label: "Voucher Details" },
  { id: "commercials", label: "Commercials" },
  { id: "service-lines", label: "Service Line Items" },
  { id: "lifecycle", label: "Lifecycle & Validity" },
  { id: "branch-assignment", label: "Branch Assignment" },
  { id: "booking", label: "Booking & Display" },
];

export const SP_VOUCHER_STATUS_VARIANT: Record<SpVoucherStatus, "emerald" | "zinc" | "rose"> = {
  draft: "zinc",
  published: "emerald",
  expired: "rose",
};

export function SpVoucherDetailHeader({ onBack, onEdit, voucher }: { onBack: () => void; onEdit: () => void; voucher: SpVoucher; }) {
  return (
    <div className="flex flex-col gap-4">
      <BackButton onClick={onBack} label="Back to Voucher Package" />
      <EntityHeader
        title={voucher.name}
        subtitle="Voucher Package"
        status={voucher.status}
        statusVariant={SP_VOUCHER_STATUS_VARIANT[voucher.status]}
        icon={<Ticket size={24} weight="fill" />}
        actions={
          <Button variant="secondary" size="lg" className="gap-2 rounded-full text-body font-medium transition-all" onClick={onEdit}>
            <PencilSimpleLine size={16} weight="bold" />
            Edit Voucher Package
          </Button>
        }
      />
    </div>
  );
}

export function SpVoucherDetailSidebar() {
  return (
    <aside className="sticky top-20 hidden w-52 shrink-0 self-start xl:block">
      <FloatingAnchorNav items={SP_VOUCHER_ANCHOR_ITEMS} />
    </aside>
  );
}

export function SpVoucherServiceLinesSection({ customServices, groups }: { customServices: string[]; groups: Array<{ category: string; services: Array<{ name: string; subServices: string[] }> }>; }) {
  return (
    <div id="service-lines" className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 pb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><ListBullets size={16} weight="fill" /></div>
          <div className="space-y-0.5">
            <h3 className="text-lead font-semibold text-foreground">Service Line Items</h3>
            <p className="text-label text-muted-foreground">Specific services included in this voucher package.</p>
          </div>
        </div>

        {groups.length === 0 && customServices.length === 0 ? (
          <p className="text-body italic text-subtle">No service lines configured.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.category} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                <div>
                  <p className="text-body font-medium uppercase tracking-wider text-foreground">{group.category}</p>
                  <p className="text-label text-muted-foreground">{group.services.length} Main Service{group.services.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="space-y-2">
                  {group.services.map((service) => (
                    <div key={service.name} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                      <p className="text-body font-medium text-foreground">{service.name}</p>
                      {service.subServices.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {service.subServices.map((subService) => <Badge key={subService} variant="secondary" className="text-label font-medium">{subService}</Badge>)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {customServices.length > 0 ? (
              <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/10 p-4">
                <div>
                  <p className="text-body font-medium uppercase tracking-wider text-foreground">Custom Services</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customServices.map((service) => <Badge key={service} variant="outline" className="text-label">{service}</Badge>)}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
