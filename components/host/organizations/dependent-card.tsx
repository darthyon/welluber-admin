"use client"

import {
  User,
  IdentificationCard,
  Clock,
} from "@phosphor-icons/react"
import { StatusBadge } from "@/components/shared/status-badge"
import { ActionPopover } from "@/components/shared/action-popover"

interface DependentCardProps {
  dependent: {
    id: string
    name: string
    employeeName: string
    employeeId: string
    relationship: string
    status: string
    joinDate: string
  }
  onViewEmployee?: (employeeId: string) => void
  onEdit?: (id: string) => void
}

export function DependentCard({
  dependent,
  onViewEmployee,
  onEdit,
}: DependentCardProps) {
  const initials = dependent.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div className="group glass-card relative flex h-full flex-col overflow-hidden rounded-lg p-5">
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/30 text-label font-semibold text-primary shadow-sm transition-all duration-500 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center bg-primary/10 font-mono tracking-tighter">
                {initials}
              </div>
            </div>
            <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow-sm" />
          </div>

          <div className="space-y-1.5">
            <h4 className="max-w-[160px] truncate text-body font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {dependent.name}
            </h4>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={dependent.status}
                variant="emerald"
                className="rounded-md px-1.5 py-0.5 text-micro"
              />
            </div>
          </div>
        </div>

        <ActionPopover
          align="end"
          actions={[
            {
              label: "View Details",
              onClick: () => onEdit?.(dependent.id),
            },
            {
              label: "Edit Dependent",
              onClick: () => onEdit?.(dependent.id),
            },
            { label: "Remove", isDanger: true },
          ]}
        />
      </div>

      <div className="relative z-10 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <User size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">
                Linked Employee
              </span>
            </div>
            <button
              onClick={() => onViewEmployee?.(dependent.employeeId)}
              className="text-body font-semibold text-primary hover:underline"
            >
              {dependent.employeeName}
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <IdentificationCard size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">
                Relationship
              </span>
            </div>
            <span className="block text-body font-medium capitalize text-foreground">
              {dependent.relationship}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-border/40 pt-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-faint">
            <Clock size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Joined
            </span>
          </div>
          <span className="block text-label font-semibold text-subtle">
            {dependent.joinDate}
          </span>
        </div>
      </div>
    </div>
  )
}
