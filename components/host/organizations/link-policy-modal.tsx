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
    id: "pol_1",
    name: "Executive Health Plus",
    code: "WP-EXE-2026",
    description:
      "Comprehensive wellness policy with full health screening and premium gym access.",
  },
  {
    id: "pol_2",
    name: "Standard Workforce Pool",
    code: "WP-STD-2026",
    description:
      "Standard benefits for full-time employees including basic outpatient and dental.",
  },
  {
    id: "pol_3",
    name: "Remote Flex Benefits",
    code: "WP-RMT-2026",
    description:
      "Tailored for remote workers with lifestyle co-working and equipment allowances.",
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground/40">
              <ShieldCheck size={24} weight="duotone" />
            </div>
            <div>
              <h3 className="text-heading font-semibold tracking-tight text-foreground">
                Link benefit policy
              </h3>
              <p className="text-nav font-medium text-muted-foreground">
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
              className="text-muted-foreground/50 group-hover:text-foreground"
            />
          </button>
        </div>

        <div className="space-y-6 p-8 pt-6">
          <div className="group relative">
            <MagnifyingGlass
              size={18}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary"
            />
            <input
              type="text"
              placeholder="Search by policy name or code..."
              className="h-12 w-full rounded-xl border border-border bg-muted/10 pr-4 pl-11 text-body text-foreground transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
                    "group cursor-pointer rounded-2xl border p-4 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-muted text-muted-foreground/30 group-hover:bg-muted/80"
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
                        <p className="font-mono text-caption leading-none tracking-tight text-muted-foreground/50">
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
              <div className="space-y-2 py-10 text-center text-muted-foreground/40">
                <MagnifyingGlass size={32} className="mx-auto opacity-20" />
                <p className="text-nav font-medium">
                  No matching policies found.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl border-border font-semibold hover:bg-muted"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl font-semibold shadow-lg shadow-primary/20"
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
