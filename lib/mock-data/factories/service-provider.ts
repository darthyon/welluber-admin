import type { ServiceProvider } from "@/types/provider"

const DEFAULT_HOURS = {
  mon: { open: "09:00", close: "18:00", isClosed: false },
  tue: { open: "09:00", close: "18:00", isClosed: false },
  wed: { open: "09:00", close: "18:00", isClosed: false },
  thu: { open: "09:00", close: "18:00", isClosed: false },
  fri: { open: "09:00", close: "18:00", isClosed: false },
  sat: { open: "09:00", close: "13:00", isClosed: false },
  sun: { open: "09:00", close: "13:00", isClosed: true },
}

const GENERATED_SPS = [
  { name: "PrimeFit Gym & Studio", brandId: "BRD-20260401-0005", cats: ["Fitness & Exercise"], services: ["Gym Access", "Group Fitness Classes"], status: "active" as const },
  { name: "Luminary Nutrition Hub", brandId: "BRD-20260401-0006", cats: ["Nutrition & Dietetics"], services: ["Nutritional Counselling", "Meal Planning"], status: "active" as const },
  { name: "Vertex Physiotherapy Centre", brandId: "BRD-20260401-0007", cats: ["Recovery & Rehabilitation", "Medical & Allied Health"], services: ["Physiotherapy", "Sports Recovery"], status: "active" as const },
  { name: "Apex Occupational Health", brandId: "BRD-20260401-0008", cats: ["Fitness & Exercise"], services: ["Health Screening", "Ergonomic Assessment"], status: "active" as const },
  { name: "Nova Mindfulness Studio", brandId: "BRD-20260401-0009", cats: ["Mental Health & Mindfulness"], services: ["Meditation", "Mindfulness Workshops"], status: "pending" as const },
  { name: "Horizon Beauty & Wellness", brandId: "BRD-20260401-0010", cats: ["Spa & Aesthetics", "Beauty & Personal Care"], services: ["Facial Treatments", "Skincare Consultations"], status: "active" as const },
]

export function createServiceProvider(index: number): ServiceProvider {
  if (index === 0) return {
    id: "SP-20260101-0001",
    brandId: "BRD-20260101-0001",
    name: "Zenith Yoga Studio",
    registrationNo: "1122334-A",
    serviceCategories: ["Yoga & Pilates", "Mental Health & Mindfulness"],
    mainServices: ["Yoga", "Meditation", "Therapy & Counselling", "Life & Executive Coaching"],
    description: "Premium yoga and mindfulness centre with certified instructors.",
    website: "https://zenithyoga.my",
    isActive: true,
    status: "active",
    taxProfile: { isTaxRegistered: true, taxRegNo: "SST-2024-001234", taxRate: 0.08 },
    commissionSchema: [
      { mainService: "Yoga", firstLevelQty: 0, firstLevelRate: 0.12, subsequentLevelQty: 1, subsequentLevelRate: 0.10, lastUpdated: "2026-01-10T00:00:00Z" },
      { mainService: "Therapy & Counselling", firstLevelQty: 0, firstLevelRate: 0.25, subsequentLevelQty: 1, subsequentLevelRate: 0.20, lastUpdated: "2026-01-10T00:00:00Z" },
    ],
    bankInfo: { bankName: "Maybank", accountNumber: "514011223344", accountName: "ZENITH YOGA STUDIO Sdn Bhd" },
    address: { line: "Lot 5, Suria KLCC", city: "Kuala Lumpur", state: "Wilayah Persekutuan", country: "Malaysia", postalCode: "50088" },
    needsEInvoiceSubmission: true,
    appointedForEInvoice: true,
    expiredCommissionFee: 0.10,
    paymentCycle: "1 Month",
    creditTerms: "15 Days",
    businessType: "sdn_bhd",
    admins: [{ id: "SPA-001", spId: "SP-20260101-0001", name: "Sara Lim", email: "sara@zenithyoga.my", status: "active", invitedAt: "2026-01-05T00:00:00Z", branchIds: [] }],
    branches: [
      {
        id: "SPB-001", spId: "SP-20260101-0001", name: "Zenith KLCC",
        services: [{ service: "Yoga", subServices: ["Vinyasa Flow", "Hatha Yoga"] }],
        address: { line: "Lot 5, Suria KLCC", city: "Kuala Lumpur", state: "Wilayah Persekutuan", country: "Malaysia", postalCode: "50088", lat: 3.1579, lon: 101.7123 },
        contacts: [{ name: "Ahmad Razif", email: "razif@zenithyoga.my", type: "branch_manager", phone: "+60112345678", isPublic: true }],
        administrators: [], isActive: true, operatingHours: DEFAULT_HOURS,
        benefits: ["Changing Room", "Shower", "Locker", "Free WiFi"],
      },
    ],
    vouchers: [
      {
        id: "VCH-20260201-0001", spId: "SP-20260101-0001", code: "PACSP000010001", name: "Monthly Yoga Pass",
        description: "Unlimited yoga classes for one month at any Zenith branch.",
        photo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
        bookingRequired: true, displayLocation: { line: "" },
        serviceLines: [{ service: "Yoga", subServices: ["Vinyasa Yoga"], description: "Unlimited drop-in sessions", descriptionList: "• Unlimited access\n• Free mat provided" }],
        status: "published", isActive: true,
        activationPeriod: { startDate: "2026-02-01T00:00:00Z", endDate: "2026-12-31T00:00:00Z" },
        currency: "MYR", initialPrice: 280, finalPrice: 250,
        validationDuration: { unit: "months", value: 1 },
        redemptionPeriod: { mode: "after_purchase", unit: "day", value: 7 },
        membershipStartDay: "1st", branchScope: "all", branchIds: [],
        createdAt: "2026-02-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z",
      },
    ],
    activeVoucherCount: 1,
    createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-03-15T00:00:00Z",
  }

  if (index === 1) return {
    id: "SP-20260115-0002",
    brandId: "BRD-20260115-0002",
    name: "AgileMind Therapy Centre",
    registrationNo: "5566778-B",
    serviceCategories: ["Mental Health & Mindfulness"],
    mainServices: ["Therapy & Counselling", "Life & Executive Coaching"],
    description: "Licensed clinical therapists and certified life coaches.",
    website: "https://agilemind.my",
    isActive: true, status: "active",
    taxProfile: { isTaxRegistered: false, taxRate: 0.08 },
    commissionSchema: [
      { mainService: "Therapy & Counselling", firstLevelQty: 0, firstLevelRate: 0.20, subsequentLevelQty: 1, subsequentLevelRate: 0.15, lastUpdated: "2026-01-20T00:00:00Z" },
    ],
    admins: [{ id: "SPA-002", spId: "SP-20260115-0002", name: "Dr. James Wong", email: "james@agilemind.my", status: "active", invitedAt: "2026-01-12T00:00:00Z", branchIds: [] }],
    branches: [
      {
        id: "SPB-003", spId: "SP-20260115-0002", name: "AgileMind PJ",
        services: [{ service: "Therapy & Counselling", subServices: ["Individual Therapy", "Group Counselling"] }],
        address: { line: "Level 10, PJ Trade Centre", city: "Petaling Jaya", state: "Selangor", country: "Malaysia", postalCode: "46200" },
        contacts: [{ name: "Nurul Ain", email: "ain@agilemind.my", type: "reception", phone: "+60198765432", isPublic: true }],
        administrators: [], isActive: true, operatingHours: DEFAULT_HOURS,
        benefits: ["Private Consultation Room", "Free WiFi"],
      },
    ],
    vouchers: [
      {
        id: "VCH-20260201-0002", spId: "SP-20260115-0002", code: "PACSP000020001", name: "Individual Therapy Session",
        description: "One 60-minute individual therapy session with a licensed therapist.",
        photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
        bookingRequired: true, displayLocation: { line: "" },
        serviceLines: [{ service: "Therapy & Counselling", subServices: ["Individual Therapy"], description: "60-min licensed therapist session", descriptionList: "• 1-on-1 session\n• Licensed practitioners" }],
        status: "published", isActive: true,
        activationPeriod: { startDate: "2026-02-01T00:00:00Z" },
        currency: "MYR", initialPrice: 220, finalPrice: 200,
        validationDuration: { unit: "months", value: 3 },
        redemptionPeriod: { mode: "after_purchase", unit: "day", value: 30 },
        membershipStartDay: "none", branchScope: "all", branchIds: [],
        createdAt: "2026-02-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z",
      },
    ],
    activeVoucherCount: 1,
    createdAt: "2026-01-15T00:00:00Z", updatedAt: "2026-03-01T00:00:00Z",
  }

  if (index === 2) return {
    id: "SP-20260201-0003",
    brandId: "BRD-20260201-0003",
    name: "CoreFit Rehabilitation",
    registrationNo: "9988776-C",
    serviceCategories: ["Medical & Allied Health", "Recovery & Rehabilitation"],
    mainServices: ["Physiotherapy", "Sports Recovery"],
    description: "Sports rehabilitation and physiotherapy specialists.",
    website: "https://corefit.my",
    isActive: true, status: "pending",
    taxProfile: { isTaxRegistered: true, taxRegNo: "SST-2024-005678", taxRate: 0.08 },
    commissionSchema: [],
    admins: [{ id: "SPA-003", spId: "SP-20260201-0003", name: "Chong Wei Lin", email: "wei@corefit.my", status: "pending_activation", invitedAt: "2026-02-03T00:00:00Z", branchIds: [] }],
    branches: [], vouchers: [], activeVoucherCount: 0,
    createdAt: "2026-02-01T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z",
  }

  if (index === 3) return {
    id: "SP-20260210-0004",
    brandId: "BRD-20260210-0004",
    name: "Serenity Spa & Aesthetics",
    registrationNo: "3344556-D",
    serviceCategories: ["Spa & Aesthetics", "Massage & Bodywork"],
    mainServices: ["Traditional / Relaxation Massage", "Face & Skin Care"],
    description: "Premium spa treatments and aesthetic services.",
    website: "https://serenityspa.my",
    isActive: false, status: "suspended",
    taxProfile: { isTaxRegistered: true, taxRegNo: "SST-2023-009012", taxRate: 0.08 },
    commissionSchema: [
      { mainService: "Traditional / Relaxation Massage", firstLevelQty: 0, firstLevelRate: 0.15, subsequentLevelQty: 1, subsequentLevelRate: 0.12, lastUpdated: "2026-02-15T00:00:00Z" },
    ],
    admins: [{ id: "SPA-004", spId: "SP-20260210-0004", name: "Mei Ling Tan", email: "mei@serenityspa.my", status: "active", invitedAt: "2026-02-12T00:00:00Z", branchIds: [] }],
    branches: [
      {
        id: "SPB-004", spId: "SP-20260210-0004", name: "Serenity Pavilion KL",
        services: [{ service: "Traditional / Relaxation Massage", subServices: ["Swedish Massage"] }],
        address: { line: "Level 5, Pavilion Kuala Lumpur", city: "Kuala Lumpur", state: "Wilayah Persekutuan", country: "Malaysia", postalCode: "55100", lat: 3.1488, lon: 101.7131 },
        contacts: [{ name: "Lena Yap", email: "lena@serenityspa.my", type: "branch_manager", phone: "+60161234567", isPublic: true }],
        administrators: [], isActive: false, operatingHours: DEFAULT_HOURS,
        benefits: ["Private Rooms", "Steam Room", "Free WiFi"],
      },
    ],
    vouchers: [], activeVoucherCount: 0,
    createdAt: "2026-02-10T00:00:00Z", updatedAt: "2026-03-20T00:00:00Z",
  }

  // Generated entries (index 4-9)
  const g = index - 4
  const d = GENERATED_SPS[g]!
  const n = index + 1
  return {
    id: `SP-20260401-00${String(n).padStart(2, "0")}`,
    brandId: d.brandId,
    name: d.name,
    registrationNo: `${7000000 + g}-X`,
    serviceCategories: d.cats,
    mainServices: d.services,
    description: `Certified wellness centre offering ${d.services[0]?.toLowerCase() ?? "quality"} services.`,
    website: `https://partner${n}.my`,
    isActive: d.status === "active",
    status: d.status,
    taxProfile: { isTaxRegistered: false, taxRate: 0.08 },
    commissionSchema: [{ mainService: d.services[0] ?? "General", firstLevelQty: 0, firstLevelRate: 0.12, subsequentLevelQty: 1, subsequentLevelRate: 0.10, lastUpdated: "2026-04-01T00:00:00Z" }],
    admins: [],
    branches: [],
    vouchers: [],
    activeVoucherCount: g % 3,
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  }
}
