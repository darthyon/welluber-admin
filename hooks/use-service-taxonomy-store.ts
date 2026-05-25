"use client";

import { useCallback, useState } from "react";
import { SERVICE_TAXONOMY, SERVICE_SPEC_TAXONOMY } from "@/features/organizations/constants";
import {
  Barbell, Bicycle, Waves, HandFist, Flower, Sparkle, Scissors,
  Brain, HandHeart, MusicNotes, BowlFood,
  Heart, PersonSimpleRun, Sun, Leaf, Wind,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

export const ICON_LIBRARY: { name: string; icon: Icon }[] = [
  { name: "Barbell", icon: Barbell },
  { name: "PersonSimpleRun", icon: PersonSimpleRun },
  { name: "Bicycle", icon: Bicycle },
  { name: "Waves", icon: Waves },
  { name: "HandFist", icon: HandFist },
  { name: "MusicNotes", icon: MusicNotes },
  { name: "Flower", icon: Flower },
  { name: "Wind", icon: Wind },
  { name: "Sun", icon: Sun },
  { name: "Leaf", icon: Leaf },
  { name: "Brain", icon: Brain },
  { name: "Heart", icon: Heart },
  { name: "HandHeart", icon: HandHeart },
  { name: "Scissors", icon: Scissors },
  { name: "BowlFood", icon: BowlFood },
  { name: "Sparkle", icon: Sparkle },
];

const INITIAL_CATEGORY_ICONS: Record<string, string> = {
  "Fitness & Exercise": "Barbell",
  "Massage & Bodywork": "Waves",
  "Spa & Aesthetics": "Flower",
  "Beauty & Personal Care": "Scissors",
  "Mental Health & Mindfulness": "Brain",
  "Medical & Allied Health": "Heart",
  "Nutrition & Dietetics": "BowlFood",
  "Recovery & Rehabilitation": "PersonSimpleRun",
  "Yoga & Pilates": "Wind",
  "Corporate & Group Wellness": "Sparkle",
  "Alternative & Holistic Therapies": "Leaf",
  "Maternal & Child Wellness": "HandHeart",
  "Senior & Geriatric Wellness": "Sun",
};

export const CATEGORY_COLORS: { name: string; hex: string }[] = [
  { name: "Violet", hex: "#7c3aed" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Emerald", hex: "#059669" },
  { name: "Amber", hex: "#d97706" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Pink", hex: "#db2777" },
  { name: "Slate", hex: "#475569" },
];

export interface CategoryEntry {
  category: string;
  description?: string;
  icon?: string;
  color?: string;
  services: string[];
}

interface TaxonomyData {
  categories: CategoryEntry[];
  specsByService: Record<string, string[]>;
}

// Module-level singleton — persists across navigation within a session, resets on refresh.
let _store: TaxonomyData = {
  categories: SERVICE_TAXONOMY.map((cat) => ({
    category: cat.category,
    services: cat.services,
    icon: INITIAL_CATEGORY_ICONS[cat.category],
  })),
  specsByService: { ...SERVICE_SPEC_TAXONOMY },
};

function trimLower(s: string) {
  return s.trim().toLowerCase();
}

export function useServiceTaxonomyStore() {
  const [data, setData] = useState<TaxonomyData>(_store);

  const commit = useCallback((next: TaxonomyData) => {
    _store = next;
    setData(next);
  }, []);

  const validateUniqueName = useCallback(
    (
      scope: "category" | "service" | "spec",
      name: string,
      opts?: { categoryName?: string; serviceName?: string; excludeName?: string }
    ): boolean => {
      const n = trimLower(name);
      if (!n) return false;
      if (scope === "category") {
        return !data.categories.some(
          (c) => trimLower(c.category) === n && c.category !== opts?.excludeName
        );
      }
      if (scope === "service") {
        const cat = data.categories.find((c) => c.category === opts?.categoryName);
        if (!cat) return true;
        return !cat.services.some(
          (s) => trimLower(s) === n && s !== opts?.excludeName
        );
      }
      if (scope === "spec") {
        const specs = data.specsByService[opts?.serviceName ?? ""] ?? [];
        return !specs.some((s) => trimLower(s) === n && s !== opts?.excludeName);
      }
      return true;
    },
    [data]
  );

  const deleteCategory = useCallback(
    (categoryName: string) => {
      const cat = data.categories.find((c) => c.category === categoryName);
      if (!cat) return;
      const newSpecs = { ...data.specsByService };
      cat.services.forEach((s) => {
        delete newSpecs[s];
      });
      commit({
        categories: data.categories.filter((c) => c.category !== categoryName),
        specsByService: newSpecs,
      });
    },
    [data, commit]
  );

  const saveWizardData = useCallback(
    (
      oldCategoryName: string | null,
      entry: CategoryEntry,
      specsByService: Record<string, string[]>
    ) => {
      const prev = _store;
      const newSpecs = { ...prev.specsByService };

      if (oldCategoryName) {
        const oldCat = prev.categories.find((c) => c.category === oldCategoryName);
        if (oldCat) {
          oldCat.services.forEach((s) => {
            if (!entry.services.includes(s)) {
              delete newSpecs[s];
            }
          });
        }
      }

      Object.assign(newSpecs, specsByService);

      const newCategories = oldCategoryName
        ? prev.categories.map((c) => (c.category === oldCategoryName ? entry : c))
        : [...prev.categories, entry];

      // Write to module singleton immediately so the next page reads fresh data.
      _store = { categories: newCategories, specsByService: newSpecs };
    },
    []
  );

  return {
    categories: data.categories,
    specsByService: data.specsByService,
    validateUniqueName,
    deleteCategory,
    saveWizardData,
  };
}
