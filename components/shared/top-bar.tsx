"use client"

import { MagnifyingGlass, Bell } from "@phosphor-icons/react"

export function TopBar() {
  return (
    <header className="flex justify-end items-center h-16 px-8 bg-card sticky top-0 z-10 border-b border-border shrink-0">
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group">
          <MagnifyingGlass
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
          />
          <input
            className="pl-12 pr-16 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm w-[400px] focus:ring-2 focus:ring-primary/20 focus:bg-card outline-none transition-all"
            placeholder="Search..."
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 bg-card border border-border rounded-md shadow-sm pointer-events-none">
            <span className="text-[10px] font-bold text-muted-foreground">⌘</span>
            <span className="text-[10px] font-bold text-muted-foreground">K</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent transition-colors relative">
            <Bell size={22} className="text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive border-2 border-card rounded-full" />
          </button>
        </div>
      </div>
    </header>
  )
}
