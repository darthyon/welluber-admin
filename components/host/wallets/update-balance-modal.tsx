"use client"

import { useState } from "react"
import { X, Wallet, CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { cn } from "@/lib/utils"

interface UpdateBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string
  walletName: string
}

export function UpdateBalanceModal({
  isOpen,
  onClose,
  walletId,
  walletName,
}: UpdateBalanceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!amount || !reason) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => {
      onClose()
      setIsSuccess(false)
      setAmount("")
      setReason("")
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={!isSubmitting && !isSuccess ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {isSuccess ? (
          <div className="p-8">
            <SuccessCelebration
              title="Balance Updated"
              message={`Adjustment recorded for ${walletName}.`}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-body font-semibold text-foreground">
                    Update Balance
                  </h3>
                  <p className="text-label text-muted-foreground">
                    {walletName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-body font-medium text-foreground">
                  Adjustment Amount (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. -50.00 or 100.00"
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-semibold text-foreground"
                />
                <p className="text-label text-faint">
                  Use negative values to reduce balance.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-body font-medium text-foreground">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this adjustment needed?"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-foreground resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-body font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !amount || !reason}
                className="text-body font-medium bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Recording...</span>
                  </div>
                ) : (
                  "Record Adjustment"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
