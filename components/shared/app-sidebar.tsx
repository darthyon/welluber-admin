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
  Tag,
  TreeStructure,
  Users,
  UsersFour,
  CaretUpDown,
  CaretDoubleLeft,
  CaretDoubleRight,
  Check,
  ChartBar,
  ClockCounterClockwise,
  UserGear as HostIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useSession } from "@/lib/session"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Personas Configuration
const personas = [
  {
    id: "host",
    name: "Host Admin",
    description: "Platform Infrastructure",
    icon: Shield,
    active: true,
  },
  {
    id: "org",
    name: "Organization Admin",
    description: "Corporate Management",
    icon: Buildings,
    active: false,
  },
  {
    id: "service-provider",
    name: "Provider Admin",
    description: "Service & Vouchers",
    icon: Storefront,
    active: false,
  },
]

// Navigation Configuration (Host)
const hostNavigation = [
  {
    title: "OPERATIONS",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: SquaresFour },
      { id: "organizations", label: "Organizations", href: "/organizations", icon: Buildings },
      { id: "providers", label: "Service Providers", href: "/service-providers", icon: Storefront },
      { id: "settlements", label: "Settlement & Payouts", href: "/settlements", icon: CurrencyCircleDollar },
      { id: "wallets", label: "Wallets", href: "/wallets", icon: Wallet },
    ],
  },
  {
    title: "SETUP & CONFIG",
    items: [
      { id: "policies", label: "Benefit Policies", href: "/policies", icon: Shield },
      { id: "services", label: "Manage Services", href: "/services", icon: TreeStructure },
      { id: "brands", label: "Manage Brands", href: "/brands", icon: Tag },
      { id: "platform", label: "Platform Configuration", href: "/settings", icon: Gear },
    ],
  },
  {
    title: "REPORTING & ANALYSIS",
    items: [
      { id: "claims", label: "Claims", href: "/claims", icon: Receipt },
      { id: "reports", label: "Reports", href: "/reports", icon: ChartBar },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { id: "team", label: "Team & Permissions", href: "/team", icon: UsersFour },
      { id: "audit", label: "Audit Log", href: "/audit-log", icon: ClockCounterClockwise },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useSession()
  const { state } = useSidebar()
  const [activePersona, setActivePersona] = React.useState(personas[0])

  return (
    <Sidebar 
      collapsible="icon" 
      className="sidebar-floating border-r-0 shadow-2xl overflow-hidden group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
      {...props}
    >
      {/* 1. Deep Layer: Solid Silhouette Base */}
      <div className="absolute inset-0 bg-[#0f1117] z-0" />

      {/* 2. Glow Layer: The "Indigo Bleed" */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-60">
        <div className="absolute -left-[40%] -top-[10%] w-[250%] h-[60%] bg-[#4f46e5]/40 blur-[130px] rounded-full" />
        <div className="absolute -left-[30%] bottom-[10%] w-[220%] h-[50%] bg-[#3b82f6]/30 blur-[110px] rounded-full" />
      </div>

      {/* 3. Glass Layer: The Charcoal Frosted Cover */}
      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-3xl saturate-[300%]" />

      {/* 4. Content Layer: The Navigation UI */}
      <div className="relative z-30 flex flex-col h-full">
        <SidebarHeader className="group-data-[collapsible=icon]:p-2 pt-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
              <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 text-primary-foreground">
                <Layout size={16} weight="fill" />
              </div>
              <span className="font-bold text-white tracking-tight uppercase text-[12px] opacity-70">
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
                    size="lg"
                    className="data-[state=open]:bg-white/5 data-[state=open]:text-white hover:bg-white/5 transition-all duration-300 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center"
                  >
                    <div className="flex aspect-square size-8.5 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 shadow-sm text-primary shrink-0 group-data-[collapsible=icon]:size-7">
                      <activePersona.icon size={19} weight="fill" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-3">
                      <span className="truncate font-bold tracking-tight text-[13px] text-white/90">
                        {activePersona.name}
                      </span>
                      <span className="truncate text-[10px] font-medium text-white/40 uppercase tracking-wider">Admin Account</span>
                    </div>
                    <CaretUpDown className="ml-auto size-4 text-white/20 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[200px] bg-[#1a1c23] border-white/10 text-white"
                  align="start"
                  side="right"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-[10px] uppercase font-bold text-white/40 px-2 py-1.5">
                    Select Account Type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {personas.map((persona) => (
                    <DropdownMenuItem
                      key={persona.name}
                      onClick={() => setActivePersona(persona)}
                      className="gap-2 p-2 focus:bg-white/5 focus:text-white cursor-pointer"
                    >
                      <div className="flex size-6 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
                        <persona.icon size={14} weight="fill" className="text-primary" />
                      </div>
                      <span className="text-[13px] font-medium">{persona.name}</span>
                      {persona.id === activePersona.id && (
                        <Check className="ml-auto size-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2 pt-3 no-scrollbar">
          {hostNavigation.map((section) => (
            <SidebarGroup key={section.title} className="py-2.5">
              <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/50 mb-2 px-3 group-data-[collapsible=icon]:hidden">
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
