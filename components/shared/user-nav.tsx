"use client"

import * as React from "react"
import { 
  User, 
  Gear, 
  CreditCard, 
  SignOut,
  Sparkle
} from "@phosphor-icons/react"
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
import { cn } from "@/lib/utils"

interface UserNavProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  }
}

export function UserNav({ user: userProp }: UserNavProps) {
  const { user: sessionUser } = useSession()
  const user = userProp || sessionUser

  const initials = React.useMemo(() => {
    if (!user?.name) return "G"
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }, [user])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={user?.name || "Guest"}
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label font-semibold border border-border hover:ring-2 hover:ring-ring/20 transition-all outline-none"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-body font-medium leading-none">{user?.name || "Guest"}</p>
            <p className="text-label leading-none text-muted-foreground">
              {user?.email || "guest@welluber.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Gear className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
          <SignOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
