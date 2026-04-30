"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
  unit?: string;
}

export function Slider({ 
  min, 
  max, 
  step = 1, 
  value, 
  onChange, 
  className,
  label,
  unit = ""
}: SliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {(label || value !== undefined) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-body font-medium text-foreground">{label}</label>}
          <span className="text-label font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            {value}{unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-muted/80"
      />
      <div className="flex justify-between text-micro text-muted-foreground font-medium px-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
