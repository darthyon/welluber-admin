"use client";

import { useState } from "react";
import { 
  CaretLeft, 
  Tag, 
  Buildings, 
  PencilSimpleLine,
  Trash,
  MagnifyingGlass,
  Plus,
  Storefront,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { ActionPopover } from "@/components/shared/action-popover";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/shared/switch";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types/brand";
import type { ServiceProvider } from "@/types/provider";
import { MOCK_SPS } from "@/features/providers/mock-data";

interface BrandDetailViewProps {
  brand: Brand;
  onBack: () => void;
  onEdit: (id: string) => void;
  onRemove: () => void;
}

export function BrandDetailView({ brand, onBack, onEdit, onRemove }: BrandDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentStatus, setCurrentStatus] = useState(brand.status);

  const brandSps = MOCK_SPS.filter(sp => sp.brandId === brand.id);

  const filteredSps = brandSps.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const spColumns: Column<ServiceProvider>[] = [
    {
      header: "Service Provider Name",
      headerClassName: "min-w-[200px]",
      render: (sp) => (
        <div className="flex flex-col">
          <span className="font-bold text-[14px] text-foreground tracking-tight">{sp.name}</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 font-mono tracking-tight">{sp.registrationNo}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (sp) => (
        <StatusBadge
          status={sp.status}
          variant={sp.status === "active" ? "emerald" : sp.status === "pending" ? "amber" : "zinc"}
        />
      ),
    },
    {
      header: "Service Categories",
      headerClassName: "min-w-[180px]",
      render: (sp) => (
        <div className="flex items-center gap-1 overflow-hidden max-w-[200px]">
          {sp.serviceCategories.slice(0, 1).map((cat, i) => (
            <Badge key={i} variant="secondary" className="bg-muted/50 font-medium text-[10px] px-1.5 py-0 h-4 border-border/40 whitespace-nowrap">
              {cat}
            </Badge>
          ))}
          {sp.serviceCategories.length > 1 && (
            <span className="text-[10px] text-muted-foreground font-bold px-1">+{sp.serviceCategories.length - 1}</span>
          )}
        </div>
      ),
    },
    {
        header: "Vouchers",
        align: "right",
        render: (sp) => (
          <span className="text-[13px] font-semibold text-foreground/80">{sp.activeVoucherCount}</span>
        ),
    },
    {
      header: "Branches",
      align: "right",
      render: (sp) => (
        <span className="text-[13px] font-medium text-muted-foreground">{sp.branches.length}</span>
      ),
    },
    {
      header: "",
      align: "right",
      render: (sp) => (
        <ActionPopover
          actions={[
            { label: "View SP Portal", onClick: () => console.log("view portal", sp.id) },
            { label: "Branches", onClick: () => console.log("manage branches", sp.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-navigation Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit group"
        >
          <CaretLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Brand List
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EntityAvatar name={brand.name} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{brand.name}</h2>
                <StatusBadge status={currentStatus} variant={currentStatus === "active" ? "emerald" : "zinc"} />
                
                <div className="flex items-center gap-2 ml-2 px-2.5 py-1 bg-muted/40 rounded-lg border border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Active Status</span>
                  <Switch 
                    checked={currentStatus === "active"} 
                    onCheckedChange={(checked) => setCurrentStatus(checked ? "active" : "inactive")}
                  />
                </div>
              </div>
              <p className="text-[14px] text-muted-foreground mt-1 font-medium">
                {brand.assignedSpCount} Service Providers Assigned
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
               variant="outline" 
               size="sm" 
               className="h-10 px-4 font-bold border-border/80 hover:bg-muted"
               onClick={() => onEdit(brand.id)}
            >
              <PencilSimpleLine size={18} weight="bold" className="mr-2" />
              Edit Brand
            </Button>
            
            <ActionPopover 
              align="end"
              actions={[
                { label: "Deactivate Brand", onClick: () => console.log("Deactivate") },
                { label: "Delete Brand", isDanger: true, onClick: () => onRemove() },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Brand Details */}
        <DetailSection 
          title="Brand Profile" 
          icon={<Tag size={18} weight="bold" className="text-primary" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
            <DetailField 
              label="Brand Identity" 
              value={brand.name} 
              icon={<Storefront size={16} />}
            />
            <DetailField 
              label="Service Categories" 
              value={
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {brand.serviceCategories?.map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-[11px] font-medium">{cat}</Badge>
                  ))}
                  {(!brand.serviceCategories || brand.serviceCategories.length === 0) && (
                    <span className="text-[12px] text-muted-foreground italic">None assigned</span>
                  )}
                </div>
              }
              icon={<Tag size={16} />}
            />
            <DetailField 
              label="Creation Date" 
              value={new Date(brand.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
              icon={<Plus size={16} />}
            />
          </div>
        </DetailSection>

        {/* Assigned Service Providers */}
        <DetailSection 
          title="Assigned Service Providers" 
          icon={<Buildings size={18} weight="bold" className="text-primary" />}
        >
          <div className="space-y-4">
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
            
            <div className="border border-border/40 rounded-xl overflow-hidden mt-2 bg-card">
                <TooltipProvider>
                    <SharedDataTable
                        data={filteredSps}
                        columns={spColumns}
                        rowsPerPage={5}
                    />
                </TooltipProvider>
            </div>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
