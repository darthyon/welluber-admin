"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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
import { SearchableMultiSelect } from "@/components/shared/searchable-multi-select";
import { SERVICE_TAXONOMY } from "@/features/organizations/constants";

export default function NewServiceProviderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSpData>({
    resolver: zodResolver(createSpSchema as any),
    defaultValues: { isActive: true, serviceCategories: [] },
  });

  const onSubmit = async (data: CreateSpData) => {
    setIsSubmitting(true);
    try {
      const res = await createSp({ ...data, serviceCategories: selectedCategories });
      if (res.success) {
        router.push(`/service-providers/${res.data.id}`);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleCategoriesChange = (cats: string[]) => {
    setSelectedCategories(cats);
    setValue("serviceCategories", cats);
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full px-3 py-2 bg-background border rounded-md text-[14px] outline-none transition-colors",
      hasError
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-foreground/30 focus:bg-muted/30"
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <div>
        <Link
          href="/service-providers"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <CaretLeft size={16} /> Back to Service Providers
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Add New Service Provider</h1>
        <p className="text-muted-foreground text-[13px] mt-1">Register a wellness service provider on the platform.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form id="newSpForm" onSubmit={handleSubmit(onSubmit)}>

          {/* Section: Basic Info */}
          <div className="p-6 border-b border-border space-y-5">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Storefront size={16} weight="fill" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">Provider Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-foreground">Company Name</label>
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

          {/* Section: Service Categories */}
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Tag size={16} weight="fill" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">Service Categories</h3>
            </div>

            <p className="text-[12px] text-muted-foreground">
              Select all service categories this provider offers. Commission rates are configured per category after creation.
            </p>

            <SearchableMultiSelect
              taxonomy={SERVICE_TAXONOMY}
              selected={selectedCategories}
              onChange={handleCategoriesChange}
              placeholder="Search and select service categories..."
            />
            {errors.serviceCategories && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <WarningCircle size={12} /> {errors.serviceCategories.message}
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
