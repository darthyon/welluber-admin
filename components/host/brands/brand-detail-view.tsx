"use client"

import { useState } from "react"
import {
  CaretLeft,
  Tag,
  PencilSimpleLine,
  Gear,
  Plus,
  Sliders,
  Storefront,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { ActionPopover } from "@/components/shared/action-popover"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { SharedDataTable, Column } from "@/components/shared/data-table"
import { EntityAvatar } from "@/components/shared/entity-avatar"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useQueryState } from "@/hooks/use-tab-persistence"
import type { Brand } from "@/types/brand"
import type { ServiceProvider } from "@/types/provider"
import { MOCK_SPS } from "@/lib/mock-data"
import { cn, formatDate } from "@/lib/utils"
import Link from "next/link"
import { ConfirmationModal } from "@/components/shared/confirmation-modal"

interface BrandDetailViewProps {
  brand: Brand
  onBack: () => void
  onRemove: () => void
}

export function BrandDetailView({
  brand,
  onBack,
  onRemove,
}: BrandDetailViewProps) {
  const [searchQuery, setSearchQuery] = useQueryState("search", "")
  const [statusFilter, setStatusFilter] = useQueryState("status", "all")
  const [activeTab, setActiveTab] = useQueryState("tab", "details")
  const [currentStatus, setCurrentStatus] = useState(brand.status)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const brandSps = MOCK_SPS.filter((sp) => sp.brandId === brand.id)

  const filteredSps = brandSps.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.registrationNo.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || sp.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const spColumns: Column<ServiceProvider>[] = [
    {
      header: "Service Provider Name",
      headerClassName: "min-w-[200px]",
      render: (sp) => (
        <div className="flex flex-col">
          <span className="text-body font-semibold text-foreground">
            {sp.name}
          </span>
          <span className="tracking-tight mt-0.5 font-mono text-label text-muted-foreground">
            {sp.registrationNo}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (sp) => (
        <StatusBadge
          status={sp.status}
          variant={
            sp.status === "active"
              ? "emerald"
              : sp.status === "pending"
                ? "amber"
                : "zinc"
          }
        />
      ),
    },
    {
      header: "Service Categories",
      headerClassName: "min-w-[180px]",
      render: (sp) => (
        <div className="flex max-w-[200px] items-center gap-1 overflow-hidden">
          {sp.serviceCategories.slice(0, 1).map((cat, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="h-4 px-1.5 py-0 text-micro font-medium whitespace-nowrap"
            >
              {cat}
            </Badge>
          ))}
          {sp.serviceCategories.length > 1 && (
            <Badge variant="outline" className="px-1.5 text-micro font-medium">
              +{sp.serviceCategories.length - 1}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Vouchers",
      align: "right",
      render: (sp) => (
        <span className="text-body font-semibold text-subtle">
          {sp.activeVoucherCount}
        </span>
      ),
    },
    {
      header: "Branches",
      align: "right",
      render: (sp) => (
        <span className="text-body font-medium text-subtle">
          {sp.branches.length}
        </span>
      ),
    },
    {
      header: "",
      align: "right",
      render: (sp) => (
        <ActionPopover
          actions={[
            {
              label: "View SP Portal",
              onClick: () => {},
            },
            {
              label: "Branches",
              onClick: () => {},
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      {/* Sub-navigation Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="group flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-primary"
        >
          <CaretLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to Brand List
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EntityAvatar name={brand.name} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="tracking-tight text-display font-semibold text-foreground">
                  {brand.name}
                </h2>
                <StatusBadge
                  status={currentStatus}
                  variant={currentStatus === "active" ? "emerald" : "zinc"}
                />
              </div>
              <p className="mt-1 text-body font-medium text-muted-foreground">
                {brand.assignedSpCount} Service Providers Assigned
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-full text-body font-medium transition-all"
            >
              <Link href={`/brands/${brand.id}/edit`}>
                <PencilSimpleLine size={16} weight="bold" className="mr-1.5" />
                Edit Brand
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {[
          { id: "details", label: "Brand Details", icon: Tag },
          { id: "settings", label: "Settings", icon: Gear },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 py-3 text-body font-medium transition-all duration-300",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon
                size={16}
                weight={isActive ? "fill" : "regular"}
                className={cn("transition-colors", isActive && "text-primary")}
              />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "details" && (
        <div className="space-y-8">
          {/* Brand Details */}
          <DetailSection
            title="Brand Profile"
            icon={<Tag size={18} weight="bold" className="text-primary" />}
          >
            <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              <DetailField
                label="Brand Identity"
                value={brand.name}
                icon={<Storefront size={16} />}
              />
              <DetailField
                label="Service Categories"
                value={
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    {brand.serviceCategories?.map((cat, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-label font-medium"
                      >
                        {cat}
                      </Badge>
                    ))}
                    {(!brand.serviceCategories ||
                      brand.serviceCategories.length === 0) && (
                      <span className="text-label text-muted-foreground italic">
                        None assigned
                      </span>
                    )}
                  </div>
                }
                icon={<Tag size={16} />}
              />
              <DetailField
                label="Creation Date"
                value={formatDate(brand.createdAt)}
                icon={<Plus size={16} />}
              />
            </div>
          </DetailSection>

          {/* Assigned Service Providers */}
          <div className="space-y-6">
            <div>
              <h2 className="text-heading font-semibold text-foreground">
                Assigned Service Providers
              </h2>
              <p className="text-body text-subtle">
                Manage service providers linked to this brand
              </p>
            </div>
            <DataFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search service providers..."
              filters={
                <FilterItem
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Pending", value: "pending" },
                  ]}
                />
              }
            />

            <div className="mt-2 overflow-hidden rounded-lg border border-border/40 bg-card">
              <TooltipProvider>
                <SharedDataTable
                  data={filteredSps}
                  columns={spColumns}
                  rowsPerPage={5}
                  freezeFirst
                  freezeLast
                />
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-8">
          <DetailSection
            title="Danger Zone"
            icon={<Sliders size={18} weight="duotone" />}
            description="Confirm how you want to change the brand lifecycle."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-body font-medium text-foreground">
                      {currentStatus === "active"
                        ? "Deactivate Brand"
                        : "Activate Brand"}
                    </p>
                    <p className="text-label text-muted-foreground">
                      {currentStatus === "active"
                        ? "Disable new assignments while keeping brand data intact."
                        : "Restore brand availability for new service provider assignments."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 text-label"
                    onClick={() => setIsStatusModalOpen(true)}
                  >
                    {currentStatus === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-body font-medium text-foreground">
                      Remove Brand
                    </p>
                    <p className="text-label text-muted-foreground">
                      Permanently remove this brand. This action cannot be
                      undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="h-9 text-label"
                    onClick={onRemove}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </DetailSection>
        </div>
      )}

      <ConfirmationModal
        isOpen={isStatusModalOpen}
        title={
          currentStatus === "active" ? "Deactivate Brand" : "Activate Brand"
        }
        description="Review the impact before proceeding."
        impactPoints={[
          currentStatus === "active"
            ? "Brand becomes unavailable for new service provider assignments."
            : "Brand becomes available again for new service provider assignments.",
          "Existing service providers remain linked to this brand.",
        ]}
        confirmLabel={
          currentStatus === "active" ? "Deactivate Brand" : "Activate Brand"
        }
        tone="warning"
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={() => {
          setCurrentStatus(currentStatus === "active" ? "inactive" : "active")
          setIsStatusModalOpen(false)
        }}
      />
    </div>
  )
}
