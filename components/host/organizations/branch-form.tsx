"use client";

import { useState } from "react";
import {
  MapPin,
  CaretLeft,
  DeviceMobile,
  MapPinLine,
  IdentificationCard,
  Building,
  CheckCircle,
  PaperPlaneTilt,
  Wallet,
  Users,
  UploadSimple,
  X,
  Info,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DetailSection } from "@/components/shared/detail-section";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { LocationPicker } from "@/components/shared/location-picker";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BranchFormProps {
  branchId?: string | null;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

// Mock org limits and same-org wallets for the dropdown
const ORG_LIMITS = {
  walletLimit: 50000,
  creditLimit: 10000,
};

const EXISTING_WALLETS = [
  { id: "wal_1", name: "KL HQ Wallet", balance: 30000 },
  { id: "wal_2", name: "PJ Ops Wallet", balance: 15000 },
];

export function BranchForm({ branchId, onCancel, onSubmit }: BranchFormProps) {
  const isEditing = !!branchId;
  const [walletType, setWalletType] = useState<"new" | "existing">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Wallet fields
  const [walletName, setWalletName] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [existingWalletId, setExistingWalletId] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // Mock initial data if editing
  const [formData, setFormData] = useState({
    name: branchId ? (branchId === "br_1" ? "ACME HQ (Kuala Lumpur)" : "ACME Subang Jaya") : "",
    type: branchId ? (branchId === "br_1" ? "HQ" : "Branch") : "Branch",
    address: {
      line: branchId ? "Level 12, Menara South" : "",
      city: branchId ? "Kuala Lumpur" : "",
      state: branchId ? "Wilayah Persekutuan" : "",
      postalCode: branchId ? "55100" : "",
      country: "Malaysia",
      lat: branchId ? "3.1390" : "",
      lon: branchId ? "101.7036" : ""
    }
  });

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setAttachment(file);
  };

  const removeAttachment = () => setAttachment(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);

    // Auto-close or navigate after celebration
    setTimeout(() => {
      onSubmit(formData);
    }, 2500);
  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors bg-card shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-heading font-semibold tracking-tight text-foreground">
              {isEditing ? "Edit Branch" : "Add New Branch"}
            </h2>
            <p className="text-nav text-muted-foreground mt-1">
              Configure location, personnel, and financial mapping for this branch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting || isSuccess}
            className="text-muted-foreground font-medium hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting || isSuccess}
            onClick={handleSubmit}
            className="bg-primary text-white hover:bg-primary/90 font-medium px-6 shadow-sm shadow-primary/20 min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isEditing ? "Saving..." : "Creating..."}</span>
              </div>
            ) : (
              isEditing ? "Save Changes" : "Create Branch"
            )}
          </Button>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-card rounded-lg border border-border py-20 animate-in zoom-in-95 duration-300">
          <SuccessCelebration
            title={isEditing ? "Changes Saved!" : "Branch Created!"}
            message={isEditing
              ? `${formData.name} has been successfully updated.`
              : `A new chapter begins for ${formData.name}.`
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
          <DetailSection
            title="Branch Identity"
            icon={<Building size={18} weight="duotone" />}
            description="Basic identifiers and branch classification"
          >
            <div className="space-y-5 p-1">
              <div className="space-y-1.5">
                <label className="text-micro font-semibold text-muted-foreground/40 tracking-tight">Branch Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ACME Subang Jaya"
                  className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-foreground hover:border-border/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-micro font-semibold text-muted-foreground/40 tracking-tight">Branch Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/10 border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-foreground hover:border-border/80 cursor-pointer"
                  >
                    <option value="HQ">Headquarters (HQ)</option>
                    <option value="Branch">Branch</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-micro font-semibold text-muted-foreground/40 tracking-tight">Status</label>
                  <div className="h-[38px] flex items-center px-3 bg-muted/20 border border-border rounded-lg text-nav text-muted-foreground font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Pending activation
                  </div>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            title="Location Mapping"
            icon={<MapPin size={18} weight="duotone" />}
            description="Geographical data and coordinate pinning"
          >
            <div className="p-1">
              <LocationPicker
                value={formData.address as any}
                onChange={(addr) => setFormData({ ...formData, address: addr as any })}
              />
            </div>
          </DetailSection>

          {/* Financial Setup moved below Location Mapping */}
          <DetailSection
            title="Wallet Configuration"
            icon={<Wallet size={18} weight="duotone" />}
            description="Define how this branch is funded"
          >
            {/* Org limits info */}
            <div className="mb-4 flex items-center gap-3 px-3 py-2 rounded-lg border border-border/60 bg-muted/20 text-nav text-muted-foreground">
              <Info size={16} className="text-primary shrink-0" />
              <span className="font-medium">
                Organization limits: Wallet RM {ORG_LIMITS.walletLimit.toLocaleString()} · Credit RM {ORG_LIMITS.creditLimit.toLocaleString()}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="text-muted-foreground/40 cursor-help ml-auto" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-nav max-w-[220px]">Wallet limit is the max prepaid funds. Credit limit is the max overdraft before hard block.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 gap-4 p-1">
              <ChoiceCard
                title="New Wallet"
                description="Create a dedicated standalone wallet for this branch. Funds are isolated."
                selected={walletType === "new"}
                onSelect={() => setWalletType("new")}
                icon={Wallet}
              />
              <ChoiceCard
                title="Existing Wallet"
                description="Link this branch to an existing wallet (e.g. Shared with HQ or another cluster)."
                selected={walletType === "existing"}
                onSelect={() => setWalletType("existing")}
                icon={IdentificationCard}
              />
            </div>

            <div className="mt-6 space-y-6">
              {walletType === "new" ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-nav font-semibold text-foreground">Wallet Name</label>
                    <input
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="e.g. PJ Ops Wallet"
                      className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-semibold text-foreground hover:border-border/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-nav font-semibold text-foreground">Initial Amount (RM)</label>
                    <input
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-semibold text-foreground hover:border-border/80"
                    />
                    <p className="text-caption text-muted-foreground/40 font-medium">Top-up amount to seed this wallet.</p>
                  </div>

                  {/* Attachment upload */}
                  <div className="space-y-1.5">
                    <label className="text-nav font-semibold text-foreground">Payment Receipt</label>
                    <p className="text-caption text-muted-foreground/40 font-medium">Attach proof of payment for manual top-ups.</p>
                    {attachment ? (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card">
                        <UploadSimple size={18} className="text-primary" />
                        <span className="text-body font-semibold text-foreground flex-1 truncate">{attachment.name}</span>
                        <button onClick={removeAttachment} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group">
                        <UploadSimple size={24} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        <span className="text-nav font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Click to upload receipt</span>
                        <span className="text-caption text-muted-foreground/40">JPG, PNG, PDF up to 5MB</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleAttachmentChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {/* TODO: Replace with FPX payment gateway button in the future */}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-nav font-semibold text-foreground">Default Currency</label>
                    <div className="flex items-center gap-3 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-body">
                      <span className="w-8 h-5 bg-muted rounded-sm flex items-center justify-center text-micro font-semibold text-muted-foreground">MYR</span>
                      <span className="text-foreground font-semibold whitespace-nowrap">Malaysian Ringgit (RM)</span>
                      <span className="ml-auto text-caption text-muted-foreground/40 font-semibold tracking-tight">Locked</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-nav font-semibold text-foreground">Bridge to Existing Wallet</label>
                  <select
                    value={existingWalletId}
                    onChange={(e) => setExistingWalletId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-semibold text-foreground hover:border-border/80 cursor-pointer"
                  >
                    <option value="">Select a wallet...</option>
                    {EXISTING_WALLETS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — RM {w.balance.toLocaleString()} MYR
                      </option>
                    ))}
                  </select>
                  <p className="text-caption text-muted-foreground/40 mt-1.5 font-medium italic">
                    * This branch will consume funds from the selected centralized liquidity pool.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-start gap-3 text-nav text-muted-foreground">
                  <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                  <span>Administrative fees are consolidated at the parent organization level for all linked accounts.</span>
                </div>
                {walletType === "new" && (
                  <div className="flex items-start gap-3 text-nav text-muted-foreground animate-in fade-in duration-300">
                    <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                    <span>A 1.5% administrative fee applies to all standalone wallets.</span>
                  </div>
                )}
              </div>
            </div>
          </DetailSection>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          <DetailSection
            title="Admin Governance"
            icon={<Users size={18} weight="duotone" />}
            description="Manage branch access roles"
          >
             <div className="p-1">
               <div className="border-2 border-dashed border-border/60 rounded-lg p-8 flex flex-col items-center text-center space-y-3 hover:border-primary/20 hover:bg-muted/30 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <PaperPlaneTilt size={20} />
                  </div>
                  <div>
                    <p className="text-body font-semibold text-foreground leading-tight">Invite org admin</p>
                    <p className="text-label text-muted-foreground mt-1">Send an invitation to manage this branch.</p>
                  </div>
                  <Button variant="secondary" size="sm" className="text-label font-semibold rounded-full px-6 transition-all hover:bg-muted">
                    Add Invitation
                  </Button>
               </div>
             </div>
          </DetailSection>

          <div className="p-4 rounded-lg border border-border bg-card shadow-sm space-y-4">
            <h4 className="text-nav font-semibold text-muted-foreground/40 tracking-tight">Branch setup guide</h4>
            <div className="space-y-3">
              {[
                { label: "Identity Verified", status: true },
                { label: "Location Mapped", status: true },
                { label: "Financial Pool Linked", status: false },
                { label: "Admins Invited", status: false }
              ].map((step, i) => (
                <div key={i} className="flex items-center justify-between text-nav">
                  <span className="text-muted-foreground font-medium">{step.label}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    step.status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-muted"
                  )} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}



