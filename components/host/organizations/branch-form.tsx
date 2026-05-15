"use client";

import { useState } from "react";
import {
  MapPin,
  CaretLeft,
  IdentificationCard,
  Building,
  CheckCircle,
  Wallet,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { LocationPicker } from "@/components/shared/location-picker";
import type { LocationData } from "@/components/shared/location-picker";
import { FormSelect } from "@/components/shared/form-select";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { MOCK_ACCOUNTS } from "@/lib/mock-data";

interface BranchFormProps {
  branchId?: string | null;
  onCancel: () => void;
  onSubmit: (data: unknown) => void;
}

const ANCHOR_ITEMS = [
  { id: "branch-identity", label: "Branch Identity" },
  { id: "location-mapping", label: "Location Mapping" },
  { id: "account-configuration", label: "Account Configuration" },
];

export function BranchForm({ branchId, onCancel, onSubmit }: BranchFormProps) {
  const isEditing = !!branchId;
  const [accountType, setAccountType] = useState<"new" | "existing">("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Wallet fields
  const [accountName, setAccountName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [existingAccountId, setExistingAccountId] = useState("");

  // Mock initial data if editing
  const [formData, setFormData] = useState({
    name: branchId ? (branchId === "br_1" ? "ACME HQ (Kuala Lumpur)" : "ACME Subang Jaya") : "",
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      onSubmit(formData);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
        <div className="bg-card rounded-lg border border-border py-20 animate-in zoom-in-95 duration-300">
          <SuccessCelebration
            title={isEditing ? "Changes Saved!" : "Branch Created!"}
            message={isEditing
              ? `${formData.name} has been successfully updated.`
              : `A new chapter begins for ${formData.name}. Top up the account from the branch detail page.`
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left Column: Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> Back
              </button>
              <div>
                <h1 className="text-heading font-semibold text-foreground text-balance">
                  {isEditing ? "Edit Branch" : "Add New Branch"}
                </h1>
                <p className="text-subtle text-body mt-1">
                  Configure location, personnel, and financial mapping for this branch.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Section: Branch Identity */}
              <div id="branch-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Building size={16} weight="fill" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-lead font-semibold text-foreground">Branch Identity</h3>
                      <p className="text-label text-muted-foreground">Basic identifiers and branch classification.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-body font-semibold text-subtle mb-1.5 block">Branch Name</label>
                      <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. ACME Subang Jaya"
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all font-medium text-foreground"
                      />
                    </div>

                  </div>
                </div>
              </div>

              {/* Section: Location Mapping */}
              <div id="location-mapping" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin size={16} weight="fill" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-lead font-semibold text-foreground">Location Mapping</h3>
                      <p className="text-label text-muted-foreground">Geographical data and coordinate pinning.</p>
                    </div>
                  </div>

                  <div className="p-1">
                    <LocationPicker
                      value={(formData.address as LocationData) ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" }}
                      onChange={(addr) => setFormData({
                        ...formData,
                        address: {
                          ...addr,
                          lat: addr.lat !== undefined ? String(addr.lat) : "",
                          lon: addr.lon !== undefined ? String(addr.lon) : "",
                        },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Account Configuration */}
              <div id="account-configuration" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Wallet size={16} weight="fill" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-lead font-semibold text-foreground">Account Configuration</h3>
                      <p className="text-label text-muted-foreground">Define how this branch is funded. Top up after creation from the branch detail page.</p>
                    </div>
                  </div>

<div className="grid grid-cols-1 gap-4">
                    <ChoiceCard
                      title="New Account"
                      description="Create a dedicated standalone account for this branch. Funds are isolated."
                      selected={accountType === "new"}
                      onSelect={() => setAccountType("new")}
                      icon={Wallet}
                    />
                    <ChoiceCard
                      title="Existing Account"
                      description="Link this branch to an existing account (e.g. Shared with HQ or another cluster)."
                      selected={accountType === "existing"}
                      onSelect={() => setAccountType("existing")}
                      icon={IdentificationCard}
                    />
                  </div>

                  <div className="space-y-6">
                    {accountType === "new" ? (
                      <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5">
                          <label className="text-body font-semibold text-subtle mb-1.5 block">Account Name</label>
                          <input
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="e.g. PJ Ops Account"
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all font-semibold text-foreground"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-body font-semibold text-subtle mb-1.5 block">Credit Limit (RM)</label>
                          <input
                            type="number"
                            value={creditLimit}
                            onChange={(e) => setCreditLimit(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all font-semibold text-foreground"
                          />
                          <p className="text-label text-faint font-medium">Max overdraft this branch may use beyond its balance.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-body font-semibold text-subtle mb-1.5 block">Default Currency</label>
                          <div className="flex items-center gap-3 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-body">
                            <span className="w-8 h-5 bg-muted rounded-sm flex items-center justify-center text-label font-medium text-muted-foreground">MYR</span>
                            <span className="text-foreground font-semibold whitespace-nowrap">Malaysian Ringgit (RM)</span>
                            <span className="ml-auto text-label text-faint font-semibold">Locked</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-body font-semibold text-subtle mb-1.5 block">Bridge to Existing Account</label>
                        <FormSelect
                          value={existingAccountId}
                          onChange={(v) => setExistingAccountId(v)}
                          options={[{ label: "Select an account...", value: "" }, ...MOCK_ACCOUNTS.map((acc) => ({
                            label: `${acc.name} — RM ${acc.balance.toLocaleString()} MYR`,
                            value: acc.id,
                          }))]}
                          placeholder="Select an account..."
                        />
                        <p className="text-label text-faint mt-1.5 font-medium italic">
                          * This branch will consume funds from the selected centralized liquidity pool.
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                      <div className="flex items-start gap-3 text-body text-subtle">
                        <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                        <span>Administrative fees are consolidated at the parent organization level for all linked accounts.</span>
                      </div>
                      {accountType === "new" && (
                        <div className="flex items-start gap-3 text-body text-subtle animate-in fade-in duration-300">
                          <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                          <span>A 1.5% administrative fee applies to all standalone accounts.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Action Bar */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-body font-semibold px-6 transition-colors"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <div className="w-px h-6 bg-border/40" />
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-body font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEditing ? "Saving..." : "Creating..."}</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Save Changes" : "Create Branch"}</span>
                  )}
                </Button>
              </div>

              <div className="h-[40vh]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
