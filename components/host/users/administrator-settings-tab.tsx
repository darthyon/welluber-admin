"use client"

import * as React from "react"
import {
  Buildings,
  Gear,
  LockKey,
  Shield,
  Storefront,
  X,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { FormSelect } from "@/components/shared/form-select"
import { DeactivateAdminDialog } from "@/components/host/users/deactivate-admin-dialog"
import { useAdmins } from "@/hooks/data-hooks"
import { MOCK_ORGS, MOCK_SPS } from "@/lib/mock-data"
import {
  MODULE_CATALOG,
  defaultModuleAccess,
  type AccessModule,
} from "@/features/users/module-catalog"
import type { Administrator } from "@/features/users/types"

interface AdministratorSettingsTabProps {
  admin: Administrator
}

type Scope = "host" | "org" | "sp"

const SCOPE_OPTIONS = [
  { id: "host" as const, label: "Host", icon: Shield },
  { id: "org" as const, label: "Organization", icon: Buildings },
  { id: "sp" as const, label: "Service Provider", icon: Storefront },
]

function scopeOf(admin: Administrator): Scope {
  if (admin.entity?.type === "Organization") return "org"
  if (admin.entity?.type === "ServiceProvider") return "sp"
  return "host"
}

function scopeLabel(scope: Scope) {
  if (scope === "org") return "Organization"
  if (scope === "sp") return "Service Provider"
  return "Host"
}

/** A module plus its children — checking the parent implies the whole subtree. */
function subtreeIds(module: AccessModule): string[] {
  return [module.id, ...(module.children?.map((c) => c.id) ?? [])]
}

export function AdministratorSettingsTab({
  admin,
}: AdministratorSettingsTabProps) {
  const { update } = useAdmins()
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<Administrator | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)

  const [scope, setScope] = React.useState<Scope>(scopeOf(admin))
  const [entityId, setEntityId] = React.useState(admin.entity?.id ?? "")
  const [modules, setModules] = React.useState<string[]>(
    admin.moduleAccess ?? []
  )

  // Re-seed when navigating between administrators.
  React.useEffect(() => {
    setScope(scopeOf(admin))
    setEntityId(admin.entity?.id ?? "")
    setModules(admin.moduleAccess ?? [])
    setIsEditing(false)
  }, [admin])

  const orgOptions = React.useMemo(
    () => MOCK_ORGS.map((o) => ({ label: o.name, value: o.id })),
    []
  )
  const spOptions = React.useMemo(
    () => MOCK_SPS.map((sp) => ({ label: sp.name, value: sp.id })),
    []
  )

  const changeScope = (next: Scope) => {
    if (next === scope) return
    setScope(next)
    // The previous entity is meaningless under a different scope.
    setEntityId("")
    // Reset grants to the new role's defaults so the tree reflects the change.
    setModules(
      defaultModuleAccess(
        next === "org" ? "OrgAdmin" : next === "sp" ? "SPAdmin" : "HostAdmin"
      )
    )
  }

  const toggleModule = (module: AccessModule, checked: boolean) => {
    const ids = subtreeIds(module)
    setModules((prev) =>
      checked
        ? Array.from(new Set([...prev, ...ids]))
        : prev.filter((id) => !ids.includes(id))
    )
  }

  const toggleChild = (parentId: string, childId: string, checked: boolean) => {
    setModules((prev) => {
      const next = checked
        ? Array.from(new Set([...prev, childId, parentId]))
        : prev.filter((id) => id !== childId)
      return next
    })
  }

  const entityMissing = scope !== "host" && !entityId
  const canSave = !entityMissing

  const cancel = () => {
    setScope(scopeOf(admin))
    setEntityId(admin.entity?.id ?? "")
    setModules(admin.moduleAccess ?? [])
    setIsEditing(false)
  }

  const save = () => {
    if (!canSave) return

    if (scope === "org") {
      const org = MOCK_ORGS.find((o) => o.id === entityId)
      update(admin.id, {
        role: "OrgAdmin",
        entity: org
          ? { id: org.id, name: org.name, type: "Organization" }
          : undefined,
        moduleAccess: modules,
      })
    } else if (scope === "sp") {
      const sp = MOCK_SPS.find((s) => s.id === entityId)
      update(admin.id, {
        role: "SPAdmin",
        entity: sp
          ? { id: sp.id, name: sp.name, type: "ServiceProvider" }
          : undefined,
        moduleAccess: modules,
      })
    } else {
      update(admin.id, {
        role: "HostAdmin",
        entity: undefined,
        moduleAccess: modules,
      })
    }
    setIsEditing(false)
  }

  const isActive = admin.status === "Active"
  const grantedCount = modules.length

  const checkboxClass =
    "rounded border-border text-primary focus:ring-primary disabled:opacity-50"

  return (
    <div className="animate-in space-y-6 fade-in">
      <DetailSection
        title="Access"
        icon={<Shield size={18} weight="duotone" />}
        description="Administrator type and the modules they can reach."
        action={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancel}
                className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
              >
                <X size={14} weight="bold" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={!canSave}
                className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
              >
                Save Access
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex h-8 items-center gap-2 rounded-full px-4 text-label font-medium"
            >
              <LockKey size={14} weight="bold" /> Manage Access
            </Button>
          )
        }
      >
        <div className="space-y-6">
          {/* Type */}
          {isEditing ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-label font-medium text-muted-foreground">
                  Administrator Type
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {SCOPE_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      type="button"
                      variant="outline"
                      onClick={() => changeScope(id)}
                      className={cn(
                        "h-10 justify-start gap-2",
                        scope === id &&
                          "border-primary/30 bg-primary/5 text-primary"
                      )}
                    >
                      <Icon size={16} className="shrink-0" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {scope === "host" ? (
                <p className="text-label text-muted-foreground lg:self-end lg:pb-2.5">
                  Host administrators are not tied to an organisation or service
                  provider.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-foreground">
                    {scope === "org" ? "Organization" : "Service Provider"}
                  </label>
                  <FormSelect
                    value={entityId}
                    onChange={setEntityId}
                    options={scope === "org" ? orgOptions : spOptions}
                    placeholder={
                      scope === "org"
                        ? "Select an organization..."
                        : "Select a service provider..."
                    }
                    searchPlaceholder="Search..."
                    error={entityMissing}
                    ariaLabel="Assigned entity"
                  />
                  {entityMissing && (
                    <p className="text-label text-destructive">
                      {scope === "org"
                        ? "Organization is required."
                        : "Service provider is required."}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailField
                label="Administrator Type"
                value={scopeLabel(scopeOf(admin))}
              />
              <DetailField
                label="Assigned Entity"
                value={admin.entity?.name ?? "Welluber Team"}
              />
              <DetailField
                label="Modules Granted"
                value={`${grantedCount} of the catalog`}
              />
            </div>
          )}

          {/* Module catalog */}
          <div className="space-y-3">
            <div className="text-label font-medium text-muted-foreground">
              Module Access
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {MODULE_CATALOG.map((group) => (
                <div
                  key={group.id}
                  className="rounded-lg border border-border bg-muted/20 p-4"
                >
                  <p className="text-label font-semibold tracking-wide text-foreground uppercase">
                    {group.label}
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {group.modules.map((module) => {
                      const checked = modules.includes(module.id)
                      return (
                        <div key={module.id} className="space-y-2">
                          <label
                            className={cn(
                              "flex items-center gap-2",
                              isEditing ? "cursor-pointer" : "cursor-default"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!isEditing}
                              onChange={(e) =>
                                toggleModule(module, e.target.checked)
                              }
                              className={checkboxClass}
                            />
                            <span
                              className={cn(
                                "text-body font-medium",
                                checked ? "text-foreground" : "text-faint"
                              )}
                            >
                              {module.label}
                            </span>
                          </label>

                          {module.children && (
                            <div className="ml-6 space-y-2 border-l border-border pl-4">
                              {module.children.map((child) => {
                                const childChecked = modules.includes(child.id)
                                return (
                                  <label
                                    key={child.id}
                                    className={cn(
                                      "flex items-center gap-2",
                                      isEditing
                                        ? "cursor-pointer"
                                        : "cursor-default"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={childChecked}
                                      disabled={!isEditing}
                                      onChange={(e) =>
                                        toggleChild(
                                          module.id,
                                          child.id,
                                          e.target.checked
                                        )
                                      }
                                      className={checkboxClass}
                                    />
                                    <span
                                      className={cn(
                                        "text-label font-medium",
                                        childChecked
                                          ? "text-subtle"
                                          : "text-faint"
                                      )}
                                    >
                                      {child.label}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title="Danger Zone"
        icon={<Gear size={18} weight="duotone" />}
        description="Confirm how you want to change this administrator's access."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-body font-medium text-foreground">
                  {isActive
                    ? "Deactivate Administrator"
                    : "Reactivate Administrator"}
                </p>
                <p className="text-label text-muted-foreground">
                  {isActive
                    ? "Block sign-in and end active sessions. Audit history is retained."
                    : "Restore portal access for this administrator."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-9 text-label",
                  isActive
                    ? "border-destructive/30 text-destructive hover:bg-destructive/5"
                    : "border-primary/30 text-primary hover:bg-primary/5"
                )}
                onClick={() =>
                  isActive
                    ? setDeactivateTarget(admin)
                    : update(admin.id, { status: "Active" })
                }
              >
                {isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      </DetailSection>

      <DeactivateAdminDialog
        admin={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
