"use client";

import {
  X,
  Ticket,
  Calendar,
  User,
  IdentificationBadge,
  Storefront,
  Buildings,
  MapPin,
  CreditCard,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { FlatClaimRow } from "@/types/claims";

interface VoucherDetailSheetProps {
  claim: FlatClaimRow | null;
  onClose: () => void;
}

export function VoucherDetailSheet({ claim, onClose }: VoucherDetailSheetProps) {
  if (!claim) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Ticket size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-body font-medium text-foreground">Voucher Details</h3>
              <p className="text-label text-muted-foreground font-medium">
                {claim.voucherCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Voucher Name */}
          <div className="space-y-1.5">
            <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
              <Ticket size={14} /> Voucher Name
            </label>
            <p className="text-body font-semibold text-foreground">
              {claim.voucherName || claim.voucherCode}
            </p>
          </div>

          {/* Voucher ID + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
                <IdentificationBadge size={14} /> Voucher ID
              </label>
              <code className="text-body font-mono text-foreground block">
                {claim.voucherCode}
              </code>
            </div>
            <div className="space-y-1.5">
              <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
                <Calendar size={14} /> Date
              </label>
              <p className="text-body font-medium text-foreground">
                {claim.date}
              </p>
            </div>
          </div>

          {/* Employee */}
          <div className="space-y-1.5">
            <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
              <User size={14} /> Employee
            </label>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-label">
                {claim.employeeName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-body font-medium text-foreground">{claim.employeeName}</p>
                <p className="text-label text-muted-foreground font-medium">{claim.empCode}</p>
              </div>
            </div>
          </div>

          {/* Redeemed By */}
          <div className="space-y-1.5">
            <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
              <User size={14} /> Redeemed By
            </label>
            <p className="text-body font-medium text-foreground">
              {claim.employeeName} <span className="text-label text-muted-foreground font-medium">(Employee)</span>
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
              <CreditCard size={14} /> Amount
            </label>
            <p className="text-display font-semibold font-mono text-foreground">
              RM {claim.amount.toFixed(2)}
            </p>
          </div>

          {/* Service Provider */}
          <div className="space-y-1.5">
            <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
              <Storefront size={14} /> Service Provider
            </label>
            <p className="text-body font-medium text-foreground">
              {claim.provider}
            </p>
          </div>

          {/* Branch + City */}
          <div className="space-y-1.5">
            <label className="text-label font-semibold text-subtle flex items-center gap-1.5">
              <Buildings size={14} /> Branch
            </label>
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <p className="text-body font-medium text-foreground">{claim.branch}</p>
              <div className="flex items-center gap-1.5 text-label text-muted-foreground font-medium">
                <MapPin size={12} />
                {claim.location}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
