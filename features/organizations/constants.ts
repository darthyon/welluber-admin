export const SERVICE_TAXONOMY = [
  {
    category: "Physical Wellbeing",
    services: ["Gymnasium Facilities", "Group Fitness", "Personal Coaching", "Recreational Sports"]
  },
  {
    category: "Psychological Wellbeing",
    services: ["Clinical Therapy", "Mental Fitness", "Crisis Intervention", "Life Coaching"]
  },
  {
    category: "Medical Rehabilitation",
    services: ["Physical Therapy", "Specialized Therapies"]
  },
  {
    category: "Holistic Therapy",
    services: ["Traditional Medicine", "Complementary Therapy"]
  },
  {
    category: "Recovery Services",
    services: ["Musculoskeletal Recovery", "Advanced Recovery"]
  },
  {
    category: "Nutritional Support",
    services: ["Dietary Counseling", "Nutritional Education"]
  },
  {
    category: "Preventive Health",
    services: ["Health Screenings", "Ergonomic Support"]
  },
  {
    category: "Personal Care",
    services: ["Therapeutic Spa Services", "Dermatological Care"]
  }
];

export const ALL_SERVICES = SERVICE_TAXONOMY.flatMap(cat => cat.services);

export const WORKFORCE_RANGES = [
  { label: "1 - 50", min: 1, max: 50 },
  { label: "51 - 100", min: 51, max: 100 },
  { label: "101 - 500", min: 101, max: 500 },
  { label: "501 - 1000", min: 501, max: 1000 },
  { label: "1000+", min: 1001, max: 5000 },
];

export const INDUSTRIES = [
  "Technology",
  "Logistics",
  "Finance",
  "Manufacturing",
  "Healthcare",
  "Retail",
  "Education"
];
