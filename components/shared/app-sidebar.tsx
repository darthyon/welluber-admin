"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Buildings,
  ShieldCheck,
  Users,
  Shield,
  Receipt,
  Gear,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/session"

type NavItem = {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "fill"; className?: string }>
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navigationConfig: Record<string, NavSection[]> = {
  host: [
    {
      title: "MANAGEMENT",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: SquaresFour },
        { id: "organizations", label: "Organizations", href: "/organizations", icon: Buildings },
        { id: "providers", label: "Service Providers", href: "/service-providers", icon: ShieldCheck },
        { id: "users", label: "Global Users", href: "/users", icon: Users },
      ],
    },
    {
      title: "BENEFITS",
      items: [
        { id: "policies", label: "Policies", href: "/policies", icon: Shield },
        { id: "transactions", label: "Transactions", href: "/transactions", icon: Receipt },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "Settings", href: "/settings", icon: Gear },
      ],
    },
  ],
  org: [
    {
      title: "MANAGEMENT",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: SquaresFour },
        { id: "employees", label: "Employees", href: "/employees", icon: Users },
      ],
    },
    {
      title: "BENEFITS",
      items: [
        { id: "policies", label: "Policies", href: "/policies", icon: Shield },
        { id: "transactions", label: "Transactions", href: "/transactions", icon: Receipt },
      ],
    },
    {
      title: "SETTINGS",
      items: [
        { id: "settings", label: "Settings", href: "/settings", icon: Gear },
      ],
    },
  ],
  serviceprovider: [
    {
      title: "MANAGEMENT",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: SquaresFour },
        { id: "branches", label: "Branches", href: "/branches", icon: Buildings },
      ],
    },
    {
      title: "BENEFITS",
      items: [
        { id: "vouchers", label: "Vouchers", href: "/vouchers", icon: Receipt },
        { id: "settlements", label: "Settlements", href: "/settlements", icon: Shield },
      ],
    },
    {
      title: "SETTINGS",
      items: [
        { id: "settings", label: "Settings", href: "/settings", icon: Gear },
      ],
    },
  ],
}

interface AppSidebarProps {
  persona?: "host" | "org" | "serviceprovider"
}

export function AppSidebar({ persona = "host" }: AppSidebarProps) {
  const pathname = usePathname()
  const { user } = useSession()
  const navigation = navigationConfig[persona]

  const personaLabel = {
    host: "Host Admin",
    org: "Org Admin",
    serviceprovider: "Provider Admin",
  }[persona]

  return (
    <aside className="h-full flex flex-col w-[240px] border-r border-border bg-sidebar z-20 shrink-0">
      {/* Logo & Brand */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <ShieldCheck size={16} weight="fill" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">
              WellUber
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {personaLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto px-3 pt-4 space-y-6 pb-4">
        {navigation.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] mb-1.5">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 transition-all duration-150 group relative rounded-md text-[13px]",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon
                      size={16}
                      weight={isActive ? "fill" : "regular"}
                      className={cn(
                        "transition-colors shrink-0",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/70 group-hover:text-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section at bottom */}
      <div className="px-3 pb-3 mt-auto border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-semibold">
            {user.initials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-[13px] font-medium text-foreground truncate leading-none">
              {user.name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
