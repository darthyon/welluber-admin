"use client"

import { useState } from "react"
import {
  ShieldCheck,
  MagnifyingGlass,
  IdentificationCard,
  X,
  Buildings,
  CheckCircle,
  Plus,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PolicyOption {
  id: string
  name: string
  code: string
  description: string
}

const GLOBAL_POLICIES: PolicyOption[] = [
  {
    id: "POL-20260115-0001",
    name: "Standard Health 2026",
    code: "BEN-STD-01",
    description: "Comprehensive wellness policy for all full-time staff.",
  },
  {
    id: "POL-20260115-0002",
    name: "Executive Wellness",
    code: "BEN-EXC-02",
    description: "Premium tier benefits including specialized clinical therapy.",
  },
  {
    id: "POL-20260115-0003",
    name: "Contractor Lite",
    code: "BEN-CON-03",
    description: "Stripped-down benefits for contract and intern staff.",
  },
]

interface LinkPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onLink: (policyId: string) => void
}

export function LinkPolicyModal({
  isOpen,
  onClose,
  onLink,
}: LinkPolicyModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredPolicies = GLOBAL_POLICIES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] duration-300 fade-in">
      <div className="w-full max-w-lg animate-in overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl duration-300 zoom-in-95">
        <div className="flex items-center justify-between border-b border-border p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted text-faint">
              <ShieldCheck size={24} weight="duotone" />
            </div>
            <div>
              <h3 className="text-heading font-semibold text-foreground text-balance">
                Link benefit policy
              </h3>
              <p className="text-body font-medium text-subtle">
                Assign a policy to this organisation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group rounded-full p-2 transition-colors hover:bg-muted"
          >
            <X
              size={20}
              className="text-faint group-hover:text-foreground"
            />
          </button>
        </div>

        <div className="space-y-6 p-8 pt-6">
          <div className="group relative">
            <MagnifyingGlass
              size={18}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-faint transition-colors group-focus-within:text-primary"
            />
            <input
              type="text"
              placeholder="Search by policy name or code..."
              className="h-12 w-full rounded-lg border border-border bg-muted/10 pr-4 pl-11 text-body text-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2">
            {filteredPolicies.map((policy) => {
              const isSelected = selectedId === policy.id
              return (
                <div
                  key={policy.id}
                  onClick={() => setSelectedId(policy.id)}
                  className={cn(
                    "group cursor-pointer rounded-lg border p-4 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted text-faint group-hover:bg-muted/80"
                        )}
                      >
                        <IdentificationCard
                          size={20}
                          weight={isSelected ? "fill" : "duotone"}
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className={cn(
                            "text-body font-semibold transition-colors",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {policy.name}
                        </p>
                        <p className="font-mono text-label leading-none tracking-tight text-faint">
                          {policy.code}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle
                        size={20}
                        weight="fill"
                        className="animate-in text-primary zoom-in-50"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-label leading-relaxed text-muted-foreground">
                    {policy.description}
                  </p>
                </div>
              )
            })}
            {filteredPolicies.length === 0 && (
              <div className="space-y-2 py-10 text-center text-faint">
                <MagnifyingGlass size={32} className="mx-auto opacity-20" />
                <p className="text-body font-medium">
                  No matching policies found.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
          <Button
            variant="ghost"
            className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-12 flex-1 rounded-lg font-semibold shadow-lg shadow-primary/20"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) {
                onLink(selectedId)
                onClose()
              }
            }}
          >
            Assign Policy
          </Button>
        </div>
      </div>
    </div>
  )
}
