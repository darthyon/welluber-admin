"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarBlank,
  CaretDown,
  DotsThreeCircle,
  DownloadSimple,
  Gear,
  LockKey,
  Prohibit,
  Wallet,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ActionPopover } from "@/components/shared/action-popover";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { DetailField } from "@/components/shared/detail-field";
import { DetailSection } from "@/components/shared/detail-section";
import { FormSelect } from "@/components/shared/form-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { SharedDataTable } from "@/components/shared/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TRANSACTION_TYPE_LABELS } from "@/features/accounts/constants";
import type { Account, AccountTransaction } from "@/features/accounts/types";
import { cn, formatDate } from "@/lib/utils";

interface AccountTransactionsSectionProps {
  activePeriod: "By Month" | "By Quarter" | "By Year";
  filteredTransactions: AccountTransaction[];
  onOpenDangerAction: (action: "suspend" | "terminate") => void;
  onOpenRecordTopup: () => void;
  onOpenUpdateBalance: () => void;
  onPeriodChange: (period: "By Month" | "By Quarter" | "By Year") => void;
  onSearchChange: (value: string) => void;
  searchQuery: string;
  wallet: Account;
}

export function AccountTransactionsSection({
  activePeriod,
  filteredTransactions,
  onOpenDangerAction,
  onOpenRecordTopup,
  onOpenUpdateBalance,
  onPeriodChange,
  onSearchChange,
  searchQuery,
  wallet,
}: AccountTransactionsSectionProps) {
  type AccountTransactionRow = (typeof filteredTransactions)[number];

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-primary p-8 text-primary-foreground">
        <Image
          loading="lazy"
          src="/img-wallet.webp"
          alt=""
          width={256}
          height={160}
          className="pointer-events-none absolute bottom-0 right-0 hidden h-auto w-64 object-contain opacity-40 lg:block"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <p className="text-label font-semibold text-primary-foreground/80">Available Balance</p>
            <h2 className="text-display font-semibold tracking-tight text-primary-foreground tabular-nums">
              RM {(wallet.balance - wallet.pendingDeductions).toLocaleString()}
            </h2>
            <p className="text-label text-primary-foreground/70">
              Last updated{" "}
              {new Date(wallet.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })},{" "}
              {new Date(wallet.updatedAt).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-4xl border border-primary-foreground/30 px-4 py-2 text-label font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                  <Wallet size={14} weight="fill" />
                  Add Balance
                  <CaretDown size={12} weight="bold" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1.5" align="end">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={onOpenRecordTopup}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body font-medium text-subtle transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Manual Top-up
                  </button>
                  <button
                    onClick={onOpenUpdateBalance}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body font-medium text-subtle transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <DotsThreeCircle size={14} className="text-primary" />
                    Update Balance
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-4xl border border-primary-foreground/30 px-4 py-2 text-label font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                  More Actions
                  <CaretDown size={12} weight="bold" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-1.5" align="end">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {}}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body font-medium text-subtle transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <DownloadSimple size={14} className="text-faint" />
                    View Statement
                  </button>
                  <button
                    onClick={() => onOpenDangerAction("suspend")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body font-medium text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
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

      <div className="animate-in space-y-4 fade-in transition-all duration-300">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <DataFilterBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              searchPlaceholder="Search transactions..."
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="rounded-lg border border-border bg-muted/50 p-0.5">
              {(["By Month", "By Quarter", "By Year"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => onPeriodChange(period)}
                  className={cn(
                    "rounded-md px-3 py-1 text-label font-semibold transition-all",
                    activePeriod === period
                      ? "bg-background text-foreground shadow-sm"
                      : "text-faint hover:text-foreground",
                  )}
                >
                  {period}
                </button>
              ))}
            </div>

            <FormSelect
              value=""
              onChange={() => {}}
              options={
                activePeriod === "By Month"
                  ? [
                      { label: "January 2026", value: "jan" },
                      { label: "February 2026", value: "feb" },
                      { label: "March 2026", value: "mar" },
                    ]
                  : activePeriod === "By Quarter"
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
                <button className="group flex h-[32px] items-center gap-2 rounded-lg border border-border bg-background px-3 py-1 text-label font-semibold text-foreground transition-colors hover:bg-muted/30">
                  <CalendarBlank size={14} className="text-muted-foreground transition-colors group-hover:text-foreground" />
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
                const iconBg =
                  trx.type === "topup"
                    ? "bg-primary/20 text-primary"
                    : trx.type === "pre-auth"
                      ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400";
                const icon =
                  trx.type === "topup" ? (
                    <ArrowUpRight size={15} weight="bold" />
                  ) : trx.type === "pre-auth" ? (
                    <LockKey size={15} weight="bold" />
                  ) : trx.type === "cancelled" ? (
                    <Prohibit size={15} weight="bold" />
                  ) : (
                    <ArrowDownRight size={15} weight="bold" />
                  );

                return (
                  <div className="flex items-center gap-4 py-1">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm", iconBg)}>
                      {icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-body font-semibold text-foreground">{trx.description}</p>
                      <p className="font-mono text-label font-semibold text-faint">ID: {trx.id}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Amount",
              accessorKey: "amount",
              sortable: true,
              align: "right",
              render: (trx: AccountTransactionRow) => {
                const isTopup = trx.type === "topup";
                const amountClass =
                  trx.type === "cancelled"
                    ? "text-lead font-semibold tracking-tight tabular-nums line-through text-rose-500 dark:text-rose-400"
                    : trx.type === "pre-auth"
                      ? "text-lead font-semibold tracking-tight tabular-nums text-amber-600 dark:text-amber-400"
                      : trx.type === "topup"
                        ? "text-lead font-semibold tracking-tight tabular-nums text-primary"
                        : "text-lead font-semibold tracking-tight tabular-nums text-foreground";
                return (
                  <div className="text-right">
                    <p className={amountClass}>
                      {isTopup ? "+" : "-"} RM {Math.abs(trx.amount).toLocaleString()}
                    </p>
                    <p className="text-nowrap font-mono text-label font-medium tabular-nums text-faint">
                      Balance after: RM {trx.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                );
              },
            },
            {
              header: "Type",
              accessorKey: "type",
              sortable: true,
              render: (trx: AccountTransactionRow) => {
                const variant =
                  trx.type === "pre-auth" ? "amber" : trx.type === "cancelled" ? "rose" : "zinc";
                return (
                  <StatusBadge
                    status={TRANSACTION_TYPE_LABELS[trx.type as keyof typeof TRANSACTION_TYPE_LABELS] || trx.type}
                    variant={variant}
                  />
                );
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
                      <p className="font-mono text-label font-semibold text-faint">{trx.claimId}</p>
                    </>
                  ) : (
                    <span className="text-label text-faint">—</span>
                  )}
                </div>
              ),
            },
            {
              header: "Date",
              accessorKey: "createdAt",
              sortable: true,
              align: "center",
              render: (trx: AccountTransactionRow) => (
                <div className="text-center">
                  <p className="text-body font-medium text-subtle whitespace-nowrap">{formatDate(trx.createdAt)}</p>
                  <p className="text-label font-medium text-faint">
                    {new Date(trx.createdAt).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ),
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
              ),
            },
          ]}
          data={filteredTransactions}
        />
      </div>
    </>
  );
}

export function AccountOverviewSection({ wallet }: { wallet: Account }) {
  return (
    <div className="animate-in space-y-8 fade-in transition-all duration-300">
      <DetailSection title="Account configuration" icon={<Wallet size={18} />}>
        <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
          <DetailField label="Account name" value={wallet.name} />
          <DetailField
            label="Status"
            value={
              <div className="flex items-center gap-3">
                <StatusBadge status={wallet.status} variant={wallet.status === "active" ? "emerald" : "zinc"} />
                <button className="text-label font-semibold text-primary transition-opacity hover:opacity-70">
                  Change status
                </button>
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
  );
}

export function AccountSettingsSection({
  onOpenDangerAction,
}: {
  onOpenDangerAction: (action: "suspend" | "terminate") => void;
}) {
  return (
    <div className="animate-in space-y-8 fade-in transition-all duration-300">
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
              <Button variant="outline" className="h-9 text-label" onClick={() => onOpenDangerAction("suspend")}>
                Suspend
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-body font-medium text-foreground">Terminate Account Permanently</p>
                <p className="text-label text-muted-foreground">
                  Instantly shutdown fiscal operations for this branch.
                </p>
              </div>
              <Button variant="destructive" className="h-9 text-label" onClick={() => onOpenDangerAction("terminate")}>
                Terminate
              </Button>
            </div>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
