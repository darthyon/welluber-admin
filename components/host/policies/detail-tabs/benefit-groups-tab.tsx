"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { BenefitGroupLedgerCard } from "../benefit-group-ledger-card"
import { NotePencil, TreeStructure } from "@phosphor-icons/react"
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"

interface BenefitGroupsTabProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
}

export function BenefitGroupsTab({
  policy,
  groups,
  benefits,
}: BenefitGroupsTabProps) {
  const router = useRouter()

  const editGroups = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `policy-groups-draft-${policy.id}`,
        JSON.stringify({ policy, groups, benefits })
      )
    }
    router.push(`/policies/${policy.id}/groups/edit`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-heading font-semibold text-foreground">
              Benefit Groups
            </h3>
            <Badge variant="secondary" className="text-label font-medium">
              {groups.length} Group{groups.length !== 1 ? "s" : ""} ·{" "}
              {benefits.length} Service{benefits.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="mt-0.5 text-label text-faint">
            Inherited from this benefit group. Individual services can override
            amounts and co-pays.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={editGroups}
          className="flex h-8 items-center gap-2 text-label font-medium"
        >
          <NotePencil size={14} weight="bold" />
          Edit Groups
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyBenefitGroups onAdd={editGroups} />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <BenefitGroupLedgerCard
              key={group.id}
              policy={policy}
              group={group}
              benefits={benefits.filter(
                (benefit) => benefit.groupId === group.id
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyBenefitGroups({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<TreeStructure size={32} weight="light" />}
      title="No Benefit Groups Configured"
      description="Add groups to define which services and benefit rules are available."
      action={
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="rounded-4xl px-4 text-label font-medium text-primary"
        >
          <NotePencil size={14} weight="bold" className="mr-1.5" />
          Add Groups
        </Button>
      }
    />
  )
}
