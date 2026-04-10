import React from "react";
import { cn } from "@/lib/utils";

interface StackedAvatarsProps {
  count: number;
  avatars?: string[];
  limit?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=faces",
];

export function StackedAvatars({ 
  count, 
  avatars = DEFAULT_AVATARS, 
  limit = 5, 
  size = "sm",
  className,
  onClick 
}: StackedAvatarsProps) {
  const displayCount = Math.min(count, limit);
  const remainingCount = Math.max(0, count - displayCount);
  
  const sizeClasses = {
    sm: "w-6 h-6 text-micro",
    md: "w-8 h-8 text-label",
    lg: "w-10 h-10 text-body"
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center -space-x-2 group cursor-pointer transition-all hover:translate-x-1", 
        className
      )}
    >
      {[...Array(displayCount)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full border-2 border-background flex items-center justify-center font-semibold ring-1 ring-border/50 shadow-sm overflow-hidden bg-muted",
            sizeClasses[size]
          )}
        >
          <img 
            src={avatars[i % avatars.length]} 
            alt={`Member ${i + 1}`} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className={cn(
          "rounded-full border-2 border-background flex items-center justify-center text-micro font-semibold ring-1 ring-border/50 shadow-sm bg-muted text-muted-foreground",
          sizeClasses[size]
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
