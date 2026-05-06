"use client";

import Link from "next/link";
import { CheckCircle, Lock, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Organization } from "@/features/organizations/types";

interface OrgSetupGuideProps {
  organization: Organization;
  className?: string;
  compact?: boolean;
}

interface SetupStep {
  n: number;
  title: string;
  description: string;
  complete: boolean;
  locked: boolean;
  href: string;
  cta: string;
}

export function OrgSetupGuide({ organization: org, className, compact = false }: OrgSetupGuideProps) {
  const steps: SetupStep[] = [
    {
      n: 1,
      title: "Define employee tiers",
      description: compact
        ? "Set position levels like Executive, Manager, Associate."
        : "Set position levels (like Executive, Manager, Associate) used for benefit policy targeting.",
      complete: (org.tierConfigs?.length ?? 0) > 0,
      locked: false,
      href: `/organizations/${org.id}?tab=employees&subTab=tiers`,
      cta: "Set up tiers",
    },
    {
      n: 2,
      title: "Add employees",
      description: compact
        ? "Upload your roster and assign tiers to each person."
        : "Upload your employee roster and assign a tier level to each person.",
      complete: org.employeeCount > 0,
      locked: false,
      href: `/organizations/${org.id}?tab=employees`,
      cta: "Add employees",
    },
    {
      n: 3,
      title: "Create a benefit policy",
      description: compact
        ? "Build a policy with service groups and benefit amounts."
        : "Build at least one policy with benefit groups, services, and coverage amounts.",
      complete: org.policies.length > 0,
      locked: false,
      href: `/organizations/${org.id}?tab=policies&addPolicy=true`,
      cta: "Create policy",
    },
    {
      n: 4,
      title: "Assign policies to employees",
      description: compact
        ? "Match employees to their benefit policy."
        : "Ensure every employee has a policy based on their tier. Use sub-policies to override amounts for specific groups.",
      complete: org.employeeCount > 0 && (org.employeesWithoutPolicy ?? 1) === 0,
      locked: org.employeeCount === 0,
      href: `/organizations/${org.id}?tab=employees&filter=missing-policy`,
      cta: "Review coverage",
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const allComplete = completedCount === steps.length;

  if (allComplete) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {!compact && (
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-body font-semibold text-foreground">
              {completedCount} of {steps.length} steps complete
            </p>
            <span className="text-label text-muted-foreground">
              {steps.length - completedCount} remaining
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={cn("divide-y divide-border", compact && "px-1 py-1")}>
        {steps.map((step) => {
          const isActive = !step.complete && !step.locked;

          return (
            <div
              key={step.n}
              className={cn(
                "flex items-start gap-4 px-5",
                compact ? "py-3" : "py-4",
                step.complete && "opacity-60",
                step.locked && !step.complete && "opacity-40"
              )}
            >
              {/* Step indicator */}
              <div className="shrink-0 mt-0.5">
                {step.complete ? (
                  <CheckCircle
                    size={22}
                    weight="fill"
                    className="text-emerald-500 dark:text-emerald-400"
                  />
                ) : step.locked ? (
                  <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-border bg-muted">
                    <Lock size={11} weight="bold" className="text-faint" />
                  </div>
                ) : (
                  <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-micro font-semibold leading-none">{step.n}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-body font-semibold leading-snug",
                    step.complete ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground"
                  )}
                >
                  {step.title}
                </p>
                {isActive && !compact && (
                  <p className="text-label text-muted-foreground mt-0.5">{step.description}</p>
                )}
                {isActive && compact && (
                  <p className="text-label text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>

              {/* CTA */}
              {isActive && (
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "shrink-0 h-8 px-3 rounded-lg text-label font-semibold gap-1.5",
                    compact && "h-7 px-2.5"
                  )}
                >
                  <Link href={step.href}>
                    {step.cta}
                    <ArrowRight size={12} weight="bold" />
                  </Link>
                </Button>
              )}

              {step.complete && (
                <span className="shrink-0 text-label font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Done
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
