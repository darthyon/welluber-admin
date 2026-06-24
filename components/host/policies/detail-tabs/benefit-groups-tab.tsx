"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
          <h3 className="text-heading font-semibold text-foreground">
            Benefit Groups
          </h3>
          <p className="mt-1 text-body text-muted-foreground">
            {groups.length} group{groups.length !== 1 ? "s" : ""} configured
            with {benefits.length} service{benefits.length !== 1 ? "s" : ""}.
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-16">
      <TreeStructure size={36} weight="duotone" className="mb-3 text-faint" />
      <p className="text-body font-medium text-muted-foreground">
        No benefit groups configured.
      </p>
      <p className="mt-1 text-label text-faint">
        Add groups to define which benefits are available.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAdd}
        className="mt-3 font-semibold text-primary"
      >
        <NotePencil size={14} weight="bold" className="mr-1.5" />
        Add Groups
      </Button>
    </div>
  )
}
