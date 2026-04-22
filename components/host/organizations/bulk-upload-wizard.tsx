"use client"

import { useState, useEffect } from "react"
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
  Funnel,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SuccessCelebration } from "@/components/shared/success-celebration"
import { StatusBadge } from "@/components/shared/status-badge"
import { SharedDataTable, Column } from "@/components/shared/data-table"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { FilterItem } from "@/components/shared/filter-item"
import { Badge } from "@/components/ui/badge"

interface BulkUploadWizardProps {
  onBack: () => void
  onSuccess?: () => void
}

type UploadStep = "upload" | "processing" | "preview" | "success"

const MOCK_RECORDS = [
  {
    code: "E001",
    name: "Robert Fox",
    email: "robert.f@acme.com",
    dob: "1990-05-12",
    gender: "male",
    mobile: "012-3456789",
    department: "Engineering",
    role: "Staff",
    date: "2026-04-10",
    policies: "Wellness Allocation",
    status: "Valid",
    branch: "ACME HQ",
  },
  {
    code: "E002",
    name: "Jenny Wilson",
    email: "jenny.w@acme.com",
    dob: "1988-11-24",
    gender: "female",
    mobile: "012-9876543",
    department: "Product",
    role: "Management",
    date: "2026-05-15",
    policies: "Lifestyle Pocket",
    status: "Valid",
    branch: "ACME Subang Jaya",
  },
  {
    code: "E003",
    name: "Dianne Russell",
    email: "dianne.r@acme.com",
    dob: "1995-02-14",
    gender: "female",
    mobile: "017-1112223",
    department: "Design",
    role: "Staff",
    date: "2026-04-01",
    policies: "Wellness Allocation",
    status: "Valid",
    branch: "ACME HQ",
  },
  {
    code: "",
    name: "Unknown User",
    email: "",
    dob: "1992-08-30",
    gender: "other",
    mobile: "",
    department: "HR",
    role: "Staff",
    date: "2026-04-20",
    policies: "Wellness Allocation",
    status: "Issue",
    issue: "Missing code & email",
    branch: "ACME HQ",
  },
  {
    code: "E005",
    name: "Guy Hawkins",
    email: "guy.h@acme.com",
    dob: "Invalid",
    gender: "male",
    mobile: "013-4445556",
    department: "Sales",
    role: "Executive",
    date: "Invalid Date",
    policies: "Wellness Allocation",
    status: "Issue",
    issue: "Invalid DOB, Join Date & ID",
    branch: "ACME HQ",
  },
]

export function BulkUploadWizard({ onBack, onSuccess }: BulkUploadWizardProps) {
  const [step, setStep] = useState<UploadStep>("upload")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [showIssuesOnly, setShowIssuesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setStep("preview")
            return 100
          }
          return prev + 5
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleFileSelect = (name: string) => {
    setFileName(name)
    setStep("processing")
  }

  const handleConfirmImport = () => {
    setStep("success")
    setTimeout(() => {
      onSuccess?.()
    }, 2500)
  }

  const MOCK_RECORDS = [
    {
      id: "rec_0",
      code: "E001",
      name: "Robert Fox",
      email: "robert.f@acme.com",
      dob: "1990-05-12",
      gender: "male",
      mobile: "012-3456789",
      department: "Engineering",
      role: "Staff",
      date: "2026-04-10",
      policies: "Standard Health",
      status: "Valid",
      branch: "ACME HQ",
    },
    {
      id: "rec_1",
      code: "E002",
      name: "Jenny Wilson",
      email: "jenny.w@acme.com",
      dob: "1988-11-24",
      gender: "female",
      mobile: "012-9876543",
      department: "Product",
      role: "Management",
      date: "2026-05-15",
      policies: "Executive Wellness",
      status: "Valid",
      branch: "ACME Subang Jaya",
    },
    {
      id: "rec_2",
      code: "E003",
      name: "Dianne Russell",
      email: "dianne.r@acme.com",
      dob: "1995-02-14",
      gender: "female",
      mobile: "017-1112223",
      department: "Design",
      role: "Staff",
      date: "2026-04-01",
      policies: "Standard Health",
      status: "Valid",
      branch: "ACME HQ",
    },
    {
      id: "rec_3",
      code: "",
      name: "Unknown User",
      email: "",
      dob: "1992-08-30",
      gender: "other",
      mobile: "",
      department: "HR",
      role: "Staff",
      date: "2026-04-20",
      policies: "Standard Health",
      status: "Issue",
      issue: "Missing Code & Email",
      branch: "ACME HQ",
    },
    {
      id: "rec_4",
      code: "E005",
      name: "Guy Hawkins",
      email: "guy.h@acme.com",
      dob: "Invalid",
      gender: "male",
      mobile: "013-4445556",
      department: "Sales",
      role: "Executive",
      date: "Invalid Date",
      policies: "Standard Health",
      status: "Issue",
      issue: "Invalid DOB, Join Date & ID",
      branch: "ACME HQ",
    },
  ]

  const [isEditing, setIsEditing] = useState(false)
  const [records, setRecords] = useState(
    MOCK_RECORDS.map((r, i) => ({ ...r, id: `rec_${i}` }))
  )

  const filteredRecords = records.filter((r) => {
    const matchesIssues = !showIssuesOnly || r.status === "Issue"
    const matchesSearch =
      !searchQuery ||
      [r.name, r.email, r.code, r.department, r.role].some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesIssues && matchesSearch
  })

  const validCount = records.filter((r) => r.status === "Valid").length
  const issueCount = records.filter((r) => r.status === "Issue").length

  const handleRecordChange = (id: string, field: string, value: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const columns: Column<any>[] = [
    {
      header: "Employee ID",
      render: (row) => (
        <div className="flex flex-col">
          {isEditing ? (
            <input
              value={row.code}
              onChange={(e) =>
                handleRecordChange(row.id, "code", e.target.value)
              }
              className={cn(
                "w-20 rounded border border-border bg-background px-2 py-1 text-label font-semibold outline-none focus:border-primary/50",
                !row.code && "border-rose-500/20 bg-rose-500/10 text-rose-400"
              )}
              placeholder="ID"
            />
          ) : (
            <span
              className={cn(
                "text-nav font-semibold tracking-tight",
                !row.code ? "text-rose-500 italic" : "text-foreground"
              )}
            >
              {row.code || "Missing"}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Personal Details",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input
                value={row.dob}
                onChange={(e) =>
                  handleRecordChange(row.id, "dob", e.target.value)
                }
                className={cn(
                  "w-full rounded border border-border bg-background px-2 py-0.5 text-label outline-none focus:border-primary/50",
                  row.dob === "Invalid" &&
                    "border-rose-500/20 bg-rose-500/10 text-rose-400"
                )}
                placeholder="DOB (YYYY-MM-DD)"
              />
              <select
                value={row.gender}
                onChange={(e) =>
                  handleRecordChange(row.id, "gender", e.target.value)
                }
                className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-caption font-semibold"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Calendar
                  size={12}
                  className="text-muted-foreground opacity-60"
                />
                <span
                  className={cn(
                    "text-label font-medium",
                    row.dob === "Invalid"
                      ? "text-rose-400 italic"
                      : "text-foreground"
                  )}
                >
                  {row.dob}
                </span>
              </div>
              <span className="text-micro leading-none font-semibold text-muted-foreground opacity-60">
                {" "}
                {row.gender}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Work Details",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <input
                value={row.department}
                onChange={(e) =>
                  handleRecordChange(row.id, "department", e.target.value)
                }
                className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-caption font-semibold outline-none focus:border-primary/50"
                placeholder="Department"
              />
              <input
                value={row.role}
                onChange={(e) =>
                  handleRecordChange(row.id, "role", e.target.value)
                }
                className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-caption font-semibold outline-none focus:border-primary/50"
                placeholder="Role"
              />
            </div>
          ) : (
            <>
              <span className="text-label leading-none font-semibold text-foreground">
                {row.department}
              </span>
              <span className="text-caption font-medium text-muted-foreground italic opacity-70">
                {row.role}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Contact",
      render: (row) => (
        <div className="flex flex-col">
          {isEditing ? (
            <input
              value={row.mobile}
              onChange={(e) =>
                handleRecordChange(row.id, "mobile", e.target.value)
              }
              className="w-full rounded border border-border bg-background px-2 py-0.5 text-label outline-none focus:border-primary/50"
              placeholder="Mobile Number"
            />
          ) : (
            <span
              className={cn(
                "text-nav font-medium",
                !row.mobile ? "text-rose-400 italic" : "text-muted-foreground"
              )}
            >
              {row.mobile || "Missing Mobile"}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Name / Email",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          {isEditing ? (
            <div className="space-y-1.5">
              <input
                value={row.name}
                onChange={(e) =>
                  handleRecordChange(row.id, "name", e.target.value)
                }
                className="w-full rounded border border-border bg-background px-2 py-1 text-nav font-medium outline-none focus:border-primary/50"
              />
              <input
                value={row.email}
                onChange={(e) =>
                  handleRecordChange(row.id, "email", e.target.value)
                }
                className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-caption outline-none focus:border-primary/50"
              />
            </div>
          ) : (
            <>
              <span className="text-body leading-tight font-semibold tracking-tight text-foreground">
                {row.name}
              </span>
              <span
                className={cn(
                  "text-caption font-medium",
                  row.email
                    ? "text-muted-foreground opacity-70"
                    : "text-rose-400 italic"
                )}
              >
                {row.email || "Missing email"}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      header: "Birth Date",
      render: (row) => (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              value={row.dob}
              onChange={(e) =>
                handleRecordChange(row.id, "dob", e.target.value)
              }
              className={cn(
                "w-full rounded border border-border bg-background px-2 py-1 font-mono text-label outline-none focus:border-primary/50",
                row.dob === "Invalid" &&
                  "border-rose-500/20 bg-rose-500/10 text-rose-400"
              )}
            />
          ) : (
            <span
              className={cn(
                "font-mono text-label",
                row.dob === "Invalid" &&
                  "font-semibold text-rose-600 underline decoration-wavy"
              )}
            >
              {row.dob}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Join Date",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar
            size={14}
            className={
              row.date === "Invalid Date"
                ? "text-rose-500"
                : "text-muted-foreground/60"
            }
          />
          {isEditing ? (
            <input
              value={row.date}
              onChange={(e) =>
                handleRecordChange(row.id, "date", e.target.value)
              }
              className={cn(
                "w-full rounded border border-border bg-background px-2 py-1 font-mono text-label outline-none focus:border-primary/50",
                row.date === "Invalid Date" &&
                  "border-rose-500/20 bg-rose-500/10 text-rose-400"
              )}
            />
          ) : (
            <span
              className={cn(
                "font-mono text-label",
                row.date === "Invalid Date" &&
                  "font-semibold text-rose-600 underline decoration-wavy"
              )}
            >
              {row.date}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branch",
      cellClassName: "text-muted-foreground font-medium",
    },
    {
      header: "Policy",
      render: (row) => (
        <div className="flex items-center gap-2 text-primary/80">
          <Shield size={16} weight="fill" />
          <span className="text-nav font-semibold">{row.policies}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) =>
        row.status === "Valid" ? (
          <div className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-micro leading-none font-semibold text-emerald-400">
            <CheckCircle size={12} weight="fill" /> Valid
          </div>
        ) : (
          <div className="flex w-fit items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-micro leading-none font-semibold text-rose-400">
            <WarningCircle size={12} weight="fill" /> {row.issue || "Issue"}
          </div>
        ),
    },
  ]

  return (
    <div className="animate-in overflow-hidden rounded-lg border border-border bg-card duration-500 fade-in slide-in-from-bottom-4">
      {/* Wizard Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-1 h-8 w-8 text-muted-foreground"
          >
            <ArrowLeft size={18} weight="bold" />
          </Button>
          <div>
            <h3 className="font-semibold text-foreground">
              Bulk Employee Enrollment
            </h3>
            <p className="mt-0.5 text-caption font-medium tracking-wider text-muted-foreground">
              CSV Import Wizard
            </p>
          </div>
        </div>

        {step === "preview" && (
          <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-background px-4 py-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-label font-semibold tracking-tight text-emerald-600">
                {validCount} Valid
              </span>
            </div>
            <div className="h-3 w-[1px] bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-label font-semibold tracking-tight text-rose-600">
                {issueCount} Issues
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="min-h-[400px] p-8">
        {step === "upload" && (
          <div className="mx-auto max-w-xl space-y-8 py-4">
            <div
              className="group flex cursor-pointer flex-col items-center space-y-4 rounded-lg border-2 border-dashed border-border p-16 text-center transition-all hover:border-primary/30 hover:bg-primary/5"
              onClick={() => handleFileSelect("employee_list_2026.csv")}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground shadow-sm transition-all duration-300 group-hover:bg-background group-hover:text-primary">
                <CloudArrowUp size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-section font-semibold text-foreground">
                  Drop your CSV here
                </p>
                <p className="max-w-[280px] text-nav text-muted-foreground">
                  Drag & drop or browse for .csv or .xlsx formats (max 10MB).
                </p>
              </div>
              <Button
                variant="secondary"
                className="mt-2 h-10 rounded-full px-8 font-semibold"
              >
                Select File
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Info size={24} weight="bold" />
                </div>
                <div className="space-y-1">
                  <p className="text-label font-semibold text-primary">
                    Required Columns
                  </p>
                  <p className="text-caption leading-relaxed text-primary/80">
                    Code, Email, First Name, Last Name, DOB, ID Type, ID Number,
                    Join Date, Branch ID.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 rounded-lg border border-border bg-muted/10 p-4">
                <p className="text-label font-semibold text-foreground">
                  Need help formatting?
                </p>
                <button className="text-left text-caption font-semibold text-primary underline hover:text-primary/80">
                  Download Sample Template
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex animate-in flex-col items-center justify-center space-y-8 py-20 text-center duration-300 zoom-in-95">
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <svg className="absolute inset-0 h-full w-full -rotate-90">
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
              <div className="absolute inset-0 flex items-center justify-center text-display font-semibold text-foreground">
                {progress}%
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-heading font-semibold text-foreground">
                Analyzing Records
              </h4>
              <p className="text-body text-muted-foreground">
                Validating record integrity for {fileName}...
              </p>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="animate-in space-y-6 duration-500 fade-in">
            <div className="flex flex-col gap-4 border-b border-border/50 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/5">
                    <FileCsv size={28} weight="fill" />
                  </div>
                  <div>
                    <p className="text-section font-semibold tracking-tight text-foreground">
                      {fileName}
                    </p>
                    <p className="text-label font-medium text-muted-foreground">
                      {records.length} total records identified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("upload")}
                    className="h-10 px-4 font-semibold text-muted-foreground transition-all hover:bg-muted"
                  >
                    Restart
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={showIssuesOnly && issueCount === 0}
                    className="h-10 animate-in bg-primary px-10 font-semibold text-white shadow-lg shadow-primary/20 transition-all fade-in"
                  >
                    Confirm Import{" "}
                    <ArrowRight size={18} className="ml-2" weight="bold" />
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
                          "relative h-4 w-8 cursor-pointer rounded-full transition-all duration-300",
                          isEditing ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all duration-300",
                            isEditing ? "left-[17px]" : "left-0.5"
                          )}
                        />
                      </div>
                      <label
                        className="cursor-pointer text-label font-semibold text-muted-foreground select-none"
                        onClick={() => setIsEditing(!isEditing)}
                      >
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
          <div className="animate-in py-10 duration-500 zoom-in-95">
            <SuccessCelebration
              title="Import Successful"
              message={`${validCount} new employee records have been successfully added to the organization directory.`}
            />
            <div className="mt-12 flex justify-center">
              <Button
                onClick={onBack}
                className="h-12 rounded-full bg-foreground px-12 font-semibold text-background shadow-xl transition-transform hover:scale-[1.02]"
              >
                Return to Directory
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
