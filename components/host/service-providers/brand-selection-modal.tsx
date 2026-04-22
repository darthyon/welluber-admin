"use client";

import { useState } from "react";
import { MagnifyingGlass, Check, CaretRight } from "@phosphor-icons/react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brand } from "@/types/brand";
import { cn } from "@/lib/utils";

interface BrandSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (brand: Brand) => void;
  brands: Brand[];
}

export function BrandSelectionModal({ isOpen, onClose, onSelect, brands }: BrandSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-heading font-semibold tracking-tight">Select Existing Brand</DialogTitle>
          <DialogDescription className="text-nav text-muted-foreground">
            Search and choose a brand to link this service provider account.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <DataFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search brands by name or ID..."
          />
        </div>

        <div className="max-h-[350px] overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onSelect(brand)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg border border-border/60 shadow-sm bg-white shrink-0">
                    {brand.logo && !brand.logo.includes("dicebear.com") && (
                      <AvatarImage src={brand.logo} className="object-contain p-1" />
                    )}
                    <AvatarFallback className="text-nav font-semibold bg-primary/[0.03] text-primary/70">
                        {brand.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-body font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {brand.name}
                    </span>
                    <span className="text-caption text-muted-foreground opacity-70">
                        {brand.assignedSpCount} SPs • ID: {brand.id}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <CaretRight size={16} weight="bold" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3 opacity-40">
                    <MagnifyingGlass size={24} weight="light" />
                </div>
                <p className="text-nav font-medium text-muted-foreground">No brands found</p>
                <p className="text-caption text-muted-foreground/60 mt-1">Try a different search term.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
