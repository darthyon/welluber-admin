"use client";

import { CaretLeft, PencilSimpleLine, MapPin, Phone, Globe, Clock, Buildings, Users, TrendUp, CheckCircle } from "@phosphor-icons/react";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { BackButton } from "@/components/shared/back-button";
import { EntityHeader } from "@/components/shared/entity-header";
import { TwoColumnDetailLayout } from "@/components/shared/two-column-detail-layout";
import { OPERATING_DAYS } from "@/features/providers/constants";
import type { SpBranch } from "@/types/provider";
import { resolveBranchServiceView } from "@/features/providers/service-taxonomy";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { ActionPopover } from "@/components/shared/action-popover";

interface SpBranchDetailViewProps {
  branch: SpBranch;
  serviceCategories: string[];
  onBack: () => void;
  onEdit: () => void;
}

const CONTACT_TYPE_LABEL: Record<string, string> = {
  branch_manager: "Branch Manager",
  staff: "Staff",
  reception: "Reception",
};

import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";

const ANCHOR_ITEMS = [
  { id: "branch-identity", label: "Branch Identity" },
  { id: "location-mapping", label: "Location Mapping" },
  { id: "service-catalog", label: "Service Catalogue" },
  { id: "governance", label: "Governance" },
  { id: "operating-hours", label: "Operating Hours" },
  { id: "benefits", label: "Benefits" },
];

export function SpBranchDetailView({ branch, serviceCategories, onBack, onEdit }: SpBranchDetailViewProps) {
  const { groups, customServices } = resolveBranchServiceView(serviceCategories, branch.services);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back + Header */}
      <div className="flex flex-col gap-4">
        <BackButton 
          onClick={onBack}
          label="Back to Branches"
        />
        
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
              className="text-body font-medium rounded-full gap-2 transition-all shadow-sm"
              onClick={onEdit}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Branch
            </Button>
          }
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start relative">
        {/* Left Column: Jump-to-section Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: View Sections */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {/* Branch Identity */}
            <div id="branch-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Buildings size={16} weight="fill" />
                  </div>
                  <h3 className="text-lead font-semibold text-foreground">Branch Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Branch Name" value={branch.name} />
                  <div className="space-y-1.5">
                    <p className="text-label font-semibold text-subtle">Branch status</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={branch.isActive ? "Active" : "Suspended"} variant={branch.isActive ? "emerald" : "rose"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Mapping */}
            <div id="location-mapping" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <MapPin size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Location Mapping</h3>
                    <p className="text-label text-muted-foreground">Address and map coordinates for this branch.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Map Preview */}
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] rounded-lg border border-border bg-muted/30 overflow-hidden group/map shadow-sm">
                    <div
                      className="absolute inset-0 bg-cover bg-center grayscale group-hover/map:grayscale-0 transition-all duration-1000"
                      style={{
                        backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}')`,
                      }}
                    />
                    <div className="absolute inset-0 bg-primary/5 group-hover/map:bg-transparent transition-colors duration-700" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center p-1.5 border border-primary/30">
                          <div className="w-full h-full rounded-full bg-primary shadow-lg shadow-primary/40 ring-4 ring-background" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                      </div>
                      <span className="text-label font-medium text-primary bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-primary/20">
                        Pinned
                      </span>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <DetailField label="Street Address" value={branch.address.line} />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailField label="City" value={branch.address.city} />
                        <DetailField label="Postal Code" value={branch.address.postalCode} />
                      </div>
                      <DetailField label="State" value={branch.address.state} />
                    </div>

                    {branch.address.lat && (
                      <div className="pt-6 border-t border-border/60 grid grid-cols-2 gap-4">
                        <DetailField 
                          label="Latitude" 
                          value={<span className="font-mono text-body text-foreground">{branch.address.lat}</span>} 
                        />
                        <DetailField 
                          label="Longitude" 
                          value={<span className="font-mono text-body text-foreground">{branch.address.lon}</span>} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Service Catalog */}
            <div id="service-catalog" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Globe size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Service Catalog</h3>
                    <p className="text-label text-muted-foreground">Categorized list of services available at this location.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {groups.length === 0 && customServices.length === 0 ? (
                    <p className="text-body text-subtle italic">No services configured for this branch.</p>
                  ) : (
                    <>
                      {groups.map((group) => (
                        <div key={group.category} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-body font-medium text-foreground uppercase tracking-wider">{group.category}</p>
                              <p className="text-label text-muted-foreground">{group.services.length} Main Service{group.services.length !== 1 ? "s" : ""}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {group.services.map((service) => (
                              <div key={service.name} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-body font-medium text-foreground">{service.name}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {service.subServices.map((subService) => (
                                    <Badge key={subService} variant="secondary" className="text-label font-medium">
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
                        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4 space-y-3">
                          <div>
                            <p className="text-body font-medium text-foreground uppercase tracking-wider">Custom Subservices</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {customServices.map((subService) => (
                              <Badge key={subService} variant="outline" className="text-label">
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
            <div id="governance" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Users size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Branch Governance</h3>
                    <p className="text-label text-muted-foreground">Administrators and PICs for this location.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Administrators Section */}
                  <div className="space-y-4">
                    <p className="text-label font-medium text-muted-foreground uppercase tracking-widest px-1">Local Administrators</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {branch.administrators?.map((admin, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-card hover:border-primary/20 transition-all group shadow-sm">
                          <div className="flex items-center gap-4">
                            <EntityAvatar name={admin.name} size="sm" className="bg-primary/10 text-primary" />
                            <div>
                              <p className="text-body font-medium text-foreground leading-tight">{admin.name}</p>
                              <p className="text-label text-muted-foreground font-medium mt-0.5">{admin.role}</p>
                              <p className="text-label text-muted-foreground mt-1">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {admin.designateAsPic && (
                              <Badge variant="outline" className="text-label font-medium border-primary/20 text-primary bg-primary/5">PIC Linked</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PICs Section */}
                  <div className="space-y-4">
                    <p className="text-label font-medium text-muted-foreground uppercase tracking-widest px-1">Persons In Charge (PIC)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {branch.contacts.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-card hover:border-primary/20 transition-all group shadow-sm">
                          <div className="flex items-center gap-4">
                            <EntityAvatar name={c.name} size="md" />
                            <div>
                              <p className="text-body font-semibold text-foreground leading-tight">{c.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-label text-muted-foreground font-medium">{CONTACT_TYPE_LABEL[c.type] ?? c.type}</span>
                                {c.isPublic && (
                                  <Badge variant="outline" className="text-micro h-4 font-semibold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Public Profile</Badge>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 mt-2">
                                <p className="text-label text-muted-foreground flex items-center gap-1.5">
                                  <Phone size={10} weight="fill" className="opacity-40" /> {c.phone}
                                </p>
                                <p className="text-label text-muted-foreground flex items-center gap-1.5">
                                  <Globe size={10} weight="fill" className="opacity-40" /> {c.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div id="operating-hours" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Clock size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Operating Hours</h3>
                    <p className="text-label text-muted-foreground">Weekly open and close schedule.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {OPERATING_DAYS.map(({ key, label }) => {
                    const day = branch.operatingHours[key];
                    return (
                      <div key={key} className="grid grid-cols-[120px_1fr] items-center gap-4 py-1.5 border-b border-border/40 last:border-0">
                        <span className="text-label font-semibold text-foreground">{label}</span>
                        {day.isClosed ? (
                          <span className="text-label text-faint italic">Closed</span>
                        ) : (
                          <span className="text-label text-muted-foreground font-mono font-medium">{day.open} – {day.close}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div id="benefits" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lead font-semibold text-foreground">Benefits</h3>
                    <p className="text-label text-muted-foreground">Amenities and benefits available at this branch.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(branch.benefits?.length ?? 0) > 0 ? (
                    branch.benefits?.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="text-label px-3 py-1 font-medium bg-muted border-border">
                        {benefit}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-body text-subtle italic">No specific benefits listed.</p>
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
  );
}
