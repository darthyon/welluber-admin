"use client";

import { useState } from "react";
import { 
  CaretLeft, 
  Buildings, 
  MapPin, 
  Wallet, 
  Users, 
  Plus, 
  TrendUp, 
  CurrencyCircleDollar, 
  TreeStructure,
  Clock,
  ClockCounterClockwise,
  DotsThreeVertical,
  PencilSimpleLine
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { ActionPopover } from "@/components/shared/action-popover";
import { InviteAdminModal } from "./invite-admin-modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { BackButton } from "@/components/shared/back-button";
import { EntityHeader } from "@/components/shared/entity-header";
import { TwoColumnDetailLayout } from "@/components/shared/two-column-detail-layout";
import { cn } from "@/lib/utils";
import { ManualTopUpModal } from "./manual-topup-modal";
import { TopUpHistoryModal } from "./topup-history-modal";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Badge } from "@/components/ui/badge";

interface BranchDetailViewProps {
  branchId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function BranchDetailView({ branchId, onBack, onEdit }: BranchDetailViewProps) {
  const [walletType, setWalletType] = useState<"independent" | "shared">("independent");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Mock Branch Data
  const branchData = {
    name: branchId === "br_1" ? "ACME HQ (Kuala Lumpur)" : "ACME Subang Jaya",
    type: branchId === "br_1" ? "Headquarters (HQ)" : "Branch Office",
    status: "Active",
    address: {
      line: "Level 12, Menara South",
      city: "Kuala Lumpur",
      state: "Wilayah Persekutuan",
      country: "Malaysia",
      postalCode: "50450",
      timezone: "GMT +8:00",
      coordinates: {
        lat: "3.1390",
        lng: "101.7036"
      }
    }
  };

  const handleResetPassword = (email: string) => {
    // Simulated toast
    const toast = document.createElement("div");
    toast.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[13px] px-4 py-2 rounded-lg shadow-2xl z-[300] border border-border/60 animate-in slide-in-from-bottom-2 duration-300";
    toast.innerText = `Reset password email sent to ${email}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("animate-out", "fade-out", "zoom-out-95");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Invite Modal */}
      <InviteAdminModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        targetId={branchId}
        title="Invite Org Admin"
      />


      <div className="flex flex-col gap-4">
        <BackButton 
          onClick={onBack}
          label="Back to Branches"
        />
        
        <EntityHeader
          title={branchData.name}
          subtitle={branchData.type}
          status={branchData.status}
          statusVariant="emerald"
          icon={<Buildings size={24} weight="fill" />}
          actions={
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-[13px] font-medium rounded-full gap-2 transition-all"
              onClick={onEdit}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Branch
            </Button>
          }
        />
      </div>

      <TwoColumnDetailLayout
        sidebar={
          <>
            {/* Section 3: Branch Governance (People) */}
            <DetailSection 
              title="Branch Governance" 
              icon={<Users size={18} weight="duotone" />}
              description="Admins with local management access"
            >
              <div className="space-y-3">
                {[
                  { name: "John Doe", email: "john.d@acme.com", role: "Branch Admin" },
                  { name: "Ahmad Faizal", email: "ahmad.f@acme.com", role: "Operations" },
                ].map((admin, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:border-primary/20 transition-all group relative overflow-hidden">
                     <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors pointer-events-none" />
                     <div className="flex items-center gap-3 relative z-10">
                        <EntityAvatar name={admin.name} size="sm" />
                        <div>
                          <p className="text-[13px] font-bold text-foreground leading-tight tracking-tight">{admin.name}</p>
                          <p className="text-[11px] text-muted-foreground font-medium opacity-70 mt-0.5">{admin.role}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 relative z-10">
                       <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Admin</Badge>
                       <ActionPopover 
                         actions={[
                           { label: "View Details", onClick: () => console.log("View", admin.name) },
                           { label: "Reset Password", onClick: () => handleResetPassword(admin.email) },
                         ]}
                       />
                     </div>
                  </div>
                ))}
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full text-[12px] font-medium rounded-full flex items-center gap-2 mt-2 transition-all"
                >
                  <Plus size={14} weight="bold" />
                  Send Invite
                </Button>
              </div>
            </DetailSection>
            
            <div className="bg-primary/95 dark:bg-primary/20 rounded-xl p-6 text-primary-foreground dark:text-primary overflow-hidden relative group border border-primary/20 shadow-lg shadow-primary/5">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 dark:bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-[15px] font-bold mb-2 tracking-tight">Branch quick stats</h4>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[11px] font-bold opacity-70 tracking-tight">Total employees</p>
                  <p className="text-xl font-bold">1,240</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold opacity-70 tracking-tight">Redemption rate</p>
                  <p className="text-xl font-bold">92%</p>
                </div>
              </div>
            </div>
          </>
        }
      >
        {/* Section 1: Office Profile (Identity & Geography) */}
          <DetailSection 
            title="Branch Identity" 
            icon={<Buildings size={18} weight="duotone" />}
            description="Basic branch identifiers and operational status"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailField label="Official Name" value={branchData.name} />
              <DetailField label="Branch Type" value={branchData.type} />
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground/80 tracking-tight">Operational status</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={branchData.status} variant="emerald" />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection 
            title="Location Mapping" 
            icon={<MapPin size={18} weight="duotone" />}
            description="Geographical data and coordinate pinning"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Map Preview */}
              <div className="space-y-4">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] rounded-2xl border border-border bg-muted/30 overflow-hidden group/map shadow-sm">
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=pk.eyJ1IjoibW9ja2Rlc2lnbiIsImEiOiJjbGZnbXhsenQwMG1xM3lvM2wwNmwwNmwwNmwwIn0')] bg-cover bg-center grayscale group-hover/map:grayscale-0 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-primary/5 group-hover/map:bg-transparent transition-colors duration-700" />
                  
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center p-1.5 border border-primary/30">
                        <div className="w-full h-full rounded-full bg-primary shadow-lg shadow-primary/40 ring-4 ring-background" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                    </div>
                    <span className="text-[10px] font-semibold text-primary bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-primary/20 tracking-tight">
                      Pinned
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Address Details */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <DetailField label="Street Address" value={branchData.address.line} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField label="City" value={branchData.address.city} />
                    <DetailField label="Postal Code" value={branchData.address.postalCode} />
                  </div>

                  <DetailField label="State" value={branchData.address.state} />

                  <div className="relative group/tz">
                    <DetailField label="Country" value={branchData.address.country} />
                    <div className="absolute top-0 right-0 flex items-center gap-1.5 text-[10px] font-semibold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 select-none opacity-0 group-hover/tz:opacity-100 transition-all duration-300">
                      <Clock size={10} weight="bold" />
                      <span>{branchData.address.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/60 grid grid-cols-2 gap-6">
                  <DetailField 
                    label="Latitude" 
                    value={<span className="font-mono text-[13px] text-foreground">{branchData.address.coordinates.lat}</span>} 
                  />
                  <DetailField 
                    label="Longitude" 
                    value={<span className="font-mono text-[13px] text-foreground">{branchData.address.coordinates.lng}</span>} 
                  />
                </div>
              </div>
            </div>
          </DetailSection>

          {/* Section 2: Wallet Details */}
          <DetailSection 
            title="Wallet Details" 
            icon={<Wallet size={18} weight="duotone" />}
            description="Active configuration of the branch's financial resource pool"
          >
            {/* View Mode: Active Configuration Card */}
            <div className="relative group/wallet bg-muted/20 border border-border/60 rounded-xl p-6 overflow-hidden transition-all hover:border-primary/30">
              {/* Decorative Accent */}
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover/wallet:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background border border-border text-muted-foreground flex items-center justify-center shadow-md shadow-black/5">
                      {walletType === "independent" ? (
                        <CurrencyCircleDollar size={24} weight="fill" />
                      ) : (
                        <TreeStructure size={24} weight="fill" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[15px] text-foreground tracking-tight">
                        {walletType === "independent" ? "New Single Wallet" : "Existing Wallet"}
                      </h4>
                      <p className="text-[12px] text-muted-foreground">Active Configuration</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[11px] font-bold tracking-tight text-muted-foreground/60 mb-1">Available balance</p>
                    <p className="text-2xl font-bold text-foreground tracking-tight">RM 45,000.00</p>
                    
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="h-8 text-[11px] font-bold rounded-full gap-1.5 px-3 border-border/60 hover:bg-muted transition-all shadow-sm"
                      >
                        <ClockCounterClockwise size={14} weight="bold" />
                        History
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => setIsTopUpModalOpen(true)}
                        className="h-8 text-[11px] font-bold rounded-full gap-1.5 px-3 bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                      >
                        <Plus size={14} weight="bold" />
                        Top-Up
                      </Button>
                    </div>
                  </div>
                </div>

                  <div className="pt-6 border-t border-border/40 grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailField 
                      label="Wallet ID" 
                      value={<span className="font-mono text-[11px] bg-background px-1.5 py-0.5 rounded border border-border/60 tracking-tight text-foreground/70">WAL-BR01-2026</span>} 
                    />
                    <DetailField 
                      label="Utilization" 
                      value={<span className="text-[14px] font-bold text-foreground/80 tracking-tight">68% <span className="text-[11px] font-normal text-muted-foreground ml-1">(RM 30,600 spent)</span></span>} 
                    />
                  {walletType === "shared" && (
                    <DetailField 
                      label="Source Pool" 
                      value={<span className="text-[13px] font-medium text-primary tracking-tight">Corporate Master HQ Wallet</span>} 
                      className="md:col-span-1"
                    />
                  )}
                </div>
              </div>
            </div>
        </DetailSection>
      </TwoColumnDetailLayout>

      {/* Manual Top-Up Modal */}
      <ManualTopUpModal 
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        orgName="Acme Corporation Sdn Bhd"
        branchName={branchData.name}
        walletId="WAL-BR01-2026"
      />

      {/* Top-Up History Modal */}
      <TopUpHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        branchId={branchId}
        branchName={branchData.name}
      />
    </div>
  );
}
