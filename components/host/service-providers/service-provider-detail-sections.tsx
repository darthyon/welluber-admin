"use client";

import Link from "next/link";
import { Bank, EnvelopeSimple, Files, Globe, IdentificationCard, MapPin, ShieldCheck, Storefront } from "@phosphor-icons/react";
import { BUSINESS_TYPES } from "@/features/providers/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommissionSchemaEditor } from "@/components/host/service-providers/commission-schema-editor";
import { ActionPopover } from "@/components/shared/action-popover";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSection } from "@/components/shared/detail-section";
import { MapPlaceholder } from "@/components/shared/map-placeholder";
import { SharedDataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatDate } from "@/lib/utils";
import { MOCK_SPS } from "@/lib/mock-data";

const BUSINESS_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.id, type.label]),
);

type ServiceProviderRecord = (typeof MOCK_SPS)[number];

interface ServiceProviderDetailsSectionProps {
  currentStatus: ServiceProviderRecord["status"];
  onInviteAdmin: () => void;
  onResendInvite: (adminId: string, email: string) => void;
  sp: ServiceProviderRecord;
  spId: string;
}

export function ServiceProviderDetailsSection({
  currentStatus,
  onInviteAdmin,
  onResendInvite,
  sp,
  spId,
}: ServiceProviderDetailsSectionProps) {
  return (
    <>
      <DetailSection
        title="Provider Profile"
        icon={<Storefront size={16} weight="fill" />}
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <DetailField label="Company Name" value={sp.name} />
          {sp.website ? (
            <DetailField
              label="Website"
              value={
                <Link
                  href={sp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-medium text-primary underline-offset-4 transition-all hover:underline"
                >
                  <Globe size={14} />
                  {sp.website}
                </Link>
              }
            />
          ) : null}
          {sp.description ? (
            <DetailField
              label="Description"
              value={sp.description}
              className="sm:col-span-2"
            />
          ) : null}
          <DetailField
            label="Main Services"
            value={
              <div className="mt-0.5 flex flex-wrap gap-1.5">
                {sp.mainServices?.map((service, index) => (
                  <Badge key={`${service}-${index}`} variant="secondary" className="text-label font-medium">
                    {service}
                  </Badge>
                ))}
                {(!sp.mainServices || sp.mainServices.length === 0) && (
                  <span className="text-label italic text-muted-foreground">None selected</span>
                )}
              </div>
            }
            className="sm:col-span-2"
          />
          <div className="grid grid-cols-1 gap-6 border-t border-border/50 pt-2 sm:col-span-2 sm:grid-cols-2">
            <DetailField
              label="Status"
              value={
                <StatusBadge
                  status={currentStatus}
                  variant={currentStatus === "active" ? "emerald" : currentStatus === "pending" ? "amber" : "zinc"}
                />
              }
            />
            <DetailField label="On Platform Since" value={formatDate(sp.createdAt)} />
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title="Registration & Compliance"
        icon={<IdentificationCard size={16} weight="fill" />}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <DetailField
            label="Registration No. (BRN)"
            value={<span className="font-mono font-semibold">{sp.registrationNo}</span>}
          />
          <DetailField label="TIN Number" value={sp.tinNumber || "N/A"} />
          <DetailField label="SST Registration No." value={sp.taxProfile?.taxRegNo || "N/A"} />

          <div className="pt-4 sm:col-span-3">
            <p className="mb-3 text-label font-medium uppercase tracking-widest text-faint">
              Compliance Documents
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(sp.documents || []).length > 0 ? (
                sp.documents?.map((doc, index) => (
                  <div
                    key={`${doc}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-faint">
                      <Files size={18} weight="duotone" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-label font-semibold text-foreground">{doc}</p>
                      <p className="text-label font-medium text-subtle">Document attached</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-label italic text-muted-foreground">No documents uploaded.</p>
              )}
            </div>
            {sp.businessType ? (
              <p className="mt-3 text-label text-muted-foreground">
                Categorized as:{" "}
                <span className="font-semibold text-foreground">
                  {BUSINESS_TYPE_LABELS[sp.businessType] || sp.businessType}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </DetailSection>

      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
        <DetailSection
          title="Business Address"
          icon={<MapPin size={16} weight="fill" />}
          className="flex h-full flex-col"
        >
          <div className="flex h-full flex-col">
            <MapPlaceholder
              lat={sp.address?.lat}
              lon={sp.address?.lon}
              address={sp.address?.line}
              className="shrink-0"
            />
            <div className="grid grid-cols-1 content-start gap-4 pt-4 sm:grid-cols-2">
              <DetailField label="Address" value={sp.address?.line || "N/A"} className="sm:col-span-2" />
              <DetailField label="Post Code" value={sp.address?.postalCode || "N/A"} />
              <DetailField label="City" value={sp.address?.city || "N/A"} />
              <DetailField label="State" value={sp.address?.state || "N/A"} />
              <DetailField label="Country" value={sp.address?.country || "Malaysia"} />
            </div>
          </div>
        </DetailSection>

        <DetailSection
          title="Settlement & Tax Compliance"
          icon={<Bank size={16} weight="fill" />}
          className="h-full border-primary/10 bg-muted/5"
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <DetailField label="Bank Name" value={sp.bankInfo?.bankName || "N/A"} />
              <DetailField label="Account Name" value={sp.bankInfo?.accountName || "N/A"} />
              <DetailField
                label="Account Number"
                value={
                  <span className="font-mono font-semibold tracking-wider">
                    {sp.bankInfo?.accountNumber || "N/A"}
                  </span>
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-border/40 pt-6 sm:grid-cols-3">
              <DetailField label="Payment Cycle" value={sp.paymentCycle || "Not Set"} />
              <DetailField label="Credit Terms" value={sp.creditTerms || "Not Set"} />
              <DetailField label="Expired Commission Fee" value={`${(sp.expiredCommissionFee ?? 0) * 100}%`} />
            </div>

            <div className="space-y-4 border-t border-border/40 pt-6">
              <div className="flex flex-wrap gap-4">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-body font-medium",
                    sp.needsEInvoiceSubmission
                      ? "border-primary/20 bg-primary/5 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  <ShieldCheck size={14} weight={sp.needsEInvoiceSubmission ? "fill" : "regular"} />
                  Needs e-Invoice Submission
                </div>
                <StatusBadge
                  status={sp.appointedForEInvoice ? "Appointed Welluber for e-Invoice" : "Not Appointed for e-Invoice"}
                  variant={sp.appointedForEInvoice ? "emerald" : "zinc"}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-background/50 p-4 sm:grid-cols-2">
                <DetailField label="Classification Code" value={sp.classificationCode || "N/A"} />
                <DetailField
                  label="Classification Descriptor"
                  value={sp.classificationDescriptor || "N/A"}
                />
              </div>
            </div>
          </div>
        </DetailSection>
      </div>

      <DetailSection
        title="Service Portfolio"
        icon={<IdentificationCard size={16} weight="fill" />}
        description="Services offered and commission rates configured per service."
      >
        <CommissionSchemaEditor
          spId={spId}
          serviceCategories={sp.serviceCategories}
          initialRows={sp.commissionSchema}
        />
      </DetailSection>

      <DetailSection
        title="Administrators"
        icon={<EnvelopeSimple size={16} weight="fill" />}
        description="Manage SP Admin access to the provider portal."
        action={
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 text-label font-medium"
            onClick={onInviteAdmin}
          >
            <EnvelopeSimple size={13} />
            Send Invite
          </Button>
        }
      >
        {sp.admins.length === 0 ? (
          <p className="text-body italic text-subtle">
            No administrators yet. Send an invite to give portal access.
          </p>
        ) : (
          <SharedDataTable
            freezeFirst
            freezeLast
            columns={[
              {
                header: "Name",
                accessorKey: "name",
                sortable: true,
                render: (admin: ServiceProviderRecord["admins"][number]) => (
                  <span className="text-body font-medium text-foreground">{admin.name}</span>
                ),
              },
              {
                header: "Email",
                accessorKey: "email",
                sortable: true,
                render: (admin: ServiceProviderRecord["admins"][number]) => (
                  <span className="text-body text-subtle">{admin.email}</span>
                ),
              },
              {
                header: "User Type",
                render: () => <span className="text-body text-subtle">SP Admin</span>,
              },
              {
                header: "Branches",
                render: (admin: ServiceProviderRecord["admins"][number]) => {
                  if (admin.branchIds && admin.branchIds.length > 0) {
                    if (admin.branchIds.includes("all")) {
                      return <span className="text-body text-subtle">All Branches</span>;
                    }

                    const branchNames = admin.branchIds.map((id: string) => {
                      const branch = sp.branches.find((item) => item.id === id || item.name === id);
                      return branch?.name ?? id;
                    });

                    if (branchNames.length <= 2) {
                      return <span className="text-body text-subtle">{branchNames.join(", ")}</span>;
                    }

                    return <span className="text-body text-subtle">{branchNames.length} Branches</span>;
                  }

                  return (
                    <span className="text-body text-subtle">
                      {sp.branches.length > 1 ? "All Branches" : sp.branches[0]?.name ?? "All Branches"}
                    </span>
                  );
                },
              },
              {
                header: "Status",
                accessorKey: "status",
                sortable: true,
                render: (admin: ServiceProviderRecord["admins"][number]) => (
                  <StatusBadge
                    status={admin.status === "active" ? "Active" : "Pending"}
                    variant={admin.status === "active" ? "emerald" : "amber"}
                  />
                ),
              },
              {
                header: "Actions",
                align: "right",
                render: (admin: ServiceProviderRecord["admins"][number]) => (
                  <div className="flex justify-end">
                    {admin.status === "pending_activation" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-label font-medium"
                        onClick={() => onResendInvite(sp.id, admin.email)}
                      >
                        Resend Invite
                      </Button>
                    ) : (
                      <ActionPopover
                        actions={[
                          {
                            label: "Resend Invite",
                            onClick: () => onResendInvite(sp.id, admin.email),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
            ]}
            data={sp.admins}
          />
        )}
      </DetailSection>
    </>
  );
}
