"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Buildings,
  CurrencyCircleDollar,
  Wallet,
  Shield,
  Gear,
  House,
  Layout,
  Lifebuoy,
  List,
  Receipt,
  Storefront,
  TreeStructure,
  UsersFour,
  CaretDoubleLeft,
  CaretDoubleRight,
  ChartBar,
  ClockCounterClockwise,
  SignOut,
  CaretUpDown,
  Check,
  Plus,
  Users,
  Tag,
  Calendar,
  ChartLineUp,
  ShieldCheck,
  Monitor,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useSession } from "@/lib/session"
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
    name: "Organization Admin",
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

// Navigation Configuration (Host)
const hostNavigation = [
  {
    title: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: SquaresFour },
      { id: "organizations", label: "Organizations", href: "/organizations", icon: Buildings },
      { id: "providers", label: "Service Providers", href: "/service-providers", icon: Storefront },
      { id: "settlements", label: "Settlement & Payouts", href: "/settlements", icon: CurrencyCircleDollar },
      { id: "wallets", label: "Wallets", href: "/wallets", icon: Wallet },
    ],
  },
  {
    title: "Setup & config",
    items: [
      { id: "policies", label: "Benefit Policies", href: "/policies", icon: ShieldCheck },
      { id: "services", label: "Services", href: "/services", icon: TreeStructure },
      { id: "brands", label: "Brands", href: "/brands", icon: Tag },
    ],
  },
  {
    title: "User Management",
    items: [
      { id: "members", label: "Members", href: "/users/members", icon: Users },
      { id: "administrators", label: "Administrators", href: "/users/administrators", icon: Shield },
    ],
  },
  {
    title: "Reporting & analysis",
    items: [
      { id: "claims", label: "Claims", href: "/claims", icon: Receipt },
      { id: "reports", label: "Reports", href: "/reports", icon: ChartBar },
    ],
  },
]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useSession()
  const { state, isMobile } = useSidebar()
  const [activePersona, setActivePersona] = React.useState(personas[0])

  return (
    <Sidebar 
      collapsible="icon" 
      className="sidebar-floating border-r-0 shadow-2xl overflow-hidden"
      {...props}
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-[#0f1117] z-0" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-60">
        <div className="absolute -left-[40%] -top-[10%] w-[250%] h-[60%] bg-[#4f46e5]/40 blur-[130px] rounded-full" />
        <div className="absolute -left-[30%] bottom-[10%] w-[220%] h-[50%] bg-[#3b82f6]/30 blur-[110px] rounded-full" />
      </div>
      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-3xl saturate-[300%]" />

      {/* Content Layer */}
      <div className="relative z-30 flex flex-col h-full">
        <SidebarHeader className="group-data-[collapsible=icon]:p-2 pt-7 pb-2">

          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
              <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 text-primary-foreground">
                <Layout size={16} weight="fill" />
              </div>
              <span className="font-bold text-white tracking-tight text-[12px] opacity-70">
                WellUber™
              </span>
            </div>
            <SidebarTrigger className="h-8 w-8 hover:bg-white/10 transition-colors text-white/40 hover:text-white group-data-[collapsible=icon]:mx-auto">
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
                    className="data-[state=open]:bg-white/5 data-[state=open]:text-white hover:bg-white/5 transition-all duration-300 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-10"
                  >
                    <div className="flex aspect-square size-8.5 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 shadow-sm text-primary shrink-0 group-data-[collapsible=icon]:size-7">
                      <activePersona.icon size={19} weight="fill" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-3">
                      <span className="truncate font-bold tracking-tight text-[13px] text-white/90">
                        {activePersona.name}
                      </span>
                      <span className="truncate text-[10px] font-medium text-white/40 tracking-tight">Admin account</span>
                    </div>
                    <CaretUpDown className="ml-auto size-4 text-white/20 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[280px] bg-popover border-border animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  align="start"
                  side="right"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-3 py-2.5 text-left text-sm">
                      <Avatar className="h-9 w-9 rounded-xl shadow-lg ring-2 ring-primary/10 transition-transform hover:scale-105 active:scale-95 duration-200">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[13px] tracking-tight">YY</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-bold tracking-tight text-foreground">{user?.name || "Yon Yusuf"}</span>
                        <span className="truncate text-[11px] text-muted-foreground font-medium">{user?.email || "yon@welluber.com"}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-semibold tracking-tight text-muted-foreground/60">
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
                          "text-[13px] font-medium tracking-tight",
                          activePersona.id === persona.id ? "text-primary font-semibold" : "text-foreground/70"
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
                      <span className="text-[13px] font-medium text-foreground/70 group-hover/settings:text-primary transition-colors">Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer focus:bg-red-500/5 group/logout">
                      <div className="flex aspect-square size-7 items-center justify-center rounded-xl bg-red-500/5 text-red-500/60 group-hover/logout:bg-red-500 group-hover/logout:text-white transition-all shadow-sm">
                        <SignOut size={15} weight="fill" />
                      </div>
                      <span className="text-[13px] font-medium text-red-500/70 group-hover/logout:text-red-500 transition-colors">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-3 no-scrollbar h-full">
          {hostNavigation.map((section) => (
            <SidebarGroup key={section.title} className="py-2.5">
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-tight text-white/50 mb-2 px-3 group-data-[collapsible=icon]:hidden">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            "transition-all duration-200 h-11 rounded-lg px-3 relative overflow-hidden group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center",
                            isActive 
                              ? "bg-white/10 text-white backdrop-blur-md ring-1 ring-white/10 shadow-lg shadow-black/20" 
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3.5 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                            <Icon
                              size={20}
                              weight={isActive ? "fill" : "regular"}
                              className={cn(
                                "shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-white/40"
                              )}
                            />
                            <span className={cn(
                              "text-sm font-medium tracking-tight truncate group-data-[collapsible=icon]:hidden",
                              isActive ? "text-white" : "text-white/70"
                            )}>
                              {item.label}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </div>
    </Sidebar>
  )
}
