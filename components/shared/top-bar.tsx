"use client"

import * as React from "react"
import { MagnifyingGlass, FileText } from "@phosphor-icons/react"
import Link from "next/link"
import { NotificationCenter } from "@/components/shared/notification-center"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TopBar() {
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 h-14 z-40 transition-all duration-300",
        "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-none"
      )}
    >
      <div className="flex justify-end items-center h-full px-8 gap-6">
        {/* Pro Search Bar */}
        <div className="relative group hidden md:block">
          <MagnifyingGlass 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
            size={16} 
            weight="bold"
          />
          <Input 
            placeholder="Search anything... (⌘K)" 
            className="pl-9 h-8 w-[240px] bg-muted/40 border-border/50 focus:bg-muted/60 focus:ring-1 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60 rounded-xl text-xs shadow-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-muted/50 border border-border rounded-md pointer-events-none opacity-50">
            <span className="text-[9px] font-medium text-muted-foreground">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-border/50 pl-6">
          <Link
            href="/audit-log"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors relative"
            title="Audit Log"
          >
            <FileText size={16} className="text-muted-foreground" />
          </Link>
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
