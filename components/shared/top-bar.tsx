"use client"

import { Gear, MagnifyingGlass, SignOut, User } from "@phosphor-icons/react"
import { ThemeToggle } from "./theme-toggle"
import { NotificationCenter } from "./notification-center"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSession } from "@/lib/session"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopBarProps {
  user?: {
    name: string;
    initials: string;
    email?: string;
  };
}

export function TopBar({ user: userProp }: TopBarProps) {
  const { user: sessionUser } = useSession()
  const user = userProp || sessionUser

  return (
    <header className="flex justify-between items-center h-14 px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-[100] border-b border-border shrink-0 transition-all duration-200">
      {/* Left side: Greeting */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground ml-2">
          Hello, {user.name} 👋
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
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

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-border mx-1" />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title={user.name}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold ml-1 border border-border hover:ring-2 hover:ring-ring/20 transition-all outline-none"
            >
              {user.initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" weight="duotone" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Gear className="mr-2 h-4 w-4" weight="duotone" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
              <SignOut className="mr-2 h-4 w-4" weight="duotone" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
