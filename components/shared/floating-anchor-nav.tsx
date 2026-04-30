"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnchorItem {
  id: string;
  label: string;
}

interface FloatingAnchorNavProps {
  items: AnchorItem[];
}

export function FloatingAnchorNav({ items }: FloatingAnchorNavProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight;
      if (distanceFromBottom < 80 && items.length > 0) {
        setActiveId(items[items.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100; // Adjust for sticky headers
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="space-y-4">
        <p className="text-label font-medium text-faint uppercase tracking-widest px-4">
          Jump to section
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={cn(
                  "group flex w-full items-center border-l-2 py-2.5 px-4 text-left transition-all duration-300 rounded-r-lg",
                  isActive
                    ? "border-primary text-primary font-medium bg-primary/[0.03] "
                    : "border-transparent text-subtle hover:text-foreground hover:bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-body transition-all duration-300",
                  isActive ? "translate-x-0" : "group-hover:translate-x-0.5"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
