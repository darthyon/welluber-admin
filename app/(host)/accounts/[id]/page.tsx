"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  CaretDown,
  LockKey,
  Prohibit,
  CalendarBlank,
  Gear,
  Wallet,
  WarningCircle,
  DownloadSimple,
  DotsThreeCircle,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAccounts, useAccountTransactions } from "@/features/accounts/hooks";
import { TRANSACTION_TYPE_LABELS } from "@/features/accounts/constants";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { FormSelect } from "@/components/shared/form-select";
import { useQueryState } from "@/hooks/use-tab-persistence";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { SharedDataTable } from "@/components/shared/data-table";
import { useState, Suspense } from "react";
import { cn, formatDate } from "@/lib/utils";
import { UpdateBalanceModal } from "@/components/host/accounts/update-balance-modal";
import { RecordTopupModal } from "@/components/host/accounts/record-topup-modal";

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
  type AccountTransactionRow = (typeof filteredTransactions)[number];



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
           <>
             <div className="bg-primary rounded-xl relative p-8 text-primary-foreground overflow-hidden">
                {/* Account illustration — anchored bottom right, overflows card */}
                <Image
                  loading="lazy"
                  src="/img-wallet.webp"
                  alt=""
                  width={256}
                  height={160}
                  className="absolute right-0 bottom-0 w-64 h-auto object-contain opacity-40 pointer-events-none hidden lg:block"
                />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  {/* Available Balance */}
                  <div className="space-y-1">
                    <p className="text-label font-semibold text-primary-foreground/80">Available Balance</p>
                    <h2 className="text-display font-semibold tracking-tight text-primary-foreground tabular-nums">
                      RM {(wallet.balance - wallet.pendingDeductions).toLocaleString()}
                    </h2>
                    <p className="text-label text-primary-foreground/70">
                      Last updated {new Date(wallet.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(wallet.updatedAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-4xl border border-primary-foreground/30 text-primary-foreground font-semibold text-label hover:bg-primary-foreground/10 transition-colors">
                          <Wallet size={14} weight="fill" />
                          Add Balance
                          <CaretDown size={12} weight="bold" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" align="end">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => setIsRecordTopupOpen(true)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-body font-medium text-left text-subtle hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                            Manual Top-up
                          </button>
                          <button
                            onClick={() => setIsUpdateBalanceOpen(true)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-body font-medium text-left text-subtle hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <DotsThreeCircle size={14} className="text-primary" />
                            Update Balance
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-4xl border border-primary-foreground/30 text-primary-foreground font-semibold text-label hover:bg-primary-foreground/10 transition-colors">
                          More Actions
                          <CaretDown size={12} weight="bold" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" align="end">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-body font-medium text-left text-subtle hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <DownloadSimple size={14} className="text-faint" />
                            View Statement
                          </button>
                          <button
                            onClick={() => openDangerAction("suspend")}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-body font-medium text-left text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <WarningCircle size={14} />
                            {wallet.status === "suspended" ? "Resume Account" : "Suspend Account"}
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

            <div className="space-y-4 animate-in fade-in transition-all duration-300">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1">
                  <DataFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search transactions..."
                  />
                </div>

                 <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border">
                      {(["By Month", "By Quarter", "By Year"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={`px-3 py-1 text-label font-semibold rounded-md transition-all ${
                            period === p ? "bg-background shadow-sm text-foreground" : "text-faint hover:text-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <FormSelect
                      value=""
                      onChange={() => {}}
                      options={
                        period === "By Month"
                          ? [
                              { label: "January 2026", value: "jan" },
                              { label: "February 2026", value: "feb" },
                              { label: "March 2026", value: "mar" },
                            ]
                          : period === "By Quarter"
                            ? [
                                { label: "Q1 (Jan - Mar) 2026", value: "q1" },
                                { label: "Q2 (Apr - Jun) 2026", value: "q2" },
                              ]
                            : [{ label: "2026", value: "2026" }]
                      }
                      triggerClassName="h-8 min-w-[120px]"
                      disabled
                    />

                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1 h-[32px] bg-background border border-border hover:bg-muted/30 rounded-lg text-label font-semibold text-foreground transition-colors group">
                          <CalendarBlank size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span>Custom Range</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="range" />
                      </PopoverContent>
                    </Popover>
                  </div>
               </div>

               <SharedDataTable
                 defaultSort={{ key: "createdAt", direction: "desc" }}
                 freezeFirst
                 freezeLast
                 columns={[
                   {
                     header: "Description",
                     accessorKey: "description",
                     sortable: true,
                       render: (trx: AccountTransactionRow) => {
                        const iconBg = trx.type === "topup" ? "bg-primary/20 text-primary" :
                          trx.type === "pre-auth" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20" :
                          trx.type === "cancelled" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20" :
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20"
                        const icon = trx.type === "topup" ? <ArrowUpRight size={15} weight="bold" /> :
                          trx.type === "pre-auth" ? <LockKey size={15} weight="bold" /> :
                          trx.type === "cancelled" ? <Prohibit size={15} weight="bold" /> :
                          <ArrowDownRight size={15} weight="bold" />
                         return (
                        <div className="flex items-center gap-4 py-1">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", iconBg)}>
                            {icon}
                          </div>
                         <div className="space-y-0.5">
                           <p className="text-body font-semibold text-foreground">{trx.description}</p>
                           <p className="text-label font-semibold text-faint font-mono">ID: {trx.id}</p>
                         </div>
                       </div>
                      )
                      }
                    },
                     {
                       header: "Amount",
                      accessorKey: "amount",
                      sortable: true,
                      align: "right",
                      render: (trx: AccountTransactionRow) => {
                        const isTopup = trx.type === "topup"
                        const unit = "RM"
                        const amountClass = trx.type === "cancelled"
                          ? "text-lead font-semibold tracking-tight tabular-nums line-through text-rose-500 dark:text-rose-400"
                          : trx.type === "pre-auth"
                          ? "text-lead font-semibold tracking-tight tabular-nums text-amber-600 dark:text-amber-400"
                          : trx.type === "topup"
                          ? "text-lead font-semibold tracking-tight tabular-nums text-primary"
                          : "text-lead font-semibold tracking-tight tabular-nums text-foreground"
                        const prefix = isTopup ? "+" : "-"
                        return (
                        <div className="text-right">
                          <p className={amountClass}>
                            {prefix} {unit} {Math.abs(trx.amount).toLocaleString()}
                          </p>
                          <p className="text-label font-medium text-faint text-nowrap tabular-nums">Balance after: RM {trx.balanceAfter.toLocaleString()}</p>
                        </div>
                      )},
                    },
                    {
                      header: "Type",
                      accessorKey: "type",
                      sortable: true,
                      render: (trx: AccountTransactionRow) => {
                        const variant = trx.type === "pre-auth" ? "amber" as const :
                          trx.type === "cancelled" ? "rose" as const : "zinc" as const
                        return (
                          <StatusBadge status={TRANSACTION_TYPE_LABELS[trx.type as keyof typeof TRANSACTION_TYPE_LABELS] || trx.type} variant={variant} />
                        )
                      },
                    },
                    {
                      header: "Reference",
                      accessorKey: "voucherName",
                      sortable: true,
                      render: (trx: AccountTransactionRow) => (
                        <div className="space-y-0.5">
                          {trx.voucherName ? (
                            <>
                              <p className="text-body font-semibold text-foreground">{trx.voucherName}</p>
                              <p className="text-label font-semibold text-faint font-mono">{trx.claimId}</p>
                            </>
                          ) : (
                            <span className="text-label text-faint">—</span>
                          )}
                        </div>
                      )
                    },
                    {
                      header: "Date",
                      accessorKey: "createdAt",
                      sortable: true,
                      align: "center",
                      render: (trx: AccountTransactionRow) => (
                        <div className="text-center">
                          <p className="text-body font-medium text-subtle whitespace-nowrap">
                            {formatDate(trx.createdAt)}
                          </p>
                          <p className="text-label font-medium text-faint">
                            {new Date(trx.createdAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )
                    },
                    {
                      header: "Actions",
                      align: "right",
                      render: () => (
                        <ActionPopover
                          actions={[
                            { label: "View detail record", onClick: () => {} },
                            { label: "Download voucher", onClick: () => {} },
                          ]}
                        />
                      )
                    }
                  ]}
                  data={filteredTransactions}
                />
             </div>
            </>
        )}

        {activeTab === "details" && (
          <div className="space-y-8 animate-in fade-in transition-all duration-300">
            <DetailSection title="Account configuration" icon={<Wallet size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                <DetailField label="Account name" value={wallet.name} />
                <DetailField
                  label="Status"
                  value={
                    <div className="flex items-center gap-3">
                      <StatusBadge status={wallet.status} variant={wallet.status === "active" ? "emerald" : "zinc"} />
                      <button className="text-label font-semibold text-primary hover:opacity-70 transition-opacity">Change status</button>
                    </div>
                  }
                />
                <DetailField label="Organization" value={wallet.orgName} />
                <DetailField label="Branch" value={wallet.branchName} />
                <DetailField label="Creation date" value={formatDate(wallet.createdAt)} />
                <DetailField label="Last activity" value={formatDate(wallet.updatedAt)} />
              </div>
            </DetailSection>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in transition-all duration-300">
            {/* Danger Zone Aligned with Org Module */}
            <DetailSection
              title="Danger Zone"
              icon={<Gear size={18} weight="duotone" />}
              description="Confirm how you want to change the account lifecycle."
            >
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-body font-medium text-foreground">Suspend Account</p>
                      <p className="text-label text-muted-foreground">
                        Pause all deductions and activities temporarily.
                      </p>
                    </div>
                    <Button variant="outline" className="text-label h-9" onClick={() => openDangerAction("suspend")}>
                      Suspend
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-body font-medium text-foreground">Terminate Account Permanently</p>
                      <p className="text-label text-muted-foreground">
                        Instantly shutdown fiscal operations for this branch.
                      </p>
                    </div>
                    <Button variant="destructive" className="text-label h-9" onClick={() => openDangerAction("terminate")}>
                      Terminate
                    </Button>
                  </div>
                </div>
              </div>
            </DetailSection>
          </div>
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
