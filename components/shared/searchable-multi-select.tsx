"use client"

import * as React from "react"
import { Checks, X } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface TaxonomyCategory {
  category: string
  services: string[]
}

interface SearchableMultiSelectProps {
  taxonomy: TaxonomyCategory[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  isInline?: boolean
  staticOptions?: string[]
  title?: string
}

export function SearchableMultiSelect({
  taxonomy,
  selected,
  onChange,
  placeholder = "Search services...",
  isInline = false,
  staticOptions = [],
  title = "Available Options",
}: SearchableMultiSelectProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const id = React.useId()

  const filteredStaticOptions = React.useMemo(
    () =>
      staticOptions.filter(
        (opt) =>
          opt.toLowerCase().includes(query.toLowerCase()) &&
          !selected.includes(opt)
      ),
    [staticOptions, query, selected]
  )

  const filteredTaxonomy = React.useMemo(
    () =>
      taxonomy
        .map((cat) => ({
          ...cat,
          services: cat.services.filter(
            (s) =>
              s.toLowerCase().includes(query.toLowerCase()) &&
              !selected.includes(s)
          ),
        }))
        .filter((cat) => cat.services.length > 0),
    [taxonomy, query, selected]
  )

  const allOptions = React.useMemo(() => {
    const opts: string[] = [...filteredStaticOptions]
    filteredTaxonomy.forEach((cat) => opts.push(...cat.services))
    return opts
  }, [filteredStaticOptions, filteredTaxonomy])

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
    setQuery("")
    if (!isInline) setIsOpen(true)
  }

  const removeOption = (opt: string) => {
    onChange(selected.filter((s) => s !== opt))
  }

  const addAllFiltered = () => {
    if (allOptions.length === 0) return
    onChange(Array.from(new Set([...selected, ...allOptions])))
    setQuery("")
    setIsOpen(true)
  }

  const closeDropdown = () => {
    if (isInline) return
    setIsOpen(false)
    setQuery("")
  }

  const SelectedBadges = (
    <div className="flex flex-wrap gap-1.5">
      {selected.map((s) => (
        <Badge
          key={s}
          variant="secondary"
          className="group gap-1 px-2 py-0.5 text-label font-medium whitespace-nowrap"
        >
          {s}
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeOption(s)
            }}
            className="transition-colors hover:text-rose-500 dark:hover:text-rose-400"
            type="button"
            aria-label={`Remove ${s}`}
          >
            <X size={10} weight="bold" />
          </button>
        </Badge>
      ))}
      {selected.length === 0 && (
        <span className="text-body text-faint">{placeholder}</span>
      )}
    </div>
  )

  const CommandBody = (
    <Command shouldFilter={false} data-listbox-id={`${id}-listbox`}>
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-2">
        <p className="text-label font-medium text-muted-foreground">
          {query ? "Filtered Results" : title}
        </p>
        {!isInline && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={closeDropdown}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={14} weight="bold" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-label font-medium text-muted-foreground">
                Close
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <CommandInput
        value={query}
        onValueChange={(v) => setQuery(v)}
        placeholder={placeholder}
        autoFocus={isOpen && !isInline}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && query === "" && selected.length > 0) {
            removeOption(selected[selected.length - 1])
          }
          if (e.key === "Escape") closeDropdown()
        }}
      />

      <CommandList id={`${id}-listbox`} className="max-h-[360px]">
        {allOptions.length === 0 ? (
          <CommandEmpty className="text-label text-muted-foreground">
            {query
              ? `No results found matching "${query}"`
              : "Search to narrow down options"}
          </CommandEmpty>
        ) : (
          <>
            {filteredStaticOptions.length > 0 && (
              <CommandGroup heading="Options">
                {filteredStaticOptions.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    data-checked={selected.includes(opt)}
                    onSelect={() => toggleOption(opt)}
                    className={cn(
                      "text-body font-medium",
                      selected.includes(opt) && "text-primary"
                    )}
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredTaxonomy.map((group) => (
              <CommandGroup
                key={group.category}
                heading={
                  taxonomy.length > 1 || staticOptions.length > 0
                    ? group.category
                    : undefined
                }
              >
                {group.services.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    data-checked={selected.includes(opt)}
                    onSelect={() => toggleOption(opt)}
                    className="text-body font-normal"
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>

      {(selected.length > 0 || query.length > 0) && (
        <div className="flex items-center justify-between gap-3 border-t border-border/50 px-3 py-2">
          <p className="text-label font-medium text-muted-foreground">
            {selected.length > 0 ? `${selected.length} selected` : ""}
            {query.length > 0 && allOptions.length > 0
              ? `${selected.length > 0 ? " · " : ""}${allOptions.length} matches`
              : ""}
          </p>
          <TooltipProvider>
            <div className="flex items-center gap-1">
              {query.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={addAllFiltered}
                      disabled={allOptions.length === 0}
                      aria-label="Select matches"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Checks size={14} weight="bold" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-label font-medium text-muted-foreground">
                    Select Matches
                  </TooltipContent>
                </Tooltip>
              )}

              {selected.length > 0 && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    onChange([])
                    setQuery("")
                  }}
                  className="text-label font-semibold text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>
          </TooltipProvider>
        </div>
      )}
    </Command>
  )

  if (isInline) {
    return (
      <div className="w-full space-y-2">
        <div
          className="min-h-[36px] rounded-lg border border-border bg-card p-1.5 shadow-sm"
          role="group"
          aria-label="Selected items"
        >
          {SelectedBadges}
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {CommandBody}
        </div>
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "min-h-[40px] w-full rounded-lg border border-border bg-card p-2 text-left shadow-sm transition-all",
            "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"
          )}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
        >
          {SelectedBadges}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] min-w-[320px] overflow-hidden p-0"
        align="start"
      >
        {CommandBody}
      </PopoverContent>
    </Popover>
  )
}
