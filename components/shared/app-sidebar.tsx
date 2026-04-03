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
        { id: "providers", label: "Service Providers", href: "/providers", icon: ShieldCheck },
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
    <aside className="h-full flex flex-col w-64 border-r border-border bg-card z-20 shrink-0">
      {/* Logo & Brand */}
      <div className="px-6 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck size={24} weight="fill" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
              WellUber
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-1">
              {personaLabel}
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px] shadow-sm">
              {user.initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-foreground truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground font-semibold truncate">
                {personaLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto px-4 space-y-8 pb-8">
        {navigation.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group relative rounded-xl",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                    )}
                  >
                    <Icon
                      size={20}
                      weight={isActive ? "fill" : "regular"}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary"
                      )}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
