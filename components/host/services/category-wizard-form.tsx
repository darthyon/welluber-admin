"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash, X, Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import {
  FormStepIndicator,
  type FormWizardStep,
  WizardActionBar,
} from "@/components/shared/form-step-wizard"
import {
  ICON_LIBRARY,
  CATEGORY_COLORS,
} from "@/hooks/use-service-taxonomy-store"
import type { CategoryEntry } from "@/hooks/use-service-taxonomy-store"
interface ServiceItem {
  localId: string
  name: string
  specs: string[]
}
interface CategoryWizardFormProps {
  mode: "create" | "edit"
  initialCategory?: CategoryEntry
  initialSpecs?: Record<string, string[]>
  validateCategoryName: (name: string, excludeName?: string) => boolean
  onSave: (
    entry: CategoryEntry,
    specsByService: Record<string, string[]>
  ) => void
}

function buildInitialServices(
  category: CategoryEntry | undefined,
  specs: Record<string, string[]>
): ServiceItem[] {
  if (!category) return []
  return category.services.map((name, i) => ({
    localId: `init-${i}`,
    name,
    specs: specs[name] ?? [],
  }))
}

const labelCls = "text-body font-semibold text-subtle mb-1.5 block"

const inputCls = (hasError?: boolean) =>
  cn(
    "h-10 w-full rounded-lg border bg-background px-3 py-2 text-body transition-all duration-200 outline-none",
    hasError
      ? "border-destructive focus:ring-2 focus:ring-destructive/10"
      : "border-border focus:border-primary/40 focus:bg-muted/10 focus:ring-2 focus:ring-primary/10"
  )

const CATEGORY_WIZARD_STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Main Services" },
] as const satisfies readonly FormWizardStep<1 | 2>[]

let _counter = 0
function nextId() {
  return `svc-${++_counter}`
}

export function CategoryWizardForm({
  mode,
  initialCategory,
  initialSpecs = {},
  validateCategoryName,
  onSave,
}: CategoryWizardFormProps) {
  const router = useRouter()
  const uid = useId()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [categoryName, setCategoryName] = useState(
    initialCategory?.category ?? ""
  )
  const [description, setDescription] = useState(
    initialCategory?.description ?? ""
  )
  const [categoryIcon, setCategoryIcon] = useState(initialCategory?.icon ?? "")
  const [categoryColor, setCategoryColor] = useState(
    initialCategory?.color ?? ""
  )
  const [nameError, setNameError] = useState("")

  const [services, setServices] = useState<ServiceItem[]>(() =>
    buildInitialServices(initialCategory, initialSpecs)
  )

  const addService = () => {
    setServices((prev) => [...prev, { localId: nextId(), name: "", specs: [] }])
    setTimeout(() => {
      const cards = document.querySelectorAll("[data-service-card]")
      const last = cards[cards.length - 1]
      if (last) {
        const input = last.querySelector("input")
        input?.focus()
        last.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 50)
  }

  const updateService = (localId: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, ...updates } : s))
    )
  }

  const removeService = (localId: string) => {
    setServices((prev) => prev.filter((s) => s.localId !== localId))
  }

  const addSpec = (localId: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.localId === localId ? { ...s, specs: [...s.specs, ""] } : s
      )
    )
  }

  const updateSpec = (localId: string, specIdx: number, value: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.localId === localId
          ? {
              ...s,
              specs: s.specs.map((sp, i) => (i === specIdx ? value : sp)),
            }
          : s
      )
    )
  }

  const removeSpec = (localId: string, specIdx: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.localId === localId
          ? { ...s, specs: s.specs.filter((_, i) => i !== specIdx) }
          : s
      )
    )
  }

  const validateDetailsStep = () => {
    const trimmed = categoryName.trim()
    if (!trimmed) {
      setNameError("Category name is required.")
      return false
    }
    const isUnique = validateCategoryName(trimmed, initialCategory?.category)
    if (!isUnique) {
      setNameError("A category with this name already exists.")
      return false
    }
    setNameError("")
    return true
  }

  const goToStep = (step: 1 | 2) => {
    if (step <= currentStep) {
      setCurrentStep(step)
      return
    }

    if (validateDetailsStep()) {
      setCurrentStep(step)
    }
  }

  const goNext = () => {
    if (validateDetailsStep()) {
      setCurrentStep(2)
    }
  }

  const handleSave = () => {
    if (!validateDetailsStep()) {
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)
    const entry: CategoryEntry = {
      category: categoryName.trim(),
      description: description.trim() || undefined,
      icon: categoryIcon || undefined,
      color: categoryColor || undefined,
      services: services.map((s) => s.name.trim()).filter(Boolean),
    }

    const specsByService: Record<string, string[]> = {}
    services.forEach((s) => {
      const name = s.name.trim()
      if (!name) return
      specsByService[name] = s.specs.map((sp) => sp.trim()).filter(Boolean)
    })

    onSave(entry, specsByService)
    setIsSubmitting(false)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSave()
      }}
      className="animate-in space-y-8 pb-24 duration-500 fade-in slide-in-from-bottom-4"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Breadcrumbs
            items={
              mode === "create"
                ? [
                    { label: "Services", href: "/services" },
                    { label: "New Service Category" },
                  ]
                : [
                    { label: "Services", href: "/services" },
                    {
                      label: initialCategory?.category ?? "",
                      href: `/services/${encodeURIComponent(initialCategory?.category ?? "")}`,
                    },
                    { label: "Edit" },
                  ]
            }
          />
          <div>
            <h1 className="text-display font-semibold tracking-tight text-balance text-foreground">
              {mode === "create"
                ? "New Service Category"
                : "Edit Service Category"}
            </h1>
            <p className="mt-1 text-body text-subtle">
              {mode === "create"
                ? "Define the category profile and add the services within it."
                : `Editing ${initialCategory?.category ?? "this category"}.`}
            </p>
          </div>
        </div>

        <FormStepIndicator
          currentStep={currentStep}
          onStepClick={goToStep}
          steps={CATEGORY_WIZARD_STEPS}
        />

        <div className="min-w-0">
          <div className="flex flex-col gap-6">
            {currentStep === 1 && (
              <div className="animate-in duration-300 fade-in slide-in-from-right-4">
                <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                  <div className="space-y-6 p-6">
                    <div className="pb-2">
                      <h2 className="text-lead font-semibold text-foreground">
                        Service Category Details
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`${uid}-name`} className={labelCls}>
                        Category Name{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        id={`${uid}-name`}
                        value={categoryName}
                        onChange={(e) => {
                          setCategoryName(e.target.value)
                          if (nameError) setNameError("")
                        }}
                        placeholder="e.g. Fitness & Exercise"
                        className={inputCls(!!nameError)}
                        autoFocus
                      />
                      {nameError && (
                        <p className="mt-1 text-label text-destructive">
                          {nameError}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`${uid}-desc`} className={labelCls}>
                        Description{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <input
                        id={`${uid}-desc`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of what this category covers"
                        className={inputCls()}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Category Icon{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {ICON_LIBRARY.map(({ name, icon: IconComp }) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              setCategoryIcon(categoryIcon === name ? "" : name)
                            }
                            title={name}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg border transition-all",
                              categoryIcon === name
                                ? "scale-105 border-primary bg-primary text-primary-foreground shadow-md"
                                : "border-border bg-muted text-faint hover:border-primary/30 hover:bg-background hover:text-primary"
                            )}
                          >
                            <IconComp
                              size={20}
                              weight={
                                categoryIcon === name ? "fill" : "duotone"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Accent Color{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_COLORS.map(({ name, hex }) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              setCategoryColor(categoryColor === hex ? "" : hex)
                            }
                            title={name}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                              categoryColor === hex
                                ? "scale-110 border-foreground shadow-md"
                                : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: hex }}
                          >
                            {categoryColor === hex && (
                              <Check
                                size={14}
                                weight="bold"
                                className="text-primary-foreground"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in space-y-4 duration-300 fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lead font-semibold text-foreground">
                      Main Services
                    </h2>
                    <p className="mt-0.5 text-label text-muted-foreground">
                      {services.length === 0
                        ? "No services added yet."
                        : `${services.length} service${services.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-body font-medium"
                    onClick={addService}
                  >
                    <Plus size={14} weight="bold" className="mr-1.5" />
                    Add Service
                  </Button>
                </div>

                {services.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card py-16 text-center">
                    <p className="text-body text-muted-foreground">
                      No services added yet.
                    </p>
                    <Button variant="outline" size="sm" onClick={addService}>
                      <Plus size={14} weight="bold" className="mr-1.5" />
                      Add your first service
                    </Button>
                  </div>
                )}
                {services.map((svc) => (
                  <div
                    key={svc.localId}
                    data-service-card
                    className="animate-in overflow-hidden rounded-lg border border-border bg-card shadow-sm duration-300 fade-in slide-in-from-top-2"
                  >
                    <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4">
                      <input
                        value={svc.name}
                        onChange={(e) =>
                          updateService(svc.localId, { name: e.target.value })
                        }
                        placeholder="Service name (e.g. Gym Access)"
                        className={cn(inputCls(), "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => removeService(svc.localId)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                        title="Remove service"
                      >
                        <Trash size={15} weight="duotone" />
                      </button>
                    </div>
                    <div className="space-y-3 px-5 py-4">
                      {svc.specs.length > 0 && (
                        <p className="text-label font-semibold text-muted-foreground">
                          Sub-services
                        </p>
                      )}
                      <div className="space-y-2">
                        {svc.specs.map((spec, specIdx) => (
                          <div
                            key={specIdx}
                            className="flex animate-in items-center gap-2 duration-200 fade-in"
                          >
                            <input
                              value={spec}
                              onChange={(e) =>
                                updateSpec(svc.localId, specIdx, e.target.value)
                              }
                              placeholder="Sub-service name (e.g. Monthly Membership)"
                              className={cn(inputCls(), "flex-1")}
                              autoFocus={spec === ""}
                            />
                            <button
                              type="button"
                              onClick={() => removeSpec(svc.localId, specIdx)}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X size={13} weight="bold" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addSpec(svc.localId)}
                        className="flex items-center gap-1.5 text-label font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        <Plus size={13} weight="bold" />
                        Add Sub-service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <WizardActionBar
        createLabel="Save Category"
        currentStep={currentStep}
        isEditing={mode === "edit"}
        isSubmitting={isSubmitting}
        onBack={() => setCurrentStep(1)}
        onNext={goNext}
        saveLabel="Save Category"
        totalSteps={2}
      />
    </form>
  )
}
