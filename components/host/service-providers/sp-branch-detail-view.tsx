"use client"

import {
  PencilSimpleLine,
  MapPin,
  Phone,
  Globe,
  Clock,
  Buildings,
  Users,
  CheckCircle,
  DeviceMobile,
  EnvelopeSimple,
  LinkSimple,
  WhatsappLogo,
} from "@phosphor-icons/react"
import { DetailField } from "@/components/shared/detail-field"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { BackButton } from "@/components/shared/back-button"
import { EntityHeader } from "@/components/shared/entity-header"
import { OPERATING_DAYS } from "@/features/providers/constants"
import type { SpBranch } from "@/types/provider"
import { resolveBranchServiceView } from "@/features/providers/service-taxonomy"
import { EntityAvatar } from "@/components/shared/entity-avatar"

interface SpBranchDetailViewProps {
  branch: SpBranch
  serviceCategories: string[]
  onBack: () => void
  onEdit: () => void
}

const CONTACT_TYPE_LABEL: Record<string, string> = {
  branch_manager: "Branch Manager",
  staff: "Staff",
  reception: "Reception",
}

import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav"

const ANCHOR_ITEMS = [
  { id: "branch-identity", label: "Branch Identity" },
  { id: "location-mapping", label: "Location Mapping" },
  { id: "service-catalog", label: "Service Catalogue" },
  { id: "governance", label: "Governance" },
  { id: "booking-settings", label: "Booking Settings" },
  { id: "operating-hours", label: "Operating Hours" },
  { id: "benefits", label: "Benefits" },
]

const BOOKING_CHANNEL_META = {
  whatsapp: {
    label: "WhatsApp",
    icon: WhatsappLogo,
  },
  email: {
    label: "Email",
    icon: EnvelopeSimple,
  },
  phone: {
    label: "Phone Number",
    icon: DeviceMobile,
  },
  booking_website: {
    label: "Link",
    icon: LinkSimple,
  },
} as const

export function SpBranchDetailView({
  branch,
  serviceCategories,
  onBack,
  onEdit,
}: SpBranchDetailViewProps) {
  const { groups, customServices } = resolveBranchServiceView(
    serviceCategories,
    branch.services
  )

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      {/* Back + Header */}
      <div className="flex flex-col gap-4">
        <BackButton onClick={onBack} label="Back to Branches" />

        <EntityHeader
          title={branch.name}
          subtitle="Service Provider Branch"
          status={branch.isActive ? "Active" : "Suspended"}
          statusVariant={branch.isActive ? "emerald" : "rose"}
          icon={<Buildings size={24} weight="fill" />}
          actions={
            <Button
              variant="secondary"
              size="lg"
              className="gap-2 rounded-full text-body font-medium shadow-sm transition-all"
              onClick={onEdit}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Branch
            </Button>
          }
        />
      </div>

      <div className="relative flex flex-col items-start gap-8 xl:flex-row">
        {/* Left Column: Jump-to-section Navigation */}
        <aside className="sticky top-20 hidden w-52 shrink-0 self-start xl:block">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: View Sections */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Branch Identity */}
            <div
              id="branch-identity"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Buildings size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">
                    Branch Identity
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DetailField label="Branch Name" value={branch.name} />
                  <div className="space-y-1.5">
                    <p className="text-label font-semibold text-subtle">
                      Branch status
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={branch.isActive ? "Active" : "Suspended"}
                        variant={branch.isActive ? "emerald" : "rose"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Mapping */}
            <div
              id="location-mapping"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Location Mapping
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Address and map coordinates for this branch.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Map Preview */}
                  <div className="group/map relative aspect-[16/10] min-h-[300px] overflow-hidden rounded-lg border border-border bg-muted/30 shadow-sm lg:aspect-auto lg:h-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-1000 group-hover/map:grayscale-0"
                      style={{
                        backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}')`,
                      }}
                    />
                    <div className="absolute inset-0 bg-primary/5 transition-colors duration-700 group-hover/map:bg-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20 p-1.5">
                          <div className="h-full w-full rounded-full bg-primary shadow-lg ring-4 shadow-primary/40 ring-background" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-sm" />
                      </div>
                      <span className="rounded-full border border-primary/20 bg-background/90 px-2 py-0.5 text-label font-medium text-primary backdrop-blur-sm">
                        Pinned
                      </span>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <DetailField
                        label="Street Address"
                        value={branch.address.line}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailField label="City" value={branch.address.city} />
                        <DetailField
                          label="Postal Code"
                          value={branch.address.postalCode}
                        />
                      </div>
                      <DetailField label="State" value={branch.address.state} />
                    </div>

                    {branch.address.lat && (
                      <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-6">
                        <DetailField
                          label="Latitude"
                          value={
                            <span className="font-mono text-body text-foreground">
                              {branch.address.lat}
                            </span>
                          }
                        />
                        <DetailField
                          label="Longitude"
                          value={
                            <span className="font-mono text-body text-foreground">
                              {branch.address.lon}
                            </span>
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Service Catalog */}
            <div
              id="service-catalog"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Globe size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Service Catalog
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Categorized list of services available at this location.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {groups.length === 0 && customServices.length === 0 ? (
                    <p className="text-body text-subtle italic">
                      No services configured for this branch.
                    </p>
                  ) : (
                    <>
                      {groups.map((group) => (
                        <div
                          key={group.category}
                          className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-body font-medium text-foreground">
                                {group.category}
                              </p>
                              <p className="text-label text-muted-foreground">
                                {group.services.length} Main Service
                                {group.services.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {group.services.map((service) => (
                              <div
                                key={service.name}
                                className="rounded-lg border border-border bg-card p-3 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-body font-medium text-foreground">
                                      {service.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {service.subServices.map((subService) => (
                                    <Badge
                                      key={subService}
                                      variant="secondary"
                                      className="text-label font-medium"
                                    >
                                      {subService}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {customServices.length > 0 && (
                        <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/10 p-4">
                          <div>
                            <p className="text-body font-medium text-foreground">
                              Custom Subservices
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {customServices.map((subService) => (
                              <Badge
                                key={subService}
                                variant="outline"
                                className="text-label"
                              >
                                {subService}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Governance */}
            <div
              id="governance"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Branch Governance
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Administrators and PICs for this location.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Administrators Section */}
                  <div className="space-y-4">
                    <p className="px-1 text-label font-medium text-foreground">
                      Local Administrators
                    </p>
                    {(branch.administrators?.length ?? 0) === 0 ? (
                      <div className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-4">
                        <p className="text-label text-muted-foreground">
                          No local administrators added yet.
                        </p>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {branch.administrators?.map((admin, i) => (
                        <div
                          key={i}
                          className="group flex items-center justify-between rounded-lg border border-border/80 bg-card p-3.5 shadow-sm transition-all hover:border-primary/20"
                        >
                          <div className="flex items-center gap-4">
                            <EntityAvatar
                              name={admin.name}
                              size="sm"
                              className="bg-primary/10 text-primary"
                            />
                            <div>
                              <p className="text-body leading-tight font-medium text-foreground">
                                {admin.name}
                              </p>
                              <p className="mt-0.5 text-label font-medium text-muted-foreground">
                                {admin.role}
                              </p>
                              <p className="mt-1 text-label text-muted-foreground">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {admin.designateAsPic && (
                              <Badge
                                variant="outline"
                                className="border-primary/20 bg-primary/5 text-label font-medium text-primary"
                              >
                                PIC Linked
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>

                  {/* PICs Section */}
                  <div className="space-y-4">
                    <p className="px-1 text-label font-medium text-foreground">
                      Persons In Charge (PIC)
                    </p>
                    {(branch.contacts?.length ?? 0) === 0 ? (
                      <div className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-4">
                        <p className="text-label text-muted-foreground">
                          No persons in charge added yet.
                        </p>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {branch.contacts.map((c, i) => (
                        <div
                          key={i}
                          className="group flex items-center justify-between rounded-lg border border-border/80 bg-card p-3.5 shadow-sm transition-all hover:border-primary/20"
                        >
                          <div className="flex items-center gap-4">
                            <EntityAvatar name={c.name} size="md" />
                            <div>
                              <p className="text-body leading-tight font-semibold text-foreground">
                                {c.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-label font-medium text-muted-foreground">
                                  {CONTACT_TYPE_LABEL[c.type] ?? c.type}
                                </span>
                                {c.isPublic && (
                                  <StatusBadge
                                    status="Public Profile"
                                    variant="emerald"
                                    className="h-4 text-micro"
                                  />
                                )}
                              </div>
                              <div className="mt-2 flex flex-col gap-0.5">
                                <p className="flex items-center gap-1.5 text-label text-muted-foreground">
                                  <Phone
                                    size={10}
                                    weight="fill"
                                    className="opacity-40"
                                  />{" "}
                                  {c.phone}
                                </p>
                                <p className="flex items-center gap-1.5 text-label text-muted-foreground">
                                  <Globe
                                    size={10}
                                    weight="fill"
                                    className="opacity-40"
                                  />{" "}
                                  {c.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              id="booking-settings"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Booking Settings
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Appointment channels this branch exposes to
                      booking-required vouchers.
                    </p>
                  </div>
                </div>

                {(branch.booking.channels?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {branch.booking.channels.map((channel) => {
                      const meta = BOOKING_CHANNEL_META[channel]
                      const Icon = meta.icon

                      const contactValue =
                        channel === "whatsapp"
                          ? branch.booking.whatsapp?.phoneNumber || "—"
                          : channel === "email"
                            ? branch.booking.email?.email || "—"
                            : channel === "phone"
                              ? branch.booking.phone?.phoneNumber || "—"
                              : branch.booking.link?.url || "—"

                      return (
                        <div
                          key={channel}
                          className="flex items-center gap-3 rounded-lg border border-border bg-muted/10 p-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon size={16} weight="fill" />
                          </div>
                          <p className="flex-1 text-body font-medium text-foreground">
                            {meta.label}
                          </p>
                          <p className="text-body text-muted-foreground">
                            {contactValue}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-body text-subtle italic">
                    No booking channels configured for this branch yet.
                  </p>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            <div
              id="operating-hours"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Clock size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Operating Hours
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Weekly open and close schedule.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {OPERATING_DAYS.map(({ key, label }) => {
                    const day = branch.operatingHours[key]
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[120px_1fr] items-center gap-4 border-b border-border/40 py-1.5 last:border-0"
                      >
                        <span className="text-label font-semibold text-foreground">
                          {label}
                        </span>
                        {day.isClosed ? (
                          <span className="text-label text-faint italic">
                            Closed
                          </span>
                        ) : (
                          <span className="font-mono text-label font-medium text-muted-foreground">
                            {day.open} – {day.close}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div
              id="benefits"
              className="scroll-mt-32 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/10 text-muted-foreground">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">
                      Benefits
                    </h3>
                    <p className="text-label text-muted-foreground">
                      Amenities and benefits available at this branch.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(branch.benefits?.length ?? 0) > 0 ? (
                    branch.benefits?.map((benefit) => (
                      <Badge
                        key={benefit}
                        variant="secondary"
                        className="px-3 py-1 text-label font-medium"
                      >
                        {benefit}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-body text-subtle italic">
                      No specific benefits listed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to allow last sections to scroll to top */}
      <div className="h-64" />
    </div>
  )
}
