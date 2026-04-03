"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer 
}: SheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="fixed inset-0 z-[140] bg-background/80 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[150] w-full sm:w-[440px] bg-card border-l border-border shadow-2xl flex flex-col pt-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
                {description && (
                  <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 mt-auto shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
