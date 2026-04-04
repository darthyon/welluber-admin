"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { TaxProfileForm } from "@/components/host/service-providers/tax-profile-form";
import { SpInviteAdminModal } from "@/components/host/service-providers/sp-invite-admin-modal";
import { SpBranchesTab } from "@/components/host/service-providers/sp-branches-tab";
import { SpVouchersTab } from "@/components/host/service-providers/sp-vouchers-tab";
import { MOCK_SPS } from "@/features/providers/mock-data";
import { suspendSp, activateSp, removeSp, resendSpAdminInvite } from "@/features/providers/actions";
import { ActionPopover } from "@/components/shared/action-popover";

const TABS = [
  { id: "details", label: "SP Details", icon: Storefront },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
  { id: "settings", label: "Settings", icon: Gear },
] as const;

type TabId = typeof TABS[number]["id"];

const OTHER_SPS = MOCK_SPS.slice(0, 5).map((s) => ({
  label: s.name,
  href: `/service-providers/${s.id}`,
}));

export default function ServiceProviderDetailPage() {
  const params = useParams();
  const spId = params.id as string;
  const sp = MOCK_SPS.find((s) => s.id === spId) ?? MOCK_SPS[0];

  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isRemoveSubmitting, setIsRemoveSubmitting] = useState(false);
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<"status" | "remove" | null>(null);
  const [currentStatus, setCurrentStatus] = useState(sp.status);

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

  const adminBranchLabel = sp.branches.length > 1 ? "All Branches" : sp.branches[0]?.name ?? "All Branches";

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
      run: () => removeSp(spId),
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
        <div className="max-w-[1200px] mx-auto py-6 lg:px-2">
          <Breadcrumbs items={breadcrumbs} className="mb-4" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-15 h-15 rounded-2xl bg-zinc-100/80 flex items-center justify-center text-zinc-500 border border-zinc-200/60 transition-all">
                <Storefront size={32} weight="fill" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{sp.name}</h1>
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
                <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                  <span className="font-mono text-[11px] text-zinc-400 bg-white px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-widest">
                    {sp.registrationNo}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="lg" className="text-[13px] font-medium rounded-full transition-all">
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
                    "flex items-center gap-2 py-3 border-b-2 text-[14px] font-medium transition-all duration-300",
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

      <div className="max-w-[1200px] mx-auto p-6 lg:p-8">
        <div className="space-y-8">

          {/* ── SP Details Tab ──────────────────────────────────────────── */}
          {activeTab === "details" && (
            <>
            <DetailSection
              title="Provider Info"
              icon={<Storefront size={16} weight="fill" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField label="Company Name" value={sp.name} />
                <DetailField label="Registration No." value={<span className="font-mono">{sp.registrationNo}</span>} />
                {sp.website && (
                  <DetailField
                    label="Website"
                    value={
                      <a href={sp.website} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 flex items-center gap-1">
                        <Globe size={12} /> {sp.website}
                      </a>
                    }
                  />
                )}
                {sp.description && (
                  <DetailField label="Description" value={sp.description} className="sm:col-span-2" />
                )}
                <DetailField
                  label="Service Categories"
                  value={
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {sp.serviceCategories.map((cat, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px]">{cat}</Badge>
                      ))}
                    </div>
                  }
                  className="sm:col-span-2"
                />
                <DetailField
                  label="Status"
                  value={
                    <StatusBadge
                      status={currentStatus}
                      variant={currentStatus === "active" ? "emerald" : currentStatus === "pending" ? "amber" : "zinc"}
                    />
                  }
                />
                <DetailField label="On Platform Since" value={new Date(sp.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })} />
              </div>
            </DetailSection>

            {/* Section 2: Commission Schema */}
            <DetailSection
              title="Commission Schema"
              icon={<IdentificationCard size={16} weight="fill" />}
              description="Rates applied per service category. Valid range: 10%–30%."
            >
              <CommissionSchemaEditor
                spId={spId}
                serviceCategories={sp.serviceCategories}
                initialRows={sp.commissionSchema}
              />
            </DetailSection>

            {/* Section 3: Tax Profile */}
            <DetailSection
              title="Tax Profile"
              icon={<IdentificationCard size={16} weight="fill" />}
              description="SST registration status and rate applied to this provider's transactions."
            >
              <TaxProfileForm spId={spId} initial={sp.taxProfile} />
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
                    className="text-[12px] font-medium h-8 gap-1.5"
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    <EnvelopeSimple size={13} /> Send Invite
                  </Button>
                }
              >
                {sp.admins.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground italic">
                    No administrators yet. Send an invite to give portal access.
                  </p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/20">
                          <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Name</th>
                          <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Email</th>
                          <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Role</th>
                          <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Branch</th>
                          <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap">Status</th>
                          <th className="font-semibold text-muted-foreground text-[12px] p-4 text-nowrap text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {sp.admins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-muted/30 transition-colors group">
                            <td className="p-4 text-[13px] font-medium text-foreground">{admin.name}</td>
                            <td className="p-4 text-[13px] text-muted-foreground">{admin.email}</td>
                            <td className="p-4 text-[13px] text-muted-foreground">SP Admin</td>
                            <td className="p-4 text-[13px] text-muted-foreground">{adminBranchLabel}</td>
                            <td className="p-4">
                              <StatusBadge
                                status={admin.status === "active" ? "Active" : "Pending"}
                                variant={admin.status === "active" ? "emerald" : "amber"}
                              />
                            </td>
                            <td className="p-4 text-right">
                              {admin.status === "pending_activation" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[12px] font-medium"
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-foreground">
                          {currentStatus === "suspended" ? "Reactivate Service Provider" : "Suspend Service Provider"}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {currentStatus === "suspended"
                            ? "Restore access and allow new transactions."
                            : "Pause access and stop new transactions temporarily."}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className={cn(
                          "w-full sm:w-auto text-[13px] font-medium rounded-full transition-all",
                          currentStatus === "suspended"
                            ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
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

                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-foreground">Remove Service Provider</p>
                        <p className="text-[12px] text-muted-foreground">
                          Permanently remove the provider, branches, vouchers, and admin access.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full sm:w-auto text-[13px] font-medium rounded-full transition-all"
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

      {/* Modals */}
      {isInviteModalOpen && (
        <SpInviteAdminModal
          spId={spId}
          spName={sp.name}
          existingEmails={sp.admins.map((a) => a.email.toLowerCase())}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
}
