"use client";

import { Wallet } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAccounts, useAccountTransactions } from "@/features/accounts/hooks";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useQueryState } from "@/hooks/use-tab-persistence";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { useState, Suspense } from "react";
import { UpdateBalanceModal } from "@/components/host/accounts/update-balance-modal";
import { RecordTopupModal } from "@/components/host/accounts/record-topup-modal";
import { cn } from "@/lib/utils";
import {
  AccountOverviewSection,
  AccountSettingsSection,
  AccountTransactionsSection,
} from "@/components/host/accounts/account-detail-sections";

function AccountDetailContent() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const { accounts } = useAccounts();
  const { transactions } = useAccountTransactions(accountId);

  const [activeTab, setActiveTab] = useQueryState("tab", "transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<"By Month" | "By Quarter" | "By Year">("By Month");

  // Danger States
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<"suspend" | "terminate" | null>(null);
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false);

  // Modal States
  const [isUpdateBalanceOpen, setIsUpdateBalanceOpen] = useState(false);
  const [isRecordTopupOpen, setIsRecordTopupOpen] = useState(false);

  const wallet = accounts.find(w => w.id === accountId);

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-heading font-semibold tracking-tight">Account Not Found</h2>
        <Button variant="ghost" onClick={() => router.push("/accounts")} className="rounded-lg px-6">
          Back to Accounts
        </Button>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const OTHER_ACCOUNTS = accounts
    .filter(w => w.id !== accountId)
    .map(w => ({ label: `${w.name} (${w.orgName})`, href: `/accounts/${w.id}` }));

  const openDangerAction = (action: "suspend" | "terminate") => {
    setDangerAction(action);
    setIsDangerModalOpen(true);
  };

  const dangerActionConfig = {
    suspend: {
      title: "Suspend Account",
      confirmLabel: "Suspend Account",
      description: "Temporarily pause all claim deductions and top-up activities for this account.",
      impactPoints: [
        "Organization will not be able to perform manual top-ups.",
        "Internal claims will be queued but not deducted until reactivation.",
        "You can reactivate the account at any time from this dashboard.",
      ],
      run: async () => {
        // Mock suspension
        return { success: true, message: "Account suspended successfully" };
      }
    },
    terminate: {
      title: "Terminate Account",
      confirmLabel: "Terminate Account Permanently",
      description: "Shut down this account permanently. This action is destructive and cannot be undone.",
      impactPoints: [
        "The organization will lose its line of credit or remaining balance immediately.",
        "All historical transaction records will be archived and read-only.",
        "Active benefit policies linked to this account's credit will be invalidated.",
        "A new account must be created to restore fiscal operations for this branch.",
      ],
      run: async () => {
        // Mock termination
        router.push("/accounts");
        return { success: true, message: "Account terminated permanently" };
      }
    }
  };

  return (
    <div className="pb-12">
      <div className="bg-card border-border border-b -mx-6 -mt-6 px-6 pt-6 relative z-30">
        <div className="py-6 lg:px-2">
          <Breadcrumbs
            items={[
              { label: "Accounts", href: "/accounts" },
              {
                label: `${wallet.name}`,
                options: OTHER_ACCOUNTS
              }
            ]}
            className="mb-4"
          />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-15 h-15 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground border border-border/60 transition-all">
                <Wallet size={32} weight="fill" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-display font-semibold tracking-tight text-foreground">{wallet.name}</h1>
                  <StatusBadge status={wallet.status} variant={wallet.status === "active" ? "emerald" : "zinc"} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-label text-faint bg-background px-2 py-0.5 rounded border border-border uppercase tracking-widest">{wallet.id}</span>
                  <span className="opacity-20 text-muted-foreground">•</span>
                  <span className="text-label font-medium text-faint">{wallet.orgName}</span>
                  <span className="opacity-20 text-muted-foreground">•</span>
                  <span className="text-label font-medium text-faint">{wallet.branchName}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-8 mt-8 border-b border-border">
            <button
              onClick={() => setActiveTab("transactions")}
              className={cn(
                "h-10 px-0 border-b-2 text-body font-medium transition-all relative",
                activeTab === "transactions" ? "border-primary text-primary" : "border-transparent text-faint hover:text-foreground"
              )}
            >
               History
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "h-10 px-0 border-b-2 text-body font-medium transition-all relative",
                activeTab === "details" ? "border-primary text-primary" : "border-transparent text-faint hover:text-foreground"
              )}
            >
               Account Details
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "h-10 px-0 border-b-2 text-body font-medium transition-all relative",
                activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-faint hover:text-foreground"
              )}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-8">
        {activeTab === "transactions" && (
          <AccountTransactionsSection
            activePeriod={period}
            filteredTransactions={filteredTransactions}
            onOpenDangerAction={openDangerAction}
            onOpenRecordTopup={() => setIsRecordTopupOpen(true)}
            onOpenUpdateBalance={() => setIsUpdateBalanceOpen(true)}
            onPeriodChange={setPeriod}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            wallet={wallet}
          />
        )}

        {activeTab === "details" && (
          <AccountOverviewSection wallet={wallet} />
        )}

        {activeTab === "settings" && (
          <AccountSettingsSection onOpenDangerAction={openDangerAction} />
        )}
      </div>

      <ConfirmationModal
        isOpen={isDangerModalOpen}
        title={dangerAction ? dangerActionConfig[dangerAction].title : "Confirm Action"}
        description={dangerAction ? dangerActionConfig[dangerAction].description : ""}
        impactPoints={dangerAction ? dangerActionConfig[dangerAction].impactPoints : []}
        confirmLabel={dangerAction ? dangerActionConfig[dangerAction].confirmLabel : ""}
        isSubmitting={isDangerSubmitting}
        onClose={() => {
          setIsDangerModalOpen(false);
          setDangerAction(null);
        }}
        onConfirm={async () => {
          if (!dangerAction) return;
          setIsDangerSubmitting(true);
          try {
            await dangerActionConfig[dangerAction].run();
            setIsDangerModalOpen(false);
            setDangerAction(null);
          } finally {
            setIsDangerSubmitting(false);
          }
        }}
      />

      {wallet && (
        <>
          <UpdateBalanceModal
            isOpen={isUpdateBalanceOpen}
            onClose={() => setIsUpdateBalanceOpen(false)}
            accountId={wallet.id}
            accountName={wallet.name}
          />
          <RecordTopupModal
            isOpen={isRecordTopupOpen}
            onClose={() => setIsRecordTopupOpen(false)}
            accountId={wallet.id}
            accountName={wallet.name}
          />
        </>
      )}
    </div>
  );
}

export default function AccountDetailPage() {
  return (
    <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading account details...</div>}>
      <AccountDetailContent />
    </Suspense>
  );
}
