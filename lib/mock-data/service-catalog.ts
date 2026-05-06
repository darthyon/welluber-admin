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

export type ServiceId = (typeof SERVICES)[number]["id"]
