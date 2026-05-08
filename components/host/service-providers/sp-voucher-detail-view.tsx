"use client";

import {
  PencilSimpleLine,
  Ticket,
  CurrencyCircleDollar,
  ListBullets,
  Stack,
  Buildings,
  CalendarBlank,
} from "@phosphor-icons/react";
import { DetailField } from "@/components/shared/detail-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import Image from "next/image";
import { BackButton } from "@/components/shared/back-button";
import { EntityHeader } from "@/components/shared/entity-header";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { resolveBranchServiceView } from "@/features/providers/service-taxonomy";
import type { SpVoucher, SpVoucherStatus } from "@/types/provider";

interface SpVoucherDetailViewProps {
  voucher: SpVoucher;
  serviceCategories: string[];
  branchNames: { id: string; name: string }[];
  onBack: () => void;
  onEdit: () => void;
}

const STATUS_VARIANT: Record<
  SpVoucherStatus,
  "emerald" | "amber" | "zinc" | "rose"
> = {
  draft: "zinc",
  published: "amber",
  activated: "emerald",
  paused: "rose",
  ended: "zinc",
};

const ANCHOR_ITEMS = [
  { id: "voucher-details", label: "Voucher Details" },
  { id: "commercials", label: "Commercials" },
  { id: "service-lines", label: "Service Line Items" },
  { id: "lifecycle", label: "Lifecycle & Validity" },
  { id: "branch-assignment", label: "Branch Assignment" },
  { id: "booking", label: "Booking & Display" },
];

export function SpVoucherDetailView({
  voucher,
  serviceCategories,
  branchNames,
  onBack,
  onEdit,
}: SpVoucherDetailViewProps) {
  const { groups, customServices } = resolveBranchServiceView(
    serviceCategories,
    voucher.serviceLines
  );

  const assignedBranches =
    voucher.branchScope === "all"
      ? ["All Branches"]
      : voucher.branchIds
          .map((id) => branchNames.find((b) => b.id === id)?.name)
          .filter(Boolean) as string[];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back + Header */}
      <div className="flex flex-col gap-4">
        <BackButton onClick={onBack} label="Back to Voucher Package" />

        <EntityHeader
          title={voucher.name}
          subtitle="Voucher Package"
          status={voucher.status}
          statusVariant={STATUS_VARIANT[voucher.status]}
          icon={<Ticket size={24} weight="fill" />}
          actions={
            <Button
              variant="secondary"
              size="lg"
              className="text-body font-medium rounded-full gap-2 transition-all shadow-sm"
              onClick={onEdit}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Voucher Package
            </Button>
          }
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative">
        {/* Left Column: Jump-to-section Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: View Sections */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Voucher Details */}
            <div
              id="voucher-details"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Ticket size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Voucher Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Voucher Name" value={voucher.name} />
                  <DetailField
                    label="Voucher Code"
                    value={
                      <span className="font-mono text-body text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                        {voucher.code}
                      </span>
                    }
                  />
                </div>

                <DetailField
                  label="Description"
                  value={voucher.description || undefined}
                />

                {voucher.summary && (
                  <DetailField label="Summary" value={voucher.summary} />
                )}

                <div className="space-y-1.5">
                  <p className="text-label font-medium text-subtle">Status</p>
                  <StatusBadge
                    status={voucher.status}
                    variant={STATUS_VARIANT[voucher.status]}
                  />
                </div>

                {voucher.photo && (
                  <div className="space-y-2">
                    <p className="text-label font-medium text-subtle">
                      Display Image
                    </p>
                    <div className="relative w-40 h-24 rounded-lg border border-border bg-muted/30 overflow-hidden">
                      <Image
                        src={voucher.photo}
                        alt={voucher.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Commercials */}
            <div
              id="commercials"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CurrencyCircleDollar size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Commercials
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailField label="Currency" value={voucher.currency} />
                  <DetailField
                    label="Initial Price"
                    value={
                      <span className="font-mono">
                        {voucher.currency} {voucher.initialPrice.toFixed(2)}
                      </span>
                    }
                  />
                  <DetailField
                    label="Final Price"
                    value={
                      <span className="font-mono text-primary font-semibold">
                        {voucher.currency} {voucher.finalPrice.toFixed(2)}
                      </span>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Service Line Items */}
            <div
              id="service-lines"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ListBullets size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Service Line Items
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Specific services included in this voucher package.
                    </p>
                  </div>
                </div>

                {groups.length === 0 && customServices.length === 0 ? (
                  <p className="text-body text-subtle italic">
                    No service lines configured.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <div
                        key={group.category}
                        className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
                      >
                        <div>
                          <p className="text-body font-medium text-foreground uppercase tracking-wider">
                            {group.category}
                          </p>
                          <p className="text-label text-muted-foreground">
                            {group.services.length} Main Service
                            {group.services.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {group.services.map((service) => (
                            <div
                              key={service.name}
                              className="rounded-lg border border-border bg-card p-3 shadow-sm"
                            >
                              <p className="text-body font-medium text-foreground">
                                {service.name}
                              </p>
                              {service.subServices.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {service.subServices.map((sub) => (
                                    <Badge
                                      key={sub}
                                      variant="secondary"
                                      className="text-label font-medium"
                                    >
                                      {sub}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {customServices.length > 0 && (
                      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4 space-y-3">
                        <div>
                          <p className="text-body font-medium text-foreground uppercase tracking-wider">
                            Custom Services
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {customServices.map((service) => (
                            <Badge
                              key={service}
                              variant="outline"
                              className="text-label"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lifecycle & Validity */}
            <div
              id="lifecycle"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Stack size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Lifecycle & Validity
                  </h3>
                </div>

                {/* Activation Period */}
                <div className="space-y-3">
                  <p className="text-body font-semibold text-foreground">
                    Activation Period
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField
                      label="Start Date"
                      value={new Date(
                        voucher.activationPeriod.startDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    />
                    <DetailField
                      label="End Date"
                      value={
                        voucher.activationPeriod.endDate
                          ? new Date(
                              voucher.activationPeriod.endDate
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Open-ended"
                      }
                    />
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                {/* Redemption Period */}
                <div className="space-y-3">
                  <p className="text-body font-semibold text-foreground">
                    Redemption Period
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailField
                      label="Mode"
                      value={
                        voucher.redemptionPeriod.mode === "after_purchase"
                          ? "Relative (after purchase)"
                          : "Fixed (exact date)"
                      }
                    />
                    {voucher.redemptionPeriod.mode === "after_purchase" ? (
                      <DetailField
                        label="Valid For"
                        value={`${voucher.redemptionPeriod.value} ${voucher.redemptionPeriod.unit}${
                          voucher.redemptionPeriod.value !== 1 ? "s" : ""
                        }`}
                      />
                    ) : voucher.redemptionPeriod.date ? (
                      <DetailField
                        label="Expiry Date"
                        value={new Date(
                          voucher.redemptionPeriod.date
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      />
                    ) : null}
                  </div>
                </div>

                {voucher.membershipStartDay &&
                  voucher.membershipStartDay !== "none" && (
                    <>
                      <div className="h-px bg-border/40" />
                      <div className="space-y-3">
                        <p className="text-body font-semibold text-foreground">
                          Membership Start Day
                        </p>
                        <DetailField
                          label="Starts On"
                          value={
                            voucher.membershipStartDay === "1st"
                              ? "1st of the month"
                              : "15th of the month"
                          }
                        />
                      </div>
                    </>
                  )}
              </div>
            </div>

            {/* Branch Assignment */}
            <div
              id="branch-assignment"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Buildings size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Branch Assignment
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Which locations accept this voucher.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <DetailField
                    label="Scope"
                    value={
                      voucher.branchScope === "all"
                        ? "All Branches"
                        : "Selected Branches"
                    }
                  />

                  {voucher.branchScope === "specific" && (
                    <div className="space-y-2">
                      <p className="text-label font-medium text-subtle">
                        Assigned Branches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {assignedBranches.length > 0 ? (
                          assignedBranches.map((name) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className="text-label font-medium px-3 py-1 bg-muted border-border"
                            >
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-body text-subtle italic">
                            No branches assigned.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking & Display */}
            <div
              id="booking"
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarBlank size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Booking & Display
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-label font-medium text-subtle">
                      Booking Required
                    </p>
                    <StatusBadge
                      status={voucher.bookingRequired ? "Yes" : "No"}
                      variant={voucher.bookingRequired ? "emerald" : "zinc"}
                    />
                  </div>
                  {voucher.displayLocation?.line && (
                    <DetailField
                      label="Display Location"
                      value={voucher.displayLocation.line}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to allow last sections to scroll to top */}
      <div className="h-64" />
    </div>
  );
}
