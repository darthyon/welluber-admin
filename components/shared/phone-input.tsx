"use client"

import { useState } from "react"
import { CaretDown, Phone } from "@phosphor-icons/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const COUNTRIES = [
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
]

interface PhoneInputProps {
  value: string // The full number with prefix
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "12-345 6789",
  className,
}: PhoneInputProps) {
  // Parse initial value to find matching country
  const initialCountry =
    COUNTRIES.find((c) => value.startsWith(c.code)) || COUNTRIES[0]
  const [selectedCountry, setSelectedCountry] = useState(initialCountry)
  const [isOpen, setIsOpen] = useState(false)

  // Extract the number part without prefix
  const numberPart = value.startsWith(selectedCountry.code)
    ? value.slice(selectedCountry.code.length).trim()
    : value

  const handleNumberChange = (newNumber: string) => {
    // Only allow digits, spaces, and hyphens
    const cleanNumber = newNumber.replace(/[^\d\s-]/g, "")
    onChange(`${selectedCountry.code} ${cleanNumber}`)
  }

  const handleCountrySelect = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country)
    onChange(`${country.code} ${numberPart}`)
    setIsOpen(false)
  }

  return (
    <div
      className={cn(
        "group relative flex h-[38px] items-center overflow-hidden rounded-lg border border-border bg-background transition-all focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10",
        className
      )}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex h-full shrink-0 items-center gap-1.5 border-r border-border/50 px-3 transition-colors hover:bg-muted">
            <span className="text-section">{selectedCountry.flag}</span>
            <span className="font-mono text-nav font-semibold text-foreground">
              {selectedCountry.code}
            </span>
            <CaretDown
              size={12}
              className={cn(
                "text-muted-foreground/60 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[200] w-[180px] border-border p-1 shadow-2xl"
        >
          <div className="grid gap-0.5">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c)}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-left transition-all hover:bg-muted",
                  selectedCountry.code === c.code && "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-section">{c.flag}</span>
                  <span
                    className={cn(
                      "text-nav font-medium",
                      selectedCountry.code === c.code
                        ? "text-primary"
                        : "text-foreground/80"
                    )}
                  >
                    {c.name}
                  </span>
                </div>
                <span className="font-mono text-caption font-semibold text-muted-foreground/40 group-hover:text-primary/70">
                  {c.code}
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="relative flex h-full flex-1 items-center">
        <Phone
          size={16}
          className="absolute left-3 text-muted-foreground/40 transition-colors group-focus-within:text-primary"
        />
        <input
          type="tel"
          value={numberPart}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          className="h-full w-full border-none bg-transparent pr-3 pl-10 font-mono text-body font-medium tracking-tight text-foreground/80 outline-none"
        />
      </div>
    </div>
  )
}
