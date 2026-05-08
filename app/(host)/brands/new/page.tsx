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

  const handleSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Creating brand:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="py-12 animate-in fade-in zoom-in duration-500">
        <div className="bg-card border border-border shadow-sm rounded-lg p-8 flex flex-col items-center">
          <SuccessCelebration 
            title="Brand Created Successfully" 
            message="Your new brand identity has been established and is ready for service provider assignment." 
          />
          <div className="mt-8 flex flex-col items-center gap-4 w-full">
            <Button 
               onClick={() => router.push("/brands")}
               className="w-full h-11 font-semibold text-body"
            >
              Back to Brand List
            </Button>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-body font-medium text-subtle hover:text-foreground transition-colors"
            >
              Create another brand
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-body font-medium text-subtle hover:text-primary transition-colors group"
        >
          <CaretLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div>
          <h1 className="text-display font-semibold tracking-tight text-foreground">Add New Brand</h1>
          <p className="text-subtle text-body mt-1 font-normal opacity-80">
            Create a new brand identity to organize service providers and branches.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border/60 rounded-lg p-6 shadow-sm">
        <BrandForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push("/brands")}
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
