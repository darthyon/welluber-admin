"use client";

import { CaretLeft, PencilSimpleLine, MapPin, Phone, Globe, Clock, Buildings, Users, TrendUp } from "@phosphor-icons/react";
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

interface SpBranchDetailViewProps {
  branch: SpBranch;
  onBack: () => void;
  onEdit: () => void;
}

const CONTACT_TYPE_LABEL: Record<string, string> = {
  branch_manager: "Branch Manager",
  staff: "Staff",
  reception: "Reception",
};

export function SpBranchDetailView({ branch, onBack, onEdit }: SpBranchDetailViewProps) {
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
            {/* Contacts Section (Aligned with Governance) */}
            <DetailSection title="Contacts" icon={<Users size={18} weight="duotone" />}>
              {branch.contacts.length === 0 ? (
                <p className="text-[13px] text-muted-foreground italic">No contacts added.</p>
              ) : (
                <div className="space-y-3">
                  {branch.contacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/20 transition-all group">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-[12px] font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {c.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{CONTACT_TYPE_LABEL[c.type] ?? c.type}</p>
                          </div>
                       </div>
                       {c.isPublic && (
                         <Badge variant="outline" className="text-[9px] border-emerald-200 text-emerald-600 bg-emerald-50">Public</Badge>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            {/* Branch Quick Stats (Matching Org Detail) */}
            <div className="bg-indigo-600 rounded-xl p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="text-[15px] font-semibold mb-2">Branch Quick Stats</h4>
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[11px] text-white/70">Services Active</p>
                  <p className="text-xl font-bold">{branch.services.length}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/70">Daily Availability</p>
                  <p className="text-xl font-bold">100%</p>
                </div>
              </div>
            </div>
          </>
        }
      >
        {/* Location */}
        <DetailSection title="Location" icon={<MapPin size={16} weight="fill" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Address" value={branch.address.line} className="sm:col-span-2" />
            <DetailField label="City" value={branch.address.city} />
            <DetailField label="State" value={branch.address.state} />
            <DetailField label="Country" value={branch.address.country} />
            <DetailField label="Postal Code" value={branch.address.postalCode} />
            {branch.address.lat && (
              <DetailField label="Coordinates" value={`${branch.address.lat}, ${branch.address.lon}`} className="sm:col-span-2" />
            )}
          </div>
        </DetailSection>

        {/* Services */}
        <DetailSection title="Services Offered" icon={<Globe size={16} weight="fill" />}>
          <div className="flex flex-wrap gap-2">
            {branch.services.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-[12px]">{s}</Badge>
            ))}
          </div>
        </DetailSection>

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
