"use client";

import { X, TreeStructure, DotsThreeVertical, PencilSimple, Trash, Plus } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: { category: string; services: string[] } | null;
  specs: Record<string, string[]>;
  serviceIcons: Record<string, string>;
  iconLibrary: { name: string; icon: Icon }[];
  onOpenDialog: (config: {
    type: "category" | "service" | "spec";
    mode: "add" | "edit";
    parentId?: string;
    id?: string;
    initialValue?: string;
  }) => void;
  onDelete: (type: "category" | "service" | "spec", id: string, parentId?: string) => void;
}

export function CategoryDetailSheet({
  isOpen,
  onClose,
  category,
  specs,
  serviceIcons,
  iconLibrary,
  onOpenDialog,
  onDelete,
}: CategoryDetailSheetProps) {
  if (!category) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over sheet */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-[150] w-full sm:w-3/4 max-w-4xl bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <TreeStructure size={24} weight="fill" />
            </div>
            <div>
              <h2 className="text-heading font-semibold text-foreground text-balance">
                {category.category}
              </h2>
              <p className="text-body text-subtle mt-0.5">
                Manage services and sub-services for this category.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-4 text-body font-medium gap-2 hover:bg-primary/5 text-primary"
              onClick={() => onOpenDialog({ type: "service", mode: "add", parentId: category.category })}
            >
              <Plus size={16} weight="bold" />
              Add Main Service
            </Button>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted text-faint hover:text-foreground transition-all border border-transparent hover:border-border"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-background/20">
          <div className="grid grid-cols-1 gap-6">
            {category.services.map((service) => {
              const iconName = serviceIcons[service];
              const IconComp = iconLibrary.find(i => i.name === iconName)?.icon || TreeStructure;
              const serviceSpecs = specs[service] || [];
              
              return (
                <div 
                  key={service} 
                  className="flex flex-col bg-card border border-border/80 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 group/service"
                >
                  {/* Service Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-faint group-hover/service:bg-primary/10 group-hover/service:text-primary transition-all duration-300">
                        <IconComp size={24} weight="duotone" />
                      </div>
                      <div>
                        <h4 className="text-lead font-semibold text-foreground group-hover/service:text-primary transition-colors leading-tight">{service}</h4>
                        <p className="text-label font-medium text-faint mt-1">Main service</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted opacity-0 group-hover/service:opacity-100 transition-all">
                          <DotsThreeVertical size={18} weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          className="gap-2 text-body font-medium py-2"
                          onClick={() => onOpenDialog({ type: "service", mode: "edit", id: service, initialValue: service })}
                        >
                          <PencilSimple size={16} /> Rename Service
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-body font-medium py-2 text-destructive focus:text-destructive"
                          onClick={() => onDelete("service", service)}
                        >
                          <Trash size={16} /> Delete Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Tier 3: Sub-services */}
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-label font-semibold text-faint">Sub-services</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {serviceSpecs.map((spec) => (
                        <div 
                          key={spec} 
                          className="group/spec flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-border/50 rounded-lg transition-all hover:bg-card hover:border-primary/30 hover:shadow-sm"
                          title={spec}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover/spec:bg-primary/40 transition-colors" />
                          <span className="text-label font-medium text-subtle group-hover/spec:text-foreground transition-colors truncate max-w-[140px]">{spec}</span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="opacity-0 group-hover/spec:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-primary">
                                <DotsThreeVertical size={12} weight="bold" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem 
                                className="text-label py-1 font-medium"
                                onClick={() => onOpenDialog({ type: "spec", mode: "edit", id: spec, parentId: service, initialValue: spec })}
                              >
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-label py-1 font-medium text-destructive focus:text-destructive"
                                onClick={() => onDelete("spec", spec, service)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                      <button 
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted/10 border border-dashed border-border rounded-lg text-faint hover:text-primary hover:border-primary/40 hover:bg-primary/[0.04] transition-all"
                        onClick={() => onOpenDialog({ type: "spec", mode: "add", parentId: service })}
                      >
                        <Plus size={12} weight="bold" />
                        <span className="text-label font-semibold">Add sub-service</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border bg-muted/30 flex justify-end gap-3">
          <Button 
            variant="ghost"
            onClick={onClose}
            className="text-body font-medium h-10 px-6"
          >
            Close Drawer
          </Button>
        </div>
      </div>
    </>
  );
}
