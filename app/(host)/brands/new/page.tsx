"use client";

import { useRouter } from "next/navigation";
import { BrandForm } from "@/components/host/brands/brand-form";
import { CaretLeft } from "@phosphor-icons/react";
import { useState } from "react";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { Button } from "@/components/ui/button";

export default function NewBrandPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Creating brand:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-card border border-border shadow-sm rounded-2xl p-8 flex flex-col items-center">
          <SuccessCelebration 
            title="Brand Created Successfully" 
            message="Your new brand identity has been established and is ready for service provider assignment." 
          />
          <div className="mt-8 flex flex-col items-center gap-4 w-full">
            <Button 
               onClick={() => router.push("/brands")}
               className="w-full h-11 font-bold text-[14px]"
            >
              Back to Brand List
            </Button>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Create another brand
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <BrandForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push("/brands")}
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
