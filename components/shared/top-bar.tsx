"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { useSession } from "@/lib/session"
import { UserNav } from "@/components/shared/user-nav"
import { NotificationCenter } from "@/components/shared/notification-center"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"

interface TopBarProps {
  user?: any
}

export function TopBar({ user: userProp }: TopBarProps) {
  const { user: sessionUser } = useSession()
  const user = userProp || sessionUser

  return (
    <header className={cn(
      "sticky top-0 z-30 h-14 w-full",
      "bg-slate-50/90 backdrop-blur-md shadow-[0_15px_30px_-5px_rgba(0,0,0,0.12)] transition-all duration-300"
    )}>
      <div className="flex justify-between items-center h-full px-8 shrink-0">
        {/* Left side: Greeting */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            Hello, {user?.name || "Guest"} 👋
          </span>
        </div>

        {/* Right side: Global Actions */}
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
