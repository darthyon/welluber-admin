"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  freezeFirst?: boolean;
  freezeLast?: boolean;
  rowsPerPage?: number;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function SharedDataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  freezeFirst = false, 
  freezeLast = false, 
  rowsPerPage = 10,
  className,
  onRowClick
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const getCellAlignment = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right justify-end";
    return "text-left";
  };

  const totalColumns = columns.length;

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm", className)}>
      {/* Scrollable Container */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/20">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-border/60 bg-zinc-50 dark:bg-muted/30">
              {columns.map((col, i) => {
                const isFirst = i === 0 && freezeFirst;
                const isLast = i === columns.length - 1 && freezeLast;
                const isFirstCol = i === 0;
                const isLastCol = i === totalColumns - 1;
                
                return (
                  <th 
                    key={i} 
                    className={cn(
                      "font-semibold text-muted-foreground text-[13px] p-4 whitespace-nowrap bg-zinc-50 dark:bg-muted/30 z-20 tracking-tight",
                      isFirstCol && "rounded-tl-xl",
                      isLastCol && "rounded-tr-xl",
                      getCellAlignment(col.align),
                      isFirst && "sticky left-0 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]",
                      isLast && "sticky right-0 z-30 shadow-[-4px_0_12_px_-4px_rgba(0,0,0,0.05)]",
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((row, rowIndex) => (
                <motion.tr 
                  key={row.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, delay: rowIndex * 0.03 }}
                  className={cn(
                    "hover:bg-muted/30 transition-all group",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, i) => {
                    const isFirst = i === 0 && freezeFirst;
                    const isLast = i === columns.length - 1 && freezeLast;
                    
                    return (
                      <td 
                        key={i} 
                        className={cn(
                          "p-4 text-[13px] transition-colors",
                          getCellAlignment(col.align),
                          isFirst && "sticky left-0 bg-card z-10 group-hover:bg-muted/40 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]",
                          isLast && "sticky right-0 bg-card z-10 group-hover:bg-muted/40 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]",
                          col.cellClassName
                        )}
                      >
                        {col.render ? col.render(row) : (row[col.accessorKey!] as any)}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-muted-foreground text-[14px] font-medium opacity-60">
                  No records found matching your selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className="p-4 border-t border-border/60 bg-muted/5 flex items-center justify-between text-[12px] text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="text-foreground font-bold">{startIndex + 1}</span>
            <span>to</span>
            <span className="text-foreground font-bold">{Math.min(startIndex + rowsPerPage, data.length)}</span>
            <span>of</span>
            <span className="text-foreground font-bold">{data.length}</span>
            <span>records</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground transition-all disabled:opacity-30 disabled:hover:bg-card disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center px-1.5">
              <span className="text-foreground font-bold">{currentPage}</span>
              <span className="mx-1 opacity-40">/</span>
              <span>{totalPages}</span>
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-foreground transition-all disabled:opacity-30 disabled:hover:bg-card disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
