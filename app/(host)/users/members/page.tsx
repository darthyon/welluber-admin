"use client";

import React, { useState, useMemo } from "react";
import { Plus, Users, Buildings, TreeStructure, MagnifyingGlass, Export, Funnel, DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_MEMBERS } from "@/features/users/mock-data";
import { Member } from "@/features/users/types";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { SearchableFilterItem } from "@/components/shared/searchable-filter-item";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { MemberCard } from "@/components/host/users/member-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default function MembersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const filteredMembers = useMemo(() => {
    return MOCK_MEMBERS.filter((member) => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || member.type === typeFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      const matchesOrg = orgFilter === "all" || member.organization.name === orgFilter;
      const matchesBranch = branchFilter === "all" || member.branch?.name === branchFilter;

      return matchesSearch && matchesType && matchesStatus && matchesOrg && matchesBranch;
    });
  }, [searchQuery, typeFilter, statusFilter, orgFilter, branchFilter]);

  const columns: Column<Member>[] = [
    {
      header: "Member Name",
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
      header: "Type",
      accessorKey: "type",
      sortable: true,
      render: (row) => (
        <span className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold border",
          row.type === "Employee" 
            ? "bg-blue-50 text-blue-600 border-blue-100" 
            : "bg-purple-50 text-purple-600 border-purple-100"
        )}>
          {row.type}
        </span>
      )
    },
    {
      header: "Organization",
      accessorKey: "organization",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Buildings size={16} className="text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">{row.organization.name}</span>
        </div>
      )
    },
    {
      header: "Branch",
      accessorKey: "branch",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <TreeStructure size={16} className="text-zinc-400" />
          <span className="text-[13px] font-medium text-zinc-600">{row.branch?.name || "-"}</span>
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
          variant={row.status === "Active" ? "emerald" : row.status === "Pending" ? "amber" : "rose"} 
        />
      )
    },
    {
      header: "Joined Date",
      accessorKey: "joinedDate",
      sortable: true,
      headerClassName: "text-right",
      align: "right",
      render: (row) => (
        <span className="text-[12px] font-medium text-zinc-500">{row.joinedDate}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Members</h1>
          <p className="text-muted-foreground text-[13px] mt-1 font-normal opacity-80">
            Manage your global workforce members, including employees and their dependents. Audit eligibility and track activation status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          
          <Button variant="outline" size="sm" className="h-9 text-[13px] font-medium border-border/60 hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button asChild className="h-9 text-[13px] font-medium shadow-sm">
            <Link href="/users/members/new">
              <Plus size={16} weight="bold" className="mr-1.5" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search members..."
        filters={
          <>
            <FilterItem 
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: "All Types", value: "all" },
                { label: "Employee", value: "Employee" },
                { label: "Dependent", value: "Dependent" },
              ]}
            />
            <FilterItem 
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "Active" },
                { label: "Pending", value: "Pending" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
            <SearchableFilterItem 
              label="Organization"
              value={orgFilter}
              onChange={setOrgFilter}
              icon={<Buildings size={14} />}
              options={[
                { label: "All Organisations", value: "all" },
                { label: "TechCorp Solutions", value: "TechCorp Solutions" },
                { label: "WellUber Global", value: "WellUber Global" },
                { label: "MediCare Group", value: "MediCare Group" },
              ]}
            />
            <SearchableFilterItem 
              label="Branch"
              value={branchFilter}
              onChange={setBranchFilter}
              icon={<TreeStructure size={14} />}
              options={[
                { label: "All Branches", value: "all" },
                { label: "Main HQ", value: "Main HQ" },
                { label: "KL Office", value: "KL Office" },
                { label: "Penang Branch", value: "Penang Branch" },
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
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              {filteredMembers.length === 0 && (
                <div className="col-span-full py-12">
                  <EmptyState 
                    icon={<MagnifyingGlass size={32} weight="light" />}
                    title="No members match your filters"
                    description="Try adjusting your search or filters to find what you're looking for."
                    action={
                      <Button variant="outline" onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setOrgFilter("");
                        setBranchFilter("");
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
                data={filteredMembers}
                columns={columns}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
