"use client"

import {
  Buildings,
  Shield,
  Calendar,
  Clock,
  UserCircle,
} from "@phosphor-icons/react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ActionPopover } from "@/components/shared/action-popover"

export type EmployeeBenefitPolicy = {
  policyName: string
  benefitGroups: string[]
  utilisation: number // 0-100
}

export interface EmployeeCardEmployee {
  id: string
  name: string
  email: string
  organization?: string
  branch: string
  empCode: string
  joinDate: string
  lastActive?: string
  department?: string
  tier?: string
  role?: string
  employmentType?: string
  benefitPolicies: EmployeeBenefitPolicy[]
  dependentsCount: number
}

interface EmployeeCardProps {
  employee: EmployeeCardEmployee
  onEdit?: (id: string) => void
  onView?: (id: string) => void
}

export function EmployeeCard({ employee, onEdit, onView }: EmployeeCardProps) {
  const [policyIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })

  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
  const currentItem =
    employee.benefitPolicies[policyIndex] || employee.benefitPolicies[0]

  useEffect(() => {
    const calculateConstraints = () => {
      if (scrollRef.current && innerRef.current) {
        const outerWidth = scrollRef.current.offsetWidth
        const innerWidth = innerRef.current.scrollWidth
        setDragConstraints({
          left: outerWidth > innerWidth ? 0 : outerWidth - innerWidth,
          right: 0,
        })
      }
    }

    // Use ResizeObserver to avoid layout thrashing
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateConstraints)
    })

    if (scrollRef.current) {
      observer.observe(scrollRef.current)
    }
    if (innerRef.current) {
      observer.observe(innerRef.current)
    }

    // Initial calculation
    const timer = setTimeout(calculateConstraints, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [currentItem])

  return (
    <div
      className="group glass-card relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg p-5"
      onClick={() => onView?.(employee.id)}
    >
      {/* Decorative Accent */}
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

      {/* Upper Section (Compact) */}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/30 text-label font-semibold text-primary shadow-sm transition-all duration-500 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center bg-primary/10 font-mono tracking-tighter">
                {initials}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="max-w-[140px] truncate text-body font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {employee.name}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-border/40 bg-background/50 px-1.5 py-0.5 font-mono text-micro tracking-tight text-faint">
                {employee.empCode}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {employee.organization && (
                <span className="rounded border border-border/40 bg-muted px-1.5 py-0.5 text-micro font-medium text-subtle">
                  {employee.organization}
                </span>
              )}
              {employee.department && (
                <span className="rounded border border-border/40 bg-muted px-1.5 py-0.5 text-micro font-semibold text-muted-foreground">
                  {employee.department}
                </span>
              )}
              {employee.tier && (
                <span className="rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-micro font-semibold text-primary">
                  {employee.tier}
                </span>
              )}
              {employee.role && (
                <span className="rounded border border-border/40 bg-muted px-1.5 py-0.5 text-micro font-semibold text-muted-foreground">
                  {employee.role}
                </span>
              )}
              {employee.employmentType && (
                <span className="rounded border border-border/40 bg-muted px-1.5 py-0.5 text-micro font-semibold text-muted-foreground capitalize">
                  {employee.employmentType.replace("-", " ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <ActionPopover
          align="end"
          actions={[
            { label: "View employee", onClick: () => onView?.(employee.id) },
            { label: "Edit employee", onClick: () => onEdit?.(employee.id) },
            { label: "Terminate link", isDanger: true, onClick: () => {} },
          ]}
        />
      </div>

      {/* Info Section */}
      <div className="relative z-10 flex-1 space-y-6">
        {/* Row 1: Branch & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-faint">
              <Buildings size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">
                Branch
              </span>
            </div>
            <span
              className="block truncate text-body font-medium text-foreground"
              title={employee.branch}
            >
              {employee.branch}
            </span>
          </div>
          <div className="space-y-2.5 font-mono">
            <div className="flex items-center gap-1.5 text-faint">
              <UserCircle size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Email</span>
            </div>
            <span
              className="block truncate text-label font-semibold text-subtle"
              title={employee.email}
            >
              {employee.email}
            </span>
          </div>
        </div>

        {/* Policy Carousel Section */}
        <div className="group/policy relative min-h-[140px] overflow-hidden rounded-lg border border-border/60 bg-muted/30 px-4 py-4">
          <div className="mb-3 flex items-center gap-1.5 text-faint">
            <Shield size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Benefit Policy
            </span>
          </div>
          <div
            key={policyIndex}
            className="animate-in space-y-3.5 duration-200 fade-in slide-in-from-right-1"
          >
            <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
              <span
                className="truncate text-body font-medium text-foreground"
                title={currentItem.policyName}
              >
                {currentItem.policyName}
              </span>

              {/* Benefit Groups (Allocations) - Grab-to-Scroll interaction */}
              <div
                className="group/scroll relative overflow-hidden px-0.5 active:cursor-grabbing"
                ref={scrollRef}
              >
                <motion.div
                  ref={innerRef}
                  className="flex w-max cursor-grab items-center gap-1.5 px-0.5 py-1 pr-2 active:cursor-grabbing"
                  drag="x"
                  dragConstraints={dragConstraints}
                  dragElastic={0.05}
                  whileTap={{ cursor: "grabbing" }}
                >
                  {currentItem.benefitGroups.map(
                    (group: string, idx: number) => (
                      <div
                        key={idx}
                        className="pointer-events-none shrink-0 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-label font-medium whitespace-nowrap text-subtle shadow-sm transition-all duration-300 hover:border-primary/40 hover:text-primary"
                      >
                        {group}
                      </div>
                    )
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-faint">
            <Calendar size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Joined Date
            </span>
          </div>
          <span className="block text-label font-semibold text-subtle">
            {employee.joinDate}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-faint">
            <Clock size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">
              Last Active
            </span>
          </div>
          <span className="block text-label font-semibold text-subtle">
            {employee.lastActive || "—"}
          </span>
        </div>
      </div>
    </div>
  )
}
