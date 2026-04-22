"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, ArrowRight, CheckCircle, WarningCircle, Lightning } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { Icon } from "@phosphor-icons/react"

export interface NotificationItem {
  id: number;
  type: "action" | "activity";
  priority: "high" | "critical" | "normal" | "low";
  title: string;
  time: string;
  context: string;
  icon: Icon;
  color: string;
  bg: string;
  read: boolean;
}

// Default platform-level notifications — replace via props when auth context is available
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "action",
    priority: "high",
    title: "Horizon Logistics requires package approval",
    time: "10 mins ago",
    context: "Physical therapy bundle submission (RM 1,200/mo).",
    icon: CheckCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    read: false,
  },
  {
    id: 2,
    type: "activity",
    priority: "normal",
    title: "Zenith Yoga Studio processed 12 redemptions",
    time: "45 mins ago",
    context: "Total claim value: RM 1,420.00",
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    read: false,
  },
  {
    id: 3,
    type: "action",
    priority: "critical",
    title: "Payout API Error: Auto-scaling failed",
    time: "2 hours ago",
    context: "Maybank API returned 503 Service Unavailable during batch payout.",
    icon: WarningCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    read: false,
  },
  {
    id: 4,
    type: "activity",
    priority: "normal",
    title: "TechCorp Global onboarded 150 employees",
    time: "5 hours ago",
    context: "Wallet provisioned successfully.",
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    read: true,
  },
  {
    id: 5,
    type: "activity",
    priority: "low",
    title: "System Backup Completed",
    time: "1 day ago",
    context: "Database snapshot created.",
    icon: CheckCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    read: true,
  }
]

interface NotificationCenterProps {
  notifications?: NotificationItem[];
}

export function NotificationCenter({ notifications = DEFAULT_NOTIFICATIONS }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "action">("all")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const displayItems = activeTab === "all" ? notifications : notifications.filter(n => n.type === "action")

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-lg border transition-colors relative",
          isOpen ? "bg-accent border-border" : "border-border hover:bg-accent"
        )}
      >
        <Bell size={16} className="text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-[400px] bg-card border border-border shadow-xl rounded-lg z-[100] overflow-hidden flex flex-col max-w-[calc(100vw-32px)]">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-body">Notification Center</h3>
              <button className="text-caption text-primary hover:underline font-medium">
                Mark all as read
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-muted/50 p-1 rounded-md border border-border">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex-1 py-1.5 text-label font-medium rounded transition-colors text-center",
                  activeTab === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Activity
              </button>
              <button
                onClick={() => setActiveTab("action")}
                className={cn(
                  "flex-1 py-1.5 text-label font-medium rounded transition-colors text-center flex items-center justify-center gap-1.5",
                  activeTab === "action" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Action Required
                <span className="bg-destructive/10 text-destructive px-1.5 rounded-full text-micro leading-tight flex items-center justify-center h-4">
                  {notifications.filter(n => n.type === "action" && !n.read).length}
                </span>
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="max-h-[420px] overflow-y-auto">
            {displayItems.length > 0 ? (
              <div className="divide-y divide-border/50">
                {displayItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 hover:bg-muted/30 transition-colors flex gap-3 cursor-pointer relative",
                        !item.read && "bg-primary/5"
                      )}
                    >
                      {!item.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full" />
                      )}

                      <div className={cn("w-8 h-8 rounded shrink-0 flex items-center justify-center mt-0.5", item.bg, item.color)}>
                        <Icon size={16} weight="fill" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className={cn(
                            "text-nav leading-normal break-words pr-2",
                            !item.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                          )}>
                            {item.title}
                          </p>
                          <span className="text-micro text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-label text-muted-foreground break-words leading-relaxed">
                          {item.context}
                        </p>

                        {item.type === "action" && (
                          <div className="mt-2.5">
                            <span className="inline-flex text-caption font-medium text-primary hover:underline items-center gap-1">
                              Review Item <ArrowRight size={10} />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                <Lightning size={24} className="mb-2 opacity-50" />
                <p className="text-nav font-medium text-foreground/80">You&apos;re all caught up</p>
                <p className="text-label">No immediate actions required.</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-muted/10 text-center">
            <button className="text-label font-medium text-foreground hover:text-primary transition-colors">
              View All History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
