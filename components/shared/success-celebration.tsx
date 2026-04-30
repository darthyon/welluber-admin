"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SuccessCelebrationProps {
  title: string;
  message: string;
  className?: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"];

export function SuccessCelebration({ title, message, className }: SuccessCelebrationProps) {
  const [particles] = useState(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400 - 50,
      rotate: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
    }))
  );

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center overflow-hidden relative", className)}>
      {/* Confetti Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x: p.x, 
              y: p.y,
              opacity: 0,
              scale: 1,
              rotate: p.rotate
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute z-0 rounded-sm"
            style={{ 
              backgroundColor: p.color, 
              width: p.size, 
              height: p.size 
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Icon with Pop effect */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1 
        }}
        className="relative z-10 w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border-4 border-emerald-500/20 dark:bg-emerald-500/20 shadow-[0_0_20px_rgba(var(--emerald-rgb),0.2)]"
      >
        <CheckCircle size={40} weight="fill" />
      </motion.div>

      {/* Text with fade-in-up */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 space-y-2"
      >
        <h3 className="text-display font-semibold text-foreground tracking-tight">{title}</h3>
        <p className="text-body text-muted-foreground mx-auto max-w-[280px]">
          {message}
        </p>
      </motion.div>
    </div>
  );
}
