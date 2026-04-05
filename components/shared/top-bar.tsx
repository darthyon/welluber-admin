"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { NotificationCenter } from "@/components/shared/notification-center"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TopBar() {
  return (
    <header className={cn(
      "fixed top-0 left-0 w-full h-14 z-40 transition-all duration-300",
      "bg-slate-50/90 backdrop-blur-md shadow-[0_15px_30px_-5px_rgba(0,0,0,0.12)]"
    )}>
      <div className="flex justify-between items-center h-full pr-8 pl-[var(--sidebar-width)] transition-all duration-300">
        {/* Left side: Global Search */}
        <div className="flex-1 max-w-md ml-8">
          <div className="relative group">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
              size={18} 
              weight="bold"
            />
            <Input 
              placeholder="Search anything... (⌘K)" 
              className="pl-10 h-9 bg-white/50 border-border focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 rounded-xl"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-muted/50 border border-border rounded-md pointer-events-none opacity-50">
              <span className="text-[10px] font-medium text-muted-foreground">⌘K</span>
            </div>
          </div>
        </div>

        {/* Right side: Global Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
