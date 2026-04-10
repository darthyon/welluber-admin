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

export function SpBranchDetailView({ branch, serviceCategories, onBack, onEdit }: SpBranchDetailViewProps) {
  const { groups, customServices } = resolveBranchServiceView(serviceCategories, branch.services);
  const serviceCount = groups.reduce((sum, group) => sum + group.services.length, 0) + customServices.length;

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
              className="text-nav font-medium rounded-full gap-2 transition-all"
              onClick={onEdit}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Edit Branch
            </Button>
          }
        />
      </div>

      <TwoColumnDetailLayout
        sidebar={
          <>
            {/* Sidebar reserved for future activity logs as per user request */}
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 flex flex-col items-center justify-center text-center opacity-40">
              <TrendUp size={24} weight="duotone" className="mb-2" />
              <p className="text-label font-medium">Activity Stream</p>
              <p className="text-micro">Logs appearing soon</p>
            </div>
          </>
        }
      >
        {/* Branch Identity */}
        <DetailSection 
          title="Branch Identity" 
          icon={<Buildings size={16} weight="fill" />}
          description="Basic identifiers and branch status."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailField label="Branch Name" value={branch.name} />
            <div className="space-y-1.5">
            <p className="text-caption font-medium text-muted-foreground/80 tracking-tight">Branch status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={branch.isActive ? "Active" : "Suspended"} variant={branch.isActive ? "emerald" : "rose"} />
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Persons In Charge (PIC) */}
        <DetailSection 
          title="Persons In Charge (PIC)" 
          icon={<Users size={18} weight="duotone" />} 
          description="Public-facing contact persons with portal visibility."
        >
          {branch.contacts.length === 0 ? (
            <p className="text-nav text-muted-foreground italic">No PICs designated for this branch.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branch.contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/20 hover:shadow-sm transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-4 relative z-10">
                    <EntityAvatar name={c.name} size="md" />
                    <div>
                      <p className="text-body font-semibold text-foreground leading-tight tracking-tight">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-caption text-muted-foreground font-medium">{CONTACT_TYPE_LABEL[c.type] ?? c.type}</span>
                        {c.isPublic && (
                          <Badge variant="outline" className="text-micro h-4 font-semibold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Public Profile</Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                          <Phone size={10} weight="fill" className="opacity-40" /> {c.phone}
                        </p>
                        <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                          <Globe size={10} weight="fill" className="opacity-40" /> {c.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ActionPopover 
                    actions={[
                      { label: "View Details", onClick: () => console.log("View", c.name) },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        {/* Branch Governance (Administrators) */}
        <DetailSection 
          title="Branch Governance" 
          icon={<Users size={18} weight="fill" />} 
          description="Local administrators with system management access."
        >
          {(branch.administrators?.length ?? 0) === 0 ? (
            <p className="text-nav text-muted-foreground italic">No system administrators added.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branch.administrators?.map((admin, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4 relative z-10">
                    <EntityAvatar name={admin.name} size="sm" className="bg-primary/10 text-primary" />
                    <div>
                      <p className="text-nav font-semibold text-foreground leading-tight tracking-tight">{admin.name}</p>
                      <p className="text-caption text-muted-foreground font-medium mt-0.5">{admin.role}</p>
                      <p className="text-caption text-muted-foreground mt-1 opacity-70">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {admin.designateAsPic && (
                      <Badge variant="outline" className="text-micro font-semibold border-primary/20 text-primary bg-primary/5">PIC Linked</Badge>
                    )}
                    <ActionPopover 
                      actions={[
                        { label: "Manage Access", onClick: () => console.log("Manage", admin.email) },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        {/* Location Mapping */}
        <DetailSection title="Location Mapping" icon={<MapPin size={16} weight="fill" />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Map Preview */}
            <div className="space-y-4">
              <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] rounded-2xl border border-border bg-muted/30 overflow-hidden group/map shadow-sm">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/101.7036,3.1390,12/800x400?access_token=pk.eyJ1IjoibW9ja2Rlc2lnbiIsImEiOiJjbGZnbXhsenQwMG1xM3lvM2wwNmwwNmwwNmwwIn0')] bg-cover bg-center grayscale group-hover/map:grayscale-0 transition-all duration-1000" />
                <div className="absolute inset-0 bg-primary/5 group-hover/map:bg-transparent transition-colors duration-700" />
                
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center p-1.5 border border-primary/30">
                      <div className="w-full h-full rounded-full bg-primary shadow-lg shadow-primary/40 ring-4 ring-background" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                  </div>
                  <span className="text-micro font-semibold text-primary bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-primary/20 tracking-tight">
                    Pinned
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Address Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <DetailField label="Street Address" value={branch.address.line} />
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="City" value={branch.address.city} />
                  <DetailField label="Postal Code" value={branch.address.postalCode} />
                </div>
                <DetailField label="State" value={branch.address.state} />
                <DetailField label="Country" value={branch.address.country} />
              </div>

              {branch.address.lat && (
                <div className="pt-6 border-t border-border/60 grid grid-cols-2 gap-4">
                  <DetailField 
                    label="Latitude" 
                    value={<span className="font-mono text-nav text-foreground">{branch.address.lat}</span>} 
                  />
                  <DetailField 
                    label="Longitude" 
                    value={<span className="font-mono text-nav text-foreground">{branch.address.lon}</span>} 
                  />
                </div>
              )}
            </div>
          </div>
        </DetailSection>

        {/* Services */}
        <DetailSection
          title="Services Offered"
          icon={<Globe size={16} weight="fill" />}
          description="Service categories and their subservices are grouped together for quick review."
        >
          <div className="space-y-4">
            {groups.length === 0 && customServices.length === 0 ? (
              <p className="text-nav text-muted-foreground italic">No services configured for this branch.</p>
            ) : (
              <>
                {groups.map((group) => (
                  <div key={group.category} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-nav font-semibold text-foreground">{group.category}</p>
                        <p className="text-caption text-muted-foreground">{group.services.length} service{group.services.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.services.map((service) => (
                        <div key={service.name} className="rounded-lg border border-border bg-card p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-nav font-medium text-foreground">{service.name}</p>
                              <p className="text-caption text-muted-foreground mt-0.5">Service</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {service.subServices.map((subService) => (
                              <Badge key={subService} variant="secondary" className="text-caption">
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
                  <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 space-y-3">
                    <div>
                      <p className="text-nav font-semibold text-foreground">Custom Subservices</p>
                      <p className="text-caption text-muted-foreground">Free-text additions entered by the provider.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customServices.map((subService) => (
                        <Badge key={subService} variant="outline" className="text-caption">
                          {subService}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DetailSection>

        {/* Benefits */}
        {(branch.benefits?.length ?? 0) > 0 && (
          <DetailSection title="Benefits" icon={<CheckCircle size={16} weight="fill" />}>
            <div className="flex flex-wrap gap-2">
              {branch.benefits?.map((benefit) => (
                <Badge key={benefit} variant="secondary" className="text-label px-3 py-1">
                  {benefit}
                </Badge>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Operating Hours */}
        <DetailSection title="Operating Hours" icon={<Clock size={16} weight="fill" />}>
          <div className="space-y-2">
            {OPERATING_DAYS.map(({ key, label }) => {
              const day = branch.operatingHours[key];
              return (
                <div key={key} className="grid grid-cols-[100px_1fr] items-center gap-4 py-1.5">
                  <span className="text-label font-medium text-foreground">{label}</span>
                  {day.isClosed ? (
                    <span className="text-label text-muted-foreground/60 italic">Closed</span>
                  ) : (
                    <span className="text-label text-muted-foreground font-mono">{day.open} – {day.close}</span>
                  )}
                </div>
              );
            })}
          </div>
        </DetailSection>
      </TwoColumnDetailLayout>
    </div>
  );
}
