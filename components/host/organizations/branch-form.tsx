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
  Users
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DetailSection } from "@/components/shared/detail-section";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { LocationPicker } from "@/components/shared/location-picker";
import { cn } from "@/lib/utils";

interface BranchFormProps {
  branchId?: string | null;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

export function BranchForm({ branchId, onCancel, onSubmit }: BranchFormProps) {
  const isEditing = !!branchId;
  const [walletType, setWalletType] = useState<"independent" | "shared">("independent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors bg-white shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              {isEditing ? "Edit Branch" : "Add New Branch"}
            </h2>
            <p className="text-[13px] text-zinc-500 mt-1">
              Configure location, personnel, and financial mapping for this branch.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onCancel} 
            disabled={isSubmitting || isSuccess}
            className="text-zinc-600 font-medium"
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
        <div className="bg-white rounded-2xl border border-zinc-200 py-20 animate-in zoom-in-95 duration-300">
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
                <label className="text-[13px] font-medium text-zinc-900">Branch Name</label>
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ACME Subang Jaya"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-zinc-700 hover:border-zinc-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-zinc-900">Branch Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-zinc-700 hover:border-zinc-300 cursor-pointer"
                  >
                    <option value="HQ">Headquarters (HQ)</option>
                    <option value="Branch">Regional Branch</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-zinc-900">Status</label>
                  <div className="h-[38px] flex items-center px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] text-zinc-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Pending Activation
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
            <div className="grid grid-cols-1 gap-4 p-1">
              <ChoiceCard 
                title="New Single Wallet"
                description="Create a dedicated standalone wallet for this branch. Funds are isolated."
                selected={walletType === "independent"}
                onSelect={() => setWalletType("independent")}
                icon={Wallet}
              />
              <ChoiceCard 
                title="Existing Wallet"
                description="Link this branch to an existing wallet (e.g. Shared with HQ or another regional cluster)."
                selected={walletType === "shared"}
                onSelect={() => setWalletType("shared")}
                icon={IdentificationCard}
              />
            </div>
            
            <div className="mt-6 space-y-6">
              {walletType === "independent" ? (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[13px] font-medium text-zinc-900">Default Currency</label>
                  <div className="flex items-center gap-3 w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-[14px]">
                    <span className="w-8 h-5 bg-zinc-200 rounded-sm flex items-center justify-center text-[10px] font-medium text-zinc-500">MYR</span>
                    <span className="text-zinc-600 font-medium whitespace-nowrap">Malaysian Ringgit (RM)</span>
                    <span className="ml-auto text-[11px] text-zinc-400 font-medium tracking-tight">Locked</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[13px] font-medium text-zinc-900">Bridge to Existing Wallet</label>
                  <select 
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-zinc-700 hover:border-zinc-300 cursor-pointer"
                  >
                    <option value="hq">Global Tech HQ - RM 250,000.00 MYR</option>
                    <option value="hub_1">North Regional Hub - RM 45,000.00 MYR</option>
                    <option value="sat_1">Cyberjaya Satellite - RM 12,000.00 MYR</option>
                  </select>
                  <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                    * This branch will consume funds from the selected centralized liquidity pool.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex items-start gap-3 text-[13px] text-zinc-500">
                  <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                  <span>Administrative fees are consolidated at the parent organization level for all linked accounts.</span>
                </div>
                {walletType === "independent" && (
                  <div className="flex items-start gap-3 text-[13px] text-zinc-500 animate-in fade-in duration-300">
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
               <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center text-center space-y-3 hover:border-primary/20 hover:bg-zinc-50/50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <PaperPlaneTilt size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-zinc-900 leading-tight">Invite Org Admin</p>
                    <p className="text-[12px] text-zinc-500 mt-1">Send an invitation to manage this branch.</p>
                  </div>
                  <Button variant="secondary" size="sm" className="text-[12px] font-medium rounded-full px-4 transition-all">
                    Add Invitation
                  </Button>

               </div>
             </div>
          </DetailSection>
          
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <h4 className="text-[13px] font-semibold text-zinc-400 tracking-tight">Branch setup guide</h4>
            <div className="space-y-3">
              {[
                { label: "Identity Verified", status: true },
                { label: "Location Mapped", status: true },
                { label: "Financial Pool Linked", status: false },
                { label: "Admins Invited", status: false }
              ].map((step, i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-600">{step.label}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    step.status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-zinc-200"
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




