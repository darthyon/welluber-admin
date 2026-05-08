"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export interface NavMainItem {
  title: string
  url: string
  icon?: React.ElementType<{ size?: number; weight?: "fill" | "regular" | "bold"; className?: string }>
  items?: { title: string; url: string }[]
}

interface NavMainProps {
  items: NavMainItem[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const hasChildren = item.items && item.items.length > 0
        const isChildActive = hasChildren
          ? item.items!.some(
              (child) => pathname === child.url || pathname.startsWith(child.url + "/")
            )
          : false

        if (!hasChildren) {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          const Icon = item.icon
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={cn(
                  "transition-all duration-200 h-11 rounded-lg px-3 relative overflow-hidden group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center",
                  isActive
                    ? "bg-sidebar-foreground/10 text-sidebar-foreground backdrop-blur-md ring-1 ring-sidebar-foreground/10 shadow-lg shadow-black/20"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                )}
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-3.5 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
                >
                  {Icon && (
                    <Icon
                      size={20}
                      weight={isActive ? "fill" : "regular"}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-body font-normal truncate group-data-[collapsible=icon]:hidden",
                      isActive ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/70"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isChildActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "transition-all duration-200 h-11 rounded-lg px-3 relative overflow-hidden group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center",
                    isChildActive
                      ? "bg-sidebar-foreground/10 text-sidebar-foreground backdrop-blur-md ring-1 ring-sidebar-foreground/10 shadow-lg shadow-black/20"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="flex items-center gap-3.5 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                    {item.icon && (
                      <item.icon
                        size={20}
                        weight={isChildActive ? "fill" : "regular"}
                        className={cn(
                          "shrink-0 transition-colors",
                          isChildActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-body font-normal truncate flex-1 group-data-[collapsible=icon]:hidden",
                        isChildActive ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/70"
                      )}
                    >
                      {item.title}
                    </span>
                    <CaretDown
                      size={14}
                      weight="bold"
                      className="ml-auto shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180 text-sidebar-foreground/50"
                    />
                  </span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items!.map((subItem) => {
                    const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/")
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive}
                          className={cn(
                            "transition-all duration-200",
                            isSubActive
                              ? "bg-sidebar-foreground/10 text-sidebar-foreground backdrop-blur-md ring-1 ring-sidebar-foreground/10 shadow-lg shadow-black/20"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground"
                          )}
                        >
                          <Link href={subItem.url}>
                            <span
                              className={cn(
                                "text-body font-normal truncate",
                                isSubActive ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/70"
                              )}
                            >
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )
      })}
    </SidebarMenu>
  )
}
