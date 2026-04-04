export interface ServiceTaxonomyGroup {
  category: string;
  services: string[];
}

export interface ServiceCatalogService {
  name: string;
  subServices: string[];
}

export interface ServiceCatalogGroup {
  category: string;
  services: ServiceCatalogService[];
}

const MASTER_SERVICE_TAXONOMY: ServiceCatalogGroup[] = [
  {
    category: "Physical Wellbeing",
    services: [
      { name: "Gymnasium Facilities", subServices: ["Standard Gym Access", "Boutique Studio Memberships"] },
      { name: "Group Fitness", subServices: ["Yoga", "Pilates", "Indoor Cycling", "Zumba", "Martial Arts"] },
      { name: "Personal Coaching", subServices: ["Individual Training", "Small Group Training", "Virtual Coaching"] },
      { name: "Recreational Sports", subServices: ["Swimming Pool Access", "Court Bookings", "Golf"] },
    ],
  },
  {
    category: "Psychological Wellbeing",
    services: [
      { name: "Clinical Therapy", subServices: ["Psychotherapy", "Cognitive Behavioral Therapy", "Psychiatric Care"] },
      { name: "Mental Fitness", subServices: ["Meditation App Subscriptions", "Mindfulness Workshops"] },
      { name: "Crisis Intervention", subServices: ["Addiction Recovery Support", "Grief Counseling"] },
      { name: "Life Coaching", subServices: ["Behavioral Coaching", "Financial Wellness Counseling"] },
    ],
  },
  {
    category: "Medical Rehabilitation",
    services: [
      { name: "Physical Therapy", subServices: ["Sports Injury Rehabilitation", "Post-Surgical Recovery"] },
      { name: "Specialized Therapies", subServices: ["Occupational Therapy", "Speech Therapy", "Cardiac Rehabilitation"] },
    ],
  },
  {
    category: "Holistic Therapy",
    services: [
      { name: "Traditional Medicine", subServices: ["Traditional Chinese Medicine", "Ayurveda", "Acupuncture"] },
      { name: "Complementary Therapy", subServices: ["Chiropractic Care", "Osteopathy", "Homeopathy"] },
    ],
  },
  {
    category: "Recovery Services",
    services: [
      { name: "Musculoskeletal Recovery", subServices: ["Deep Tissue Massage", "Sports Massage", "Clinical Reflexology"] },
      { name: "Advanced Recovery", subServices: ["Cryotherapy", "Infrared Sauna", "Floatation Therapy", "Hyperbaric Oxygen"] },
    ],
  },
  {
    category: "Nutritional Support",
    services: [
      { name: "Dietary Counseling", subServices: ["Clinical Dietitian Consultations", "Diabetic Management Planning"] },
      { name: "Nutritional Education", subServices: ["Healthy Meal Preparation Workshops", "Weight Management Programs"] },
    ],
  },
  {
    category: "Preventive Health",
    services: [
      { name: "Health Screenings", subServices: ["Comprehensive Blood Panels", "Biometric Screenings", "Bone Density"] },
      { name: "Ergonomic Support", subServices: ["Posture Assessments", "Ergonomic Equipment Allowances"] },
    ],
  },
  {
    category: "Personal Care",
    services: [
      { name: "Therapeutic Spa Services", subServices: ["Relaxation Massage", "Prenatal Massage", "Hydrotherapy"] },
      { name: "Dermatological Care", subServices: ["Clinical Skin Treatments", "Laser Therapy", "Eczema Management"] },
    ],
  },
];

const CATEGORY_ALIASES: Record<string, string> = {
  "Mindfulness & Mental": "Psychological Wellbeing",
};

function normalizeCategory(category: string) {
  return CATEGORY_ALIASES[category] ?? category;
}

export function buildBranchServiceTaxonomy(serviceCategories: string[]): ServiceTaxonomyGroup[] {
  const allowedCategories = new Set(serviceCategories.map(normalizeCategory));

  return MASTER_SERVICE_TAXONOMY.filter((group) => allowedCategories.has(group.category)).map((group) => ({
    category: group.category,
    services: group.services.map((service) => service.name),
  }));
}

export function buildBranchServiceCatalog(serviceCategories: string[]): ServiceCatalogGroup[] {
  const allowedCategories = new Set(serviceCategories.map(normalizeCategory));
  return MASTER_SERVICE_TAXONOMY.filter((group) => allowedCategories.has(group.category));
}

export function resolveBranchServiceView(serviceCategories: string[], selectedServices: string[]) {
  const catalog = buildBranchServiceCatalog(serviceCategories);
  const selectedSet = new Set(selectedServices);
  const matchedItems = new Set<string>();

  const groups = catalog.flatMap((group) => {
    if (selectedSet.has(group.category)) {
      group.services.forEach((service) => matchedItems.add(service.name));
      return [
        {
          category: group.category,
          services: group.services.map((service) => ({
            name: service.name,
            subServices: service.subServices,
          })),
        },
      ];
    }

    const services = group.services.filter((service) => selectedSet.has(service.name));
    services.forEach((service) => matchedItems.add(service.name));

    return services.length > 0 ? [{ category: group.category, services }] : [];
  });

  const customServices = selectedServices.filter(
    (service) => !catalog.some((group) => group.category === service || group.services.some((item) => item.name === service))
  );

  return { groups, customServices };
}
