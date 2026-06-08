"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarBlank, X } from "@phosphor-icons/react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateTimePickerFieldProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  clearable?: boolean
  min?: string
}

function parseLocalDateTime(value?: string): Date | undefined {
  if (!value) return undefined

  const [datePart, timePart = "00:00"] = value.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return undefined
  }

  const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function toLocalDateTimeValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getTimeParts(date?: Date) {
  const hours = date?.getHours() ?? 9
  const minutes = date?.getMinutes() ?? 0
  const period = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12

  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(minutes).padStart(2, "0"),
    period,
  }
}

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = String(index + 1).padStart(2, "0")
  return { label: value, value }
})

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => {
  const value = String(index).padStart(2, "0")
  return { label: value, value }
})

export function DateTimePickerField({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled,
  className,
  clearable = true,
  min,
}: DateTimePickerFieldProps) {
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(() => parseLocalDateTime(value), [value])
  const minDate = React.useMemo(() => parseLocalDateTime(min), [min])

  const selectedParts = React.useMemo(() => getTimeParts(selected), [selected])

  const updateValue = React.useCallback(
    (
      nextDate: Date | undefined,
      nextParts: { hour: string; minute: string; period: string }
    ) => {
      if (!nextDate) {
        onChange("")
        return
      }

      const normalized = new Date(nextDate)
      let hour24 = Number(nextParts.hour) % 12

      if (nextParts.period === "PM") {
        hour24 += 12
      }

      normalized.setHours(hour24, Number(nextParts.minute), 0, 0)
      onChange(toLocalDateTimeValue(normalized))
    },
    [onChange]
  )

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("")
      return
    }

    updateValue(date, selectedParts)
  }

  const handleTimePartChange = (
    key: "hour" | "minute" | "period",
    nextValue: string
  ) => {
    const baseDate = selected ?? minDate ?? new Date()
    const nextParts = { ...selectedParts, [key]: nextValue }
    updateValue(baseDate, nextParts)
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="group relative">
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-left text-body font-medium transition-all pr-10",
              "hover:border-foreground/20 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 focus:outline-none",
              "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50",
              selected ? "text-foreground" : "text-faint",
              className
            )}
          >
            <CalendarBlank size={16} className="shrink-0 text-faint" />
            {selected ? format(selected, "dd/MM/yyyy, hh:mm aa") : placeholder}
          </button>

          {clearable && selected && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-faint transition-colors hover:bg-muted hover:text-foreground"
              title="Clear date and time"
            >
              <X size={14} weight="bold" />
            </button>
          ) : null}
        </div>
      </PopoverTrigger>

      <PopoverContent className="z-[300] w-fit space-y-3 rounded-xl border border-border bg-popover p-3 shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          defaultMonth={selected ?? minDate ?? new Date()}
          fromDate={minDate}
          fromYear={2020}
          toYear={2035}
        />

        <div className="flex items-end gap-2 border-t border-border pt-3">
          <label className="flex w-[72px] flex-col gap-1">
            <span className="text-micro font-medium text-faint">Hour</span>
            <select
              value={selectedParts.hour}
              onChange={(event) =>
                handleTimePartChange("hour", event.target.value)
              }
              disabled={disabled}
              className="h-10 w-[72px] rounded-lg border border-border bg-background px-2.5 text-body font-medium text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            >
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-[80px] flex-col gap-1">
            <span className="text-micro font-medium text-faint">Minute</span>
            <select
              value={selectedParts.minute}
              onChange={(event) =>
                handleTimePartChange("minute", event.target.value)
              }
              disabled={disabled}
              className="h-10 w-[80px] rounded-lg border border-border bg-background px-2.5 text-body font-medium text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            >
              {MINUTE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-[72px] flex-col gap-1">
            <span className="text-micro font-medium text-faint">Period</span>
            <select
              value={selectedParts.period}
              onChange={(event) =>
                handleTimePartChange("period", event.target.value)
              }
              disabled={disabled}
              className="h-10 w-[72px] rounded-lg border border-border bg-background px-2.5 text-body font-medium text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-end border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-4xl border border-border bg-background px-3 py-1.5 text-label font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
