"use client";

import { useRef, useState, useLayoutEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MASTER_SERVICE_TAXONOMY } from "@/features/providers/service-taxonomy";

interface ServicePortfolioTagsProps {
  mainServices: string[];
  className?: string;
}

/**
 * Renders main services as badges.
 * Shows "+x" with a popover listing hidden items and their sub-services.
 */
export function ServicePortfolioTags({ mainServices, className }: ServicePortfolioTagsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phantomRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(mainServices.length);

  // Map main services to their sub-services for the popover
  const serviceDetails = useMemo(() => {
    return mainServices.map(name => {
      let subServices: string[] = [];
      for (const group of MASTER_SERVICE_TAXONOMY) {
        const match = group.services.find(s => s.name === name);
        if (match) {
          subServices = match.subServices;
          break;
        }
      }
      return { name, subServices };
    });
  }, [mainServices]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const phantom = phantomRef.current;
    if (!container || !phantom || mainServices.length === 0) return;

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const badges = Array.from(
        phantom.querySelectorAll("[data-tag]")
      ) as HTMLElement[];

      const MORE_BTN_WIDTH = 34; // width of "+X" button including gaps
      const GAP = 4; // gap-1

      let count = badges.length;

      for (let i = 0; i < badges.length; i++) {
        const badge = badges[i];
        const right = badge.offsetLeft + badge.offsetWidth;
        const isLast = i === badges.length - 1;
        
        // If not the last item, we need to account for the space of the MORE button
        const spaceNeeded = isLast ? right : right + GAP + MORE_BTN_WIDTH;

        if (spaceNeeded > containerWidth) {
          count = Math.max(0, i);
          break;
        }
      }

      setVisibleCount(count);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [mainServices]);

  const visibleItems = mainServices.slice(0, visibleCount);
  const hiddenItems = serviceDetails.slice(visibleCount);

  return (
    <TooltipProvider>
      <div className={cn("relative group/portfolio", className)}>
        {/* Real visible tags */}
        <div
          ref={containerRef}
          className="flex flex-nowrap gap-1 items-center overflow-hidden"
        >
          {visibleItems.map((item, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-[10px] font-bold bg-muted/50 border-border/40 text-muted-foreground/80 px-1.5 py-0 h-4 shrink-0 whitespace-nowrap"
            >
              {item}
            </Badge>
          ))}

          {hiddenItems.length > 0 && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-muted-foreground/60 hover:text-primary font-bold px-1 shrink-0 whitespace-nowrap transition-colors"
                >
                  +{hiddenItems.length}
                </button>
              </TooltipTrigger>
              <TooltipContent
                className="w-64 bg-popover rounded-xl border border-border/60 shadow-2xl z-[200] p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-0.5 py-1">
                  <span className="text-[9px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                    Other Main Services
                  </span>
                  <div className="max-h-[300px] overflow-y-auto">
                    {hiddenItems.map((item, i) => (
                      <div
                        key={i}
                        className="px-2 py-2 hover:bg-accent/40 rounded-lg transition-colors"
                      >
                        <div className="text-[12px] text-foreground/90 font-bold leading-none mb-1">
                          {item.name}
                        </div>
                        {item.subServices.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.subServices.slice(0, 4).map((sub, j) => (
                              <span key={j} className="text-[9px] text-muted-foreground/60 border border-border/30 px-1 rounded-sm">
                                {sub}
                              </span>
                            ))}
                            {item.subServices.length > 4 && (
                              <span className="text-[9px] text-muted-foreground/40 italic">+{item.subServices.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Phantom measurement container (off-screen) */}
        <div
          ref={phantomRef}
          className="absolute -top-[9999px] -left-[9999px] invisible flex flex-nowrap gap-1 pointer-events-none"
          aria-hidden="true"
        >
          {mainServices.map((item, i) => (
            <Badge
              key={i}
              data-tag={String(i)}
              variant="secondary"
              className="text-[10px] font-bold px-1.5 py-0 h-4 shrink-0 whitespace-nowrap"
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
