"use client"

import { ClockCounterClockwise } from "@phosphor-icons/react"

type PolicyAuditEvent = {
  id: string
  at: string
  actor: string
  action: string
  summary: string
  meta?: { label: string; value: string }[]
}

const MOCK_POLICY_AUDIT_EVENTS: PolicyAuditEvent[] = [
  {
    id: "AUD-20260521-0001",
    at: "21 May 2026 · 10:12 AM",
    actor: "Aina (Host Admin)",
    action: "Created",
    summary: 'Policy created from template "Standard Health".',
    meta: [
      { label: "Template", value: "standard-health" },
      { label: "Refresh Cycle", value: "Yearly" },
    ],
  },
  {
    id: "AUD-20260521-0002",
    at: "21 May 2026 · 10:18 AM",
    actor: "Aina (Host Admin)",
    action: "Updated",
    summary: "Employment types updated.",
    meta: [{ label: "Employment Types", value: "Full-time, Part-time" }],
  },
  {
    id: "AUD-20260521-0003",
    at: "21 May 2026 · 10:26 AM",
    actor: "Irfan (Benefits Manager)",
    action: "Updated",
    summary: "Employee policy amount set.",
    meta: [{ label: "Employee Policy Amount", value: "RM 3,000" }],
  },
  {
    id: "AUD-20260521-0004",
    at: "21 May 2026 · 10:33 AM",
    actor: "Irfan (Benefits Manager)",
    action: "Edited Groups",
    summary: 'Added 2 benefits under "Physical Wellbeing".',
    meta: [
      { label: "Group", value: "Physical Wellbeing" },
      { label: "Services", value: "Gym Access, Fitness Classes" },
    ],
  },
  {
    id: "AUD-20260521-0005",
    at: "21 May 2026 · 10:47 AM",
    actor: "System",
    action: "Assigned",
    summary: "Policy assigned to organisation.",
    meta: [{ label: "Organisation", value: "Acme Corporation Sdn Bhd" }],
  },
]

export function AuditLogTab() {
  const events = MOCK_POLICY_AUDIT_EVENTS

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading font-semibold text-foreground">Audit Log</h3>
        <p className="mt-1 text-body text-muted-foreground">
          Track changes to this policy over time.
        </p>
      </div>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-card text-muted/30">
            <ClockCounterClockwise size={32} weight="duotone" />
          </div>
          <p className="text-body font-medium text-muted-foreground">No audit events yet.</p>
          <p className="mt-1 text-label text-faint">
            Policy changes will be logged here once activity begins.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border/60">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-4 px-5 py-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30">
                  <ClockCounterClockwise size={13} weight="duotone" className="text-faint" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body font-semibold text-foreground">{e.action}</span>
                    <span className="text-label text-faint">by {e.actor}</span>
                    <span className="ml-auto shrink-0 text-label text-faint">{e.at}</span>
                  </div>
                  <p className="mt-0.5 text-body text-subtle">{e.summary}</p>
                  {e.meta && e.meta.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {e.meta.map((m) => (
                        <span
                          key={m.label}
                          className="rounded border border-border bg-muted/40 px-2 py-0.5 text-label text-muted-foreground"
                        >
                          <span className="font-semibold">{m.label}:</span> {m.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
