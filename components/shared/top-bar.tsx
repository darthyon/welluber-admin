"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { useSession } from "@/lib/session"
import { UserNav } from "@/components/shared/user-nav"
import { NotificationCenter } from "@/components/shared/notification-center"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

interface TopBarProps {
  user?: any
}

export function TopBar({ user: userProp }: TopBarProps) {
  const { user: sessionUser } = useSession()
  const { state } = useSidebar()
  const user = userProp || sessionUser

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 h-14",
      "bg-slate-50/90 backdrop-blur-md shadow-sm transition-all duration-300",
      state === "expanded" ? "pl-[215px]" : "pl-[4.4rem]"
    )}>
      <div className="flex justify-between items-center h-full px-8 shrink-0">
        {/* Left side: Greeting */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            Hello, {user?.name || "Guest"} 👋
          </span>
        </div>

        {/* Right side: Global Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Pro Search Bar */}
          <div className="relative group hidden md:block">
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

          <div className="h-4 w-px bg-border mx-2" />
          
          {/* Theme switcher */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter />

          <div className="h-4 w-px bg-border mx-2" />
          
          {/* Shared User Profile Component */}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}
