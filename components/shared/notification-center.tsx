"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowCircleUp,
  Bell,
  CheckCircle,
  Gear,
  Lightning,
  PlusCircle,
  WarningCircle,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
  MOCK_ORG_PORTAL_ACTIVITY,
  type OrgPortalActivityItem,
} from "@/lib/mock-data"
import { routes } from "@/lib/navigation"
import type { Icon } from "@phosphor-icons/react"

export interface NotificationItem {
  id: string
  type: "action" | "activity"
  priority: "high" | "critical" | "normal" | "low"
  title: string
  time: string
  context: string
  icon: Icon
  color: string
  bg: string
  read: boolean
  href: string
  actionLabel?: string
}

const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "fallback-1",
    type: "action",
    priority: "high",
    title: "Package Approval Required",
    time: "10 mins ago",
    context: "A payout package needs review before release.",
    icon: WarningCircle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    read: false,
    href: "/audit-log",
    actionLabel: "Review Item",
  },
  {
    id: "fallback-2",
    type: "activity",
    priority: "normal",
    title: "Settlement Batch Completed",
    time: "45 mins ago",
    context: "The latest payout run completed successfully.",
    icon: CheckCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    read: false,
    href: "/audit-log",
  },
]

function getTargetHref(item: OrgPortalActivityItem, orgSlug?: string): string {
  if (!orgSlug) return "/audit-log"

  switch (item.targetPage) {
    case "claims":
      return routes.org.claims(orgSlug)
    case "settings":
      return routes.org.settings(orgSlug)
    case "employees":
      return routes.org.employees(orgSlug)
    case "policies":
      return routes.org.policies(orgSlug)
    case "dashboard":
    default:
      return routes.org.dashboard(orgSlug)
  }
}

function mapActivityToNotification(
  item: OrgPortalActivityItem,
  orgSlug?: string
): NotificationItem {
  if (item.notificationPriority === "critical") {
    return {
      id: item.id,
      type: item.notificationType,
      priority: item.notificationPriority,
      title: item.title,
      time: item.timestamp,
      context: item.desc,
      icon: WarningCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      read: item.read,
      href: getTargetHref(item, orgSlug),
      actionLabel: item.actionLabel,
    }
  }

  if (item.requiresAction) {
    return {
      id: item.id,
      type: item.notificationType,
      priority: item.notificationPriority,
      title: item.title,
      time: item.timestamp,
      context: item.desc,
      icon: Lightning,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      read: item.read,
      href: getTargetHref(item, orgSlug),
      actionLabel: item.actionLabel,
    }
  }

  if (item.type === "SettingChange") {
    return {
      id: item.id,
      type: item.notificationType,
      priority: item.notificationPriority,
      title: item.title,
      time: item.timestamp,
      context: item.desc,
      icon: Gear,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      read: item.read,
      href: getTargetHref(item, orgSlug),
    }
  }

  if (item.type === "Create") {
    return {
      id: item.id,
      type: item.notificationType,
      priority: item.notificationPriority,
      title: item.title,
      time: item.timestamp,
      context: item.desc,
      icon: PlusCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      read: item.read,
      href: getTargetHref(item, orgSlug),
    }
  }

  if (item.type === "Approval") {
    return {
      id: item.id,
      type: item.notificationType,
      priority: item.notificationPriority,
      title: item.title,
      time: item.timestamp,
      context: item.desc,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      read: item.read,
      href: getTargetHref(item, orgSlug),
      actionLabel: item.actionLabel,
    }
  }

  return {
    id: item.id,
    type: item.notificationType,
    priority: item.notificationPriority,
    title: item.title,
    time: item.timestamp,
    context: item.desc,
    icon: ArrowCircleUp,
    color: "text-primary",
    bg: "bg-primary/10",
    read: item.read,
    href: getTargetHref(item, orgSlug),
  }
}

interface NotificationCenterProps {
  notifications?: NotificationItem[]
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const params = useParams<{ orgSlug?: string }>()
  const orgSlug = params?.orgSlug
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "action">("all")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const resolvedNotifications = useMemo(() => {
    if (notifications) return notifications
    if (orgSlug) {
      return MOCK_ORG_PORTAL_ACTIVITY.map((item) =>
        mapActivityToNotification(item, orgSlug)
      )
    }
    return FALLBACK_NOTIFICATIONS
  }, [notifications, orgSlug])

  const unreadCount = resolvedNotifications.filter((item) => !item.read).length
  const actionCount = resolvedNotifications.filter(
    (item) => item.type === "action" && !item.read
  ).length
  const displayItems =
    activeTab === "all"
      ? resolvedNotifications
      : resolvedNotifications.filter((item) => item.type === "action")
  const activityHref = orgSlug ? routes.org.activity(orgSlug) : "/audit-log"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors",
          isOpen ? "bg-accent" : "hover:bg-accent"
        )}
      >
        <Bell size={16} className="text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-11 right-0 z-[100] flex w-[400px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="border-b border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body font-semibold text-foreground">
                Notifications
              </h3>
              <button
                type="button"
                className="text-label font-medium text-primary transition-colors hover:text-primary/80"
              >
                Mark All as Read
              </button>
            </div>

            <div className="flex rounded-md border border-border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex-1 rounded px-3 py-1.5 text-center text-label font-medium transition-colors",
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Activity
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("action")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-center text-label font-medium transition-colors",
                  activeTab === "action"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Actions Required
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.5 text-micro font-medium text-primary">
                  {actionCount}
                </span>
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {displayItems.length > 0 ? (
              <div className="divide-y divide-border/50">
                {displayItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "relative flex gap-3 p-4 transition-colors hover:bg-muted/30",
                        !item.read && "bg-primary/5"
                      )}
                    >
                      {!item.read && (
                        <div className="absolute top-0 bottom-0 left-0 w-0.5 rounded-r-full bg-primary" />
                      )}

                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          item.bg,
                          item.color
                        )}
                      >
                        <Icon size={16} weight="fill" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "pr-2 text-body leading-normal",
                              !item.read
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground/80"
                            )}
                          >
                            {item.title}
                          </p>
                          <span className="mt-0.5 shrink-0 text-micro whitespace-nowrap text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-label leading-relaxed text-muted-foreground">
                          {item.context}
                        </p>

                        {item.type === "action" && (
                          <div className="mt-2.5">
                            <span className="inline-flex items-center gap-1 text-label font-medium text-primary">
                              {item.actionLabel ?? "Review Item"}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center text-muted-foreground">
                <Lightning size={24} className="mb-2 opacity-50" />
                <p className="text-body font-medium text-foreground/80">
                  You&apos;re All Caught Up
                </p>
                <p className="text-label">No immediate actions required.</p>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-muted/10 p-3 text-center">
            <Link
              href={activityHref}
              onClick={() => setIsOpen(false)}
              className="text-label font-medium text-foreground transition-colors hover:text-primary"
            >
              View All Activity
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
