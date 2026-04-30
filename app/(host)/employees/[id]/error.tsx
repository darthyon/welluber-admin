"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react";

export default function EmployeeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Employee page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 dark:border-destructive/30 mx-auto flex items-center justify-center text-destructive dark:bg-destructive/20 mb-6">
        <WarningCircle size={32} weight="fill" />
      </div>
      
      <h2 className="text-heading font-semibold text-foreground mb-3">
        Unable to load employee details
      </h2>
      
      <p className="text-body text-muted-foreground mb-8 max-w-md mx-auto">
        We encountered an error while loading the employee information. This could be due to a network issue or the employee record not existing.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={18} />
          Go Back
        </Button>
        
        <Button
          className="gap-2"
          onClick={() => reset()}
        >
          Try Again
        </Button>
      </div>
      
      {error.digest && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-left">
          <p className="text-label font-mono text-muted-foreground">
            Error ID: {error.digest}
          </p>
        </div>
      )}
    </div>
  );
}