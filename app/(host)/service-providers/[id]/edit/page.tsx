"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeft, Storefront, Tag, WarningCircle, NavigationArrow } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createSpSchema, CreateSpData } from "@/features/providers/schemas";
import { updateSp } from "@/features/providers/actions";
import { Button } from "@/components/ui/button";
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";
import { MOCK_SPS } from "@/features/providers/mock-data";
import { MOCK_BRANDS } from "@/features/brands/mock-data";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { Controller } from "react-hook-form";
import { Article, Files, Info } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EditServiceProviderPage() {
  const router = useRouter();
  const params = useParams();
  const spId = params.id as string;
  const sp = MOCK_SPS.find((s) => s.id === spId) ?? MOCK_SPS[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainServices, setSelectedMainServices] = useState<string[]>(sp.mainServices || []);
  
  const brand = MOCK_BRANDS.find(b => b.id === sp.brandId);
  const brandCategories = brand?.serviceCategories || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateSpData>({
    resolver: zodResolver(createSpSchema as any),
    defaultValues: {
      name: sp.name,
      registrationNo: sp.registrationNo,
      website: sp.website ?? "",
      description: sp.description ?? "",
      mainServices: sp.mainServices || [],
      serviceCategories: sp.serviceCategories || [],
      isActive: sp.isActive,
      tinNumber: sp.tinNumber ?? "",
      classificationCode: sp.classificationCode ?? "",
      classificationDescriptor: sp.classificationDescriptor ?? "",
      documents: sp.documents ?? [],
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const derivedCategories = Array.from(new Set(
        selectedMainServices.map(serviceName => {
          const group = MASTER_SERVICE_TAXONOMY.find(g => g.services.some(s => s.name === serviceName));
          return group?.category;
        }).filter(Boolean) as string[]
      ));

      const res = await updateSp(spId, { 
        ...data, 
        mainServices: selectedMainServices,
        serviceCategories: derivedCategories 
      });
      if (res.success) {
        router.push(`/service-providers/${spId}`);
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

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          href={`/service-providers/${spId}`}
          className="inline-flex items-center gap-1.5 text-nav font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <CaretLeft size={16} /> Back to {sp.name}
        </Link>
        <h1 className="text-heading font-semibold tracking-tight text-foreground">Edit Service Provider</h1>
        <p className="text-muted-foreground text-nav mt-1">Update the profile and service categories for {sp.name}.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form id="editSpForm" onSubmit={handleSubmit(onSubmit)}>

          {/* Section: Basic Info */}
          <div className="p-6 border-b border-border space-y-5">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Storefront size={16} weight="fill" />
              </div>
              <h3 className="text-subtitle font-semibold text-foreground">Provider Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-nav font-medium text-foreground">Company Name</label>
                <input {...register("name")} className={inputCls(!!errors.name)} />
                {errors.name && (
                  <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-nav font-medium text-foreground">Registration Number</label>
                <input {...register("registrationNo")} className={inputCls(!!errors.registrationNo)} />
                {errors.registrationNo && (
                  <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.registrationNo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-nav font-medium text-foreground">
                  Website <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input {...register("website")} className={inputCls(!!errors.website)} type="url" />
                {errors.website && (
                  <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.website.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-nav font-medium text-foreground">TIN No.</label>
                <input {...register("tinNumber")} className={inputCls(!!errors.tinNumber)} placeholder="e.g. TR-882910-01" />
                {errors.tinNumber && (
                  <p className="text-caption text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.tinNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-nav font-medium text-foreground">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea {...register("description")} rows={3} className={cn(inputCls(), "resize-none")} />
              </div>
            </div>
          </div>

          {/* Section: Service Portfolio */}
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Tag size={16} weight="fill" />
                </div>
                <h3 className="text-subtitle font-semibold text-foreground">Service Portfolio</h3>
              </div>
              {brandCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                    {brandCategories.map(cat => (
                        <Badge key={cat} variant="outline" className="text-micro font-medium bg-muted/20">{cat}</Badge>
                    ))}
                </div>
              )}
            </div>

            <p className="text-label text-muted-foreground">
              Select available services from the masterlist allowed for this brand.
            </p>

            <SearchableMultiSelect
              taxonomy={SERVICE_PORTFOLIO_TAXONOMY}
              selected={selectedMainServices}
              onChange={handleServicesChange}
              placeholder="Search main services..."
            />
            {errors.mainServices && (
              <p className="text-caption text-destructive flex items-center gap-1">
                <WarningCircle size={12} /> {errors.mainServices.message}
              </p>
            )}
          </div>

          {/* Section: e-Invoice Malaysia */}
          <div className="p-6 border-b border-border space-y-5">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Article size={16} weight="fill" />
              </div>
              <h3 className="text-subtitle font-semibold text-foreground">e-Invoice Malaysia</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 flex items-center gap-1 text-caption font-medium text-primary cursor-default">
                      <Info size={13} weight="fill" className="text-primary/70" />
                      Submitted by Welluber
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px] text-center text-label">
                    Welluber will submit for SP on behalf to the org.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-nav font-medium text-foreground">Classification Code</label>
                <input {...register("classificationCode")} className={inputCls(!!errors.classificationCode)} placeholder="e.g. 001" />
              </div>

              <div className="space-y-1.5">
                <label className="text-nav font-medium text-foreground">Classification Descriptor</label>
                <input {...register("classificationDescriptor")} className={inputCls(!!errors.classificationDescriptor)} placeholder="e.g. General" />
              </div>
            </div>
          </div>

          {/* Section: Documents */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-muted0/10 flex items-center justify-center text-muted-foreground">
                <Files size={16} weight="fill" />
              </div>
              <h3 className="text-subtitle font-semibold text-foreground">Documents</h3>
            </div>

            <Controller
              name="documents"
              control={control}
              render={({ field }) => (
                <DocumentUploadSection 
                  documents={field.value || []}
                  onChange={field.onChange}
                  error={errors.documents?.message}
                />
              )}
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
            <Button asChild variant="outline" className="text-nav font-medium">
              <Link href={`/service-providers/${spId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-nav font-medium flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
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
