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
    organization?: string;
    branch: string;
    status: string;
    employeeId: string;
    empCode: string;
    joinDate: string;
    department?: string;
    tier?: string;
    employmentType?: string;
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
    const calculateConstraints = () => {
      if (scrollRef.current && innerRef.current) {
        const outerWidth = scrollRef.current.offsetWidth;
        const innerWidth = innerRef.current.scrollWidth;
        setDragConstraints({
          left: outerWidth > innerWidth ? 0 : outerWidth - innerWidth,
          right: 0
        });
      }
    };

    // Use ResizeObserver to avoid layout thrashing
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateConstraints);
    });

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }
    if (innerRef.current) {
      observer.observe(innerRef.current);
    }

    // Initial calculation
    const timer = setTimeout(calculateConstraints, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [currentItem]);

  const nextItem = () => {
    setPolicyIndex((prev) => (prev + 1) % employee.benefitPolicies.length);
  };

  const prevItem = () => {
    setPolicyIndex((prev) => (prev - 1 + employee.benefitPolicies.length) % employee.benefitPolicies.length);
  };

  return (
    <div
      className="group glass-card rounded-lg p-5 relative flex flex-col h-full overflow-hidden cursor-pointer"
      onClick={() => onView?.(employee.id)}
    >
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
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-2 border-white rounded-full shadow-sm" />
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
              <span className="text-micro text-faint font-mono bg-background/50 px-1.5 py-0.5 rounded border border-border/40 tracking-tight">{employee.empCode}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {employee.organization && (
                <span className="text-micro font-medium px-1.5 py-0.5 rounded bg-muted text-subtle border border-border/40">
                  {employee.organization}
                </span>
              )}
              {employee.department && (
                <span className="text-micro font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                  {employee.department}
                </span>
              )}
              {employee.tier && (
                <span className="text-micro font-semibold px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">
                  {employee.tier}
                </span>
              )}
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
            <div className="flex items-center gap-1.5 text-faint">
              <Buildings size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Branch</span>
            </div>
            <span className="text-body font-medium text-foreground block truncate" title={employee.branch}>
              {employee.branch}
            </span>
          </div>
          <div className="space-y-2.5 font-mono">
            <div className="flex items-center gap-1.5 text-faint">
              <UserCircle size={14} weight="bold" />
              <span className="text-label font-semibold text-faint">Email</span>
            </div>
            <span className="text-label font-semibold text-subtle block truncate" title={employee.email}>
              {employee.email}
            </span>
          </div>
        </div>
          
        {/* Policy Carousel Section */}
        <div className="bg-muted/30 rounded-lg px-4 py-4 border border-border/60 relative overflow-hidden group/policy min-h-[140px]">
          <div className="flex items-center gap-1.5 text-faint mb-3">
            <Shield size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">Benefit Policy</span>
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
                <span className="text-body font-medium text-foreground truncate" title={currentItem.policyName}>
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
                        className="bg-background/40 border border-border/60 text-subtle px-2.5 py-1 rounded-full text-label font-medium shadow-sm whitespace-nowrap shrink-0 hover:border-primary/40 hover:text-primary transition-all duration-300 pointer-events-none"
                      >
                        {group}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-label font-semibold">
                  <span className="text-faint font-semibold">Utilisation</span>
                  <StatusBadge
                    status={`${currentItem.utilisation}%`}
                    variant={currentItem.utilisation > 80 ? "rose" : "emerald"}
                    className="shrink-0 font-semibold"
                  />
                </div>

                <div className="relative h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentItem.utilisation}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      currentItem.utilisation > 80
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 shadow-[0_0_8px_rgba(var(--emerald-rgb),0.4)]"
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
          <div className="flex items-center gap-1.5 text-faint">
            <Users size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">Workforce</span>
          </div>
          <span className="text-label font-semibold text-subtle block">
            {employee.dependentsCount} (Dependents)
          </span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-faint">
            <Clock size={14} weight="bold" />
            <span className="text-label font-semibold text-faint">Last Active</span>
          </div>
          <span className="text-label font-semibold text-subtle block">
            {employee.joinDate}
          </span>
        </div>
      </div>
    </div>
  );
}
