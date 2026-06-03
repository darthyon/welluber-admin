"use client"

import type { Dispatch, RefObject, SetStateAction } from "react"
import { useEffect } from "react"
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import { clearResolvedValidationErrors } from "@/hooks/use-policy-wizard-content.helpers"

export function useStoredPolicySubmitError({
  nameInputRef,
  setValidationErrors,
}: {
  nameInputRef: RefObject<HTMLInputElement | null>
  setValidationErrors: Dispatch<SetStateAction<Record<string, string>>>
}) {
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("policy-submit-error")
    if (!raw) return

    try {
      const error = JSON.parse(raw) as { field: string; message: string }
      sessionStorage.removeItem("policy-submit-error")
      setTimeout(() => {
        setValidationErrors((prev) => ({ ...prev, [error.field]: error.message }))
      }, 0)

      if (error.field === "name") {
        setTimeout(() => {
          nameInputRef.current?.focus()
          nameInputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
        }, 100)
      }
    } catch {
      sessionStorage.removeItem("policy-submit-error")
    }
  }, [nameInputRef, setValidationErrors])
}

export function useLivePolicyWizardErrorClearing({
  benefits,
  groups,
  policyData,
  setFieldError,
  setValidationErrors,
  validationErrors,
}: {
  benefits: Benefit[]
  groups: BenefitGroup[]
  policyData: Partial<BenefitPolicy>
  setFieldError: (key: string, message: string | undefined) => void
  setValidationErrors: Dispatch<SetStateAction<Record<string, string>>>
  validationErrors: Record<string, string>
}) {
  useEffect(() => {
    if (validationErrors.name && policyData.name?.trim() && policyData.name.length <= 100) {
      setTimeout(() => setFieldError("name", undefined), 0)
    }
  }, [policyData.name, setFieldError, validationErrors.name])

  useEffect(() => {
    if (validationErrors.organizationId && policyData.organizationId) {
      setTimeout(() => setFieldError("organizationId", undefined), 0)
    }
  }, [policyData.organizationId, setFieldError, validationErrors.organizationId])

  useEffect(() => {
    if (
      validationErrors.eligibleEmploymentTypes &&
      (policyData.eligibleEmploymentTypes?.length ?? 0) > 0
    ) {
      setTimeout(() => setFieldError("eligibleEmploymentTypes", undefined), 0)
    }
  }, [policyData.eligibleEmploymentTypes, setFieldError, validationErrors.eligibleEmploymentTypes])

  useEffect(() => {
    if (
      validationErrors.dependentsPoolType &&
      ((policyData.dependentCoverages?.length ?? 0) === 0 || policyData.dependentsPoolType)
    ) {
      setTimeout(() => setFieldError("dependentsPoolType", undefined), 0)
    }
  }, [
    policyData.dependentCoverages,
    policyData.dependentsPoolType,
    setFieldError,
    validationErrors.dependentsPoolType,
  ])

  useEffect(() => {
    if (
      validationErrors.prorateUnit &&
      (policyData.utilisationMode !== "Prorated" || policyData.prorateUnit)
    ) {
      setTimeout(() => setFieldError("prorateUnit", undefined), 0)
    }
  }, [
    policyData.prorateUnit,
    policyData.utilisationMode,
    setFieldError,
    validationErrors.prorateUnit,
  ])

  useEffect(() => {
    if (validationErrors.groups && groups.length > 0) {
      setTimeout(() => setFieldError("groups", undefined), 0)
    }
  }, [groups.length, setFieldError, validationErrors.groups])

  useEffect(() => {
    setTimeout(() => {
      setValidationErrors((prev) =>
        clearResolvedValidationErrors({
          benefits,
          groups,
          policyData,
          validationErrors: prev,
        }),
      )
    }, 0)
  }, [benefits, groups, policyData, setValidationErrors])
}
