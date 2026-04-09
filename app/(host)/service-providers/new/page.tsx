"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CaretLeft,
  Storefront,
  Tag,
  Plus,
  Trash,
  WarningCircle,
  NavigationArrow,
} from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createSpSchema, CreateSpData } from "@/features/providers/schemas";
import { createSp } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_BRANDS } from "@/features/brands/mock-data";
import { BrandSelectionModal } from "@/components/host/service-providers/brand-selection-modal";
import { Brand } from "@/types/brand";
import { LogoUpload } from "@/components/shared/logo-upload";
import { Badge } from "@/components/ui/badge";

type Step = "selection" | "details";
type BrandType = "new" | "existing";

export default function NewServiceProviderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("selection");
  const [brandType, setBrandType] = useState<BrandType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainServices, setSelectedMainServices] = useState<string[]>([]);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandCategories, setBrandCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateSpData & { brandName?: string; brandLogo?: any }>({
    resolver: zodResolver(createSpSchema as any),
    defaultValues: { isActive: true, mainServices: [], serviceCategories: [] },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Derive service categories from selected main services for storage efficiency
      const derivedCategories = Array.from(new Set(
        selectedMainServices.map(serviceName => {
          const group = MASTER_SERVICE_TAXONOMY.find(g => g.services.some(s => s.name === serviceName));
          return group?.category;
        }).filter(Boolean) as string[]
      ));

      // Generate empty commission schema rows for each selected main service
      const initialCommissionSchema = selectedMainServices.map(service => ({
        mainService: service,
        tiers: [{ limit: 0, rate: 0.10 }], // Default 10% base
        lastUpdated: new Date().toISOString()
      }));

      const res = await createSp({ 
        ...data, 
        brandId: selectedBrand?.id || "NEW-BRAND-ID",
        mainServices: selectedMainServices,
        serviceCategories: derivedCategories,
        commissionSchema: initialCommissionSchema
      });

      if (res.success) {
        router.push(`/service-providers/${res.data.id}`);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleServicesChange = (services: string[]) => {
    setSelectedMainServices(services);
    setValue("mainServices", services);
  };

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandCategories(brand.serviceCategories || []);
    setIsBrandModalOpen(false);
    setStep("details");
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  // Filter the taxonomy based on the Brand's allowed service categories
  const SERVICE_PORTFOLIO_TAXONOMY = MASTER_SERVICE_TAXONOMY
    .filter(group => brandCategories.length === 0 || brandCategories.includes(group.category))
    .map(group => ({
      category: group.category,
      services: group.services.map(s => s.name),
    }));

  if (step === "selection") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div>
          <Link
            href="/service-providers"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <CaretLeft size={16} /> Back to Service Providers
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Add Service Provider</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal">Select how you want to categorize this service provider account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => { setBrandType("new"); setStep("details"); }}
            className="group flex flex-col p-6 bg-card border border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all text-left space-y-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Plus size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">New Brand</h3>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Create a fresh brand record and link this service provider account to it.</p>
            </div>
          </button>

          <button
            onClick={() => { setBrandType("existing"); setIsBrandModalOpen(true); }}
            className="group flex flex-col p-6 bg-card border border-border/60 rounded-xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all text-left space-y-3 shadow-sm hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <Tag size={20} weight="fill" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Existing Brand</h3>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Select from your existing portfolio of brands to link this service provider.</p>
            </div>
          </button>
        </div>

        <BrandSelectionModal 
          isOpen={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          onSelect={handleBrandSelect}
          brands={MOCK_BRANDS}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setStep("selection")}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <CaretLeft size={16} /> Change Brand Selection
        </button>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Account Details</h1>
                <p className="text-muted-foreground text-[13px] mt-1">
                    {brandType === "new" ? "Registering a new brand and its first service provider." : `Adding a new provider under the ${selectedBrand?.name} brand.`}
                </p>
            </div>
            {selectedBrand && (
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/40">
                    <Avatar className="h-6 w-6 rounded">
                        <AvatarImage src={selectedBrand.logo} />
                        <AvatarFallback className="text-[9px] font-bold">{selectedBrand.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-[12px] font-bold text-foreground/80">{selectedBrand.name}</span>
                </div>
            )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form id="newSpForm" onSubmit={handleSubmit(onSubmit)}>

          {brandType === "new" && (
            <div className="p-6 border-b border-border space-y-5 bg-muted/5">
                <div className="flex items-center gap-2 pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Tag size={16} weight="fill" />
                    </div>
                    <h3 className="text-[15px] font-bold text-foreground">Brand Identity</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 sm:col-span-1">
                        <label className="text-[13px] font-medium text-foreground">Brand Name</label>
                        <input
                            {...register("brandName")}
                            className={inputCls()}
                            placeholder="e.g. Zenith Wellness"
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Controller
                            control={control}
                            name="brandLogo"
                            render={({ field }) => (
                                <LogoUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.brandLogo?.message as string}
                                    label="Brand Logo"
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
          )}

          {/* Section: Basic Info */}
          <div className="p-6 border-b border-border space-y-5">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Storefront size={16} weight="fill" />
              </div>
              <h3 className="text-[15px] font-bold text-foreground">Provider Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-foreground">Service Provider Name</label>
                <input
                  {...register("name")}
                  className={inputCls(!!errors.name)}
                  placeholder="e.g. Zenith Yoga Studio Sdn Bhd"
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Registration Number</label>
                <input
                  {...register("registrationNo")}
                  className={inputCls(!!errors.registrationNo)}
                  placeholder="e.g. 1122334-A"
                />
                {errors.registrationNo && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.registrationNo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Website <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  {...register("website")}
                  className={inputCls(!!errors.website)}
                  placeholder="https://yoursite.my"
                  type="url"
                />
                {errors.website && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-foreground">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className={cn(inputCls(), "resize-none")}
                  placeholder="Brief description of services offered..."
                />
              </div>
            </div>
          </div>

          {/* Section: Service Portfolio */}
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Tag size={16} weight="fill" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[15px] font-bold text-foreground">Service Portfolio</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Select available services from the masterlist allowed for this brand.
                </p>
              </div>
            </div>
            {brandCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 w-full mb-1">Brand Categories</span>
                    {brandCategories.map(cat => (
                        <Badge key={cat} variant="outline" className="text-[10px] font-medium bg-muted/20">{cat}</Badge>
                    ))}
                </div>
            )}

            <SearchableMultiSelect
              taxonomy={SERVICE_PORTFOLIO_TAXONOMY}
              selected={selectedMainServices}
              onChange={handleServicesChange}
              placeholder="Search main services..."
            />
            {errors.mainServices && (
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <WarningCircle size={12} /> {errors.mainServices.message}
              </p>
            )}
          </div>

          {/* Form Footer */}
          <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
            <Button asChild variant="outline" className="text-[13px] font-medium">
              <Link href="/service-providers">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-[13px] font-medium flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Service Provider
                  <NavigationArrow size={14} weight="bold" className="rotate-90" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
