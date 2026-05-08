import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CaretUp, CaretDown, ArrowsDownUp, CaretRight, CaretDown as CaretDownExpanded } from "@phosphor-icons/react";

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

export interface ExpandableDataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  isExpanded: (row: T) => boolean;
  onToggleExpand: (row: T) => void;
  renderExpanded: (row: T) => React.ReactNode;
  rowsPerPage?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  defaultSort?: {
    key: keyof T;
    direction: SortDirection;
  };
  ghost?: boolean;
  freezeFirst?: boolean;
  freezeLast?: boolean;
}

export function ExpandableDataTable<T extends { id: string | number }>({
  data,
  columns,
  isExpanded,
  onToggleExpand,
  renderExpanded,
  rowsPerPage = 10,
  className,
  onRowClick,
  defaultSort,
  ghost = false,
  freezeFirst = false,
  freezeLast = false,
}: ExpandableDataTableProps<T>) {
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
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const key = sortConfig.key!;
      let aVal: any = a[key];
      let bVal: any = b[key];

      if (aVal && typeof aVal === "object" && "name" in aVal) aVal = aVal.name;
      if (bVal && typeof bVal === "object" && "name" in bVal) bVal = bVal.name;

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const direction = sortConfig.direction === "asc" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
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
      !ghost ? "rounded-lg border border-border bg-card overflow-hidden shadow-sm" : "bg-transparent border-none shadow-none",
      className
    )}>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/20">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              {columns.map((col, i) => {
                const isSorted = sortConfig.key === col.accessorKey;
                const isFirst = i === 0 && freezeFirst;
                const isLast = i === totalColumns - 1 && freezeLast;
                return (
                  <th
                    key={i}
                    onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                    className={cn(
                      "font-semibold text-subtle text-body p-4 whitespace-nowrap z-20 transition-colors",
                      !ghost ? "bg-muted/30" : "bg-transparent",
                      col.sortable && "cursor-pointer hover:bg-primary/5 hover:text-primary",
                      getCellAlignment(col.align),
                      isSorted && "text-foreground",
                      isFirst && "sticky left-0 z-30 bg-muted shadow-sm border-r border-border/40",
                      isLast && "sticky right-0 z-30 bg-muted shadow-sm border-l border-border/40",
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
              {paginatedData.map((row) => {
                const expanded = isExpanded(row);
                return (
                  <React.Fragment key={row.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "hover:bg-muted/40 group transition-colors",
                        onRowClick && "cursor-pointer",
                        expanded && "bg-muted/20"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((col, i) => {
                        const isFirst = i === 0 && freezeFirst;
                        const isLast = i === totalColumns - 1 && freezeLast;
                        return (
                        <td
                          key={i}
                          className={cn(
                            "p-4 text-body transition-colors",
                            getCellAlignment(col.align),
                            isFirst && "sticky left-0 bg-card z-10 group-hover:bg-muted shadow-sm border-r border-border/40",
                            isLast && "sticky right-0 bg-card z-10 group-hover:bg-muted shadow-sm border-l border-border/40",
                            col.cellClassName
                          )}
                        >
                          {i === 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleExpand(row);
                                }}
                                className="text-faint hover:text-foreground transition-colors shrink-0"
                              >
                                {expanded ? (
                                  <CaretDownExpanded size={16} weight="bold" />
                                ) : (
                                  <CaretRight size={16} weight="bold" />
                                )}
                              </button>
                              <div className="flex-1">
                                {col.render ? col.render(row) : (row[col.accessorKey!] as any)}
                              </div>
                            </div>
                          ) : (
                            col.render ? col.render(row) : (row[col.accessorKey!] as any)
                          )}
                        </td>
                        );
                      })}
                    </motion.tr>
                    {expanded && (
                      <tr className="bg-muted/10 border-b border-border/40">
                        <td colSpan={totalColumns} className="p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {renderExpanded(row)}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={totalColumns} className="p-12 text-center text-muted-foreground text-body font-medium opacity-60">
                  No records found matching your selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className={cn(
          "p-4 flex items-center justify-between text-label text-muted-foreground font-medium transition-all",
          !ghost ? "border-t border-border/60 bg-muted/5" : "bg-transparent border-t border-border/40 px-0"
        )}>
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="text-foreground font-semibold">{startIndex + 1}</span>
            <span>to</span>
            <span className="text-foreground font-semibold">{Math.min(startIndex + rowsPerPage, sortedData.length)}</span>
            <span>of</span>
            <span className="text-foreground font-semibold">{sortedData.length}</span>
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
              <span className="text-foreground font-semibold">{currentPage}</span>
              <span className="mx-1 opacity-40">/</span>
              <span>{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "px-3 py-1.5 rounded-lg border border-border/80 text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed",
                !ghost ? "bg-card hover:bg-muted" : "bg-transparent hover:bg-muted/40"
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
