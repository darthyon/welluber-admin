"use client"

import * as React from "react"
import { Bell, MagnifyingGlass } from "@phosphor-icons/react"
import { useSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

interface TopBarProps {
  user?: any
}

export function TopBar({ user: userProp }: TopBarProps) {
  const { user: sessionUser } = useSession()
  const { state } = useSidebar()
  const user = userProp || sessionUser

  // Helper to get initials
  const initials = React.useMemo(() => {
    if (!user?.name) return "G"
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }, [user?.name])

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
          
          {/* Restored Avatar Button */}
          <button
            title={user?.name || "Guest"}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold border border-border hover:ring-2 hover:ring-ring/20 transition-all outline-none"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  )
}
