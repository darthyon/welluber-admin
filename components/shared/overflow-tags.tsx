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
              "text-[10px] font-medium bg-white border-zinc-200 text-zinc-600 px-2 py-0.5 h-5 shrink-0 whitespace-nowrap",
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
                className="text-[10px] text-zinc-500 hover:text-zinc-900 font-bold px-1 shrink-0 whitespace-nowrap underline decoration-zinc-200 underline-offset-4 transition-colors"
              >
                +{hiddenItems.length}
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="w-52 bg-white rounded-2xl border-zinc-200 shadow-2xl z-[200]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-semibold tracking-tight text-zinc-400 px-2 py-1 opacity-50">
                  All categories
                </span>
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="text-[12px] px-2 py-1.5 hover:bg-zinc-50 rounded-lg text-zinc-700 font-medium"
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
