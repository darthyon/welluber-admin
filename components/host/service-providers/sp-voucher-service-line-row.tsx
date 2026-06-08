"use client"

import * as React from "react"
import {
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form"
import { z } from "zod"
import { CaretDown, Plus, Trash, WarningCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { CustomMultiSelect } from "@/components/shared/custom-multi-select"
import { SectionedSearchSelect } from "@/components/shared/sectioned-search-select"
import {
  SERVICE_SPEC_TAXONOMY,
  SERVICE_TAXONOMY,
} from "@/features/organizations/constants"
import { createVoucherSchema } from "@/features/providers/schemas"
import { cn } from "@/lib/utils"

type VoucherFormValues = z.input<typeof createVoucherSchema>

interface ServiceLineRowProps {
  index: number
  currency: string
  spServiceCategories: string[]
  expanded: boolean
  hasError: boolean
  autoFocus: boolean
  onToggle: () => void
  onRemove?: () => void
  register: UseFormRegister<VoucherFormValues>
  setValue: UseFormSetValue<VoucherFormValues>
  watch: UseFormWatch<VoucherFormValues>
}

export function ServiceLineRow({
  index,
  currency,
  spServiceCategories,
  expanded,
  hasError,
  autoFocus,
  onToggle,
  onRemove,
  register,
  setValue,
  watch,
}: ServiceLineRowProps) {
  const service = watch(`serviceLines.${index}.service`)
  const subServices = watch(`serviceLines.${index}.subServices`) || []
  const priceValue = watch(`serviceLines.${index}.price`)
  const price = Number.isFinite(Number(priceValue)) ? Number(priceValue) : 0

  const [showFeatures, setShowFeatures] = React.useState(
    () => !!watch(`serviceLines.${index}.descriptionList`)
  )

  const currencyLabel = currency || "RM"
  const indexBadge = (
    <div
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        hasError ? "bg-destructive/15" : "bg-border"
      )}
    >
      <span
        className={cn(
          "text-label font-semibold",
          hasError ? "text-destructive" : "text-subtle"
        )}
      >
        {index + 1}
      </span>
    </div>
  )

  if (!expanded) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-muted/40 pr-2 transition-colors",
          hasError ? "border-destructive/40 bg-destructive/5" : "border-border/60"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={false}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 pl-3 text-left transition-colors hover:bg-muted/60"
        >
          {indexBadge}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {hasError && (
              <WarningCircle
                size={14}
                weight="fill"
                className="shrink-0 text-destructive"
              />
            )}
            <span
              className={cn(
                "shrink-0 text-body font-medium",
                service ? "text-foreground" : "text-faint"
              )}
            >
              {service || "Select a service"}
            </span>
            {subServices.length > 0 && (
              <span className="min-w-0 truncate text-body text-muted-foreground">
                · {subServices.join(" · ")}
              </span>
            )}
          </div>
          <span className="ml-auto shrink-0 pr-1 font-mono text-body font-medium text-foreground tabular-nums">
            {currencyLabel} {price.toLocaleString()}
          </span>
          <CaretDown size={16} className="shrink-0 text-faint" />
        </button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove service ${index + 1}`}
            className="h-8 w-8 shrink-0 rounded-lg text-faint transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash size={16} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "animate-in space-y-5 rounded-lg border bg-muted/40 p-5 duration-300 fade-in slide-in-from-top-1",
        hasError ? "border-destructive/40" : "border-border/60"
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded
          className="flex items-center gap-2.5 rounded-md text-left"
        >
          {indexBadge}
          <span className="text-label font-semibold text-faint">Service</span>
          <CaretDown size={16} className="rotate-180 text-faint" />
        </button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove service ${index + 1}`}
            className="h-8 w-8 rounded-lg text-faint transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash size={18} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-label font-medium text-subtle">Service</label>
          <SectionedSearchSelect
            taxonomy={SERVICE_TAXONOMY.filter((category) =>
              spServiceCategories.includes(category.category)
            )}
            value={service}
            onChange={(value) => {
              setValue(`serviceLines.${index}.service`, value)
              setValue(`serviceLines.${index}.subServices`, [])
            }}
            placeholder="Search service..."
            autoFocus={autoFocus}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-label font-medium text-subtle">
            Sub-services
          </label>
          <CustomMultiSelect
            options={SERVICE_SPEC_TAXONOMY[service] || []}
            selected={subServices}
            onChange={(value) =>
              setValue(`serviceLines.${index}.subServices`, value)
            }
            placeholder="Select or type custom..."
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-label font-medium text-subtle">
            Price ({currencyLabel})
          </label>
          <input
            type="number"
            step="0.01"
            min={0}
            {...register(`serviceLines.${index}.price`, {
              valueAsNumber: true,
            })}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-body transition-colors outline-none focus:border-foreground/30 focus:bg-muted/30"
            placeholder="0.00"
          />
        </div>
      </div>

      {showFeatures ? (
        <div className="animate-in space-y-1.5 duration-300 fade-in slide-in-from-top-1">
          <label className="text-label font-medium text-subtle">
            Voucher features
          </label>
          <textarea
            {...register(`serviceLines.${index}.descriptionList`)}
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-body transition-colors outline-none focus:border-foreground/30 focus:bg-muted/30"
            placeholder={`List features separated by lines, e.g.
• Includes 5 sessions
• Peak hours access
• Valid at KL branches`}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowFeatures(true)}
          className="flex items-center gap-1.5 text-label font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <Plus size={14} weight="bold" />
          Add details
        </button>
      )}
    </div>
  )
}
