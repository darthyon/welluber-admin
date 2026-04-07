"use client";

import { 
  User, 
  Users, 
  DotsThreeVertical, 
  Buildings, 
  Shield, 
  CaretLeft, 
  CaretRight 
} from "@phosphor-icons/react";
import { StatusBadge } from "@/components/shared/status-badge";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ActionPopover } from "@/components/shared/action-popover";

export type EmployeeBenefitPolicy = {
  policyName: string;
  benefitGroups: string[];
  utilisation: number; // 0-100
};

interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email: string;
    branch: string;
    status: string;
    employeeId: string;
    empCode: string;
    joinDate: string;
    benefitPolicies: EmployeeBenefitPolicy[];
    dependentsCount: number;
  };
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export function EmployeeCard({ employee, onEdit, onView }: EmployeeCardProps) {
  const [policyIndex, setPolicyIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  
  const initials = employee.name.split(" ").map(n => n[0]).join("");
  const hasMultipleItems = employee.benefitPolicies.length > 1;
  const currentItem = employee.benefitPolicies[policyIndex] || employee.benefitPolicies[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && innerRef.current) {
        const outerWidth = scrollRef.current.offsetWidth;
        const innerWidth = innerRef.current.scrollWidth;
        setDragConstraints({
          left: outerWidth > innerWidth ? 0 : outerWidth - innerWidth,
          right: 0
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentItem]);

  const nextItem = () => {
    setPolicyIndex((prev) => (prev + 1) % employee.benefitPolicies.length);
  };

  const prevItem = () => {
    setPolicyIndex((prev) => (prev - 1 + employee.benefitPolicies.length) % employee.benefitPolicies.length);
  };

  return (
    <div className="group glass-card rounded-xl p-5 relative flex flex-col h-full overflow-hidden">
      {/* Decorative Accent */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />

      {/* Upper Section (Compact) */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg border border-border/40 flex items-center justify-center bg-muted/30 text-primary font-bold text-[12px] group-hover:scale-105 transition-all duration-500 shadow-sm overflow-hidden">
               <div className="bg-primary/10 w-full h-full flex items-center justify-center font-mono tracking-tighter">
                  {initials}
               </div>
            </div>
            {employee.status === "Linked" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[14px] text-foreground group-hover:text-primary transition-colors truncate tracking-tight max-w-[140px]">
                {employee.name}
              </h4>
              <StatusBadge 
                status={employee.status} 
                variant={employee.status === "Linked" ? "emerald" : "amber"} 
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-medium truncate max-w-[180px]">
              <span className="opacity-80">{employee.empCode}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-border" />
              <span>{employee.email}</span>
            </div>
          </div>
        </div>

        <ActionPopover 
          align="end"
          actions={[
            { label: "View Employee", onClick: () => onView?.(employee.id) },
            { label: "Edit Employee", onClick: () => onEdit?.(employee.id) },
            { label: "Terminate Link", isDanger: true, onClick: () => console.log("Terminate", employee.id) },
          ]}
        />
      </div>

      {/* Info Section */}
      <div className="flex-1 space-y-4 relative z-10">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-medium bg-muted/40 px-2.5 py-1 rounded w-fit border border-border/40">
          <Buildings size={14} className="text-muted-foreground/60" />
          <span className="truncate">{employee.branch}</span>
        </div>
          
          {/* Policy Carousel Section */}
          <div className="bg-muted/30 rounded-xl px-4 py-4 border border-border/60 relative overflow-hidden group/policy min-h-[148px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={policyIndex}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                <div className="flex flex-col gap-2.5 overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                      <Shield size={12} className="text-primary" weight="fill" />
                    </div>
                    <span className="text-[12px] font-bold text-foreground truncate" title={currentItem.policyName}>
                      {currentItem.policyName}
                    </span>
                  </div>
                  
                  {/* Benefit Groups (Allocations) - Grab-to-Scroll interaction */}
                  <div className="relative group/scroll px-0.5 overflow-hidden active:cursor-grabbing" ref={scrollRef}>
                    <motion.div 
                      ref={innerRef}
                      className="flex items-center gap-1.5 py-1 px-0.5 cursor-grab active:cursor-grabbing w-max pr-2"
                      drag="x"
                      dragConstraints={dragConstraints}
                      dragElastic={0.05}
                      whileTap={{ cursor: "grabbing" }}
                    >
                      {currentItem.benefitGroups.map((group: string, idx: number) => (
                        <div 
                          key={idx}
                          className="bg-background/40 border border-border/60 text-muted-foreground/80 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap shrink-0 hover:border-primary/40 hover:text-primary transition-all duration-300 pointer-events-none"
                        >
                          {group}
                        </div>
                      ))}
                    </motion.div>
                    
                    {/* Visual fade affordance */}
                    <div className="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold tracking-tight">
                    <span className="text-muted-foreground/80">Utilisation</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded shrink-0",
                      currentItem.utilisation > 80 ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                    )}>
                      {currentItem.utilisation}%
                    </span>
                  </div>

                  <div className="relative h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentItem.utilisation}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        currentItem.utilisation > 80 ? "bg-rose-500" : "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls - Repositioned to Bottom-Right */}
            {hasMultipleItems && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/policy:opacity-100 transition-opacity duration-300">
                 <button 
                   onClick={(e) => { e.stopPropagation(); prevItem(); }}
                   className="w-6 h-6 rounded-lg bg-background/60 border border-border/60 flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-all shadow-sm hover:scale-105 active:scale-95"
                 >
                   <CaretLeft size={14} weight="bold" />
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); nextItem(); }}
                   className="w-6 h-6 rounded-lg bg-background/60 border border-border/60 flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-all shadow-sm hover:scale-105 active:scale-95"
                 >
                   <CaretRight size={14} weight="bold" />
                 </button>
              </div>
            )}

            {/* Pagination Dots - Center Bottom */}
            {hasMultipleItems && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-1.5">
                {employee.benefitPolicies.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPolicyIndex(i); }}
                    className={cn(
                      "w-1 h-1 rounded-full transition-all duration-300",
                      i === policyIndex ? "bg-primary w-3" : "bg-border hover:bg-border/80"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Footer Metrics */}
      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 group/stat">
             <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center group-hover/stat:bg-primary/5 transition-colors">
                <Users size={14} className="text-muted-foreground/60 group-hover/stat:text-primary transition-colors" />
             </div>
             <span className="text-[11px] font-bold text-muted-foreground/80 group-hover/stat:text-foreground transition-colors">{employee.dependentsCount} Dependents</span>
           </div>
           
           <div className="h-4 w-[1px] bg-border/40" />
           
           <div className="flex items-center gap-1.5">
             <span className="text-[11px] font-medium text-muted-foreground/60">Joined</span>
             <span className="text-[11px] font-bold text-foreground/80">{employee.joinDate}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
