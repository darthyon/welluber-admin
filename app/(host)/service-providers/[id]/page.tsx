"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTabPersistence } from "@/hooks/use-tab-persistence";
import {
  Storefront,
  GitBranch,
  Ticket,
  PencilSimpleLine,
  Gear,
  Prohibit,
  CheckCircle,
  Globe,
  IdentificationCard,
  EnvelopeSimple,
  Article,
  Files,
  Info,
  Bank,
  MapPin,
  CreditCard,
  Clock,
  ShieldCheck
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommissionSchemaEditor } from "@/components/host/service-providers/commission-schema-editor";
import { SpInviteAdminModal } from "@/components/host/service-providers/sp-invite-admin-modal";
import { SpBranchesTab } from "@/components/host/service-providers/sp-branches-tab";
import { SpVouchersTab } from "@/components/host/service-providers/sp-vouchers-tab";
import { MOCK_SPS } from "@/lib/mock-data";
import { suspendSp, activateSp, removeSp, resendSpAdminInvite } from "@/features/providers/actions";
import { ActionPopover } from "@/components/shared/action-popover";
import { SharedDataTable } from "@/components/shared/data-table";
import { CommissionSchemaSheet } from "@/components/host/service-providers/commission-schema-sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TABS = [
  { id: "details", label: "SP Details", icon: Storefront },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "vouchers", label: "Voucher Package", icon: Ticket },
  { id: "settings", label: "Settings", icon: Gear },
] as const;

type TabId = typeof TABS[number]["id"];

const OTHER_SPS = MOCK_SPS.slice(0, 5).map((s) => ({
  label: s.name,
  href: `/service-providers/${s.id}`,
}));

import { BUSINESS_TYPES } from "@/features/providers/constants";

const BUSINESS_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPES.map(t => [t.id, t.label])
);

export default function ServiceProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spId = params.id as string;
  const sp = MOCK_SPS.find((s) => s.id === spId) ?? MOCK_SPS[0];

  const [activeTab, setActiveTab] = useTabPersistence<TabId>("details");
  const searchParams = useSearchParams();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    if (searchParams.has("voucherView")) {
      setActiveTab("vouchers");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isRemoveSubmitting, setIsRemoveSubmitting] = useState(false);
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<"status" | "remove" | null>(null);
  const [currentStatus, setCurrentStatus] = useState(sp.status);
  const [isCommissionSheetOpen, setIsCommissionSheetOpen] = useState(false);

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    const action = currentStatus === "suspended" ? activateSp : suspendSp;
    const res = await action(spId);
    if (res.success) {
      setCurrentStatus(currentStatus === "suspended" ? "active" : "suspended");
    }
    setIsTogglingStatus(false);
  };

  const openDangerAction = (action: "status" | "remove") => {
    setDangerAction(action);
    setIsDangerModalOpen(true);
  };



  const dangerActionConfig = {
    status: {
      title: currentStatus === "suspended" ? "Activate Service Provider" : "Suspend Service Provider",
      confirmLabel: currentStatus === "suspended" ? "Activate Service Provider" : "Suspend Service Provider",
      description:
        currentStatus === "suspended"
          ? "Reactivate this service provider and restore portal access."
          : "Temporarily suspend this service provider without deleting its records.",
      impactPoints:
        currentStatus === "suspended"
          ? [
              "Admins regain access to the provider portal.",
              "New transactions and voucher activity are allowed again.",
              "Branches and voucher data remain intact.",
            ]
          : [
              "New voucher redemptions will be blocked.",
              "Admins lose portal access until the provider is reactivated.",
              "Branches and voucher records remain available for recovery.",
            ],
      run: () => handleToggleStatus(),
    },
    remove: {
      title: "Remove Service Provider",
      confirmLabel: "Remove Service Provider",
      description: "Permanently remove this service provider and all linked records.",
      impactPoints: [
        "Provider profile, branches, vouchers, and admins will be removed.",
        "This action cannot be undone.",
        "Any linked reporting references will remain historical only.",
      ],
      run: async () => {
        const res = await removeSp(spId);
        if (res.success) {
          router.push("/service-providers");
        }
        return res;
      },
    },
  } as const;

  const breadcrumbs = [
    { label: "Service Providers", href: "/service-providers" },
    { label: sp.name, href: `/service-providers/${sp.id}`, options: OTHER_SPS },
    { label: TABS.find((t) => t.id === activeTab)?.label ?? "Details" },
  ];

  return (
    <div className="pb-12">
      <div className="bg-card border-b border-border -mx-6 -mt-6 px-6 pt-6 relative z-30">
        <div className="py-6 lg:px-2">
          <Breadcrumbs items={breadcrumbs} className="mb-4" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-15 h-15 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground border border-border/60 transition-all">
                <Storefront size={32} weight="fill" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-display font-semibold tracking-tight text-foreground">{sp.name}</h1>
                  <StatusBadge
                    status={currentStatus}
                    variant={
                      currentStatus === "active"
                        ? "emerald"
                        : currentStatus === "pending"
                          ? "amber"
                          : currentStatus === "removed"
                            ? "zinc"
                            : "rose"
                    }
                  />
                </div>
                <div className="flex items-center gap-3 text-body text-subtle">
                  <span className="font-mono text-label text-faint bg-muted px-2 py-0.5 rounded border border-border tracking-widest">
                    {sp.registrationNo}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="lg" className="text-body font-medium rounded-full transition-all">
                <Link href={`/service-providers/${spId}/edit`}>
                  <PencilSimpleLine size={16} weight="bold" className="mr-1.5" />
                  Edit Service Provider
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8 border-b border-border">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-3 border-b-2 text-body font-medium transition-all duration-300",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} className={cn("transition-colors", isActive && "text-primary")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="space-y-8">

          {/* ── SP Details Tab ──────────────────────────────────────────── */}
          {activeTab === "details" && (
            <>
            <DetailSection
              title="Provider Profile"
              icon={<Storefront size={16} weight="fill" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <DetailField label="Company Name" value={sp.name} />
                {sp.website && (
                  <DetailField
                    label="Website"
                    value={
                      <a href={sp.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4 flex items-center gap-1.5 font-medium transition-all">
                        <Globe size={14} /> {sp.website}
                      </a>
                    }
                  />
                )}
                {sp.description && (
                  <DetailField label="Description" value={sp.description} className="sm:col-span-2" />
                )}
                <DetailField
                  label="Main Services"
                  value={
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {sp.mainServices?.map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-label font-medium bg-muted/40">{service}</Badge>
                      ))}
                      {(!sp.mainServices || sp.mainServices.length === 0) && (
                        <span className="text-label text-muted-foreground italic">None selected</span>
                      )}
                    </div>
                  }
                  className="sm:col-span-2"
                />
                <div className="pt-2 border-t border-border/50 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailField
                        label="Status"
                        value={
                            <StatusBadge
                            status={currentStatus}
                            variant={currentStatus === "active" ? "emerald" : currentStatus === "pending" ? "amber" : "zinc"}
                            />
                        }
                    />
                    <DetailField label="On Platform Since" value={new Date(sp.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
                </div>
              </div>
            </DetailSection>

            {/* Registration & Compliance */}
            <DetailSection
              title="Registration & Compliance"
              icon={<IdentificationCard size={16} weight="fill" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <DetailField label="Registration No. (BRN)" value={<span className="font-mono font-semibold">{sp.registrationNo}</span>} />
                <DetailField label="TIN Number" value={sp.tinNumber || "N/A"} />
                <DetailField label="SST Registration No." value={sp.taxProfile?.taxRegNo || "N/A"} />
                
                <div className="sm:col-span-3 pt-4">
                  <p className="text-label font-medium text-faint uppercase tracking-widest mb-3">Compliance Documents</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(sp.documents || []).length > 0 ? (
                      sp.documents?.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                          <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-faint">
                            <Files size={18} weight="duotone" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-label font-semibold text-foreground truncate">{doc}</p>
                            <p className="text-label text-subtle font-medium">Document attached</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-label text-muted-foreground italic">No documents uploaded.</p>
                    )}
                  </div>
                  {sp.businessType && (
                    <p className="text-label text-muted-foreground mt-3">
                      Categorized as: <span className="font-semibold text-foreground">{BUSINESS_TYPE_LABELS[sp.businessType] || sp.businessType}</span>
                    </p>
                  )}
                </div>
              </div>
            </DetailSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section: Business Address */}
                <DetailSection
                    title="Registered Business Address"
                    icon={<MapPin size={16} weight="fill" />}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailField label="Address" value={sp.address?.line || "N/A"} className="sm:col-span-2" />
                        <DetailField label="Post Code" value={sp.address?.postalCode || "N/A"} />
                        <DetailField label="City" value={sp.address?.city || "N/A"} />
                        <DetailField label="State" value={sp.address?.state || "N/A"} />
                        <DetailField label="Country" value={sp.address?.country || "Malaysia"} />
                    </div>
                </DetailSection>

                {/* Section: Settlement & Tax Compliance */}
                <DetailSection
                    title="Settlement & Tax Compliance"
                    icon={<Bank size={16} weight="fill" />}
                    className="bg-muted/5 border-primary/10"
                >
                    <div className="space-y-8">
                        {/* Bank Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <DetailField label="Bank Name" value={sp.bankInfo?.bankName || "N/A"} />
                            <DetailField label="Account Name" value={sp.bankInfo?.accountName || "N/A"} />
                            <DetailField label="Account Number" value={<span className="font-mono font-semibold tracking-wider">{sp.bankInfo?.accountNumber || "N/A"}</span>} />
                        </div>

                        {/* Billing & Tax Settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-faint mb-1">
                                    <Clock size={14} />
                                    <span className="text-label font-medium uppercase tracking-wider">Payment Cycle</span>
                                </div>
                                <p className="text-body font-medium text-foreground">{sp.paymentCycle || "Not Set"}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-faint mb-1">
                                    <CreditCard size={14} />
                                    <span className="text-label font-medium uppercase tracking-wider">Credit Terms</span>
                                </div>
                                <p className="text-body font-medium text-foreground">{sp.creditTerms || "Not Set"}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-faint mb-1">
                                    <Article size={14} />
                                    <span className="text-label font-medium uppercase tracking-wider">Expired Commission Fee</span>
                                </div>
                                <p className="text-body font-medium text-foreground">{(sp.expiredCommissionFee ?? 0) * 100}%</p>
                            </div>
                        </div>

                        {/* e-Invoice Settings */}
                        <div className="pt-6 border-t border-border/40 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-body font-medium",
                                    sp.needsEInvoiceSubmission ? "bg-primary/5 border-primary/20 text-primary" : "bg-muted/50 border-border text-muted-foreground"
                                )}>
                                    <ShieldCheck size={14} weight={sp.needsEInvoiceSubmission ? "fill" : "regular"} />
                                    Needs e-Invoice Submission
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-body font-medium",
                                    sp.appointedForEInvoice ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20 dark:border-emerald-500/30" : "bg-muted/50 border-border text-muted-foreground"
                                )}>
                                    <ShieldCheck size={14} weight={sp.appointedForEInvoice ? "fill" : "regular"} />
                                    Appointed Welluber for e-Invoice
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background/50 border border-border rounded-lg">
                                <DetailField label="Classification Code" value={sp.classificationCode || "N/A"} />
                                <DetailField label="Classification Descriptor" value={sp.classificationDescriptor || "N/A"} />
                            </div>
                        </div>
                    </div>
                </DetailSection>
            </div>

 
            {/* Section 2: Service Portfolio */}
            <DetailSection
              title="Service Portfolio"
              icon={<IdentificationCard size={16} weight="fill" />}
              description="Manage your service catalogue and configure tiered commission rates."
              action={
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center cursor-default text-primary">
                          <Info size={16} weight="fill" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[240px] text-label">
                        Define your service portfolio and configure tiered commission rates.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-label font-medium gap-1.5"
                    onClick={() => setIsCommissionSheetOpen(true)}
                  >
                    <PencilSimpleLine size={13} />
                    Edit
                  </Button>
                </div>
              }
            >
              <CommissionSchemaEditor
                spId={spId}
                serviceCategories={sp.serviceCategories}
                initialRows={sp.commissionSchema}
              />
            </DetailSection>

            {/* Section 4: Administrators */}
              <DetailSection
                title="Administrators"
                icon={<EnvelopeSimple size={16} weight="fill" />}
                description="Manage SP Admin access to the provider portal."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-label font-medium h-8 gap-1.5"
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    <EnvelopeSimple size={13} /> Send Invite
                  </Button>
                }
              >
                {sp.admins.length === 0 ? (
                  <p className="text-body text-subtle italic">
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
                        render: (admin: (typeof sp.admins)[number]) => (
                          <span className="text-body font-medium text-foreground">{admin.name}</span>
                        ),
                      },
                      {
                        header: "Email",
                        accessorKey: "email",
                        sortable: true,
                        render: (admin: (typeof sp.admins)[number]) => (
                          <span className="text-body text-subtle">{admin.email}</span>
                        ),
                      },
                      {
                        header: "User Type",
                        render: () => <span className="text-body text-subtle">SP Admin</span>,
                      },
                      {
                        header: "Branches",
                        render: (admin: (typeof sp.admins)[number]) => {
                          if (admin.branchIds && admin.branchIds.length > 0) {
                            if (admin.branchIds.includes("all")) {
                              return <span className="text-body text-subtle">All Branches</span>;
                            }

                            const branchNames = admin.branchIds.map((id: string) => {
                              const branch = sp.branches.find((b) => b.id === id || b.name === id);
                              return branch?.name ?? id;
                            });
                            
                            if (branchNames.length <= 2) {
                              return <span className="text-body text-subtle">{branchNames.join(", ")}</span>;
                            }
                            return (
                              <span className="text-body text-subtle">
                                {branchNames.length} Branches
                              </span>
                            );
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
                        render: (admin: (typeof sp.admins)[number]) => (
                          <StatusBadge
                            status={admin.status === "active" ? "Active" : "Pending"}
                            variant={admin.status === "active" ? "emerald" : "amber"}
                          />
                        ),
                      },
                      {
                        header: "Actions",
                        align: "right",
                        render: (admin: (typeof sp.admins)[number]) => (
                          <div className="flex justify-end">
                            {admin.status === "pending_activation" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-label font-medium"
                                onClick={() => resendSpAdminInvite(spId, admin.id, admin.email)}
                              >
                                Resend Invite
                              </Button>
                            ) : (
                              <ActionPopover
                                actions={[
                                  { label: "Resend Invite", onClick: () => resendSpAdminInvite(spId, admin.id, admin.email) },
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
          )}

          {/* ── Branches Tab ─────────────────────────────────────────────── */}
          {activeTab === "branches" && <SpBranchesTab sp={sp} />}

          {/* ── Vouchers Tab ─────────────────────────────────────────────── */}
          {activeTab === "vouchers" && <SpVouchersTab sp={sp} />}

          {/* ── Settings Tab ─────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in">
              <DetailSection
                title="Danger Zone"
                icon={<Gear size={18} weight="duotone" />}
                description="Confirm how you want to change the provider lifecycle."
              >
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-body font-medium text-foreground">
                          {currentStatus === "suspended" ? "Reactivate Service Provider" : "Suspend Service Provider"}
                        </p>
                        <p className="text-label text-muted-foreground">
                          {currentStatus === "suspended"
                            ? "Restore access and allow new transactions."
                            : "Pause access and stop new transactions temporarily."}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className={cn(
                          "w-full sm:w-auto text-body font-medium rounded-full transition-all",
                          currentStatus === "suspended"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            : "text-destructive border-destructive/30 hover:bg-destructive/5"
                        )}
                        onClick={() => openDangerAction("status")}
                        disabled={isTogglingStatus}
                      >
                        {currentStatus === "suspended" ? (
                          <>
                            <CheckCircle size={16} weight="bold" className="mr-1.5" />
                            Activate Service Provider
                          </>
                        ) : (
                          <>
                            <Prohibit size={16} weight="bold" className="mr-1.5" />
                            Suspend Service Provider
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-body font-medium text-foreground">Remove Service Provider</p>
                        <p className="text-label text-muted-foreground">
                          Permanently remove the provider, branches, vouchers, and admin access.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full sm:w-auto text-body font-medium rounded-full transition-all"
                        onClick={() => openDangerAction("remove")}
                      >
                        Remove Service Provider
                      </Button>
                    </div>
                  </div>
                </div>
              </DetailSection>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDangerModalOpen}
        title={dangerAction ? dangerActionConfig[dangerAction].title : "Confirm Action"}
        description={dangerAction ? dangerActionConfig[dangerAction].description : "Review the impact before proceeding."}
        impactPoints={dangerAction ? dangerActionConfig[dangerAction].impactPoints : []}
        confirmLabel={dangerAction ? dangerActionConfig[dangerAction].confirmLabel : "Confirm"}
        isSubmitting={dangerAction === "remove" ? isRemoveSubmitting : isTogglingStatus}
        onClose={() => {
          setIsDangerModalOpen(false);
          setDangerAction(null);
        }}
        onConfirm={async () => {
          if (!dangerAction) return;
          if (dangerAction === "remove") {
            setIsRemoveSubmitting(true);
            try {
              const res = await dangerActionConfig.remove.run();
              if (res.success) {
                setCurrentStatus("removed");
                setIsDangerModalOpen(false);
                setDangerAction(null);
              }
            } finally {
              setIsRemoveSubmitting(false);
            }
            return;
          }

          await dangerActionConfig.status.run();
          setIsDangerModalOpen(false);
          setDangerAction(null);
        }}
      />

      {/* Commission Schema Sheet */}
      <CommissionSchemaSheet
        isOpen={isCommissionSheetOpen}
        onClose={() => setIsCommissionSheetOpen(false)}
        spId={spId}
        serviceCategories={sp.serviceCategories}
        initialRows={sp.commissionSchema}
      />

      {/* Modals */}
      {isInviteModalOpen && (
        <SpInviteAdminModal
          spId={spId}
          spName={sp.name}
          branches={sp.branches}
          existingEmails={sp.admins.map((a) => a.email.toLowerCase())}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
}
