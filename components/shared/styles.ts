import { cn } from "@/lib/utils";

export const inputCls = (hasError?: boolean, customClasses?: string) =>
  cn(
    "w-full px-3 py-2 bg-background border rounded-md text-body outline-none transition-colors",
    hasError ? "border-destructive" : "border-border focus:border-foreground/30 focus:bg-muted/30",
    customClasses
  );
