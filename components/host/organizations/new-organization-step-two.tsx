"use client";

import {
  ArrowLeft,
  Building,
  CheckCircle,
  IdentificationCard,
  MapPin,
  NavigationArrow,
  Wallet,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { FormSelect } from "@/components/shared/form-select";
import { LocationPicker } from "@/components/shared/location-picker";
import { Spinner } from "@/components/shared/spinner";
import type { LocationData } from "@/components/shared/location-picker";
import { MOCK_ACCOUNTS } from "@/lib/mock-data";

interface NewOrganizationStepTwoProps {
  accountName: string;
  accountType: "new" | "existing";
  branchAddress: LocationData;
  branchName: string;
  creditLimit: string;
  existingAccountId: string;
  isSubmitting: boolean;
  labelCls: string;
  onAccountNameChange: (value: string) => void;
  onAccountTypeChange: (value: "new" | "existing") => void;
  onBack: () => void;
  onBranchAddressChange: (value: LocationData) => void;
  onBranchNameChange: (value: string) => void;
  onConfirm: () => void;
  onCreditLimitChange: (value: string) => void;
  onExistingAccountChange: (value: string) => void;
}

export function NewOrganizationStepTwo({
  accountName,
  accountType,
  branchAddress,
  branchName,
  creditLimit,
  existingAccountId,
  isSubmitting,
  labelCls,
  onAccountNameChange,
  onAccountTypeChange,
  onBack,
  onBranchAddressChange,
  onBranchNameChange,
  onConfirm,
  onCreditLimitChange,
  onExistingAccountChange,
}: NewOrganizationStepTwoProps) {
  return (
    <div className="animate-in space-y-6 fade-in slide-in-from-bottom-4 duration-400">
      <div id="hq-identity" className="scroll-mt-24 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building size={16} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lead font-semibold text-foreground">HQ Branch Identity</h3>
              <p className="text-label text-muted-foreground">Basic identifiers for the headquarters branch.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Branch Name</label>
            <input
              value={branchName}
              onChange={(event) => onBranchNameChange(event.target.value)}
              placeholder="e.g. Acme Corporation HQ"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-body font-medium text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
      </div>

      <div id="hq-location" className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin size={16} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lead font-semibold text-foreground">Location Mapping</h3>
              <p className="text-label text-muted-foreground">Geographical data and coordinate pinning.</p>
            </div>
          </div>
          <div className="p-1">
            <LocationPicker value={branchAddress} onChange={onBranchAddressChange} />
          </div>
        </div>
      </div>

      <div id="hq-account" className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wallet size={16} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lead font-semibold text-foreground">Account Configuration</h3>
              <p className="text-label text-muted-foreground">
                Define how this branch is funded. Top up after creation from the branch detail page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <ChoiceCard
              title="New Account"
              description="Create a dedicated standalone account for this branch. Funds are isolated."
              selected={accountType === "new"}
              onSelect={() => onAccountTypeChange("new")}
              icon={Wallet}
            />
            <ChoiceCard
              title="Existing Account"
              description="Link this branch to an existing account (e.g. shared with another cluster)."
              selected={accountType === "existing"}
              onSelect={() => onAccountTypeChange("existing")}
              icon={IdentificationCard}
            />
          </div>

          <div className="space-y-6">
            {accountType === "new" ? (
              <div className="animate-in space-y-5 fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className={labelCls}>Account Name</label>
                  <input
                    value={accountName}
                    onChange={(event) => onAccountNameChange(event.target.value)}
                    placeholder="e.g. HQ Main Account"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-body font-semibold text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Credit Limit (RM)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(event) => onCreditLimitChange(event.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-body font-semibold text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                  <p className="text-label font-medium text-faint">
                    Max overdraft this branch may use beyond its balance.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Default Currency</label>
                  <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-body">
                    <span className="flex h-5 w-8 items-center justify-center rounded-sm bg-muted text-label font-medium text-muted-foreground">
                      MYR
                    </span>
                    <span className="whitespace-nowrap font-semibold text-foreground">
                      Malaysian Ringgit (RM)
                    </span>
                    <span className="ml-auto text-label font-semibold text-faint">Locked</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in space-y-1.5 fade-in slide-in-from-top-2 duration-300">
                <label className={labelCls}>Bridge to Existing Account</label>
                <FormSelect
                  value={existingAccountId}
                  onChange={onExistingAccountChange}
                  options={[
                    { label: "Select an account...", value: "" },
                    ...MOCK_ACCOUNTS.map((account) => ({
                      label: `${account.name} — RM ${account.balance.toLocaleString()} MYR`,
                      value: account.id,
                    })),
                  ]}
                />
                <p className="mt-1.5 text-label font-medium italic text-faint">
                  * This branch will consume funds from the selected centralized liquidity pool.
                </p>
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3 text-body text-subtle">
                <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                <span>
                  Administrative fees are consolidated at the parent organization level for all linked accounts.
                </span>
              </div>
              {accountType === "new" && (
                <div className="animate-in flex items-start gap-3 text-body text-subtle fade-in duration-300">
                  <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                  <span>A 1.5% administrative fee applies to all standalone accounts.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl animate-in slide-in-from-bottom-10 duration-700 ease-out lg:left-[calc(50%+104px)] lg:translate-x-0">
        <Button
          variant="ghost"
          size="lg"
          className="flex items-center gap-2 px-6 text-body font-semibold transition-colors"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={14} weight="bold" />
          Back
        </Button>
        <div className="h-6 w-px bg-border/40" />
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 text-body font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" variant="white" />
              Creating...
            </>
          ) : (
            <>
              Confirm & Create
              <NavigationArrow size={14} weight="bold" className="rotate-90" />
            </>
          )}
        </Button>
      </div>

      <div className="h-[60vh]" />
    </div>
  );
}
