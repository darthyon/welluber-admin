"use client";

import { useState, useMemo, Suspense } from "react";
import { 
  TreeStructure, 
  Plus, 
  MagnifyingGlass, 
  DotsThreeVertical,
  PlusCircle,
  PencilSimple,
  Trash,
  Barbell,
  Stethoscope,
  Tooth,
  Bicycle,
  Waves,
  HandFist,
  FirstAid,
  Pill,
  Flower,
  Sparkle,
  HandSoap,
  Scissors,
  Brain,
  HandHeart,
  MusicNotes,
  BowlFood,
  Check,
  House
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BentoGrid } from "@/components/shared/bento-grid";
import { ActionPopover } from "@/components/shared/action-popover";
import { CategoryDetailSheet } from "@/components/host/services/category-detail-sheet";
import { OverflowTags } from "@/components/shared/overflow-tags";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SERVICE_TAXONOMY, SERVICE_SPEC_TAXONOMY } from "@/features/organizations/constants";
import { cn } from "@/lib/utils";

// Icon Library for Main Services
const ICON_LIBRARY = [
  { name: "Barbell", icon: Barbell },
  { name: "Bicycle", icon: Bicycle },
  { name: "Waves", icon: Waves },
  { name: "HandFist", icon: HandFist },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "Tooth", icon: Tooth },
  { name: "FirstAid", icon: FirstAid },
  { name: "Pill", icon: Pill },
  { name: "Flower", icon: Flower },
  { name: "Sparkle", icon: Sparkle },
  { name: "HandSoap", icon: HandSoap },
  { name: "Scissors", icon: Scissors },
  { name: "Brain", icon: Brain },
  { name: "HandHeart", icon: HandHeart },
  { name: "MusicNotes", icon: MusicNotes },
  { name: "BowlFood", icon: BowlFood },
];

// Initial Icon Mappings for Main Services
const INITIAL_SERVICE_ICONS: Record<string, string> = {
  "Gym Access": "Barbell",
  "Personal Training": "Barbell",
  "Yoga": "Flower",
  "Dental": "Tooth",
  "Physiotherapy": "Stethoscope",
  "General Practitioner": "Stethoscope",
  "Nutritional Counselling": "BowlFood",
  "Meditation": "Brain",
};

function ServicesContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [taxonomy, setTaxonomy] = useState(SERVICE_TAXONOMY);
  const [specs, setSpecs] = useState(SERVICE_SPEC_TAXONOMY);
  const [serviceIcons, setServiceIcons] = useState<Record<string, string>>(INITIAL_SERVICE_ICONS);
  
  // Sheet & Category Selection State (Refactored to Query State)
  const [selectedCategoryName, setSelectedCategoryName] = useQueryState("category");
  const [isSheetOpen, setIsSheetOpen] = useQueryState("sheet", "false");
  const updateQueryParams = useUpdateQueryParams();

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryName) return null;
    return taxonomy.find(cat => cat.category === selectedCategoryName) || null;
  }, [selectedCategoryName, taxonomy]);

  // CRUD State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    type: "category" | "service" | "spec";
    mode: "add" | "edit";
    parentId?: string;
    id?: string;
    initialValue?: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleOpenDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    setInputValue(config?.initialValue || "");
    setSelectedIcon(config?.type === "service" ? serviceIcons[config.id || ""] || null : null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!dialogConfig || !inputValue.trim()) return;

    if (dialogConfig.type === "category") {
      if (dialogConfig.mode === "add") {
        setTaxonomy(prev => [...prev, { category: inputValue, services: [] }]);
      } else {
        setTaxonomy(prev => prev.map(c => c.category === dialogConfig.id ? { ...c, category: inputValue } : c));
        // Update URL if the selected category was renamed
        if (selectedCategoryName === dialogConfig.id) {
          setSelectedCategoryName(inputValue);
        }
      }
    } else if (dialogConfig.type === "service") {
      if (dialogConfig.mode === "add") {
        setTaxonomy(prev => prev.map(c => c.category === dialogConfig.parentId ? { ...c, services: [...c.services, inputValue] } : c));
        setSpecs(prev => ({ ...prev, [inputValue]: [] }));
        if (selectedIcon) setServiceIcons(prev => ({ ...prev, [inputValue]: selectedIcon }));
      } else {
        const oldName = dialogConfig.id!;
        setTaxonomy(prev => prev.map(c => ({ ...c, services: c.services.map(s => s === oldName ? inputValue : s) })));
        setSpecs(prev => {
          const newSpecs = { ...prev };
          newSpecs[inputValue] = newSpecs[oldName] || [];
          delete newSpecs[oldName];
          return newSpecs;
        });
        setServiceIcons(prev => {
          const newIcons = { ...prev };
          if (selectedIcon) newIcons[inputValue] = selectedIcon;
          if (oldName !== inputValue) delete newIcons[oldName];
          return newIcons;
        });
      }
    } else if (dialogConfig.type === "spec") {
      const serviceName = dialogConfig.parentId!;
      if (dialogConfig.mode === "add") {
        setSpecs(prev => ({ ...prev, [serviceName]: [...(prev[serviceName] || []), inputValue] }));
      } else {
        const oldSpec = dialogConfig.id!;
        setSpecs(prev => ({ ...prev, [serviceName]: (prev[serviceName] || []).map(s => s === oldSpec ? inputValue : s) }));
      }
    }

    setIsDialogOpen(false);
    setInputValue("");
    setSelectedIcon(null);
  };

  const handleDelete = (type: "category" | "service" | "spec", id: string, parentId?: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    if (type === "category") {
      setTaxonomy(prev => prev.filter(c => c.category !== id));
      if (selectedCategoryName === id) {
        handleCloseSheet();
      }
    } else if (type === "service") {
      setTaxonomy(prev => prev.map(c => ({ ...c, services: c.services.filter(s => s !== id) })));
      setServiceIcons(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else if (type === "spec") {
      setSpecs(prev => ({ ...prev, [parentId!]: (prev[parentId!] || []).filter(s => s !== id) }));
    }
  };

  const handleOpenCategory = (cat: { category: string; services: string[] }) => {
    updateQueryParams({
      category: cat.category,
      sheet: "true"
    });
  };

  const handleCloseSheet = () => {
    updateQueryParams({
      category: null,
      sheet: null
    });
  };

  const filteredTaxonomy = taxonomy.filter(cat => {
    const matchesCategory = cat.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServices = cat.services.some(service => {
      const matchesService = service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecs = (specs[service] || []).some(spec => 
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesService || matchesSpecs;
    });
    return matchesCategory || matchesServices;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Services</h1>
          <p className="text-subtle text-body mt-1 font-normal">
            Define and manage the global service taxonomy. Group services into categories and link them to brands and providers.
          </p>
        </div>
        <Button 
          className="h-9 text-body font-medium shadow-sm transition-all hover:scale-[1.02]"
          onClick={() => handleOpenDialog({ type: "category", mode: "add" })}
        >
          <Plus size={16} weight="bold" className="mr-1.5" />
          Add Service Category
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={16} />
          <Input 
            placeholder="Search categories, services or specs..." 
            className="pl-9 h-10 text-body bg-background/50 focus:bg-background transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-label font-medium text-subtle ml-auto">
          <span>{filteredTaxonomy.length} Categories</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{filteredTaxonomy.reduce((acc, cat) => acc + cat.services.length, 0)} Main Services</span>
        </div>
      </div>

      {/* Category Grid */}
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTaxonomy.map((category) => {
            const categoryActions = [
              { 
                label: "Add Main Service", 
                onClick: () => handleOpenDialog({ type: "service", mode: "add", parentId: category.category }) 
              },
              { 
                label: "Rename Category", 
                onClick: () => handleOpenDialog({ type: "category", mode: "edit", id: category.category, initialValue: category.category }) 
              },
              { 
                label: "Delete Category", 
                isDanger: true,
                onClick: () => handleDelete("category", category.category) 
              }
            ];

            return (
              <div
                key={category.category}
                onClick={() => handleOpenCategory(category)}
                className="group relative bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Decorative accent */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <TreeStructure size={16} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-body font-medium text-foreground leading-tight">{category.category}</p>
                      <p className="text-label text-muted-foreground">{category.services.length} service{category.services.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="relative z-20">
                    <ActionPopover actions={categoryActions} />
                  </div>
                </div>

                {/* Services list */}
                <div className="relative z-10 h-7 flex items-center">
                  {category.services.length === 0 ? (
                    <span className="text-label text-muted-foreground italic">No services yet</span>
                  ) : (
                    <OverflowTags items={category.services} className="w-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Detail Slide-over Sheet */}
      <CategoryDetailSheet
        isOpen={isSheetOpen === "true"}
        onClose={handleCloseSheet}
        category={selectedCategory}
        specs={specs}
        serviceIcons={serviceIcons}
        iconLibrary={ICON_LIBRARY}
        onOpenDialog={handleOpenDialog}
        onDelete={handleDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogConfig?.mode === "add" ? "Add New" : "Rename"} {dialogConfig?.type.charAt(0).toUpperCase()}{dialogConfig?.type.slice(1)}
            </DialogTitle>
            <DialogDescription>
              {dialogConfig?.mode === "add" 
                ? `Enter the name for the new ${dialogConfig?.type}.`
                : `Update the name for this ${dialogConfig?.type}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-label font-semibold text-muted-foreground block">Name</label>
                <Input
                  id="name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={dialogConfig?.type === "category" ? "e.g. Fitness & Exercise" : "e.g. Yoga"}
                  className="h-10 text-body"
                  autoFocus
                />
              </div>

              {dialogConfig?.type === "service" && (
                <div className="space-y-3 pb-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-label font-semibold text-muted-foreground block">Service Icon</label>
                    {selectedIcon && (
                      <button 
                        onClick={() => setSelectedIcon(null)}
                        className="text-label text-primary font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {ICON_LIBRARY.map(({ name, icon: IconComp }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedIcon(name)}
                        title={name}
                        className={cn(
                          "w-10 h-10 rounded-lg border flex items-center justify-center transition-all group/icon",
                          selectedIcon === name 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110 z-10" 
                            : "bg-muted border-zinc-200 text-faint hover:border-primary/30 hover:bg-white hover:text-primary"
                        )}
                      >
                        <IconComp size={20} weight={selectedIcon === name ? "fill" : "duotone"} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-10 text-body font-medium">
              Cancel
            </Button>
            <Button onClick={handleSave} className="h-10 px-6 text-body font-semibold">
              {dialogConfig?.mode === "add" ? "Save " + dialogConfig?.type : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading service taxonomy...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
