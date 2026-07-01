import React, { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { CaretUp, CaretDown, ArrowsDownUp } from "@phosphor-icons/react"

export interface Column<T> {
  header: React.ReactNode
  accessorKey?: keyof T
  headerClassName?: string
  cellClassName?: string
  align?: "left" | "center" | "right"
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

type SortDirection = "asc" | "desc" | null

interface SortConfig<T> {
  key: keyof T | null
  direction: SortDirection
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  freezeFirst?: boolean
  freezeLast?: boolean
  rowsPerPage?: number
  className?: string
  onRowClick?: (row: T) => void
  defaultSort?: {
    key: keyof T
    direction: SortDirection
  }
  /**
   * If true, removes the card background, border, and shadow.
   */
  ghost?: boolean
  emptyState?: React.ReactNode
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
  ghost = false,
  emptyState,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(
    defaultSort || { key: null, direction: null }
  )

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key: null, direction: null }
      }
      return { key, direction: "asc" }
    })
    setCurrentPage(1) // Reset to first page on sort
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data

    return [...data].sort((a, b) => {
      const key = sortConfig.key!
      let aVal: unknown = a[key]
      let bVal: unknown = b[key]

      // Extract comparison value (handle objects with name property)
      if (aVal && typeof aVal === "object" && "name" in aVal) aVal = aVal.name
      if (bVal && typeof bVal === "object" && "name" in bVal) bVal = bVal.name

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const direction = sortConfig.direction === "asc" ? 1 : -1

      // Handle simple types
      if (typeof aVal === "string" && typeof bVal === "string") {
        // Check if strings are dates
        const aDate = Date.parse(aVal)
        const bDate = Date.parse(bVal)
        if (
          !isNaN(aDate) &&
          !isNaN(bDate) &&
          (aVal.includes("-") || aVal.includes("/"))
        ) {
          return (aDate - bDate) * direction
        }
        return aVal.localeCompare(bVal) * direction
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * direction
      }

      return 0
    })
  }, [data, sortConfig])

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage)

  const getCellAlignment = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center"
    if (align === "right") return "text-right justify-end"
    return "text-left"
  }

  const totalColumns = columns.length

  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-300",
        !ghost
          ? "overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          : "border-none bg-transparent shadow-none",
        className
      )}
    >
      {/* Scrollable Container */}
      <div className="scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/20 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              {columns.map((col, i) => {
                const isFirst = i === 0 && freezeFirst
                const isLast = i === columns.length - 1 && freezeLast
                const isFirstCol = i === 0
                const isLastCol = i === totalColumns - 1
                const isSorted = sortConfig.key === col.accessorKey

                return (
                  <th
                    key={i}
                    onClick={() =>
                      col.sortable &&
                      col.accessorKey &&
                      handleSort(col.accessorKey)
                    }
                    className={cn(
                      "z-20 p-4 text-label font-medium whitespace-nowrap text-subtle transition-colors",
                      !ghost ? "bg-muted/30" : "bg-transparent",
                      col.sortable &&
                        "cursor-pointer hover:bg-primary/5 hover:text-primary",
                      isFirstCol && !ghost && "rounded-tl-xl",
                      isLastCol && !ghost && "rounded-tr-xl",
                      getCellAlignment(col.align),
                      isFirst &&
                        "sticky left-0 z-30 border-r border-border/40 bg-muted shadow-sm",
                      isLast &&
                        "sticky right-0 z-30 border-l border-border/40 bg-muted shadow-sm",
                      isSorted && "text-foreground",
                      col.headerClassName
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1.5",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      {col.header}
                      {col.sortable && col.accessorKey && (
                        <div className="flex-shrink-0 opacity-40 transition-opacity group-hover:opacity-100">
                          {isSorted ? (
                            sortConfig.direction === "asc" ? (
                              <CaretUp size={12} weight="bold" />
                            ) : (
                              <CaretDown size={12} weight="bold" />
                            )
                          ) : (
                            <ArrowsDownUp size={12} />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: rowIndex * 0.03 }}
                  className={cn(
                    "group transition-colors hover:bg-muted/40",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, i) => {
                    const isFirst = i === 0 && freezeFirst
                    const isLast = i === columns.length - 1 && freezeLast

                    return (
                      <td
                        key={i}
                        className={cn(
                          "p-4 text-body font-normal transition-colors",
                          getCellAlignment(col.align),
                          isFirst &&
                            "sticky left-0 z-10 border-r border-border/40 bg-card shadow-sm group-hover:bg-muted",
                          isLast &&
                            "sticky right-0 z-10 border-l border-border/40 bg-card shadow-sm group-hover:bg-muted",
                          col.cellClassName
                        )}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.accessorKey!] ?? "")}
                      </td>
                    )
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState ?? (
                    <div className="p-12 text-center text-body font-normal text-subtle">
                      No records found matching your selection.
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div
          className={cn(
            "flex items-center justify-between p-4 text-label font-medium text-subtle transition-all",
            !ghost
              ? "border-t border-border/60 bg-muted/5"
              : "border-t border-border/40 bg-transparent px-0"
          )}
        >
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-medium text-foreground">
              {startIndex + 1}
            </span>
            <span>to</span>
            <span className="font-medium text-foreground">
              {Math.min(startIndex + rowsPerPage, sortedData.length)}
            </span>
            <span>of</span>
            <span className="font-medium text-foreground">
              {sortedData.length}
            </span>
            <span>records</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={cn(
                "rounded-lg border border-border/80 px-3 py-1.5 text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-30",
                !ghost
                  ? "bg-card hover:bg-muted"
                  : "bg-transparent hover:bg-muted/40"
              )}
            >
              Previous
            </button>
            <div className="flex items-center px-1.5">
              <span className="font-semibold text-foreground">
                {currentPage}
              </span>
              <span className="mx-1 text-faint">/</span>
              <span>{totalPages}</span>
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={cn(
                "rounded-lg border border-border/80 px-3 py-1.5 text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-30",
                !ghost
                  ? "bg-card hover:bg-muted"
                  : "bg-transparent hover:bg-muted/40 dark:hover:bg-background/5"
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
