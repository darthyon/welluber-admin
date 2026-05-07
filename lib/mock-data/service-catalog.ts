/**
 * Service taxonomy used by:
 * - Benefit policies (Tier 2 ids only — sub-services NEVER surface in policy UI).
 * - Service provider package authoring (Tier 2 + Tier 3 sub-services).
 *
 * `MainServiceId` is the canonical id type for benefits → use it on `Benefit.serviceId`.
 */
export const SERVICES = [
  { id: "s1", category: "Physical Wellbeing", name: "Gymnasium Facilities", subServices: ["Standard Gym Access", "Boutique Studio Memberships"] },
  { id: "s2", category: "Physical Wellbeing", name: "Group Fitness", subServices: ["Yoga", "Pilates", "Indoor Cycling", "Zumba"] },
  { id: "s3", category: "Psychological Wellbeing", name: "Clinical Therapy", subServices: ["Psychotherapy", "CBT", "Psychiatric Care"] },
  { id: "s4", category: "Psychological Wellbeing", name: "Mental Fitness", subServices: ["Meditation Apps", "Mindfulness Workshops"] },
  { id: "s5", category: "Nutritional Support", name: "Dietary Counseling", subServices: ["Dietitian Consultations", "Diabetic Management"] },
  { id: "s6", category: "Personal Care", name: "Therapeutic Spa Services", subServices: ["Relaxation Massage", "Hydrotherapy"] },
  { id: "s7", category: "Physical Wellbeing", name: "Occupational Health", subServices: ["Health Screening", "Ergonomic Assessment"] },
  { id: "s8", category: "Personal Care", name: "Beauty & Aesthetics", subServices: ["Facial Treatments", "Skincare Consultations"] },
  { id: "s9", category: "Psychological Wellbeing", name: "Life & Executive Coaching", subServices: ["Career Coaching", "Executive Coaching"] },
  { id: "s10", category: "Physical Wellbeing", name: "Physiotherapy & Recovery", subServices: ["Sports Rehab", "Manual Therapy"] },
] as const

export type MainServiceId = (typeof SERVICES)[number]["id"]
/** @deprecated use MainServiceId */
export type ServiceId = MainServiceId

export const MAIN_SERVICE_IDS: readonly MainServiceId[] = SERVICES.map((s) => s.id)

export function isMainServiceId(value: string): value is MainServiceId {
  return MAIN_SERVICE_IDS.includes(value as MainServiceId)
}

export function getMainServiceName(id: MainServiceId): string {
  return SERVICES.find((s) => s.id === id)?.name ?? id
}
