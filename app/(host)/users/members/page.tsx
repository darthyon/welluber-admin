"use client";

import React, { useState, useMemo } from "react";
import { Buildings, TreeStructure, MagnifyingGlass, DownloadSimple, Eye, PencilSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { MOCK_MEMBERS } from "@/lib/mock-data";
import { Member } from "@/features/users/types";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { SearchableFilterItem } from "@/components/shared/searchable-filter-item";
import { ViewToggle, ViewMode } from "@/components/shared/view-toggle";
import { MemberCard } from "@/components/host/users/member-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { ActionPopover } from "@/components/shared/action-popover";

export default function MembersPage() {
  const mounted = useMounted();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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
      header: "Member",
      accessorKey: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <EntityAvatar name={row.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-body hover:text-primary transition-colors cursor-pointer">{row.name}</span>
            <span className="text-label text-subtle font-medium">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      render: (row) => (
        <Badge variant="secondary" className="text-label font-medium whitespace-nowrap">
          {row.type}
        </Badge>
      )
    },
    {
              header: "Organisation",
      accessorKey: "organization",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Buildings size={16} className="text-faint" />
          <span className="text-body font-medium text-subtle">{row.organization.name}</span>
        </div>
      )
    },
    {
      header: "Branch",
      accessorKey: "branch",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <TreeStructure size={16} className="text-faint" />
          <span className="text-body font-medium text-subtle">{row.branch?.name || "-"}</span>
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
      render: (row) => (
        <span className="text-label font-medium text-subtle">{row.joinedDate}</span>
      )
    },
    {
      header: "Last Active",
      accessorKey: "lastActive",
      sortable: true,
      render: (row) => (
        <span className="text-label font-medium text-subtle">{row.lastActive}</span>
      )
    },
    {
      header: "",
      headerClassName: "text-right",
      align: "right",
      render: (row) => (
        <div className="flex justify-end">
          <ActionPopover
            actions={[
              {
                label: "View member",
                icon: <Eye size={16} />,
                onClick: () => console.log("view", row.id),
              },
              {
                label: "Edit member",
                icon: <PencilSimple size={16} />,
                onClick: () => console.log("edit", row.id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Members</h1>
          <p className="text-subtle text-body mt-1 font-normal">
            Record of global workforce members, including employees and their dependents who have signed up on the app. Track activation status and member activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          
          <Button variant="ghost" size="sm" className="h-9 text-body font-medium hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>

        </div>
      </div>

      {/* Toolbar */}
      {mounted ? (
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
                label="Organisation"
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
      ) : (
        <div className="h-10 w-full" />
      )}

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
                      <Button variant="ghost" onClick={() => {
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
              <SharedDataTable freezeFirst freezeLast 
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
