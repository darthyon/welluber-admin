"use client";

import Link from "next/link";
import { House, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-6">
      <div className="w-full max-w-xl">
        <EmptyState
          isPageLevel
          icon={<WarningCircle size={48} weight="duotone" />}
          title="Page Not Found"
          description="The page you are looking for might have been moved, deleted, or does not exist. Please check the URL or return to the dashboard."
          action={
            <Button asChild className="rounded-full px-8 h-12 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Link href="/dashboard" className="flex items-center gap-2">
                <House size={20} weight="bold" />
                Return to Dashboard
              </Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
