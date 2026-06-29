"use client"

import * as React from "react"
import { CaretDown, Plus, Trash } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/shared/switch"
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ServiceToggleCardProps {
  /**
   * The name of the service.
   */
  name: string
  /**
   * Whether the service is currently selected/active.
   */
  isSelected: boolean
  /**
   * Callback for toggling the selection state.
   */
  onToggle: (checked: boolean) => void
  /**
   * List of active sub-services for this selection.
   */
  selectedSubServices: string[]
  /**
   * List of predefined sub-services in the masterlist (for styling).
   */
  masterlistSubServices?: string[]
  /**
   * Callback for updating the selected sub-services.
   */
  onSelectedSubServicesChange: (val: string[]) => void
  /**
   * Placeholder for the custom sub-service input.
   */
  placeholder?: string
}

/**
 * A standardized high-density component for service management.
 * Pairs a main toggle with a Badge Cloud for sub-services and a custom input.
 */
export function ServiceToggleCard({
  name,
  isSelected,
  onToggle,
  selectedSubServices,
  masterlistSubServices = [],
  onSelectedSubServicesChange,
  placeholder,
}: ServiceToggleCardProps) {
  const [customInput, setCustomInput] = React.useState("")
  const [isExpanded, setIsExpanded] = React.useState(isSelected)

  React.useEffect(() => {
    if (isSelected) {
      setIsExpanded(true)
      return
    }

    setIsExpanded(false)
  }, [isSelected])

  const standardSubServices = selectedSubServices.filter((subService) =>
    masterlistSubServices.includes(subService)
  )
  const customSubServices = selectedSubServices.filter(
    (subService) => !masterlistSubServices.includes(subService)
  )

  const handleStandardSubServicesChange = (
    nextStandardSubServices: string[]
  ) => {
    onSelectedSubServicesChange([
      ...nextStandardSubServices,
      ...customSubServices,
    ])
  }

  const handleAddCustomSubService = () => {
    const nextCustomSubService = customInput.trim()
    if (
      !nextCustomSubService ||
      selectedSubServices.includes(nextCustomSubService)
    ) {
      return
    }

    onSelectedSubServicesChange([...selectedSubServices, nextCustomSubService])
    setCustomInput("")
  }

  const handleRemoveCustomSubService = (subServiceToRemove: string) => {
    onSelectedSubServicesChange(
      selectedSubServices.filter(
        (subService) => subService !== subServiceToRemove
      )
    )
  }

  return (
    <Collapsible open={isExpanded && isSelected} className="bg-card/40">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (!isSelected) {
              return
            }

            setIsExpanded((current) => !current)
          }}
          className="group flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
        >
          <span
            className="shrink-0"
            onClick={(event) => event.stopPropagation()}
          >
            <Switch
              checked={isSelected}
              onCheckedChange={(checked) => {
                onToggle(checked)

                if (checked) {
                  setIsExpanded(true)
                }
              }}
            />
          </span>
          <span
            className={cn(
              "truncate text-body font-semibold transition-colors",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {name}
          </span>
          <CaretDown
            size={14}
            className={cn(
              "ml-auto shrink-0 text-faint transition-transform",
              isExpanded && isSelected && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="animate-in space-y-4 border-t border-border bg-muted/20 px-4 py-4 duration-200 fade-in slide-in-from-top-1">
          <div className="space-y-2">
            <p className="text-label font-medium text-muted-foreground">
              Sub-services
            </p>
            <SearchableMultiSelect
              taxonomy={[
                {
                  category: "Sub-services",
                  services: masterlistSubServices,
                },
              ]}
              selected={standardSubServices}
              onChange={handleStandardSubServicesChange}
              placeholder={placeholder || "Select sub-services..."}
              title="Available Sub-services"
            />
          </div>

          <div className="space-y-2">
            <p className="text-label font-medium text-muted-foreground">
              Add Custom Sub-service
            </p>
            <div className="flex max-w-sm gap-2">
              <input
                value={customInput}
                onChange={(event) => setCustomInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleAddCustomSubService()
                  }
                }}
                className="h-8 w-full rounded-lg border border-border bg-background px-3 py-1 text-label transition-all outline-none placeholder:text-faint focus:border-primary/30 focus:shadow-[0_0_10px_-4px_rgba(var(--primary-rgb),0.1)]"
                placeholder="Type a custom sub-service"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 px-0 text-faint transition-all hover:text-primary"
                onClick={handleAddCustomSubService}
              >
                <Plus size={14} weight="bold" />
              </Button>
            </div>
          </div>

          {customSubServices.length > 0 && (
            <div className="space-y-2">
              <p className="text-label font-medium text-muted-foreground">
                Custom Sub-services
              </p>
              <div className="flex flex-wrap gap-2">
                {customSubServices.map((subService) => (
                  <span
                    key={subService}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.04] px-2.5 py-1 text-label font-medium text-primary"
                  >
                    {subService}
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSubService(subService)}
                      className="text-faint transition-colors hover:text-destructive"
                    >
                      <Trash size={12} weight="bold" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
