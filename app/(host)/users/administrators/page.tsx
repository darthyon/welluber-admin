"use client";

import React, { useState, useMemo } from "react";
import { Plus, Shield, Buildings, Storefront, MagnifyingGlass, Export, DownloadSimple, Clock, FadersHorizontal } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_ADMINS } from "@/features/users/mock-data";
import { Administrator } from "@/features/users/types";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { SearchableFilterItem } from "@/components/shared/searchable-filter-item";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { AdminCard } from "@/components/host/users/admin-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdministratorsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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
          <span className="font-semibold text-foreground text-body tracking-tight">{row.name}</span>
          <span className="text-caption text-muted-foreground font-medium">{row.email}</span>
        </div>
      )
    },
    {
      header: "User Type",
      accessorKey: "role",
      sortable: true,
      render: (row) => (
        <span className={cn(
          "px-2 py-0.5 rounded-md text-micro font-semibold border whitespace-nowrap",
          row.role === "HostAdmin" ? "bg-primary/10 text-primary border-primary/20" :
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
                <Buildings size={16} className="text-muted-foreground/60" />
              ) : (
                <Storefront size={16} className="text-muted-foreground/60" />
              )}
              <span className="text-nav font-semibold text-foreground">{row.entity.name}</span>
            </>
          ) : (
             <div className="flex items-center gap-2">
               <Shield size={16} className="text-primary/60" />
               <span className="text-label font-semibold text-primary tracking-tight">Platform Core</span>
             </div>
          )}
        </div>
      )
    },
    {
      header: "Joined Date",
      accessorKey: "joinedDate",
      sortable: true,
      render: (row) => (
        <span className="text-label font-medium text-muted-foreground">
          {row.joinedDate}
        </span>
      )
    },
    {
      header: "Last Active",
      accessorKey: "lastActive",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 text-label font-medium text-muted-foreground">
          <Clock size={14} />
          {row.lastActive}
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
        <Button variant="ghost" size="sm" className="h-8 text-caption font-semibold text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all">
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
          <h1 className="text-heading font-semibold tracking-tight text-foreground">Administrators</h1>
          <p className="text-muted-foreground text-nav mt-1 font-normal opacity-80">
            Configure system access for host, organization, and service provider administrative staff. Define ownership and audit access logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          
          <Button asChild variant="ghost" size="sm" className="h-9 text-nav font-medium hover:bg-muted/50">
            <Link href="/audit-log">
              <DownloadSimple size={16} className="mr-1.5 opacity-60" />
              Audit Logs
            </Link>
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-nav font-medium shadow-sm">
            <Link href="/users/administrators/invite">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Invite Administrator
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search administrators..."
        filters={
          <>
            <FilterItem 
              label="User Type"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: "All User Types", value: "all" },
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
                      <Button variant="ghost" onClick={() => {
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
