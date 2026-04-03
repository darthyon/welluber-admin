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
import { SERVICE_TAXONOMY } from "@/features/organizations/constants";
import { MOCK_SPS } from "@/features/providers/mock-data";

export default function EditServiceProviderPage() {
  const router = useRouter();
  const params = useParams();
  const spId = params.id as string;
  const sp = MOCK_SPS.find((s) => s.id === spId) ?? MOCK_SPS[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(sp.serviceCategories);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSpData>({
    resolver: zodResolver(createSpSchema as any),
    defaultValues: {
      name: sp.name,
      registrationNo: sp.registrationNo,
      website: sp.website ?? "",
      description: sp.description ?? "",
      serviceCategories: sp.serviceCategories,
      isActive: sp.isActive,
    },
  });

  const onSubmit = async (data: CreateSpData) => {
    setIsSubmitting(true);
    try {
      const res = await updateSp(spId, { ...data, serviceCategories: selectedCategories });
      if (res.success) {
        router.push(`/service-providers/${spId}`);
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
      <div>
        <Link
          href={`/service-providers/${spId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <CaretLeft size={16} /> Back to {sp.name}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit Service Provider</h1>
        <p className="text-muted-foreground text-[13px] mt-1">Update the profile and service categories for {sp.name}.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form id="editSpForm" onSubmit={handleSubmit(onSubmit)}>

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
                <input {...register("name")} className={inputCls(!!errors.name)} />
                {errors.name && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                    <WarningCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Registration Number</label>
                <input {...register("registrationNo")} className={inputCls(!!errors.registrationNo)} />
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
                <input {...register("website")} className={inputCls(!!errors.website)} type="url" />
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
                <textarea {...register("description")} rows={3} className={cn(inputCls(), "resize-none")} />
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
              Changing service categories will affect commission schema rows and branch service options.
            </p>

            <SearchableMultiSelect
              taxonomy={SERVICE_TAXONOMY}
              selected={selectedCategories}
              onChange={handleCategoriesChange}
            />
            {errors.serviceCategories && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <WarningCircle size={12} /> {errors.serviceCategories.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
            <Button asChild variant="outline" className="text-[13px] font-medium">
              <Link href={`/service-providers/${spId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-[13px] font-medium flex items-center gap-2">
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
