"use client"

import { Upload } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EmployeePolicy {
  policyName: string
  benefitGroups?: string[]
  utilisation?: number
}

interface EmployeePoliciesCellProps {
  policies?: EmployeePolicy[]
}

export function EmployeeDirectoryEmptyState({
  hasSearchOrFilter,
}: {
  hasSearchOrFilter: boolean
}) {
  return (
    <EmptyState
      icon={<Upload size={32} weight="light" />}
      title="No Employees Found"
      description={
        hasSearchOrFilter
          ? "Try adjusting the current search or filter to find more employees."
          : "Add employees or import a bulk file to start building this workforce."
      }
    />
  )
}

export function EmployeePoliciesCell({ policies }: EmployeePoliciesCellProps) {
  if (!policies || policies.length === 0) {
    return (
      <Badge variant="outline" className="text-label font-medium">
        None
      </Badge>
    )
  }

  return (
    <div className="flex max-w-[280px] flex-wrap items-center gap-1 overflow-visible">
      {policies.slice(0, 2).map((policy, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger asChild>
            <div className="flex cursor-help items-center">
              <Badge
                variant="secondary"
                className="text-label font-medium whitespace-nowrap transition-colors hover:bg-secondary/80"
              >
                {policy.policyName}
                {policy.benefitGroups && policy.benefitGroups.length > 0 && (
                  <span className="ml-1 max-w-[80px] truncate font-medium text-subtle">
                    ({policy.benefitGroups.length})
                  </span>
                )}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-[200] w-56 p-2">
            <EmployeePolicyTooltip policy={policy} />
          </TooltipContent>
        </Tooltip>
      ))}

      {policies.length > 2 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="cursor-help px-1 text-label font-medium text-subtle transition-colors hover:text-primary"
            >
              +{policies.length - 2}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="z-[200] flex w-56 flex-col gap-2 p-2"
          >
            <div className="px-1 text-label font-semibold text-muted-foreground opacity-60">
              Other policies
            </div>
            {policies.slice(2).map((policy, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1.5 border-b border-border/50 px-1 pb-2.5 last:border-0 last:pb-0"
              >
                <EmployeePolicyTooltip policy={policy} />
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function EmployeePolicyTooltip({ policy }: { policy: EmployeePolicy }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-label font-semibold text-foreground">
        {policy.policyName}
      </div>
      {policy.benefitGroups && policy.benefitGroups.length > 0 ? (
        <div className="text-label leading-snug text-muted-foreground">
          {policy.benefitGroups.join(", ")}
        </div>
      ) : (
        <div className="text-label text-muted-foreground italic">
          No specific groups.
        </div>
      )}
      {policy.utilisation !== undefined && (
        <StatusBadge
          status={`${policy.utilisation}% Utilized`}
          variant="emerald"
          className="mt-0.5"
        />
      )}
    </div>
  )
}
