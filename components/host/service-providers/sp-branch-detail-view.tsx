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
              className="text-[13px] font-medium rounded-full gap-2 transition-all"
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
            {/* Administrators Section (Aligned with Governance) */}
            <DetailSection title="Branch Governance" icon={<Users size={18} weight="duotone" />} description="Local administrators with branch management access.">
              {branch.contacts.length === 0 ? (
                <p className="text-[13px] text-muted-foreground italic">No administrators added.</p>
              ) : (
                <div className="space-y-3">
                  {branch.contacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:border-primary/20 transition-all group relative overflow-hidden">
                       <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors pointer-events-none" />
                       <div className="flex items-center gap-3 relative z-10">
                          <EntityAvatar name={c.name} size="sm" />
                          <div>
                            <p className="text-[13px] font-bold text-foreground leading-tight tracking-tight">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground font-medium opacity-70 mt-0.5">{CONTACT_TYPE_LABEL[c.type] ?? c.type}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 relative z-10">
                         {c.isPublic && (
                           <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Portal</Badge>
                         )}
                         <ActionPopover 
                           actions={[
                             { label: "View Details", onClick: () => console.log("View", c.name) },
                           ]}
                         />
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            {/* Branch Quick Stats (Matching Org Detail) */}
            <div className="bg-primary/95 dark:bg-primary/20 rounded-xl p-6 text-primary-foreground dark:text-primary overflow-hidden relative group border border-primary/20 shadow-lg shadow-primary/5">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 dark:bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-[15px] font-bold mb-2 tracking-tight">Branch quick stats</h4>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[11px] font-bold opacity-70 tracking-tight text-white/70 dark:text-primary/70">Services Active</p>
                  <p className="text-xl font-bold">{serviceCount}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold opacity-70 tracking-tight text-white/70 dark:text-primary/70">Daily Availability</p>
                  <p className="text-xl font-bold">100%</p>
                </div>
              </div>
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
            <p className="text-[11px] font-medium text-muted-foreground/80 tracking-tight">Branch status</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={branch.isActive ? "Active" : "Suspended"} variant={branch.isActive ? "emerald" : "rose"} />
              </div>
            </div>
          </div>
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
                  <span className="text-[10px] font-bold text-primary bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-primary/20 tracking-tight">
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
                    value={<span className="font-mono text-[13px] text-foreground">{branch.address.lat}</span>} 
                  />
                  <DetailField 
                    label="Longitude" 
                    value={<span className="font-mono text-[13px] text-foreground">{branch.address.lon}</span>} 
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
              <p className="text-[13px] text-muted-foreground italic">No services configured for this branch.</p>
            ) : (
              <>
                {groups.map((group) => (
                  <div key={group.category} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{group.category}</p>
                        <p className="text-[11px] text-muted-foreground">{group.services.length} service{group.services.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.services.map((service) => (
                        <div key={service.name} className="rounded-lg border border-border bg-card p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-medium text-foreground">{service.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Service</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {service.subServices.map((subService) => (
                              <Badge key={subService} variant="secondary" className="text-[11px]">
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
                      <p className="text-[13px] font-semibold text-foreground">Custom Subservices</p>
                      <p className="text-[11px] text-muted-foreground">Free-text additions entered by the provider.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customServices.map((subService) => (
                        <Badge key={subService} variant="outline" className="text-[11px]">
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
                <Badge key={benefit} variant="secondary" className="text-[12px] px-3 py-1">
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
                  <span className="text-[12px] font-medium text-foreground">{label}</span>
                  {day.isClosed ? (
                    <span className="text-[12px] text-muted-foreground/60 italic">Closed</span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground font-mono">{day.open} – {day.close}</span>
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
