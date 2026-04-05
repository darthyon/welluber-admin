"use client"

import * as React from "react"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { NotificationCenter } from "@/components/shared/notification-center"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/session"
import { useSidebar } from "@/components/ui/sidebar"

export function TopBar() {
  const { user } = useSession()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  // Calculate the physical offset based on sidebar state
  // This matches SIDEBAR_WIDTH and SIDEBAR_WIDTH_ICON from sidebar.tsx
  const sidebarOffset = isMobile ? "0px" : (isCollapsed ? "70.4px" : "215px")

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 h-14 z-40 transition-all duration-300",
        "bg-slate-50/90 backdrop-blur-md shadow-[0_1px_2px_0_rgba(0,0,0,0.05),0_15px_30px_-5px_rgba(0,0,0,0.08)]"
      )}
    >
      <div 
        style={{ 
          paddingLeft: sidebarOffset,
          transition: 'padding-left 200ms linear' 
        }}
        className="flex justify-between items-center h-full pr-8"
      >
        {/* Left side: Personalized Greeting */}
        <div className="flex items-center pl-8">
          <span className="text-[13px] font-bold tracking-tight text-foreground/90">
            Hello, {user?.name?.split(' ')[0] || "User"} 👋
          </span>
        </div>

        {/* Right side: Search & Global Actions */}
        <div className="flex items-center gap-6">
          {/* Pro Search Bar */}
          <div className="relative group hidden md:block">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
              size={16} 
              weight="bold"
            />
            <Input 
              placeholder="Search anything... (⌘K)" 
              className="pl-9 h-8 w-[240px] bg-white/50 border-border focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60 rounded-xl text-xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-muted/50 border border-border rounded-md pointer-events-none opacity-50">
              <span className="text-[9px] font-medium text-muted-foreground">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-border/50 pl-6">
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
