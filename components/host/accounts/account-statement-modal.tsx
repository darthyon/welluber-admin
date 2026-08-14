"use client"

import { DownloadSimple, FileText } from "@phosphor-icons/react"
import type { AccountTransaction } from "@/features/accounts/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface AccountStatementModalProps {
  accountName: string
  isOpen: boolean
  onClose: () => void
  transactions: AccountTransaction[]
}

function downloadStatement(accountName: string, transactions: AccountTransaction[]) {
  const headers = ["Transaction ID", "Description", "Type", "Amount", "Balance After", "Date"]
  const rows = transactions.map((transaction) => [
    transaction.id,
    transaction.description,
    transaction.type,
    transaction.amount,
    transaction.balanceAfter,
    transaction.createdAt,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `${accountName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-statement.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function AccountStatementModal({
  accountName,
  isOpen,
  onClose,
  transactions,
}: AccountStatementModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-heading">
            <FileText size={20} weight="duotone" className="text-primary" />
            Account Statement
          </DialogTitle>
          <DialogDescription>
            Read-only transaction statement for {accountName}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-auto rounded-lg border border-border">
          <table className="w-full text-left">
            <thead className="sticky top-0 border-b border-border bg-muted/80">
              <tr>
                <th className="px-3 py-2 text-label font-semibold text-subtle">Description</th>
                <th className="px-3 py-2 text-label font-semibold text-subtle">Amount</th>
                <th className="px-3 py-2 text-label font-semibold text-subtle">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-3 py-2">
                    <p className="text-body font-medium text-foreground">{transaction.description}</p>
                    <p className="font-mono text-label text-faint">{transaction.id}</p>
                  </td>
                  <td className="px-3 py-2 text-body font-medium tabular-nums text-foreground">
                    RM {Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-label text-subtle">{formatDate(transaction.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            className="rounded-4xl"
            onClick={() => downloadStatement(accountName, transactions)}
          >
            <DownloadSimple size={16} aria-hidden="true" />
            Download CSV
          </Button>
          <Button variant="outline" className="rounded-4xl" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
