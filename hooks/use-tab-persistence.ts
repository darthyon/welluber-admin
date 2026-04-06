"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * A custom hook to manage state via URL search parameters.
 */
export function useQueryState(
  key: string,
  defaultValue: string = ""
): [string, (value: string | null) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const value = useMemo(() => {
    return searchParams.get(key) || defaultValue;
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === null || newValue === defaultValue || newValue === "") {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      
      const search = params.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, searchParams, pathname, key, defaultValue]
  );

  return [value, setValue];
}

/**
 * A custom hook to manage tab state with URL persistence.
 */
export function useTabPersistence<T extends string>(
  defaultTab: T,
  queryParam: string = "tab"
): [T, (tab: T) => void] {
  const [value, setValue] = useQueryState(queryParam, defaultTab);
  
  return [value as T, (tab: T) => setValue(tab)];
}

/**
 * A hook that provides a function to update multiple query parameters at once.
 */
export function useUpdateQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const search = params.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [router, searchParams, pathname]
  );

  return updateParams;
}
