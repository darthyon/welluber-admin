"use client";

import { useState, useEffect } from "react";
import { 
  CloudArrowUp, 
  FileCsv, 
  CheckCircle, 
  WarningCircle, 
  Info,
  ArrowRight,
  Shield,
  ArrowLeft,
  Calendar,
  Funnel
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { StatusBadge } from "@/components/shared/status-badge";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { DataFilterBar } from "@/components/shared/data-filter-bar";
import { FilterItem } from "@/components/shared/filter-item";
import { Badge } from "@/components/ui/badge";

interface BulkUploadWizardProps {
  onBack: () => void;
  onSuccess?: () => void;
}

type UploadStep = "upload" | "processing" | "preview" | "success";

const MOCK_RECORDS = [
  { code: "E001", name: "Robert Fox", email: "robert.f@acme.com", dob: "1990-05-12", gender: "male", mobile: "012-3456789", department: "Engineering", role: "Staff", date: "2026-04-10", policies: "Wellness Allocation", status: "Valid", branch: "ACME HQ" },
  { code: "E002", name: "Jenny Wilson", email: "jenny.w@acme.com", dob: "1988-11-24", gender: "female", mobile: "012-9876543", department: "Product", role: "Management", date: "2026-05-15", policies: "Lifestyle Pocket", status: "Valid", branch: "ACME Subang Jaya" },
  { code: "E003", name: "Dianne Russell", email: "dianne.r@acme.com", dob: "1995-02-14", gender: "female", mobile: "017-1112223", department: "Design", role: "Staff", date: "2026-04-01", policies: "Wellness Allocation", status: "Valid", branch: "ACME HQ" },
  { code: "", name: "Unknown User", email: "", dob: "1992-08-30", gender: "other", mobile: "", department: "HR", role: "Staff", date: "2026-04-20", policies: "Wellness Allocation", status: "Issue", issue: "Missing code & email", branch: "ACME HQ" },
  { code: "E005", name: "Guy Hawkins", email: "guy.h@acme.com", dob: "Invalid", gender: "male", mobile: "013-4445556", department: "Sales", role: "Executive", date: "Invalid Date", policies: "Wellness Allocation", status: "Issue", issue: "Invalid DOB, Join Date & ID", branch: "ACME HQ" },
];

export function BulkUploadWizard({ onBack, onSuccess }: BulkUploadWizardProps) {
  const [step, setStep] = useState<UploadStep>("upload");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep("preview");
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleFileSelect = (name: string) => {
    setFileName(name);
    setStep("processing");
  };

  const handleConfirmImport = () => {
    setStep("success");
    setTimeout(() => {
      onSuccess?.();
    }, 2500);
  };

  const MOCK_RECORDS = [
    { id: "rec_0", code: "E001", name: "Robert Fox", email: "robert.f@acme.com", dob: "1990-05-12", gender: "male", mobile: "012-3456789", department: "Engineering", role: "Staff", date: "2026-04-10", policies: "Standard Health", status: "Valid", branch: "ACME HQ" },
    { id: "rec_1", code: "E002", name: "Jenny Wilson", email: "jenny.w@acme.com", dob: "1988-11-24", gender: "female", mobile: "012-9876543", department: "Product", role: "Management", date: "2026-05-15", policies: "Executive Wellness", status: "Valid", branch: "ACME Subang Jaya" },
    { id: "rec_2", code: "E003", name: "Dianne Russell", email: "dianne.r@acme.com", dob: "1995-02-14", gender: "female", mobile: "017-1112223", department: "Design", role: "Staff", date: "2026-04-01", policies: "Standard Health", status: "Valid", branch: "ACME HQ" },
    { id: "rec_3", code: "", name: "Unknown User", email: "", dob: "1992-08-30", gender: "other", mobile: "", department: "HR", role: "Staff", date: "2026-04-20", policies: "Standard Health", status: "Issue", issue: "Missing Code & Email", branch: "ACME HQ" },
    { id: "rec_4", code: "E005", name: "Guy Hawkins", email: "guy.h@acme.com", dob: "Invalid", gender: "male", mobile: "013-4445556", department: "Sales", role: "Executive", date: "Invalid Date", policies: "Standard Health", status: "Issue", issue: "Invalid DOB, Join Date & ID", branch: "ACME HQ" },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [records, setRecords] = useState(MOCK_RECORDS.map((r, i) => ({ ...r, id: `rec_${i}` })));

  const filteredRecords = records.filter(r => {
    const matchesIssues = !showIssuesOnly || r.status === "Issue";
    const matchesSearch = !searchQuery || 
      [r.name, r.email, r.code, r.department, r.role].some(field => 
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesIssues && matchesSearch;
  });

  const validCount = records.filter(r => r.status === "Valid").length;
  const issueCount = records.filter(r => r.status === "Issue").length;

  const handleRecordChange = (id: string, field: string, value: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const columns: Column<any>[] = [
    {
      header: "Employee ID",
      render: (row) => (
        <div className="flex flex-col">
          {isEditing ? (
            <input 
              value={row.code} 
              onChange={(e) => handleRecordChange(row.id, "code", e.target.value)}
              className={cn(
                "w-20 text-[12px] font-bold bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary/50",
                !row.code && "border-rose-500/20 text-rose-400 bg-rose-500/10"
              )}
              placeholder="ID"
            />
          ) : (
            <span className={cn("text-[13px] font-bold tracking-tight", !row.code ? "text-rose-500 italic" : "text-foreground")}>
              {row.code || "Missing"}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Personal Details",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input 
                value={row.dob} 
                onChange={(e) => handleRecordChange(row.id, "dob", e.target.value)}
                className={cn(
                  "w-full text-[12px] bg-background border border-border rounded px-2 py-0.5 outline-none focus:border-primary/50",
                  row.dob === "Invalid" && "border-rose-500/20 text-rose-400 bg-rose-500/10"
                )}
                placeholder="DOB (YYYY-MM-DD)"
              />
              <select 
                value={row.gender} 
                onChange={(e) => handleRecordChange(row.id, "gender", e.target.value)}
                className="w-full text-[11px] font-bold bg-background border border-border rounded px-1.5 py-0.5"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-muted-foreground opacity-60" />
                <span className={cn("text-[12px] font-medium", row.dob === "Invalid" ? "text-rose-400 italic" : "text-foreground")}>
                  {row.dob}
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground opacity-60 leading-none"> {row.gender}</span>
            </>
          )}
        </div>
      )
    },
    {
      header: "Work Details",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input 
                value={row.department} 
                onChange={(e) => handleRecordChange(row.id, "department", e.target.value)}
                className="w-full text-[11px] font-bold bg-background border border-border rounded px-1.5 py-0.5 outline-none focus:border-primary/50"
                placeholder="Department"
              />
              <input 
                value={row.role} 
                onChange={(e) => handleRecordChange(row.id, "role", e.target.value)}
                className="w-full text-[11px] font-bold bg-background border border-border rounded px-1.5 py-0.5 outline-none focus:border-primary/50"
                placeholder="Role"
              />
            </div>
          ) : (
            <>
              <span className="text-[12px] font-bold text-foreground leading-none">{row.department}</span>
              <span className="text-[11px] font-medium text-muted-foreground opacity-70 italic">{row.role}</span>
            </>
          )}
        </div>
      )
    },
    {
       header: "Contact",
       render: (row) => (
         <div className="flex flex-col">
            {isEditing ? (
              <input 
                value={row.mobile} 
                onChange={(e) => handleRecordChange(row.id, "mobile", e.target.value)}
                className="w-full text-[12px] bg-background border border-border rounded px-2 py-0.5 outline-none focus:border-primary/50"
                placeholder="Mobile Number"
              />
            ) : (
              <span className={cn("text-[13px] font-medium", !row.mobile ? "text-rose-400 italic" : "text-muted-foreground")}>
                {row.mobile || "Missing Mobile"}
              </span>
            )}
         </div>
       )
    },
    {
      header: "Name / Email",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          {isEditing ? (
            <div className="space-y-1.5">
              <input 
                value={row.name} 
                onChange={(e) => handleRecordChange(row.id, "name", e.target.value)}
                className="w-full text-[13px] font-medium bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary/50"
              />
              <input 
                value={row.email} 
                onChange={(e) => handleRecordChange(row.id, "email", e.target.value)}
                className="w-full text-[11px] bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono"
              />
            </div>
          ) : (
            <>
              <span className="font-semibold text-foreground text-[14px] leading-tight tracking-tight">{row.name}</span>
              <span className={cn("text-[11px] font-medium", row.email ? "text-muted-foreground opacity-70" : "text-rose-400 italic")}>
                {row.email || "Missing email"}
              </span>
            </>
          )}
        </div>
      )
    },
    {
      header: "Birth Date",
      render: (row) => (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input 
              value={row.dob} 
              onChange={(e) => handleRecordChange(row.id, "dob", e.target.value)}
              className={cn(
                "w-full text-[12px] font-mono bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary/50",
                row.dob === "Invalid" && "border-rose-500/20 text-rose-400 bg-rose-500/10"
              )}
            />
          ) : (
            <span className={cn("font-mono text-[12px]", row.dob === "Invalid" && "text-rose-600 font-bold underline decoration-wavy")}>
              {row.dob}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Join Date",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className={row.date === "Invalid Date" ? "text-rose-500" : "text-muted-foreground/60"} />
          {isEditing ? (
            <input 
              value={row.date} 
              onChange={(e) => handleRecordChange(row.id, "date", e.target.value)}
              className={cn(
                "w-full text-[12px] font-mono bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary/50",
                row.date === "Invalid Date" && "border-rose-500/20 text-rose-400 bg-rose-500/10"
              )}
            />
          ) : (
            <span className={cn("font-mono text-[12px]", row.date === "Invalid Date" && "text-rose-600 font-bold underline decoration-wavy")}>
              {row.date}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Branch",
      accessorKey: "branch",
      cellClassName: "text-muted-foreground font-medium"
    },
    {
      header: "Policy",
      render: (row) => (
        <div className="flex items-center gap-2 text-primary/80">
          <Shield size={16} weight="fill" />
          <span className="font-semibold text-[13px]">{row.policies}</span>
        </div>
      )
    },
    {
      header: "Status",
      render: (row) => (
        row.status === "Valid" ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full border border-emerald-500/20 leading-none">
            <CheckCircle size={12} weight="fill" /> Valid
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px] bg-rose-500/10 w-fit px-2 py-0.5 rounded-full border border-rose-500/20 leading-none">
            <WarningCircle size={12} weight="fill" /> {row.issue || "Issue"}
          </div>
        )
      )
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Wizard Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 text-muted-foreground mr-1">
            <ArrowLeft size={18} weight="bold" />
          </Button>
          <div>
            <h3 className="font-bold text-foreground">Bulk Employee Enrollment</h3>
            <p className="text-[11px] text-muted-foreground font-medium tracking-wider mt-0.5">CSV Import Wizard</p>
          </div>
        </div>
        
        {step === "preview" && (
           <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-lg border border-border/50">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[12px] font-bold text-emerald-600 tracking-tight">{validCount} Valid</span>
             </div>
             <div className="w-[1px] h-3 bg-border" />
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-rose-500" />
               <span className="text-[12px] font-bold text-rose-600 tracking-tight">{issueCount} Issues</span>
             </div>
           </div>
        )}
      </div>

      <div className="p-8 min-h-[400px]">
        {step === "upload" && (
          <div className="max-w-xl mx-auto space-y-8 py-4">
            <div 
              className="border-2 border-dashed border-border rounded-2xl p-16 flex flex-col items-center text-center space-y-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
              onClick={() => handleFileSelect("employee_list_2026.csv")}
            >
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-background group-hover:text-primary transition-all duration-300 shadow-sm">
                <CloudArrowUp size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-[16px] font-bold text-foreground">Drop your CSV here</p>
                <p className="text-[13px] text-muted-foreground max-w-[280px]">Drag & drop or browse for .csv or .xlsx formats (max 10MB).</p>
              </div>
              <Button variant="secondary" className="rounded-full px-8 h-10 mt-2 font-bold">
                Select File
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Info size={24} weight="bold" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-primary">Required Columns</p>
                    <p className="text-[11px] text-primary/80 leading-relaxed">Code, Email, First Name, Last Name, DOB, ID Type, ID Number, Join Date, Branch ID.</p>
                  </div>
               </div>
               <div className="bg-muted/10 rounded-xl p-4 border border-border flex flex-col gap-2 justify-center">
                  <p className="text-[12px] font-bold text-foreground">Need help formatting?</p>
                  <button className="text-[11px] font-bold text-primary underline text-left hover:text-primary/80">
                    Download Sample Template
                  </button>
               </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-8 animate-in zoom-in-95 duration-300">
             <div className="relative w-28 h-28">
                <div className="absolute inset-0 border-4 border-muted rounded-full" />
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    className="text-primary transition-all duration-200"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    r="52"
                    cx="56"
                    cy="56"
                    strokeDasharray={326.7}
                    strokeDashoffset={326.7 * (1 - progress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-foreground">
                  {progress}%
                </div>
             </div>
             <div className="space-y-2">
               <h4 className="text-xl font-bold text-foreground">Analyzing Records</h4>
               <p className="text-muted-foreground text-[14px]">Validating record integrity for {fileName}...</p>
             </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col gap-4 py-3 border-b border-border/50">
               <div className="flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-500/5">
                       <FileCsv size={28} weight="fill" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-foreground tracking-tight">{fileName}</p>
                      <p className="text-[12px] text-muted-foreground font-medium">{records.length} total records identified</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setStep("upload")} className="text-muted-foreground font-bold hover:bg-muted font-bold transition-all h-10 px-4">Restart</Button>
                    <Button onClick={handleConfirmImport} disabled={showIssuesOnly && issueCount === 0} className="bg-primary text-white font-bold px-10 shadow-lg shadow-primary/20 h-10 animate-in fade-in transition-all">
                      Confirm Import <ArrowRight size={18} className="ml-2" weight="bold" />
                    </Button>
                 </div>
               </div>

               <DataFilterBar
                 searchQuery={searchQuery}
                 onSearchChange={setSearchQuery}
                 searchPlaceholder="Search identified records..."
                 filters={
                   <div className="flex items-center gap-6">
                     <FilterItem
                       label="Issues"
                       value={showIssuesOnly ? "issues" : "all"}
                       onChange={(v) => setShowIssuesOnly(v === "issues")}
                       options={[
                         { label: "All Records", value: "all" },
                         { label: "Issues Only", value: "issues" },
                       ]}
                     />
                     <div className="flex items-center space-x-2">
                       <div 
                         onClick={() => setIsEditing(!isEditing)}
                         className={cn(
                           "w-8 h-4 rounded-full relative transition-all duration-300 cursor-pointer",
                           isEditing ? "bg-primary" : "bg-zinc-300"
                         )}
                       >
                         <div className={cn(
                           "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm",
                           isEditing ? "left-[17px]" : "left-0.5"
                         )} />
                       </div>
                       <label className="text-[12px] font-bold text-muted-foreground select-none cursor-pointer" onClick={() => setIsEditing(!isEditing)}>
                         Quick Edit
                       </label>
                     </div>
                   </div>
                 }
               />
             </div>

            <SharedDataTable 
              data={filteredRecords}
              columns={columns}
              rowsPerPage={5}
              className="border-border/60"
            />
          </div>
        )}

        {step === "success" && (
          <div className="py-10 animate-in zoom-in-95 duration-500">
            <SuccessCelebration 
              title="Import Successful"
              message={`${validCount} new employee records have been successfully added to the organization directory.`}
            />
            <div className="mt-12 flex justify-center">
               <Button onClick={onBack} className="bg-foreground text-background font-bold px-12 rounded-full h-12 shadow-xl hover:scale-[1.02] transition-transform">
                  Return to Directory
               </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
