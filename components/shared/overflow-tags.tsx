"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OverflowTagsProps {
  items: string[];
  className?: string;
}

/**
 * Renders items as badges in a single row.
 * Once items would wrap, shows "+x" with a tooltip listing the hidden ones.
 */
export function OverflowTags({ items, className }: OverflowTagsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const badges = Array.from(
        container.querySelectorAll("[data-tag]")
      ) as HTMLElement[];

      // Estimate +x button width (rendered but offscreen/zero-size until overflow)
      // Safe estimate: 30px covers "+99"
      const MORE_BTN_WIDTH = 30;
      const GAP = 6; // gap-1.5

      let count = badges.length;

      for (let i = 0; i < badges.length; i++) {
        const badge = badges[i];
        const right = badge.offsetLeft + badge.offsetWidth;
        const isLast = i === badges.length - 1;
        const spaceNeeded = isLast ? right : right + GAP + MORE_BTN_WIDTH;

        if (spaceNeeded > containerWidth) {
          count = i;
          break;
        }
      }

      setVisibleCount(count);
    };

    // Initial measure
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [items]);

  const hiddenItems = items.slice(visibleCount);

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn("flex flex-nowrap gap-1.5 overflow-hidden", className)}
      >
        {items.map((item, i) => (
          <Badge
            key={i}
            data-tag={String(i)}
            variant="secondary"
            className={cn(
              "text-micro font-semibold bg-background/50 border-border/60 text-muted-foreground/80 px-2 py-0.5 h-5 shrink-0 whitespace-nowrap transition-colors hover:text-primary hover:border-primary/30",
              // Keep in DOM for measurement but visually hide overflow items
              i >= visibleCount && "invisible pointer-events-none"
            )}
          >
            {item}
          </Badge>
        ))}

        {hiddenItems.length > 0 && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-micro text-muted-foreground/60 hover:text-primary font-semibold px-1.5 shrink-0 whitespace-nowrap transition-colors"
              >
                +{hiddenItems.length}
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="w-52 bg-popover rounded-lg border border-border/60 shadow-2xl z-[200] p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-0.5 py-1">
                <span className="text-micro font-semibold text-muted-foreground/60 px-2 py-0.5 uppercase tracking-wider">
                  More items
                </span>
                {hiddenItems.map((item, i) => (
                  <div
                    key={i}
                    className="text-label px-2 py-1 hover:bg-accent/40 rounded-lg text-foreground/80 font-medium transition-colors"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
