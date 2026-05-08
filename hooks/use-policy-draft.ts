"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DraftEnvelope<T> {
  savedAt: string;
  data: T;
}

interface UsePolicyDraftResult<T> {
  hasDraft: boolean;
  savedAt?: string;
  restored: boolean;
  restore: () => T | null;
  clear: () => void;
}

function loadDraft<T>(key: string): DraftEnvelope<T> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DraftEnvelope<T>;
    return parsed?.data ? parsed : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function usePolicyDraft<T>(orgId: string | undefined, state: T, enabled = true): UsePolicyDraftResult<T> {
  const key = useMemo(() => `policy-draft-${orgId || "global"}`, [orgId]);
  const [draft, setDraft] = useState<DraftEnvelope<T> | null>(() => loadDraft<T>(key));
  const [restored, setRestored] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setTimeout(() => {
      setDraft(loadDraft<T>(key));
    }, 0);
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const payload: DraftEnvelope<T> = {
        savedAt: new Date().toISOString(),
        data: state,
      };
      window.localStorage.setItem(key, JSON.stringify(payload));
      setDraft(payload);
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, key, state]);

  const restore = useCallback(() => {
    if (!draft) return null;
    setRestored(true);
    return draft.data;
  }, [draft]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    setDraft(null);
    setRestored(false);
  }, [key]);

  return {
    hasDraft: Boolean(draft),
    savedAt: draft?.savedAt,
    restored,
    restore,
    clear,
  };
}
