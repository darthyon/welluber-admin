"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Storefront,
  GitBranch,
  Ticket,
  PencilSimpleLine,
  Prohibit,
  CheckCircle,
  Globe,
  IdentificationCard,
  EnvelopeSimple,
  UserCirclePlus,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { suspendSp, activateSp, resendSpAdminInvite } from "@/features/providers/actions";
import { PulseStatus } from "@/components/shared/pulse-status";

const TABS = [
  { id: "details", label: "SP Details", icon: Storefront },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
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

  const breadcrumbs = [
    { label: "Service Providers", href: "/service-providers" },
    { label: sp.name, href: `/service-providers/${sp.id}`, options: OTHER_SPS },
    { label: TABS.find((t) => t.id === activeTab)?.label ?? "Details" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
            <Storefront size={28} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{sp.name}</h1>
              <PulseStatus status={currentStatus as "active" | "pending" | "suspended"} showLabel />
            </div>
            <p className="text-[13px] text-muted-foreground mt-0.5 font-mono">{sp.registrationNo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="h-9 text-[13px] gap-2">
            <Link href={`/service-providers/${spId}/edit`}>
              <PencilSimpleLine size={14} /> Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 text-[13px] gap-2",
              currentStatus === "suspended"
                ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                : "text-destructive border-destructive/30 hover:bg-destructive/5"
            )}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
          >
            {currentStatus === "suspended" ? (
              <><CheckCircle size={14} /> Activate</>
            ) : (
              <><Prohibit size={14} /> Suspend</>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 py-3 border-b-2 text-[14px] font-medium transition-all duration-300",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon size={16} weight={isActive ? "fill" : "regular"} className={cn("transition-colors", isActive && "text-primary")} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">

        {/* ── SP Details Tab ──────────────────────────────────────────── */}
        {activeTab === "details" && (
          <>
            {/* Section 1: Basic Info */}
            <DetailSection
              title="Provider Info"
              icon={<Storefront size={16} weight="fill" />}
              action={
                <Button asChild variant="ghost" size="sm" className="text-[12px] h-8 gap-1.5">
                  <Link href={`/service-providers/${spId}/edit`}>
                    <PencilSimpleLine size={13} /> Edit
                  </Link>
                </Button>
              }
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

            {/* Section 4: Team (SP Admins) */}
            <DetailSection
              title="Team"
              icon={<UserCirclePlus size={16} weight="fill" />}
              description="SP Admins access the provider portal via magic link."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[12px] h-8 gap-1.5"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <EnvelopeSimple size={13} /> Invite Admin
                </Button>
              }
            >
              {sp.admins.length === 0 ? (
                <p className="text-[13px] text-muted-foreground italic">No admins yet. Invite an SP Admin to give portal access.</p>
              ) : (
                <div className="space-y-2">
                  {sp.admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{admin.name}</p>
                        <p className="text-[12px] text-muted-foreground">{admin.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge
                          status={admin.status === "active" ? "Active" : "Pending"}
                          variant={admin.status === "active" ? "emerald" : "amber"}
                          dot
                        />
                        {admin.status === "pending_activation" && (
                          <button
                            onClick={() => resendSpAdminInvite(spId, admin.id, admin.email)}
                            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            <ArrowCounterClockwise size={11} /> Resend
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>
          </>
        )}

        {/* ── Branches Tab ─────────────────────────────────────────────── */}
        {activeTab === "branches" && <SpBranchesTab sp={sp} />}

        {/* ── Vouchers Tab ─────────────────────────────────────────────── */}
        {activeTab === "vouchers" && <SpVouchersTab sp={sp} />}
      </div>

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
