"use client";

import { 
  User, 
  Users, 
  DotsThreeVertical, 
  Buildings, 
  Shield, 
  CaretLeft, 
  CaretRight,
  Clock,
  UserCircle
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
            <div className="w-10 h-10 rounded-lg border border-border/40 flex items-center justify-center bg-muted/30 text-primary font-semibold text-label group-hover:scale-105 transition-all duration-500 shadow-sm overflow-hidden">
               <div className="bg-primary/10 w-full h-full flex items-center justify-center font-mono tracking-tighter">
                  {initials}
               </div>
            </div>
            {employee.status === "Linked" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-body text-foreground group-hover:text-primary transition-colors truncate tracking-tight max-w-[140px]">
                {employee.name}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge 
                status={employee.status} 
                variant={employee.status === "Linked" ? "emerald" : "amber"} 
                className="px-1.5 py-0.5 rounded-md text-micro"
              />
              <span className="text-micro text-muted-foreground/60 font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">{employee.empCode}</span>
            </div>
          </div>
        </div>

        <ActionPopover 
          align="end"
          actions={[
            { label: "View employee", onClick: () => onView?.(employee.id) },
            { label: "Edit employee", onClick: () => onEdit?.(employee.id) },
            { label: "Terminate link", isDanger: true, onClick: () => console.log("Terminate", employee.id) },
          ]}
        />
      </div>

      {/* Info Section */}
      {/* Info Section: Standardized Grid */}
      <div className="flex-1 space-y-6 relative z-10">
        
        {/* Row 1: Branch & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <Buildings size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Branch</span>
            </div>
            <span className="text-nav font-semibold text-foreground block truncate" title={employee.branch}>
              {employee.branch}
            </span>
          </div>
          <div className="space-y-2.5 font-mono">
            <div className="flex items-center gap-1.5 text-muted-foreground/30">
              <UserCircle size={14} weight="bold" />
              <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Email</span>
            </div>
            <span className="text-caption font-semibold text-muted-foreground/80 block truncate" title={employee.email}>
              {employee.email}
            </span>
          </div>
        </div>
          
        {/* Policy Carousel Section */}
        <div className="bg-muted/30 rounded-xl px-4 py-4 border border-border/60 relative overflow-hidden group/policy min-h-[140px]">
          <div className="flex items-center gap-1.5 text-muted-foreground/30 mb-3">
            <Shield size={14} weight="bold" />
            <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Benefit Policy</span>
          </div>
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
                <span className="text-nav font-semibold text-foreground truncate" title={currentItem.policyName}>
                  {currentItem.policyName}
                </span>
                
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
                        className="bg-background/40 border border-border/60 text-muted-foreground/80 px-2.5 py-1 rounded-full text-micro font-semibold shadow-sm whitespace-nowrap shrink-0 hover:border-primary/40 hover:text-primary transition-all duration-300 pointer-events-none"
                      >
                        {group}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-caption font-semibold tracking-tight">
                  <span className="text-muted-foreground/60 font-semibold">Utilisation</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded shrink-0 font-semibold",
                    currentItem.utilisation > 80 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
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
                      currentItem.utilisation > 80 ? "bg-rose-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(var(--emerald-rgb),0.4)]"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* ... existing carousel controls ... */}
        </div>
      </div>

      {/* Footer Metadata: Standardized Fields */}
      <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground/30">
            <Users size={14} weight="bold" />
            <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Workforce</span>
          </div>
          <span className="text-label font-semibold text-foreground/80 block">
            {employee.dependentsCount} (Dependents)
          </span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground/30">
            <Clock size={14} weight="bold" />
            <span className="text-caption font-semibold tracking-tight text-muted-foreground/60">Last Active</span>
          </div>
          <span className="text-label font-semibold text-foreground/80 block">
            {employee.joinDate}
          </span>
        </div>
      </div>
    </div>
  );
}
