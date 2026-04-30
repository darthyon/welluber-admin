"use client"

import { useState, useRef } from "react"
import { X, Wallet, UploadSimple, CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { cn } from "@/lib/utils"

interface RecordTopupModalProps {
  isOpen: boolean
  onClose: () => void
  walletId: string
  walletName: string
}

export function RecordTopupModal({
  isOpen,
  onClose,
  walletId,
  walletName,
}: RecordTopupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAttachment(file)
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async () => {
    if (!amount || !reference) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => {
      onClose()
      setIsSuccess(false)
      setAmount("")
      setReference("")
      setAttachment(null)
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
              title="Top-up Recorded"
              message={`Manual top-up logged for ${walletName}.`}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Wallet size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-body font-semibold text-foreground">
                    Record Manual Top-up
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
                  Top-up Amount (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000.00"
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-semibold text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body font-medium text-foreground">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. Bank transfer ref #12345"
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-semibold text-foreground"
                />
              </div>

              {/* Attachment */}
              <div className="space-y-1.5">
                <label className="text-body font-medium text-foreground">
                  Payment Receipt
                </label>
                <p className="text-label text-faint">
                  Attach proof of payment (optional)
                </p>
                {attachment ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card">
                    <UploadSimple size={18} className="text-primary" />
                    <span className="text-body font-semibold text-foreground flex-1 truncate">
                      {attachment.name}
                    </span>
                    <button
                      onClick={removeAttachment}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group">
                    <UploadSimple
                      size={24}
                      className="text-faint group-hover:text-primary transition-colors"
                    />
                    <span className="text-body font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      Click to upload receipt
                    </span>
                    <span className="text-label text-faint">
                      JPG, PNG, PDF up to 5MB
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
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
                disabled={isSubmitting || !amount || !reference}
                className="text-body font-medium bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Recording...</span>
                  </div>
                ) : (
                  "Record Top-up"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
