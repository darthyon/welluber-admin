"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface EditableCellProps {
  value: string
  onChange: (v: string) => void
  invalid?: boolean
  placeholder?: string
  mono?: boolean
  maxWidth?: number
  className?: string
  displayFormatter?: (v: string) => string
}

export function EditableCell({
  value,
  onChange,
  invalid,
  placeholder,
  mono,
  maxWidth = 140,
  className,
  displayFormatter,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") cancel()
        }}
        style={{ minWidth: maxWidth }}
        className={cn(
          "w-full rounded border border-primary/40 bg-background px-1.5 py-0.5 text-body outline-none ring-2 ring-primary/10",
          mono && "font-mono text-label",
          className
        )}
      />
    )
  }

  const isMissing = !value
  const display = value && displayFormatter ? displayFormatter(value) : value

  const button = (
    <button
      type="button"
      onClick={() => setEditing(true)}
      style={{ maxWidth }}
      className={cn(
        "block w-full truncate rounded border border-transparent px-1.5 py-0.5 text-left text-body transition hover:border-border hover:bg-muted/40",
        invalid && "border-rose-500/30 bg-rose-500/5 font-semibold text-rose-600 dark:text-rose-400",
        isMissing &&
          !invalid &&
          "text-rose-600 italic dark:text-rose-400 border-rose-500/20 bg-rose-500/5",
        mono && "font-mono text-label",
        className
      )}
    >
      {display || placeholder || "Add"}
    </button>
  )

  if (!value) return button

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top" className="text-label font-medium">
        {value}
      </TooltipContent>
    </Tooltip>
  )
}
