"use client";

import { useRouter } from "next/navigation";
import { BrandForm } from "@/components/host/brands/brand-form";
import { CaretLeft } from "@phosphor-icons/react";
import { useState } from "react";

export default function NewBrandPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Creating brand:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    router.push("/brands");
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <button
          onClick={() => router.push("/brands")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <CaretLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Brands
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Brand</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal opacity-80">
            Create a new brand identity to organize service providers and branches.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
        <BrandForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
