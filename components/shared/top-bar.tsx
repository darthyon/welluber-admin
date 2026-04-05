"use client"

import * as React from "react"
import { Bell, MagnifyingGlass } from "@phosphor-icons/react"
import { useSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/shared/user-nav"
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
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MagnifyingGlass size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell size={18} />
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          
          {/* Shared User Profile Component */}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}
