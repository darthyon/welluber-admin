"use client"

import * as React from "react"
import { MagnifyingGlass, FileText, List } from "@phosphor-icons/react"
import Link from "next/link"
import { NotificationCenter } from "@/components/shared/notification-center"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function TopBar() {
  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-40 h-14 transition-all duration-300",
        "border-b border-border/40 bg-background/80 shadow-none backdrop-blur-md"
      )}
    >
      <div className="flex h-full items-center justify-between gap-6 px-4 md:justify-end md:px-8">
        {/* Mobile nav trigger — sidebar is off-canvas below md */}
        <SidebarTrigger
          aria-label="Open Navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent md:hidden"
        >
          <List size={16} className="text-muted-foreground" />
        </SidebarTrigger>

        {/* Pro Search Bar */}
        <div className="group relative hidden md:block">
          <MagnifyingGlass
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            size={16}
            weight="bold"
          />
          <Input
            placeholder="Search anything... (⌘K)"
            className="h-8 w-[240px] rounded-lg border-border/50 bg-muted/40 pl-9 text-label shadow-none transition-all placeholder:text-faint focus:bg-muted/60 focus:ring-1 focus:ring-primary/10"
          />
          <div className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 opacity-50 sm:flex">
            <span className="text-micro font-medium text-subtle">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-border/50 pl-6">
          <Link
            href="/audit-log"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
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
