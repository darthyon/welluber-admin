"use client"

import { MagnifyingGlass } from "@phosphor-icons/react"
import { ThemeToggle } from "./theme-toggle"
import { NotificationCenter } from "./notification-center"

interface TopBarProps {
  user?: {
    name: string;
    initials: string;
  };
}

export function TopBar({ user = { name: "Admin", initials: "WU" } }: TopBarProps) {
  return (
    <header className="flex justify-between items-center h-14 px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-[100] border-b border-border shrink-0">
      {/* Breadcrumb area — left side placeholder */}
      <div className="flex items-center">
        {/* Future: breadcrumbs */}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative group">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors"
          />
          <input
            className="pl-9 pr-14 py-1.5 bg-muted/50 border border-border rounded-lg text-sm w-[260px] focus:ring-1 focus:ring-ring focus:bg-background outline-none transition-all placeholder:text-muted-foreground/60"
            placeholder="Search..."
            type="text"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-background border border-border rounded-md pointer-events-none">
            <span className="text-[10px] font-medium text-muted-foreground">⌘K</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* User avatar */}
        <button
          title={user.name}
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold ml-1 border border-border hover:ring-2 hover:ring-ring/20 transition-all"
        >
          {user.initials}
        </button>
      </div>
    </header>
  )
}
