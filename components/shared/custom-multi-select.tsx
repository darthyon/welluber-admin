"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, Check, CaretDown, Plus } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface CustomMultiSelectOption {
  value: string
  label: string
  description?: string
  searchText?: string
}

interface CustomMultiSelectProps {
  options: Array<string | CustomMultiSelectOption>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  allowCustom?: boolean
}

export function CustomMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select or type to add...",
  className,
  disabled = false,
  allowCustom = true,
}: CustomMultiSelectProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>(
    {}
  )

  const normalizedOptions = React.useMemo<CustomMultiSelectOption[]>(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { value: option, label: option, searchText: option }
          : {
              ...option,
              searchText:
                option.searchText ??
                `${option.label} ${option.description ?? ""}`,
            }
      ),
    [options]
  )

  const filteredOptions = normalizedOptions.filter(
    (option) =>
      option.searchText?.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(option.value)
  )

  const exactMatch = normalizedOptions.some(
    (option) => option.label.toLowerCase() === query.toLowerCase()
  )
  const alreadySelected = selected.some(
    (s) => s.toLowerCase() === query.toLowerCase()
  )
  const showAddCustom = allowCustom && query && !exactMatch && !alreadySelected

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
    setQuery("")
  }

  const addCustom = () => {
    if (query && !selected.includes(query)) {
      onChange([...selected, query])
      setQuery("")
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const updatePosition = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        minWidth: "200px",
      })
    }
    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isOpen])

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        className={cn(
          "relative flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-background/5 px-3 py-1.5 pr-12 transition-all",
          isOpen
            ? "border-primary ring-2 ring-primary/10"
            : "border-border/60 hover:border-primary/30",
          disabled && "cursor-not-allowed bg-muted/40 opacity-60"
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {selected.map((selectedValue) => {
          const matchedOption = normalizedOptions.find(
            (option) => option.value === selectedValue
          )
          const displayLabel = matchedOption?.label ?? selectedValue

          return (
            <Badge
              key={selectedValue}
              variant="secondary"
              className="group h-7 items-center gap-1.5 border-primary/20 bg-primary/15 px-2.5 py-1 text-label font-semibold whitespace-nowrap text-primary"
            >
              {displayLabel}
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(selectedValue)
                  }}
                  className="shrink-0 transition-colors hover:text-destructive"
                  type="button"
                >
                  <X size={10} weight="bold" />
                </button>
              )}
            </Badge>
          )
        })}
        <input
          type="text"
          className="h-7 min-w-[80px] flex-1 border-0 bg-transparent px-1 text-body outline-none placeholder:text-faint"
          placeholder={selected.length === 0 ? placeholder : ""}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            if (disabled) return
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === "Enter" && query) {
              e.preventDefault()
              if (showAddCustom) addCustom()
              else if (filteredOptions.length > 0)
                toggleOption(filteredOptions[0].value)
            }
          }}
        />
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5 pl-2 text-faint">
          {!disabled && selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange([])
              }}
              className="rounded-md p-1 transition-colors hover:bg-primary/10 hover:text-primary"
              title="Clear all"
            >
              <X size={12} weight="bold" />
            </button>
          )}
          <CaretDown
            size={12}
            className={cn(
              "shrink-0 transition-transform",
              isOpen && "rotate-180",
              disabled && "opacity-40"
            )}
          />
        </div>
      </div>

      {isOpen &&
        (filteredOptions.length > 0 || showAddCustom) &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="z-[1000] max-h-[300px] animate-in overflow-y-auto rounded-lg border border-border/60 bg-popover p-1 shadow-2xl duration-100 zoom-in-95 fade-in"
            style={dropdownStyle}
          >
            {showAddCustom && (
              <button
                onClick={addCustom}
                className="mb-1 flex w-full items-center gap-2 rounded-lg border-b border-border/20 bg-primary/10 px-3 py-2 text-left text-body font-semibold text-primary"
              >
                <Plus size={14} weight="bold" />
                <span>Add custom: &quot;{query}&quot;</span>
              </button>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                type="button"
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-body font-semibold text-subtle transition-colors hover:bg-accent/40 hover:text-foreground"
              >
                <div className="min-w-0">
                  <span className="truncate">{option.label}</span>
                  {option.description ? (
                    <p className="truncate text-label font-medium text-muted-foreground">
                      {option.description}
                    </p>
                  ) : null}
                </div>
                <Check size={14} className="opacity-0 group-hover:opacity-40" />
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
