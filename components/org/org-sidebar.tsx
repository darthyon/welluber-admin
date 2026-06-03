"use client"

import * as React from "react"
import {
  SquaresFour,
  Buildings,
  Users,
  Shield,
  SealCheck,
  Ticket,
  ChartBar,
  ClockCounterClockwise,
  Gear,
  CaretDoubleLeft,
  CaretDoubleRight,
  CaretUpDown,
  SignOut,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { WelluberLogo } from "@/components/shared/welluber-logo"
import { WelluberMark } from "@/components/shared/welluber-mark"
import { useSession } from "@/lib/session"
import { routes } from "@/lib/navigation"
import { NavMain } from "@/components/nav-main"
import type { NavMainItem } from "@/components/nav-main"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"


interface OrgSidebarProps extends React.ComponentProps<typeof Sidebar> {
  orgSlug: string
}

export function OrgSidebar({ orgSlug, ...props }: OrgSidebarProps) {
  const { user } = useSession()
  const { state } = useSidebar()
  const router = useRouter()
  const navMyOrg: NavMainItem[] = [
    { title: "Dashboard", url: routes.org.dashboard(orgSlug), icon: SquaresFour },
    { title: "Employees", url: routes.org.employees(orgSlug), icon: Users },
    { title: "Branches", url: routes.org.branches(orgSlug), icon: Buildings },
  ]

  const navBenefits: NavMainItem[] = [
    { title: "Benefit Policies", url: routes.org.policies(orgSlug), icon: Shield },
    { title: "Claims", url: routes.org.claims(orgSlug), icon: SealCheck },
    { title: "Vouchers", url: routes.org.vouchers(orgSlug), icon: Ticket },
  ]

  const navReporting: NavMainItem[] = [
    { title: "Reports", url: routes.org.reports(orgSlug), icon: ChartBar },
  ]

  const navAccount: NavMainItem[] = [
    { title: "Activity", url: routes.org.activity(orgSlug), icon: ClockCounterClockwise },
    { title: "Settings", url: routes.org.settings(orgSlug), icon: Gear },
  ]

  return (
    <Sidebar
      collapsible="icon"
      className="sidebar-floating border-r-0 shadow-2xl overflow-hidden"
      {...props}
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-sidebar z-0" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-60">
        <div className="absolute -left-[40%] -top-[10%] w-[250%] h-[60%] bg-primary/30 blur-[130px] rounded-full" />
        <div className="absolute -left-[30%] bottom-[10%] w-[220%] h-[50%] bg-primary/20 blur-[110px] rounded-full" />
      </div>
      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-3xl saturate-[300%]" />

      {/* Content Layer */}
      <div className="relative z-30 flex flex-col h-full">
        <SidebarHeader className="group-data-[collapsible=icon]:p-2 pt-7 pb-2">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center group-data-[collapsible=icon]:hidden">
              <WelluberLogo width={120} height={31} className="text-primary-foreground opacity-90" />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center flex-1">
              <WelluberMark size={32} className="opacity-90" />
            </div>
            <SidebarTrigger className="h-8 w-8 hover:bg-sidebar-foreground/10 transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground group-data-[collapsible=icon]:mx-auto">
              {state === "expanded" ? (
                <CaretDoubleLeft size={16} weight="bold" />
              ) : (
                <CaretDoubleRight size={16} weight="bold" />
              )}
            </SidebarTrigger>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-foreground/5 data-[state=open]:text-sidebar-foreground hover:bg-sidebar-foreground/5 transition-all duration-300 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-10"
                  >
                    <div className="flex aspect-square size-8.5 items-center justify-center rounded-lg bg-sidebar-foreground/5 ring-1 ring-sidebar-foreground/10 shadow-sm text-primary shrink-0 group-data-[collapsible=icon]:size-7">
                      <Buildings size={19} weight="fill" />
                    </div>
                    <div className="grid flex-1 text-left text-body leading-tight group-data-[collapsible=icon]:hidden ml-3">
                      <span className="truncate font-medium text-body text-sidebar-foreground">
                        {user?.name || "Admin"}
                      </span>
                      <span className="truncate text-label font-medium text-sidebar-foreground/80">Organisation Admin</span>
                    </div>
                    <CaretUpDown className="ml-auto size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[280px] bg-popover border-border animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  align="start"
                  side="right"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-3 py-2.5 text-left text-body">
                      <Avatar className="h-9 w-9 rounded-full shadow-lg ring-2 ring-primary/10 transition-transform hover:scale-105 active:scale-95 duration-200">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-body">
                          {(() => {
                            const n = user?.name || ""
                            const parts = n.trim().split(/\s+/).filter(Boolean)
                            return parts.length >= 2
                              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                              : parts[0]?.substring(0, 2).toUpperCase() || "?"
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold text-foreground">{user?.name || "Yon Yusuf"}</span>
                        <span className="truncate text-label text-subtle font-medium">{user?.email || "yon@welluber.com"}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-primary/5 group/settings">
                      <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground group-hover/settings:bg-primary/5 group-hover/settings:text-primary transition-colors border border-transparent group-hover/settings:border-primary/10">
                        <Gear size={15} weight="fill" />
                      </div>
                      <span className="text-body font-medium text-subtle group-hover/settings:text-primary transition-colors">Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-destructive/5 group/logout"
                      onClick={() => router.push("/signout")}
                    >
                      <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-destructive/5 text-destructive/60 group-hover/logout:bg-destructive/10 group-hover/logout:text-destructive transition-colors border border-transparent group-hover/logout:border-destructive/10">
                        <SignOut size={15} weight="fill" />
                      </div>
                      <span className="text-body font-medium text-destructive/70 group-hover/logout:text-destructive transition-colors">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-3 no-scrollbar h-full">
          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              My Organisation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navMyOrg} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              Benefits
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navBenefits} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              Reporting
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navReporting} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navAccount} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </div>
    </Sidebar>
  )
}
