import type { Brand } from "@/types/brand"

const GENERATED_NAMES = [
  "PrimeFit Wellness", "Luminary Health", "Vertex Vitality",
  "Apex Wellness Co", "Nova Health Partners", "Zenith Care Group",
]

const GENERATED_CATS = [
  ["Fitness & Exercise", "Yoga & Pilates"],
  ["Medical & Allied Health", "Recovery & Rehabilitation"],
  ["Nutrition & Dietetics", "Corporate & Group Wellness"],
  ["Spa & Aesthetics", "Beauty & Personal Care"],
  ["Mental Health & Mindfulness", "Life & Executive Coaching"],
  ["Fitness & Exercise", "Occupational Health"],
]

export function createBrand(index: number): Brand {
  // Hand-crafted entries
  if (index === 0) return {
    id: "BRD-20260101-0001",
    name: "Zenith Wellness",
    logo: "/brand_logo_sample_1775530545153.png",
    status: "active",
    serviceCategories: ["Fitness & Exercise", "Yoga & Pilates", "Mental Health & Mindfulness"],
    assignedSpCount: 2,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
  }
  if (index === 1) return {
    id: "BRD-20260115-0002",
    name: "Agile Group",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=AG&backgroundColor=6366f1",
    status: "active",
    serviceCategories: ["Mental Health & Mindfulness", "Corporate & Group Wellness"],
    assignedSpCount: 1,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  }
  if (index === 2) return {
    id: "BRD-20260201-0003",
    name: "Core Health",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=CH&backgroundColor=6366f1",
    status: "inactive",
    serviceCategories: ["Medical & Allied Health", "Recovery & Rehabilitation", "Nutrition & Dietetics"],
    assignedSpCount: 1,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  }
  if (index === 3) return {
    id: "BRD-20260210-0004",
    name: "Serenity Luxe",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=SL&backgroundColor=6366f1",
    status: "active",
    serviceCategories: ["Spa & Aesthetics", "Massage & Bodywork", "Beauty & Personal Care"],
    assignedSpCount: 1,
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  }

  // Generated entries (index 4-9)
  const g = index - 4
  const n = index + 1
  const statuses: Brand["status"][] = ["active", "active", "active", "inactive", "active", "active"]
  return {
    id: `BRD-20260401-00${String(n).padStart(2, "0")}`,
    name: GENERATED_NAMES[g] ?? `Wellness Brand ${n}`,
    logo: `https://api.dicebear.com/7.x/initials/svg?seed=WB${n}&backgroundColor=6366f1`,
    status: statuses[g] ?? "active",
    serviceCategories: GENERATED_CATS[g] ?? ["Fitness & Exercise"],
    assignedSpCount: g % 3,
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  }
}
