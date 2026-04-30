"use client";

import React, { useState, useMemo } from "react";
import { FileText, Download, Clock, Buildings, Shield, Storefront, HardDrive } from "@phosphor-icons/react";
import { MOCK_AUDIT_LOGS } from "@/features/audit-log/mock-data";
import { AuditLogEntry } from "@/features/audit-log/types";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/ui/button";
import { type DateRange } from "react-day-picker";
import { format, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((log) => {
      // Search matching
      const matchesSearch = 
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.updatedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type matching
      const matchesType = typeFilter === "all" || log.type === typeFilter;

      // Date Range matching
      let matchesDate = true;
      if (dateRange?.from) {
        const logDate = parseISO(log.timestamp.replace(' ', 'T'));
        const end = dateRange.to || dateRange.from;
        matchesDate = isWithinInterval(logDate, { 
          start: dateRange.from, 
          end: new Date(end.setHours(23, 59, 59, 999)) 
        });
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [searchQuery, typeFilter, dateRange]);

  const exportToCsv = () => {
    const headers = ["Activity", "Type", "Description", "Entity", "User", "Timestamp"];
    const rows = filteredLogs.map(log => [
      log.title,
      log.type,
      log.desc,
      log.entity?.name || "N/A",
      log.updatedBy.name,
      log.timestamp
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-log-export-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
            <FileText size={20} weight="bold" />
          </div>
          <div>
            <h1 className="text-heading font-semibold text-foreground text-balance">Audit Log</h1>
            <p className="text-subtle text-body mt-0.5 font-medium">
              Complete chronological record of all administrative actions and system events.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={exportToCsv}
          className="h-10 px-4 font-semibold hover:bg-muted/50 transition-all flex items-center gap-2"
        >
          <Download size={18} weight="bold" />
          Export to CSV
        </Button>
      </div>

      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search activities, descriptions, or users..."
        filters={
          <>
            <FilterItem 
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: "All Types", value: "all" },
                { label: "Approval", value: "Approval" },
                { label: "Creation", value: "Create" },
                { label: "Payout", value: "Payout" },
                { label: "Settings", value: "SettingChange" },
              ]}
            />
            <DateRangePicker 
              value={dateRange}
              onChange={setDateRange}
              placeholder="Date Range"
              align="end"
            />
          </>
        }
      />

      <div className="bg-card rounded-lg border border-border p-8 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.02),transparent_70%)] pointer-events-none" />
        <ActivityTimeline 
          className="relative z-10"
          items={filteredLogs.map(log => ({
            id: log.id,
            title: log.title,
            description: log.desc,
            timestamp: log.timestamp,
            user: log.updatedBy.name,
            type: log.type as any
          }))} 
        />
      </div>
    </div>
  );
}
