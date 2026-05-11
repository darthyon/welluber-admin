"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DraftEnvelope<T> {
  savedAt: string;
  data: T;
}

type DraftStatus = "idle" | "saving" | "saved";

interface UsePolicyDraftResult<T> {
  hasDraft: boolean;
  savedAt?: string;
  status: DraftStatus;
  restored: boolean;
  restore: () => T | null;
  clear: () => void;
}

function draftKey(orgId: string | undefined): string {
  return `policy-draft-${orgId || "global"}`;
}

export function readPolicyDraft<T>(orgId: string | undefined): DraftEnvelope<T> | null {
  return loadDraft<T>(draftKey(orgId));
}

export function clearPolicyDraft(orgId: string | undefined): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(orgId));
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
  const key = useMemo(() => draftKey(orgId), [orgId]);
  const [draft, setDraft] = useState<DraftEnvelope<T> | null>(() => loadDraft<T>(key));
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState<DraftStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    setTimeout(() => {
      setDraft(loadDraft<T>(key));
    }, 0);
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus("saving");
      const payload: DraftEnvelope<T> = {
        savedAt: new Date().toISOString(),
        data: state,
      };
      window.localStorage.setItem(key, JSON.stringify(payload));
      setDraft(payload);
      setStatus("saved");
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
    status,
    restored,
    restore,
    clear,
  };
}
