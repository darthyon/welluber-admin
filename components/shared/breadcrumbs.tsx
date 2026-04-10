"use client";

import Link from "next/link";
import { CaretRight, CaretDown } from "@phosphor-icons/react";
import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbOption {
  label: string;
  href: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  options?: BreadcrumbOption[]; // Sequential selection support
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-nav text-muted-foreground", className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hasOptions = item.options && item.options.length > 0;

          return (
            <Fragment key={index}>
              <li className="relative">
                <div className="flex items-center gap-1">
                  {item.href && !isLast ? (
                    <Link 
                      href={item.href}
                      className="hover:text-foreground transition-colors font-medium flex items-center gap-1"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={cn("font-medium", isLast ? "text-foreground" : "")}>
                      {item.label}
                    </span>
                  )}
                  
                  {hasOptions && (
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="p-0.5 hover:bg-muted rounded transition-colors"
                    >
                      <CaretDown size={12} weight="bold" className="text-muted-foreground/60" />
                    </button>
                  )}

                  {/* Sequential Dropdown */}
                  {hasOptions && openIndex === index && (
                    <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-background border border-border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                      {item.options?.map((opt, i) => (
                        <Link
                          key={i}
                          href={opt.href}
                          onClick={() => setOpenIndex(null)}
                          className="block px-3 py-1.5 hover:bg-accent text-foreground transition-colors"
                        >
                          {opt.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
              {!isLast && (
                <li>
                  <CaretRight size={12} weight="bold" className="text-muted-foreground/60 mx-1" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
      
      {/* Click outside to close */}
      {openIndex !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenIndex(null)}
        />
      )}
    </nav>
  );
}
