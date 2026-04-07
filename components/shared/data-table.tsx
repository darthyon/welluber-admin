import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CaretUp, CaretDown, ArrowsDownUp } from "@phosphor-icons/react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

type SortDirection = "asc" | "desc" | null;

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  freezeFirst?: boolean;
  freezeLast?: boolean;
  rowsPerPage?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  defaultSort?: {
    key: keyof T;
    direction: SortDirection;
  };
  /**
   * If true, removes the card background, border, and shadow.
   */
  ghost?: boolean;
}

export function SharedDataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  freezeFirst = false, 
  freezeLast = false, 
  rowsPerPage = 10,
  className,
  onRowClick,
  defaultSort,
  ghost = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(
    defaultSort || { key: null, direction: null }
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1); // Reset to first page on sort
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const key = sortConfig.key!;
      let aVal: any = a[key];
      let bVal: any = b[key];

      // Extract comparison value (handle objects with name property)
      if (aVal && typeof aVal === "object" && "name" in aVal) aVal = aVal.name;
      if (bVal && typeof bVal === "object" && "name" in bVal) bVal = bVal.name;

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const direction = sortConfig.direction === "asc" ? 1 : -1;

      // Handle simple types
      if (typeof aVal === "string" && typeof bVal === "string") {
        // Check if strings are dates
        const aDate = Date.parse(aVal);
        const bDate = Date.parse(bVal);
        if (!isNaN(aDate) && !isNaN(bDate) && (aVal.includes("-") || aVal.includes("/"))) {
          return (aDate - bDate) * direction;
        }
        return aVal.localeCompare(bVal) * direction;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * direction;
      }

      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const getCellAlignment = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right justify-end";
    return "text-left";
  };

  const totalColumns = columns.length;

  return (
    <div className={cn(
      "transition-all duration-300 flex flex-col",
      !ghost ? "rounded-xl border border-border bg-card overflow-hidden shadow-sm" : "bg-transparent border-none shadow-none",
      className
    )}>
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
                const isSorted = sortConfig.key === col.accessorKey;
                
                return (
                  <th 
                    key={i} 
                    onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                    className={cn(
                      "font-semibold text-muted-foreground text-[13px] p-4 whitespace-nowrap z-20 tracking-tight transition-colors",
                      !ghost ? "bg-zinc-50 dark:bg-muted/30" : "bg-transparent dark:bg-transparent",
                      col.sortable && "cursor-pointer hover:bg-zinc-100 hover:text-foreground dark:hover:bg-muted/40",
                      (isFirstCol && !ghost) && "rounded-tl-xl",
                      (isLastCol && !ghost) && "rounded-tr-xl",
                      getCellAlignment(col.align),
                      isFirst && "sticky left-0 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]",
                      isLast && "sticky right-0 z-30 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]",
                      isSorted && "text-foreground",
                      col.headerClassName
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-1.5",
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center"
                    )}>
                      {col.header}
                      {col.sortable && col.accessorKey && (
                        <div className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                          {isSorted ? (
                            sortConfig.direction === "asc" ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
                          ) : (
                            <ArrowsDownUp size={12} />
                          )}
                        </div>
                      )}
                    </div>
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
            {sortedData.length === 0 && (
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
        <div className={cn(
          "p-4 flex items-center justify-between text-[12px] text-muted-foreground font-medium transition-all",
          !ghost ? "border-t border-border/60 bg-muted/5" : "bg-transparent border-t border-border/40 px-0"
        )}>
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="text-foreground font-bold">{startIndex + 1}</span>
            <span>to</span>
            <span className="text-foreground font-bold">{Math.min(startIndex + rowsPerPage, sortedData.length)}</span>
            <span>of</span>
            <span className="text-foreground font-bold">{sortedData.length}</span>
            <span>records</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn(
                "px-3 py-1.5 rounded-lg border border-border/80 text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                !ghost ? "bg-card hover:bg-muted" : "bg-transparent hover:bg-muted/40"
              )}
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
              className={cn(
                "px-3 py-1.5 rounded-lg border border-border/80 text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                !ghost ? "bg-card hover:bg-muted" : "bg-transparent hover:bg-muted/40 dark:hover:bg-white/5"
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
