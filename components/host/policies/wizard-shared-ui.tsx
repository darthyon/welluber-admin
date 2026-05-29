"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  NotePencil,
  CheckCircle,
  XCircle,
  CaretDown,
} from "@phosphor-icons/react"
import { FieldHelp } from "@/components/shared/field-help"
import type { PolicyStatus } from "@/types/policy"
import type { PolicyGlossaryKey } from "@/lib/policy-glossary"

// ─── STATUS_CONFIG ─────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  PolicyStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    icon: NotePencil,
  },
  active: {
    label: "Active",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    icon: CheckCircle,
  },
  deactivated: {
    label: "Deactivated",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    icon: XCircle,
  },
}

// ─── ReadField (wizard variant — bold value) ───────────────────────────────────

export function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-semibold text-subtle">{label}</p>
      <p className="text-body font-medium text-foreground">
        {value || (
          <span className="text-faint italic dark:text-muted-foreground">—</span>
        )}
      </p>
    </div>
  )
}

// ─── ReadFieldMuted (content variant — muted label, bold value) ───────────────

export function ReadFieldMuted({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="text-body font-semibold text-foreground">
        {value || <span className="text-faint italic">—</span>}
      </p>
    </div>
  )
}

// ─── StatusPicker ──────────────────────────────────────────────────────────────

export function StatusPicker({
  value,
  onChange,
  disabled,
}: {
  value: PolicyStatus
  onChange: (v: PolicyStatus) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[value]
  const Icon = cfg.icon

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-label font-semibold transition-all",
          cfg.bg,
          cfg.color,
          !disabled && "cursor-pointer hover:opacity-80"
        )}
      >
        <Icon size={13} weight="fill" />
        {cfg.label}
        {!disabled && <CaretDown size={11} weight="bold" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-lg border border-border bg-popover shadow-lg shadow-black/20"
          >
            {(Object.keys(STATUS_CONFIG) as PolicyStatus[]).map((s) => {
              const c = STATUS_CONFIG[s]
              const SI = c.icon
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-body font-semibold transition-colors hover:bg-muted",
                    c.color,
                    s === value && "bg-muted"
                  )}
                >
                  <SI size={14} weight="fill" />
                  {c.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

export function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description?: string
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <Icon size={18} weight="duotone" />
      </div>
      <div>
        <h3 className="text-lead font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-label text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

// ─── FieldLabel ────────────────────────────────────────────────────────────────

export function FieldLabel({
  children,
  required,
  helpKey,
}: {
  children: React.ReactNode
  required?: boolean
  helpKey?: PolicyGlossaryKey
}) {
  return (
    <label className="flex items-center gap-1.5 text-label font-medium text-subtle">
      <span>
        {children}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {helpKey ? <FieldHelp termKey={helpKey} /> : null}
    </label>
  )
}

// ─── ErrorText ─────────────────────────────────────────────────────────────────

export function ErrorText({
  children,
  id,
}: {
  children: React.ReactNode
  id?: string
}) {
  return (
    <p id={id} className="mt-1 text-label font-medium text-destructive">
      {children}
    </p>
  )
}

// ─── HelpText ──────────────────────────────────────────────────────────────────

export function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-micro text-faint">{children}</p>
}
