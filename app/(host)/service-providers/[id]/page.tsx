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
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Button } from "@/components/ui/button";
import { SpInviteAdminModal } from "@/components/host/service-providers/sp-invite-admin-modal";
import { SpBranchesTab } from "@/components/host/service-providers/sp-branches-tab";
import { SpVouchersTab } from "@/components/host/service-providers/sp-vouchers-tab";
import { MOCK_SPS } from "@/lib/mock-data";
import { suspendSp, activateSp, removeSp, resendSpAdminInvite } from "@/features/providers/actions";
import { ServiceProviderDetailsSection } from "@/components/host/service-providers/service-provider-detail-sections";
import { ServiceProviderSettingsSection } from "@/components/host/service-providers/service-provider-settings-section";

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
                  <h1 className="text-title font-semibold tracking-tight text-foreground">{sp.name}</h1>
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
            <ServiceProviderDetailsSection
              currentStatus={currentStatus}
              onInviteAdmin={() => setIsInviteModalOpen(true)}
              onResendInvite={(adminId, email) => resendSpAdminInvite(spId, adminId, email)}
              sp={sp}
              spId={spId}
            />
          )}

          {/* ── Branches Tab ─────────────────────────────────────────────── */}
          {activeTab === "branches" && <SpBranchesTab sp={sp} />}

          {/* ── Vouchers Tab ─────────────────────────────────────────────── */}
          {activeTab === "vouchers" && <SpVouchersTab sp={sp} />}

          {/* ── Settings Tab ─────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <ServiceProviderSettingsSection
              currentStatus={currentStatus}
              isTogglingStatus={isTogglingStatus}
              onOpenDangerAction={openDangerAction}
            />
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
          branches={sp.branches}
          existingEmails={sp.admins.map((a) => a.email.toLowerCase())}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
}
