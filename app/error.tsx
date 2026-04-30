"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, ArrowCounterClockwise, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-6">
      <div className="w-full max-w-2xl">
        <EmptyState
          isPageLevel
          icon={<Warning size={48} weight="duotone" />}
          title="Something went wrong"
          description={
            error.message || 
            "An unexpected error occurred while processing your request. Please try again or return to the dashboard."
          }
          action={
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => reset()}
                className="rounded-full px-8 h-12 font-semibold hover:bg-muted transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ArrowCounterClockwise size={20} weight="bold" />
                Try again
              </Button>
              <Button asChild className="rounded-full px-8 h-12 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <Link href="/dashboard">
                  <House size={20} weight="bold" />
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
