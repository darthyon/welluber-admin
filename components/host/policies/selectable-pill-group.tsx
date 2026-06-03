"use client"

import { Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface SelectablePillOption {
  label: string
  value: string
}

interface SelectablePillGroupProps {
  options: SelectablePillOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  onToggleAll?: () => void
  disabled?: boolean
  className?: string
  buttonClassName?: string
  allLabel?: string
}

export function SelectablePillGroup({
  options,
  selectedValues,
  onToggle,
  onToggleAll,
  disabled = false,
  className,
  buttonClassName,
  allLabel = "All",
}: SelectablePillGroupProps) {
  const allSelected = options.length > 0 && options.every((option) => selectedValues.includes(option.value))

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {onToggleAll ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onToggleAll}
          className={cn(
            "rounded-full border transition-all",
            allSelected
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-primary/30",
            disabled && "cursor-not-allowed opacity-60",
            buttonClassName
          )}
        >
          {allSelected ? <Check size={12} weight="bold" className="mr-1.5 inline" /> : null}
          {allLabel}
        </button>
      ) : null}
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value)
        return (
          <button
            type="button"
            key={option.value}
            disabled={disabled}
            onClick={() => onToggle(option.value)}
            className={cn(
              "rounded-full border transition-all",
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/30",
              disabled && "cursor-not-allowed opacity-60",
              buttonClassName
            )}
          >
            {isSelected ? <Check size={12} weight="bold" className="mr-1.5 inline" /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
