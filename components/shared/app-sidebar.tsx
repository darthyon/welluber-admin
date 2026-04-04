"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Buildings,
  ShieldCheck,
  CurrencyCircleDollar,
  Wallet,
  Shield,
  TreeStructure,
  Tag,
  Gear,
  Receipt,
  ChartBar,
  UsersFour,
  ClockCounterClockwise,
  CaretUpDown,
  Check,
  Storefront,
  Buildings as OrganizationIcon,
  Storefront as ProviderIcon,
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
    name: "Host Console",
    description: "Platform Infrastructure",
    icon: HostIcon,
    active: true,
  },
  {
    id: "org",
    name: "Organization Console",
    description: "Corporate Management",
    icon: OrganizationIcon,
    active: false,
  },
  {
    id: "service-provider",
    name: "Provider Console",
    description: "Service & Vouchers",
    icon: ProviderIcon,
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

  const handlePersonaSwitch = (persona: typeof personas[0]) => {
    if (!persona.active) {
      // Placeholder for toast or alert
      alert(`${persona.name} coming soon!`)
      return
    }
    setActivePersona(persona)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <activePersona.icon size={18} weight="fill" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">WellUber</span>
                    <span className="truncate text-xs font-medium text-muted-foreground">{activePersona.name}</span>
                  </div>
                  <CaretUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--reka-popper-anchor-width) min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">Personas</DropdownMenuLabel>
                {personas.map((persona) => (
                  <DropdownMenuItem
                    key={persona.id}
                    onClick={() => handlePersonaSwitch(persona)}
                    className="gap-2 p-2 focus:bg-accent"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border border-border bg-background">
                      <persona.icon className="size-4 shrink-0" weight={persona.id === activePersona.id ? "fill" : "regular"} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{persona.name}</span>
                      <span className="text-[10px] text-muted-foreground">{persona.description}</span>
                    </div>
                    {persona.id === activePersona.id && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {hostNavigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
                          "transition-all duration-200",
                          isActive ? "bg-accent text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <Link href={item.href}>
                          <Icon
                            size={16}
                            weight={isActive ? "fill" : "regular"}
                            className={cn(
                              "shrink-0 transition-colors",
                              isActive ? "text-foreground" : "text-muted-foreground/70"
                            )}
                          />
                          <span className="font-medium">{item.label}</span>
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

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent cursor-default px-2 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-semibold shrink-0">
                {user.initials}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden overflow-hidden ml-1">
                <span className="truncate font-medium text-foreground">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
