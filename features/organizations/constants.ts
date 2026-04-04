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

export const SERVICE_SPEC_TAXONOMY: Record<string, string[]> = {
  "Gymnasium Facilities": ["Standard Gym Access", "Boutique Studio Memberships"],
  "Group Fitness": ["Yoga", "Pilates", "Indoor Cycling", "Zumba", "Martial Arts"],
  "Personal Coaching": ["Individual Training", "Small Group Training", "Virtual Coaching"],
  "Recreational Sports": ["Swimming Pool Access", "Court Bookings (Tennis, Badminton)", "Golf"],
  "Clinical Therapy": ["Psychotherapy", "Cognitive Behavioral Therapy", "Psychiatric Care"],
  "Mental Fitness": ["Meditation App Subscriptions", "Mindfulness Workshops"],
  "Crisis Intervention": ["Addiction Recovery Support", "Grief Counseling"],
  "Life Coaching": ["Behavioral Coaching", "Financial Wellness Counseling"],
  "Physical Therapy": ["Sports Injury Rehabilitation", "Post-Surgical Recovery"],
  "Specialized Therapies": ["Occupational Therapy", "Speech Therapy", "Cardiac Rehabilitation"],
  "Traditional Medicine": ["Traditional Chinese Medicine", "Ayurveda", "Acupuncture"],
  "Complementary Therapy": ["Chiropractic Care", "Osteopathy", "Homeopathy"],
  "Musculoskeletal Recovery": ["Deep Tissue Massage", "Sports Massage", "Clinical Reflexology"],
  "Advanced Recovery": ["Cryotherapy", "Infrared Sauna", "Floatation Therapy", "Hyperbaric Oxygen"],
  "Dietary Counseling": ["Clinical Dietitian Consultations", "Diabetic Management Planning"],
  "Nutritional Education": ["Healthy Meal Preparation Workshops", "Weight Management Programs"],
  "Health Screenings": ["Comprehensive Blood Panels", "Biometric Screenings", "Bone Density"],
  "Ergonomic Support": ["Posture Assessments", "Ergonomic Equipment Allowances"],
  "Therapeutic Spa Services": ["Relaxation Massage", "Prenatal Massage", "Hydrotherapy"],
  "Dermatological Care": ["Clinical Skin Treatments", "Laser Therapy", "Eczema Management"]
};

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
