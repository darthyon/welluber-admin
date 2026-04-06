"use client";

import React, { useState, useMemo } from "react";
import { Plus, Shield, Buildings, Storefront, MagnifyingGlass, Export, DownloadSimple, Clock, FadersHorizontal } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_ADMINS } from "@/features/users/mock-data";
import { Administrator } from "@/features/users/types";
import { FilterItem } from "@/components/shared/filter-item";
import { SearchableFilterItem } from "@/components/shared/searchable-filter-item";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { SearchBar } from "@/components/shared/search-bar";
import { DataToolbarContainer } from "@/components/shared/data-toolbar";
import { AdminCard } from "@/components/host/users/admin-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdministratorsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const filteredAdmins = useMemo(() => {
    return MOCK_ADMINS.filter((admin) => {
      const matchesSearch = 
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;
      const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
      const matchesEntity = entityFilter === "all" || 
        (admin.entity?.name === entityFilter) || 
        (entityFilter === "Platform Core" && !admin.entity);

      return matchesSearch && matchesRole && matchesStatus && matchesEntity;
    });
  }, [searchQuery, roleFilter, statusFilter, entityFilter]);

  const columns: Column<Administrator>[] = [
    {
      header: "Admin Name",
      accessorKey: "name",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 text-[14px] tracking-tight">{row.name}</span>
          <span className="text-[11px] text-zinc-500 font-medium">{row.email}</span>
        </div>
      )
    },
    {
      header: "Role",
      accessorKey: "role",
      sortable: true,
      render: (row) => (
        <span className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap",
          row.role === "HostAdmin" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
          row.role === "OrgAdmin" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
          "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          {row.role === "HostAdmin" ? "Host admin" : row.role === "OrgAdmin" ? "Org admin" : "SP admin"}
        </span>
      )
    },
    {
      header: "Assigned Entity",
      accessorKey: "entity",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.entity ? (
            <>
              {row.entity.type === "Organization" ? (
                <Buildings size={16} className="text-zinc-400" />
              ) : (
                <Storefront size={16} className="text-zinc-400" />
              )}
              <span className="text-[13px] font-semibold text-zinc-700">{row.entity.name}</span>
            </>
          ) : (
             <div className="flex items-center gap-2">
               <Shield size={16} className="text-primary/60" />
               <span className="text-[12px] font-bold text-primary tracking-tight">Platform Core</span>
             </div>
          )}
        </div>
      )
    },
    {
      header: "Last Login",
      accessorKey: "lastLogin",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
          <Clock size={14} />
          {row.lastLogin}
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      render: (row) => (
        <StatusBadge 
          status={row.status} 
          variant={row.status === "Active" ? "emerald" : "rose"} 
        />
      )
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      align: "right",
      render: (row) => (
        <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all">
          Manage Access
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Administrators</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal opacity-80">
            Configure system access for host, organization, and service provider administrative staff. Define ownership and audit access logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          
          <Button asChild variant="outline" size="sm" className="h-9 text-[13px] font-medium border-border/60 hover:bg-muted/50">
            <Link href="/audit-log">
              <DownloadSimple size={16} className="mr-1.5 opacity-60" />
              Audit Logs
            </Link>
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-[13px] font-medium shadow-sm">
            <Link href="/users/administrators/invite">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Invite Administrator
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DataToolbarContainer 
        search={
          <SearchBar 
            placeholder="Search administrators..." 
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-sm"
          />
        }
        filters={
          <>
            <FilterItem 
              label="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: "All Roles", value: "all" },
                { label: "Host Admin", value: "HostAdmin" },
                { label: "Org Admin", value: "OrgAdmin" },
                { label: "SP Admin", value: "SPAdmin" },
              ]}
            />
            <SearchableFilterItem 
              label="Assigned Entity"
              value={entityFilter}
              onChange={setEntityFilter}
              icon={<Buildings size={14} />}
              options={[
                { label: "All Entities", value: "all" },
                { label: "Platform Core", value: "Platform Core" },
                { label: "Acme Corporation", value: "Acme Corporation" },
                { label: "Global Tech Solutions", value: "Global Tech Solutions" },
                { label: "Nexus Innovations", value: "Nexus Innovations" },
              ]}
            />
          </>
        }
      />

      {/* Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAdmins.map((admin) => (
                <AdminCard key={admin.id} admin={admin} />
              ))}
              {filteredAdmins.length === 0 && (
                <div className="col-span-full py-12">
                  <EmptyState 
                    icon={<MagnifyingGlass size={32} weight="light" />}
                    title="No administrators match your filters"
                    description="Try adjusting your search or filters to find what you're looking for."
                    action={
                      <Button variant="outline" onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setRoleFilter("all");
                        setEntityFilter("all");
                      }}>
                        Clear All Filters
                      </Button>
                    }
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SharedDataTable 
                data={filteredAdmins}
                columns={columns}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
