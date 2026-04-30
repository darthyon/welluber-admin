"use client";

import { useState, useEffect } from "react";
import { PolicyTemplate } from "@/types/policy";
import { POLICY_TEMPLATES } from "@/components/host/policies/policy-template-data";

interface UsePolicyTemplatesReturn {
  templates: PolicyTemplate[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch policy templates from the backend.
 * Currently uses local mock data; replace with API call when backend is ready.
 */
export function usePolicyTemplates(): UsePolicyTemplatesReturn {
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTemplates() {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (cancelled) return;

        // TODO: Replace with actual API call
        // const response = await fetch("/api/policy-templates");
        // const data = await response.json();

        setTemplates(POLICY_TEMPLATES);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load templates");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  return { templates, isLoading, error };
}
