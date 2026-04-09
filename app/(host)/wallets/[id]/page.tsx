"use client";

import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Bank, 
  Info, 
  Clock, 
  User, 
  DotsThreeVertical,
  DotsThreeCircle,
  Funnel,
  DownloadSimple,
  Ticket,
  CalendarBlank,
  Buildings,
  Gear
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useWallets, useWalletTransactions } from "@/features/wallets/hooks";
import { TRANSACTION_TYPE_LABELS } from "@/features/wallets/constants";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useQueryState } from "@/hooks/use-tab-persistence";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { SharedDataTable } from "@/components/shared/data-table";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function WalletDetailContent() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;
  const { wallets } = useWallets();
  const { transactions } = useWalletTransactions(walletId);

  const [activeTab, setActiveTab] = useQueryState("tab", "transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState<"By Month" | "By Quarter" | "By Year">("By Month");
  
  // Danger States
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<"suspend" | "terminate" | null>(null);
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false);

  const wallet = wallets.find(w => w.id === walletId);

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Wallet Not Found</h2>
        <Button variant="outline" onClick={() => router.push("/wallets")} className="rounded-xl px-6">
          Back to Wallets
        </Button>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const limit = wallet.creditLimit || wallet.balance;
  const utilisationRatio = limit > 0 ? (wallet.balance / limit) : 0;
  const utilisationPercent = Math.round(utilisationRatio * 100);

  const OTHER_WALLETS = wallets
    .filter(w => w.id !== walletId)
    .map(w => ({ label: `${w.orgName} (${w.branchName})`, href: `/wallets/${w.id}` }));

  const openDangerAction = (action: "suspend" | "terminate") => {
    setDangerAction(action);
    setIsDangerModalOpen(true);
  };

  const dangerActionConfig = {
    suspend: {
      title: "Suspend Wallet",
      confirmLabel: "Suspend Wallet",
      description: "Temporarily pause all claim deductions and top-up activities for this wallet.",
      impactPoints: [
        "Organization will not be able to perform manual top-ups.",
        "Internal claims will be queued but not deducted until reactivation.",
        "You can reactivate the wallet at any time from this dashboard.",
      ],
      run: async () => {
        // Mock suspension
        return { success: true, message: "Wallet suspended successfully" };
      }
    },
    terminate: {
      title: "Terminate Wallet",
      confirmLabel: "Terminate Wallet Permanently",
      description: "Shut down this wallet permanently. This action is destructive and cannot be undone.",
      impactPoints: [
        "The organization will lose its line of credit or remaining cash balance immediately.",
        "All historical transaction records will be archived and read-only.",
        "Active benefit policies linked to this wallet's credit will be invalidated.",
        "A new wallet must be created to restore fiscal operations for this branch.",
      ],
      run: async () => {
        // Mock termination
        router.push("/wallets");
        return { success: true, message: "Wallet terminated permanently" };
      }
    }
  };

  return (
    <div className="pb-12">
      <div className="bg-card border-border border-b -mx-6 -mt-6 px-6 pt-6 relative z-30">
        <div className="max-w-[1200px] mx-auto py-6 lg:px-2">
          <Breadcrumbs 
            items={[
              { label: "Wallets", href: "/wallets" },
              { 
                label: `${wallet.orgName} (${wallet.branchName})`,
                options: OTHER_WALLETS
              }
            ]}
            className="mb-4"
          />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              <div className="w-15 h-15 rounded-2xl bg-zinc-100/80 flex items-center justify-center text-zinc-500 border border-zinc-200/60 transition-all">
                {wallet.model === "cash_balance" ? <Bank size={32} weight="fill" /> : <CreditCard size={32} weight="fill" />}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{wallet.orgName}</h1>
                  <StatusBadge status={wallet.status} variant={wallet.status === "active" ? "emerald" : "zinc"} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-zinc-400 bg-white px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-widest">{wallet.id}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[10px] font-semibold text-zinc-500">
                    {wallet.model === "cash_balance" ? "Cash balance" : "Credit limit"}
                  </span>
                  <span className="opacity-20 text-muted-foreground">•</span>
                  <span className="text-[12px] font-medium text-muted-foreground/60">{wallet.branchName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="lg" className="text-[13px] font-medium rounded-full h-10 px-5 border-border/60 hover:bg-muted/10">
                <CreditCard size={16} className="mr-2 opacity-60" />
                Update {wallet.model === "cash_balance" ? "Balance" : "Limit"}
              </Button>
              <ActionPopover 
                actions={[
                  { label: "View Statement", onClick: () => {} },
                  { label: "Suspend Wallet", isDanger: true, onClick: () => openDangerAction("suspend") },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-8 mt-8 border-b border-border">
            <button 
              onClick={() => setActiveTab("transactions")}
              className={cn(
                "h-10 px-0 border-b-2 text-[14px] font-medium transition-all relative",
                activeTab === "transactions" ? "border-primary text-primary" : "border-transparent text-muted-foreground/60 hover:text-foreground"
              )}
            >
              Transaction records
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={cn(
                "h-10 px-0 border-b-2 text-[14px] font-medium transition-all relative",
                activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-muted-foreground/60 hover:text-foreground"
              )}
            >
              General settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-8">
        {activeTab === "transactions" ? (
           <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-indigo-50/20 border border-indigo-100 rounded-2xl overflow-hidden relative p-8">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  {wallet.model === "cash_balance" ? <Bank size={80} weight="fill" /> : <CreditCard size={80} weight="fill" />}
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-1">
                      <p className="text-[12px] font-semibold text-indigo-600/70 tracking-tight">Utilisation</p>
                      <h2 className="text-4xl font-bold tracking-tight text-indigo-950">
                        RM {wallet.balance.toLocaleString()}
                      </h2>
                      <div className="flex items-center gap-3 mt-4">
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                          wallet.pendingDeductions > 0
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-zinc-50 border-zinc-200 text-zinc-400"
                        )}>
                          <Ticket size={14} weight="fill" />
                          {wallet.pendingDeductions === 0 ? "0" : `RM ${wallet.pendingDeductions.toLocaleString()}`} pending claims
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 min-w-[280px]">
                      <div className="flex justify-between items-center text-[12px] font-bold">
                        <span className="text-indigo-600/70 tracking-tight">Utilisation pool</span>
                        <span className="text-indigo-950 font-mono">{utilisationPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-indigo-200/50 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            utilisationRatio > 0.9 ? "bg-rose-500" : utilisationRatio > 0.7 ? "bg-amber-500" : "bg-indigo-600"
                          )}
                          style={{ width: `${Math.min(utilisationPercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-indigo-900/40 tracking-tight">
                        <span>Used RM {wallet.balance.toLocaleString()}</span>
                        <span>Total RM {(wallet.creditLimit || wallet.balance).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-xl p-5 space-y-5">
                <h3 className="text-[14px] font-bold tracking-tight text-foreground/80">Quick actions</h3>
                <div className="space-y-2.5 text-[13px] font-medium">
                   <Button variant="ghost" className="w-full justify-start h-10 gap-3 px-3 hover:bg-muted/50 rounded-lg group">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <ArrowUpRight size={14} weight="bold" />
                    </div>
                    Manual top-up
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-10 gap-3 px-3 hover:bg-muted/50 rounded-lg group">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <DotsThreeCircle size={14} weight="bold" />
                    </div>
                    Adjustment ledger
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-10 gap-3 px-3 hover:bg-muted/50 rounded-lg group">
                    <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-200 transition-colors">
                      <DownloadSimple size={14} weight="bold" />
                    </div>
                    Export statement
                  </Button>
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
                      {["By Month", "By Quarter", "By Year"].map((p) => (
                        <button 
                          key={p}
                          onClick={() => setPeriod(p as any)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                            period === p ? "bg-white shadow-sm text-foreground" : "text-muted-foreground/60 hover:text-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <select className="px-3 py-1 h-[32px] bg-white border border-border hover:bg-muted/30 rounded-lg text-[11px] font-bold text-foreground outline-none cursor-pointer transition-colors min-w-[120px]">
                      {period === "By Month" && (
                        <>
                          <option>January 2026</option>
                          <option>February 2026</option>
                          <option defaultValue="true">March 2026</option>
                        </>
                      )}
                      {period === "By Quarter" && (
                        <>
                          <option defaultValue="true">Q1 (Jan - Mar) 2026</option>
                          <option>Q2 (Apr - Jun) 2026</option>
                        </>
                      )}
                      {period === "By Year" && <option defaultValue="true">2026</option>}
                    </select>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1 h-[32px] bg-white border border-border hover:bg-muted/30 rounded-lg text-[11px] font-bold text-foreground transition-colors group">
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
                 columns={[
                   {
                     header: "Description",
                     accessorKey: "description",
                     sortable: true,
                     render: (trx: any) => (
                       <div className="flex items-center gap-4 py-1">
                         <div className={cn(
                           "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                           trx.type === "topup" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-500"
                         )}>
                           {trx.type === "topup" ? <ArrowUpRight size={15} weight="bold" /> : <ArrowDownRight size={15} weight="bold" />}
                         </div>
                         <div className="space-y-0.5">
                           <p className="text-[14px] font-bold tracking-tight text-foreground">{trx.description}</p>
                           <p className="text-[11px] font-semibold text-muted-foreground/50 font-mono">ID: {trx.id}</p>
                         </div>
                       </div>
                     )
                   },
                   {
                     header: "Amount",
                     accessorKey: "amount",
                     sortable: true,
                     align: "right",
                     render: (trx: any) => (
                       <div className="text-right">
                         <p className={cn(
                           "text-[15px] font-bold tracking-tight",
                           trx.amount > 0 && trx.type === "topup" ? "text-emerald-600" : "text-foreground"
                         )}>
                           {trx.type === "topup" ? "+" : "-"} RM {Math.abs(trx.amount).toLocaleString()}
                         </p>
                         <p className="text-[11px] font-medium text-muted-foreground/50 text-nowrap">Balance after: RM {trx.balanceAfter.toLocaleString()}</p>
                       </div>
                     )
                   },
                   {
                     header: "Type",
                     accessorKey: "type",
                     sortable: true,
                     render: (trx: any) => (
                       <StatusBadge status={TRANSACTION_TYPE_LABELS[trx.type as keyof typeof TRANSACTION_TYPE_LABELS] || trx.type} variant="zinc" />
                     )
                   },
                   {
                     header: "Date",
                     accessorKey: "createdAt",
                     sortable: true,
                     align: "center",
                     render: (trx: any) => (
                       <div className="text-center">
                         <p className="text-[13px] font-bold text-foreground/80 tracking-tight">
                           {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                         </p>
                         <p className="text-[11px] font-semibold text-muted-foreground/40">
                           {new Date(trx.createdAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                         </p>
                       </div>
                     )
                   },
                   {
                     header: "Actions",
                     align: "right",
                     render: (trx: any) => (
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
          ) : (
            <div className="space-y-8 animate-in fade-in transition-all duration-300">
              <DetailSection title="Wallet configuration" icon={<Bank size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                  <DetailField label="Wallet model" value={wallet.model === "cash_balance" ? "Cash balance (Pre-paid)" : "Credit limit (Post-paid)"} />
                  <DetailField 
                    label="Status" 
                    value={
                      <div className="flex items-center gap-3">
                        <StatusBadge status={wallet.status} variant={wallet.status === "active" ? "emerald" : "zinc"} />
                        <button className="text-[11px] font-bold text-primary hover:opacity-70 transition-opacity">Change status</button>
                      </div>
                    } 
                  />
                  <DetailField label="Creation date" value={new Date(wallet.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                  <DetailField label="Last activity" value={new Date(wallet.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                </div>
              </DetailSection>

              {/* Danger Zone Aligned with Org Module */}
              <DetailSection
                title="Danger Zone"
                icon={<Gear size={18} weight="duotone" />}
                description="Confirm how you want to change the wallet lifecycle."
              >
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-foreground">Suspend Wallet</p>
                        <p className="text-[12px] text-muted-foreground">
                          Pause all deductions and activities temporarily.
                        </p>
                      </div>
                      <Button variant="outline" className="text-[12px] h-9" onClick={() => openDangerAction("suspend")}>
                        Suspend
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-foreground">Terminate Wallet Permanently</p>
                        <p className="text-[12px] text-muted-foreground">
                          Instantly shutdown fiscal operations for this branch.
                        </p>
                      </div>
                      <Button variant="destructive" className="text-[12px] h-9" onClick={() => openDangerAction("terminate")}>
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
    </div>
  );
}

export default function WalletDetailPage() {
  return (
    <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading wallet details...</div>}>
      <WalletDetailContent />
    </Suspense>
  );
}
