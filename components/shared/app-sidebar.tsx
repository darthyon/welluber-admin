"use client"

import * as React from "react"
import {
  SquaresFour,
  Buildings,
  CurrencyCircleDollar,
  Wallet,
  Shield,
  Gear,
  Receipt,
  Storefront,
  TreeStructure,
  CaretDoubleLeft,
  CaretDoubleRight,
  SignOut,
  CaretUpDown,
  Check,
  Users,
  Tag,
  ChartBar,
  List
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { WelluberLogo } from "@/components/shared/welluber-logo"
import { WelluberMark } from "@/components/shared/welluber-mark"
import { useSession } from "@/lib/session"
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

// Personas Configuration
const personas = [
  {
    id: "host",
    name: "Host Admin",
    description: "Platform Infrastructure",
    icon: Shield,
  },
  {
    id: "org",
    name: "Organisation Admin",
    description: "Corporate Management",
    icon: Buildings,
  },
  {
    id: "provider",
    name: "Provider Admin",
    description: "Service & Vouchers",
    icon: Storefront,
  },
]

// Navigation Data
const navOperations: NavMainItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: SquaresFour },
  {
    title: "Organisations",
    url: "#",
    icon: Buildings,
    items: [
      { title: "All Organisations", url: "/organizations" },
      { title: "Benefit Policies", url: "/policies" },
      { title: "Claims", url: "/claims" },
      { title: "Employees", url: "/employees" },
    ],
  },
  {
    title: "Service Providers",
    url: "#",
    icon: Storefront,
    items: [
      { title: "All Service Providers", url: "/service-providers" },
      { title: "Voucher Packages", url: "/voucher-packages" },
    ],
  },
]

const navSetup: NavMainItem[] = [
  { title: "Services", url: "/services", icon: TreeStructure },
  { title: "Brands", url: "/brands", icon: Tag },
]

const navUserMgmt: NavMainItem[] = [
  { title: "Members", url: "/users/members", icon: Users },
  { title: "Administrators", url: "/users/administrators", icon: Shield },
]

const navFinance: NavMainItem[] = [
  { title: "Claims", url: "/claims", icon: Receipt },
  { title: "Invoices", url: "/invoices", icon: List },
  { title: "Settlements", url: "/settlements", icon: CurrencyCircleDollar },
  { title: "Accounts", url: "/accounts", icon: Wallet },
  { title: "Reports", url: "/reports", icon: ChartBar },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSession()
  const { state } = useSidebar()
  const [activePersona, setActivePersona] = React.useState(personas[0])

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
            {/* Expanded logo */}
            <div className="flex items-center group-data-[collapsible=icon]:hidden">
              <WelluberLogo width={120} height={31} className="opacity-90" />
            </div>
            {/* Collapsed mark */}
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
                    id="persona-dropdown-trigger"
                    size="lg"
                    className="data-[state=open]:bg-sidebar-foreground/5 data-[state=open]:text-sidebar-foreground hover:bg-sidebar-foreground/5 transition-all duration-300 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-10"
                  >
                    <div className="flex aspect-square size-8.5 items-center justify-center rounded-lg bg-sidebar-foreground/5 ring-1 ring-sidebar-foreground/10 shadow-sm text-primary shrink-0 group-data-[collapsible=icon]:size-7">
                      <activePersona.icon size={19} weight="fill" />
                    </div>
                    <div className="grid flex-1 text-left text-body leading-tight group-data-[collapsible=icon]:hidden ml-3">
                      <span className="truncate font-medium text-body text-sidebar-foreground">
                        {activePersona.name}
                      </span>
                      <span className="truncate text-label font-medium text-sidebar-foreground/80">Admin account</span>
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
                    <DropdownMenuLabel className="px-3 py-1.5 text-label font-medium text-faint">
                      Select account type
                    </DropdownMenuLabel>
                    {personas.map((persona) => (
                      <DropdownMenuItem
                        key={persona.id}
                        onClick={() => setActivePersona(persona)}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-primary/5 transition-all group/item"
                      >
                        <div className={cn(
                          "flex aspect-square size-7 items-center justify-center rounded-lg ring-1 ring-border group-hover/item:ring-primary/20",
                          activePersona.id === persona.id ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-0" : "bg-muted/30 text-muted-foreground"
                        )}>
                          <persona.icon size={15} weight="fill" />
                        </div>
                        <span className={cn(
                          "text-body font-medium",
                          activePersona.id === persona.id ? "text-primary font-semibold" : "text-subtle"
                        )}>
                          {persona.name}
                        </span>
                        {activePersona.id === persona.id && (
                          <Check className="ml-auto size-4 text-primary" weight="bold" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-primary/5 group/settings">
                      <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground group-hover/settings:bg-primary/5 group-hover/settings:text-primary transition-colors border border-transparent group-hover/settings:border-primary/10">
                        <Gear size={15} weight="fill" />
                      </div>
                      <span className="text-body font-medium text-subtle group-hover/settings:text-primary transition-colors">Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-destructive/5 group/logout">
                      <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-destructive/5 text-destructive/60 group-hover/logout:bg-destructive group-hover/logout:text-destructive-foreground transition-all shadow-sm">
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
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navOperations} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              Setup & Config
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navSetup} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              User Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navUserMgmt} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="py-2.5">
            <SidebarGroupLabel className="text-label font-medium text-sidebar-foreground/70 mb-2 px-3 group-data-[collapsible=icon]:hidden uppercase">
              Finance & Reporting
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={navFinance} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </div>
    </Sidebar>
  )
}

