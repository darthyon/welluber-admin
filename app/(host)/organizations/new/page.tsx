"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CaretLeft,
  Buildings,
  NavigationArrow,
  WarningCircle,
  IdentificationCard,
  MapPin,
  Bank,
  Building,
  Wallet,
  CheckCircle,
  ArrowLeft,
  CalendarBlank,
  CaretDown,
} from "@phosphor-icons/react";
import { format, parse, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createOrganizationSchema, CreateOrganizationData, HqBranchData } from "@/features/organizations/schemas";
import { createOrganization, createHqBranch } from "@/features/organizations/actions";
import { Button } from "@/components/ui/button";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { LocationPicker } from "@/components/shared/location-picker";
import type { LocationData } from "@/components/shared/location-picker";
import { DocumentUploadSection } from "@/components/shared/document-upload-section";
import { FormSelect } from "@/components/shared/form-select";
import { ChoiceCard } from "@/components/shared/choice-card";
import { MALAYSIAN_BANKS } from "@/lib/constants/banks";
import { MOCK_ACCOUNTS } from "@/lib/mock-data";
import { toast } from "sonner";

const STEP1_ANCHORS = [
  { id: "org-profile", label: "Organisation Profile" },
  { id: "registration-compliance", label: "Registration & Compliance" },
  { id: "business-address", label: "Business Address" },
  { id: "payment-details", label: "Payment Details" },
];

const STEP2_ANCHORS = [
  { id: "hq-identity", label: "HQ Branch Identity" },
  { id: "hq-location", label: "Location Mapping" },
  { id: "hq-account", label: "Account Configuration" },
];

const ORG_TYPES = [
  { id: "sole_proprietorship", label: "Sole Proprietorship", docs: "Form D / MyCoID" },
  { id: "partnership", label: "Partnership", docs: "Form A / Partnership Deed" },
  { id: "sdn_bhd", label: "Private Limited (Sdn. Bhd.)", docs: "SSM Section 14 & 17" },
  { id: "llp", label: "LLP", docs: "LLP Registration Certificate" },
  { id: "bhd", label: "Public Limited (Bhd.)", docs: "Prospectus & SSM Cert" },
  { id: "clbg", label: "CLBG", docs: "Memorandum & Articles" },
];

export default function NewOrganizationPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fyOpen, setFyOpen] = useState(false);
  const [pendingOrgData, setPendingOrgData] = useState<CreateOrganizationData | null>(null);

  // HQ branch state
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState<LocationData>({
    line: "", city: "", state: "", country: "Malaysia", postalCode: "",
  });
  const [accountType, setAccountType] = useState<"new" | "existing">("new");
  const [accountName, setAccountName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [existingAccountId, setExistingAccountId] = useState("");

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<CreateOrganizationData>({
    resolver: zodResolver(createOrganizationSchema) as Resolver<CreateOrganizationData>,
    defaultValues: { type: "sdn_bhd", documents: [] },
  });

  const industryValue = watch("industry");
  const bankNameValue = watch("bankAccountDetails.bankName");
  const orgType = watch("type");
  const orgName = watch("name");

  const onStep1Submit = (data: CreateOrganizationData) => {
    setPendingOrgData(data);
    setBranchName(data.name ? `${data.name} HQ` : "");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirm = async () => {
    if (!pendingOrgData) return;
    setIsSubmitting(true);
    try {
      const orgRes = await createOrganization(pendingOrgData);
      if (!orgRes.success) throw new Error("Organisation creation failed");

      const orgId = orgRes.data.id;
      const branchData: HqBranchData = {
        name: branchName || `${pendingOrgData.name} HQ`,
        address: branchAddress,
        accountType,
        accountName: accountType === "new" ? accountName : undefined,
        creditLimit: accountType === "new" && creditLimit ? Number(creditLimit) : undefined,
        existingAccountId: accountType === "existing" ? existingAccountId : undefined,
      };
      await createHqBranch(orgId, branchData);

      toast.success("Organisation and HQ branch created");
      router.push(`/organizations/${orgId}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create organisation");
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full h-10 px-3 py-2 bg-background border rounded-lg text-body outline-none transition-all duration-200",
      hasError
        ? "border-destructive focus:ring-2 focus:ring-destructive/10"
        : "border-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-muted/10"
    );

  const labelCls = "text-body font-semibold text-subtle mb-1.5 block";

  const getDocRequirements = (type: string) => {
    switch (type) {
      case "sole_proprietorship": return "Form D / MyCoID registration required";
      case "partnership": return "Form A and Partnership Deed required";
      case "sdn_bhd": return "SSM Certificate, Section 14 & Section 17 required";
      case "llp": return "LLP Registration Certificate required";
      case "bhd": return "Prospectus and SSM Certificate required";
      case "clbg": return "Memorandum and Articles of Association required";
      default: return "Supporting documents required";
    }
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

        {/* Left Column: Navigation */}
        <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={step === 1 ? STEP1_ANCHORS : STEP2_ANCHORS} />
        </aside>

        {/* Right Column */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => step === 1 ? router.back() : setStep(1)}
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> {step === 1 ? "Back" : "Back to Organisation"}
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-heading font-semibold text-foreground text-balance">
                    {step === 1 ? "Add New Organisation" : "Set Up HQ Branch"}
                  </h1>
                  <span className="text-label font-semibold text-muted-foreground bg-muted/50 border border-border px-2 py-0.5 rounded-full">
                    Step {step} of 2
                  </span>
                </div>
                <p className="text-subtle text-body">
                  {step === 1
                    ? "Register a new corporate client on the platform."
                    : `Configure the HQ branch and account for ${pendingOrgData?.name ?? "this organisation"}.`}
                </p>
              </div>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form id="newOrgForm" onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">

                {/* Organisation Profile */}
                <div id="org-profile" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Buildings size={16} weight="fill" />
                      </div>
                      <h3 className="text-lead font-semibold text-foreground">Organisation Profile</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Company Name</label>
                        <input
                          {...register("name")}
                          className={inputCls(!!errors.name)}
                          placeholder="e.g. Acme Corporation Sdn Bhd"
                        />
                        {errors.name && (
                          <p className="text-label text-destructive flex items-center gap-1 mt-1">
                            <WarningCircle size={12} /> {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>Industry</label>
                        <FormSelect
                          value={industryValue}
                          onChange={(v) => setValue("industry", v)}
                          options={[
                            { label: "Select industry", value: "" },
                            { label: "Technology", value: "Technology" },
                            { label: "Healthcare", value: "Healthcare" },
                            { label: "Finance", value: "Finance" },
                            { label: "Logistics", value: "Logistics" },
                            { label: "Retail", value: "Retail" },
                            { label: "Manufacturing", value: "Manufacturing" },
                          ]}
                          error={!!errors.industry}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>Financial Year Start</label>
                        <Controller
                          control={control}
                          name="financialYearStart"
                          render={({ field }) => {
                            const parsed = field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined;
                            const selected = parsed && isValid(parsed) ? parsed : undefined;
                            return (
                              <Popover open={fyOpen} onOpenChange={setFyOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full flex items-center gap-2 h-10 px-3 bg-background border rounded-lg text-body transition-all",
                                      "hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30",
                                      errors.financialYearStart ? "border-destructive" : "border-border"
                                    )}
                                  >
                                    <CalendarBlank size={16} className="text-faint shrink-0" />
                                    <span className={selected ? "text-foreground font-medium" : "text-faint"}>
                                      {selected ? format(selected, "d MMM yyyy") : "Select date"}
                                    </span>
                                    <CaretDown size={14} className={cn("text-faint ml-auto transition-transform", fyOpen && "rotate-180")} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={selected}
                                    onSelect={(date) => {
                                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                      setFyOpen(false);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration & Compliance */}
                <div id="registration-compliance" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <IdentificationCard size={16} weight="fill" />
                      </div>
                      <h3 className="text-lead font-semibold text-foreground">Registration & Compliance</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className={labelCls}>Registration Number</label>
                        <input
                          {...register("registrationNumber")}
                          className={inputCls(!!errors.registrationNumber)}
                          placeholder="e.g. 1234567-T"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>TIN Number</label>
                        <input
                          {...register("tinNumber")}
                          className={inputCls(!!errors.tinNumber)}
                          placeholder="e.g. TR-882910-01"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2 pt-4 border-t border-border/40">
                        <label className={labelCls}>Organisation Type</label>
                        <FormSelect
                          value={orgType || ""}
                          onChange={(v) => setValue("type", v as CreateOrganizationData["type"])}
                          options={[
                            { label: "Select type", value: "" },
                            ...ORG_TYPES.map(t => ({ label: t.label, value: t.id })),
                          ]}
                          error={!!errors.type}
                        />
                      </div>

                      <div className="sm:col-span-2 pt-4 border-t border-border/40">
                        <Controller
                          control={control}
                          name="documents"
                          render={({ field }) => (
                            <DocumentUploadSection
                              documents={field.value || []}
                              onChange={field.onChange}
                              error={errors.documents?.message}
                              label="Compliance Documents"
                              description={getDocRequirements(orgType)}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Address */}
                <div id="business-address" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin size={16} weight="fill" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lead font-semibold text-foreground">Business Address</h3>
                        <p className="text-label text-muted-foreground">Official business address as per SSM registration.</p>
                      </div>
                    </div>
                    <div className="p-1">
                      <Controller
                        control={control}
                        name="address"
                        render={({ field }) => (
                          <LocationPicker
                            value={field.value ?? { line: "", city: "", state: "", country: "Malaysia", postalCode: "" }}
                            onChange={field.onChange}
                            errors={errors.address}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div id="payment-details" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                  <div className="p-6 space-y-8">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Bank size={16} weight="fill" />
                      </div>
                      <h3 className="text-lead font-semibold text-foreground">Payment Details</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className={labelCls}>Bank Name</label>
                        <FormSelect
                          value={bankNameValue || ""}
                          onChange={(v) => setValue("bankAccountDetails.bankName", v)}
                          options={[
                            { label: "Select bank", value: "" },
                            ...MALAYSIAN_BANKS.map((b) => ({ label: b, value: b })),
                          ]}
                          error={!!errors.bankAccountDetails?.bankName}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>Account Number</label>
                        <input
                          {...register("bankAccountDetails.accountNumber")}
                          className={cn(inputCls(!!errors.bankAccountDetails?.accountNumber), "font-mono")}
                          placeholder="e.g. 5140 1234 5678"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>Account Name</label>
                        <input
                          {...register("bankAccountDetails.accountName")}
                          className={inputCls(!!errors.bankAccountDetails?.accountName)}
                          placeholder="e.g. Acme Corporation Sdn Bhd"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Action Bar — Step 1 */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
                  <Button variant="ghost" size="lg" className="text-body font-semibold px-6 transition-colors" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <div className="w-px h-6 bg-border/40" />
                  <Button
                    type="submit"
                    size="lg"
                    className="text-body font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Next
                    <NavigationArrow size={14} weight="bold" className="rotate-90" />
                  </Button>
                </div>

                <div className="h-[60vh]" />
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">

                {/* HQ Branch Identity */}
                <div id="hq-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Building size={16} weight="fill" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lead font-semibold text-foreground">HQ Branch Identity</h3>
                        <p className="text-label text-muted-foreground">Basic identifiers for the headquarters branch.</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Branch Name</label>
                      <input
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Acme Corporation HQ"
                        className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all font-medium text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Mapping */}
                <div id="hq-location" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin size={16} weight="fill" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lead font-semibold text-foreground">Location Mapping</h3>
                        <p className="text-label text-muted-foreground">Geographical data and coordinate pinning.</p>
                      </div>
                    </div>
                    <div className="p-1">
                      <LocationPicker value={branchAddress} onChange={setBranchAddress} />
                    </div>
                  </div>
                </div>

                {/* Account Configuration */}
                <div id="hq-account" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet size={16} weight="fill" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-lead font-semibold text-foreground">Account Configuration</h3>
                        <p className="text-label text-muted-foreground">Define how this branch is funded. Top up after creation from the branch detail page.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <ChoiceCard
                        title="New Account"
                        description="Create a dedicated standalone account for this branch. Funds are isolated."
                        selected={accountType === "new"}
                        onSelect={() => setAccountType("new")}
                        icon={Wallet}
                      />
                      <ChoiceCard
                        title="Existing Account"
                        description="Link this branch to an existing account (e.g. shared with another cluster)."
                        selected={accountType === "existing"}
                        onSelect={() => setAccountType("existing")}
                        icon={IdentificationCard}
                      />
                    </div>

                    <div className="space-y-6">
                      {accountType === "new" ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1.5">
                            <label className={labelCls}>Account Name</label>
                            <input
                              value={accountName}
                              onChange={(e) => setAccountName(e.target.value)}
                              placeholder="e.g. HQ Main Account"
                              className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all font-semibold text-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelCls}>Credit Limit (RM)</label>
                            <input
                              type="number"
                              value={creditLimit}
                              onChange={(e) => setCreditLimit(e.target.value)}
                              placeholder="0.00"
                              className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all font-semibold text-foreground"
                            />
                            <p className="text-label text-faint font-medium">Max overdraft this branch may use beyond its balance.</p>
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelCls}>Default Currency</label>
                            <div className="flex items-center gap-3 w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-body">
                              <span className="w-8 h-5 bg-muted rounded-sm flex items-center justify-center text-label font-medium text-muted-foreground">MYR</span>
                              <span className="text-foreground font-semibold whitespace-nowrap">Malaysian Ringgit (RM)</span>
                              <span className="ml-auto text-label text-faint font-semibold">Locked</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className={labelCls}>Bridge to Existing Account</label>
                          <FormSelect
                            value={existingAccountId}
                            onChange={(v) => setExistingAccountId(v)}
                            options={[
                              { label: "Select an account...", value: "" },
                              ...MOCK_ACCOUNTS.map((acc) => ({
                                label: `${acc.name} — RM ${acc.balance.toLocaleString()} MYR`,
                                value: acc.id,
                              })),
                            ]}
                          />
                          <p className="text-label text-faint mt-1.5 font-medium italic">
                            * This branch will consume funds from the selected centralized liquidity pool.
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                        <div className="flex items-start gap-3 text-body text-subtle">
                          <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                          <span>Administrative fees are consolidated at the parent organization level for all linked accounts.</span>
                        </div>
                        {accountType === "new" && (
                          <div className="flex items-start gap-3 text-body text-subtle animate-in fade-in duration-300">
                            <CheckCircle size={18} weight="fill" className="text-primary mt-0.5 shrink-0" />
                            <span>A 1.5% administrative fee applies to all standalone accounts.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Action Bar — Step 2 */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[calc(50%+104px)] z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-body font-semibold px-6 transition-colors flex items-center gap-2"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft size={14} weight="bold" /> Back
                  </Button>
                  <div className="w-px h-6 bg-border/40" />
                  <Button
                    size="lg"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="text-body font-semibold px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Confirm & Create
                        <NavigationArrow size={14} weight="bold" className="rotate-90" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="h-[60vh]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
