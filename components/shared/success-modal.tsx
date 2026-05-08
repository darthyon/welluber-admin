"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryAction: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  primaryAction,
  secondaryAction,
}: SuccessModalProps) {
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
            className="fixed inset-0 bg-background/40 backdrop-blur-md z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
              className="bg-card border border-border shadow-lg rounded-3xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              {/* Close Button */}
              <Button 
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="absolute top-4 right-4 text-faint hover:text-foreground"
              >
                <X size={16} />
              </Button>

              <div className="p-8 flex flex-col items-center text-center">
                {/* Animated Icon with Quiet Pulse */}
                <div className="relative w-20 h-20 mb-6">
                  {/* Pulse Ring */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 bg-primary/20 rounded-full"
                  />
                  
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, ease: "easeOut" }}
                    className="absolute inset-0 bg-primary/10 rounded-full"
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center text-primary">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path
                        d="M20 6L9 17L4 12"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <h2 className="text-lead font-semibold tracking-tight text-foreground">{title}</h2>
                  <p className="text-body text-subtle leading-relaxed px-4">
                    {message}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col w-full gap-3 mt-8"
                >
                  <Button
                    asChild={!!primaryAction.href}
                    onClick={primaryAction.onClick}
                    size="lg"
                    className="w-full text-body font-semibold flex items-center justify-center gap-2"
                  >
                    {primaryAction.href ? (
                      <Link href={primaryAction.href}>
                        {primaryAction.label}
                        {primaryAction.icon || <ArrowRight size={16} weight="bold" />}
                      </Link>
                    ) : (
                      <>
                        {primaryAction.label}
                        {primaryAction.icon || <ArrowRight size={16} weight="bold" />}
                      </>
                    )}
                  </Button>
                  
                  {secondaryAction && (
                    <Button
                      asChild={!!secondaryAction.href}
                      variant="ghost"
                      onClick={secondaryAction.onClick}
                      size="lg"
                      className="w-full text-body font-semibold text-muted-foreground hover:text-foreground"
                    >
                      {secondaryAction.href ? (
                        <Link href={secondaryAction.href}>
                          {secondaryAction.label}
                        </Link>
                      ) : (
                        secondaryAction.label
                      )}
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
