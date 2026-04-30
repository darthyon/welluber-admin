"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export function BackButton({ onClick, label, className }: BackButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-body font-medium text-subtle hover:text-primary transition-colors w-fit group",
        className
      )}
    >
      <CaretLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}
