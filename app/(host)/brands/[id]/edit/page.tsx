"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BrandForm } from "@/components/host/brands/brand-form";
import { CaretLeft } from "@phosphor-icons/react";
import { MOCK_BRANDS } from "@/features/brands/mock-data";
import { Brand } from "@/types/brand";

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const brandId = params.id as string;

  useEffect(() => {
    // Simulate fetching data
    const foundBrand = MOCK_BRANDS.find((b) => b.id === brandId);
    if (foundBrand) {
      setBrand(foundBrand);
    }
    setIsLoading(false);
  }, [brandId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Updating brand:", brandId, data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    router.push(`/brands/${brandId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-lg border border-dashed border-border">
        <h2 className="text-heading font-semibold text-foreground">Brand Not Found</h2>
        <p className="text-muted-foreground mt-2">The brand you are looking for does not exist.</p>
        <button
          onClick={() => router.push("/brands")}
          className="mt-6 text-primary font-semibold hover:underline"
        >
          Back to Brands
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-nav font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <CaretLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div>
          <h1 className="text-display font-semibold tracking-tight text-foreground">Edit Brand</h1>
          <p className="text-muted-foreground text-nav mt-1 font-normal opacity-80">
            Update the brand identity for {brand.name}.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border/60 rounded-lg p-6 shadow-sm">
        <BrandForm 
          initialData={brand} 
          onSubmit={handleSubmit} 
          onCancel={() => router.push(`/brands/${brandId}`)}
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
