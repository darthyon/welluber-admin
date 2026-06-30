export interface ServiceTaxonomyGroup {
  category: string;
  services: string[];
}

export interface ServiceCatalogService {
  id: string;
  name: string;
  subServices: string[];
}

export interface ServiceCatalogGroup {
  category: string;
  services: ServiceCatalogService[];
}

export const MASTER_SERVICE_TAXONOMY: ServiceCatalogGroup[] = [
  {
    category: "Fitness & Exercise",
    services: [
      { id: "FX-GYM", name: "Gym Access", subServices: ["Daily Pass", "Weekly Pass", "Monthly Membership", "Annual Membership", "Off-Peak Pass"] },
      { id: "FX-PT", name: "Personal Training", subServices: ["1-on-1 Session", "Small Group Training (2–5 pax)", "Online Coaching Session"] },
      { id: "FX-CLS", name: "Fitness Classes", subServices: ["Yoga", "Pilates", "Zumba", "HIIT", "Spin / Cycling", "Aerobics", "Body Pump", "CrossFit", "Barre", "TRX Suspension"] },
      { id: "FX-DAN", name: "Dance", subServices: ["Zumba", "Ballet", "Hip Hop", "Contemporary", "Latin Dance", "K-Pop Dance", "Salsa", "Ballroom"] },
      { id: "FX-MA", name: "Martial Arts & Combat", subServices: ["Boxing", "Muay Thai", "Brazilian Jiu-Jitsu (BJJ)", "Kickboxing", "Taekwondo", "Karate", "MMA", "Self-Defence"] },
      { id: "FX-SWM", name: "Swimming", subServices: ["Lane Swim", "Aqua Aerobics", "Swim Coaching", "Kids Swim Lesson"] },
      { id: "FX-OUT", name: "Outdoor & Adventure", subServices: ["Boot Camp", "Trail Running", "Obstacle Course", "Rock Climbing", "Hiking Guide"] },
      { id: "FX-RKT", name: "Racket Sports", subServices: ["Badminton Court Rental", "Tennis Court Rental", "Squash Court Rental", "Padel Tennis"] },
      { id: "FX-TM", name: "Team Sports", subServices: ["Futsal", "Basketball", "Volleyball", "Netball"] },
      { id: "FX-CYC", name: "Cycling", subServices: ["Indoor Cycling Class", "Outdoor Cycling Group Ride"] },
      { id: "FX-WTR", name: "Water Sports", subServices: ["Kayaking", "Stand-Up Paddleboarding (SUP)", "Surfing Lesson"] },
    ],
  },
  {
    category: "Massage & Bodywork",
    services: [
      { id: "MB-REL", name: "Traditional / Relaxation Massage", subServices: ["Swedish Massage", "Balinese Massage", "Aromatherapy Massage", "Hot Stone Massage", "Lomi Lomi"] },
      { id: "MB-THR", name: "Therapeutic Massage", subServices: ["Deep Tissue Massage", "Sports Recovery Massage", "Myofascial Release", "Trigger Point Therapy"] },
      { id: "MB-FT", name: "Foot & Reflexology", subServices: ["Foot Reflexology", "Foot Soak + Scrub", "Traditional Chinese Reflexology"] },
      { id: "MB-PN", name: "Prenatal & Postnatal", subServices: ["Prenatal Massage", "Postnatal Massage", "Confinement Massage (Urut Bersalin)"] },
      { id: "MB-ENG", name: "Energy & Holistic Bodywork", subServices: ["Reiki", "Thai Yoga Massage", "Shiatsu", "Acupressure"] },
      { id: "MB-HD", name: "Head & Scalp", subServices: ["Indian Head Massage", "Scalp Treatment Massage", "Hair & Scalp Therapy"] },
    ],
  },
  {
    category: "Spa & Aesthetics",
    services: [
      { id: "SP-FAC", name: "Face & Skin Care", subServices: ["Classic Facial", "Anti-Aging Facial", "Brightening Facial", "Acne Treatment Facial", "Hydrafacial", "Oxygen Facial"] },
      { id: "SP-BDY", name: "Body Treatments", subServices: ["Body Scrub", "Body Wrap", "Body Polish", "Hydrotherapy", "Slimming Wrap", "Detox Treatment"] },
      { id: "SP-COS", name: "Cosmetic Procedures", subServices: ["Botox", "Dermal Fillers", "Thread Lift", "Chemical Peel", "Microdermabrasion", "PRP Treatment"] },
      { id: "SP-LAS", name: "Laser & Technology", subServices: ["Laser Hair Removal", "Laser Skin Resurfacing", "IPL Photofacial", "RF Skin Tightening", "Cryotherapy"] },
      { id: "SP-NAIL", name: "Nail & Grooming", subServices: ["Manicure", "Pedicure", "Gel Nails", "Nail Art", "Paraffin Treatment"] },
      { id: "SP-WAX", name: "Waxing & Hair Removal", subServices: ["Full Body Wax", "Brazilian Wax", "Eyebrow Threading", "Facial Hair Removal"] },
    ],
  },
  {
    category: "Beauty & Personal Care",
    services: [
      { id: "BC-HAIR", name: "Hair Care", subServices: ["Haircut", "Hair Colouring", "Highlights / Balayage", "Keratin Treatment", "Hair Rebonding", "Perming", "Scalp Treatment"] },
      { id: "BC-MKP", name: "Makeup", subServices: ["Bridal Makeup", "Event Makeup", "Makeup Lesson", "Airbrush Makeup"] },
      { id: "BC-LASH", name: "Eyebrow & Lash", subServices: ["Eyebrow Embroidery", "Eyelash Extension", "Lash Lift & Tint", "Microblading"] },
      { id: "BC-TEETH", name: "Teeth & Oral Aesthetics", subServices: ["Teeth Whitening", "Dental Cleaning (Aesthetic)", "Invisalign Consultation"] },
      { id: "BC-EAR", name: "Ear Candling", subServices: ["Ear Candling Session"] },
      { id: "BC-TAN", name: "Tanning", subServices: ["Spray Tan", "UV Tanning Bed"] },
    ],
  },
  {
    category: "Mental Health & Mindfulness",
    services: [
      { id: "MH-THR", name: "Therapy & Counselling", subServices: ["Individual Therapy", "Couples Therapy", "Group Counselling", "Family Therapy", "Grief Counselling", "Trauma Therapy"] },
      { id: "MH-CCH", name: "Life & Executive Coaching", subServices: ["Life Coaching Session", "Executive Coaching", "Career Coaching", "Burnout Recovery Coaching"] },
      { id: "MH-MED", name: "Meditation", subServices: ["Guided Meditation Session", "Mindfulness-Based Stress Reduction (MBSR)", "Transcendental Meditation", "Breathwork"] },
      { id: "MH-SND", name: "Sound & Sensory Therapy", subServices: ["Sound Bath", "Singing Bowl Therapy", "Floatation / Sensory Deprivation Tank"] },
      { id: "MH-ART", name: "Art & Expressive Therapy", subServices: ["Art Therapy", "Music Therapy", "Drama Therapy", "Journalling Workshop"] },
      { id: "MH-STR", name: "Stress & Anxiety Programs", subServices: ["Corporate Wellness Workshop", "Stress Management Program", "Sleep Improvement Program"] },
      { id: "MH-PSY", name: "Psychiatry & Psychology", subServices: ["Psychiatric Assessment", "Psychological Testing", "Medication Review"] },
    ],
  },
  {
    category: "Medical & Allied Health",
    services: [
      { id: "MD-PHY", name: "Physiotherapy", subServices: ["Injury Rehabilitation", "Post-Surgery Recovery", "Sports Physiotherapy", "Dry Needling"] },
      { id: "MD-CHI", name: "Chiropractic & Osteopathy", subServices: ["Spinal Adjustment", "Posture Correction", "Neck & Back Treatment", "Scoliosis Management"] },
      { id: "MD-OCC", name: "Occupational Therapy", subServices: ["Workplace Ergonomics Assessment", "Motor Skills Rehabilitation", "Sensory Integration Therapy"] },
      { id: "MD-SPC", name: "Speech Therapy", subServices: ["Adult Speech Therapy", "Swallowing Therapy", "Voice Therapy"] },
      { id: "MD-ACM", name: "Acupuncture & TCM", subServices: ["Traditional Acupuncture", "Cupping Therapy", "TCM Consultation", "Herbal Therapy"] },
      { id: "MD-POD", name: "Podiatry", subServices: ["Foot Assessment", "Orthotics Fitting", "Nail Treatment", "Diabetic Foot Care"] },
      { id: "MD-EYE", name: "Optical", subServices: ["Eye Screening", "Vision Test", "Contact Lens Fitting"] },
      { id: "MD-DEN", name: "Dental", subServices: ["Dental Checkup & Cleaning", "Tooth Extraction", "Filling", "Root Canal", "Orthodontic Consultation"] },
      { id: "MD-MSP", name: "Medical / Specialist", subServices: ["GP Consultation", "Specialist Consultation", "Outpatient Diagnostic Review"] },
      { id: "MD-GPV", name: "GP / Clinic Visit", subServices: ["General Practitioner Visit", "Panel Clinic Visit", "Urgent Care Consultation"] },
      { id: "MD-RX", name: "Pharmacy", subServices: ["Prescription Fulfilment", "Over-the-Counter Medication", "Essential Medication Supply"] },
      { id: "MD-SCR", name: "Health Screening", subServices: ["Basic Health Screening", "Comprehensive Health Screening", "Executive Health Check", "Cardiac Screening"] },
      { id: "MD-VAC", name: "Vaccination", subServices: ["Influenza Vaccine", "Hepatitis Vaccine", "Travel Vaccine", "HPV Vaccine"] },
    ],
  },
  {
    category: "Nutrition & Dietetics",
    services: [
      { id: "NT-NUT", name: "Nutritional Counselling", subServices: ["General Nutrition Consultation", "Sports Nutrition", "Weight Management", "Clinical Nutrition (Diabetes / Kidney)"] },
      { id: "NT-ML", name: "Meal Planning", subServices: ["Custom Meal Plan", "Diet Planning for Weight Loss", "Plant-Based Diet Plan", "Post-Op Nutrition Plan"] },
      { id: "NT-BCA", name: "Body Composition Analysis", subServices: ["DEXA Scan", "InBody Scan", "Hydrostatic Weighing"] },
      { id: "NT-SUP", name: "Supplement Consultation", subServices: ["Sports Supplement Advice", "Vitamin & Mineral Review"] },
    ],
  },
  {
    category: "Recovery & Rehabilitation",
    services: [
      { id: "RC-CRY", name: "Cryotherapy", subServices: ["Whole Body Cryotherapy", "Localised Cryotherapy", "Ice Bath / Cold Plunge"] },
      { id: "RC-HT", name: "Heat Therapy", subServices: ["Infrared Sauna", "Steam Room", "Traditional Sauna", "Hot Tub"] },
      { id: "RC-CMP", name: "Compression & Circulation", subServices: ["Lymphatic Drainage Massage", "Compression Therapy (Boots)", "NormaTec Session"] },
      { id: "RC-SPR", name: "Sports Recovery", subServices: ["Foam Rolling Class", "Stretching Session", "Active Recovery Class", "IASTM (Instrument-Assisted)"] },
      { id: "RC-IV", name: "IV Therapy & Drips", subServices: ["Vitamin C IV Drip", "Hydration IV Drip", "NAD+ Therapy", "Immunity Boost Drip"] },
      { id: "RC-HBO", name: "Hyperbaric Oxygen", subServices: ["Hyperbaric Oxygen Therapy (HBOT) Session"] },
    ],
  },
  {
    category: "Yoga & Pilates",
    services: [
      { id: "YP-YGA", name: "Yoga", subServices: ["Hatha Yoga", "Vinyasa Flow", "Yin Yoga", "Restorative Yoga", "Hot Yoga", "Aerial Yoga", "Prenatal Yoga", "Kids Yoga"] },
      { id: "YP-PIL", name: "Pilates", subServices: ["Mat Pilates", "Reformer Pilates", "Clinical Pilates", "Prenatal Pilates"] },
      { id: "YP-BAR", name: "Barre", subServices: ["Barre Class", "Barre Fusion (Pilates + Barre)"] },
      { id: "YP-STF", name: "Stretching & Flexibility", subServices: ["Assisted Stretching Session", "Flexibility Workshop"] },
    ],
  },
  {
    category: "Corporate & Group Wellness",
    services: [
      { id: "CW-CWP", name: "Corporate Wellness Program", subServices: ["Onsite Wellness Day", "Employee Wellness Workshop", "Mental Health First Aid Training"] },
      { id: "CW-TB", name: "Team Building", subServices: ["Wellness-Themed Team Building", "Yoga / Fitness Team Session", "Cooking (Healthy) Workshop"] },
      { id: "CW-ERG", name: "Ergonomics", subServices: ["Workplace Ergonomics Assessment", "Desk Setup Consultation"] },
      { id: "CW-TLK", name: "Health Talk & Seminar", subServices: ["Nutrition Talk", "Stress Management Seminar", "Sleep Hygiene Workshop", "Mental Health Awareness Talk"] },
    ],
  },
  {
    category: "Alternative & Holistic Therapies",
    services: [
      { id: "HT-ENG", name: "Energy Healing", subServices: ["Reiki Session", "Pranic Healing", "Crystal Healing", "Chakra Balancing"] },
      { id: "HT-HYP", name: "Hypnotherapy", subServices: ["Hypnotherapy for Anxiety", "Hypnotherapy for Weight Loss", "Hypnotherapy for Smoking Cessation"] },
      { id: "HT-NAT", name: "Naturopathy", subServices: ["Naturopathic Consultation", "Homeopathy", "Herbal Medicine Consultation"] },
      { id: "HT-AYU", name: "Ayurveda", subServices: ["Ayurvedic Consultation", "Abhyanga (Ayurvedic Massage)", "Shirodhara", "Panchakarma"] },
      { id: "HT-ARO", name: "Aromatherapy", subServices: ["Aromatherapy Consultation", "Custom Blend Session"] },
    ],
  },
  {
    category: "Maternal & Child Wellness",
    services: [
      { id: "MC-PRE", name: "Prenatal Care", subServices: ["Prenatal Yoga", "Prenatal Massage", "Antenatal Class", "Hypnobirthing"] },
      { id: "MC-PST", name: "Postnatal Recovery", subServices: ["Postnatal Massage", "Postnatal Pilates", "Urut Bersalin (Confinement Massage)", "Pelvic Floor Therapy"] },
      { id: "MC-LAC", name: "Lactation Support", subServices: ["Lactation Consultation", "Breastfeeding Workshop"] },
      { id: "MC-PED", name: "Paediatric Wellness", subServices: ["Paediatric Physiotherapy", "Child Occupational Therapy", "Infant Massage Class"] },
    ],
  },
  {
    category: "Senior & Geriatric Wellness",
    services: [
      { id: "SR-FIT", name: "Senior Fitness", subServices: ["Silver Yoga", "Chair Exercise Class", "Low-Impact Aerobics", "Balance & Fall Prevention Class"] },
      { id: "SR-PHY", name: "Geriatric Physiotherapy", subServices: ["Mobility Rehabilitation", "Post-Stroke Physiotherapy", "Joint Replacement Recovery"] },
      { id: "SR-DEM", name: "Dementia & Memory Support", subServices: ["Cognitive Stimulation Therapy", "Memory Enhancement Program"] },
      { id: "SR-PAL", name: "Palliative & Comfort Care", subServices: ["Palliative Massage", "Comfort Care Therapy"] },
    ],
  },
];

/** Flat list of all main services with IDs — used by benefit policy domain. */
export const POLICY_SERVICE_CATALOG: { id: string; category: string; name: string }[] =
  MASTER_SERVICE_TAXONOMY.flatMap((group) =>
    group.services.map((service) => ({
      id: service.id,
      category: group.category,
      name: service.name,
    }))
  );

/** All valid main-service IDs. */
export type MainServiceId = (typeof POLICY_SERVICE_CATALOG)[number]["id"];

const CATEGORY_ALIASES: Record<string, string> = {
  "Physical Wellbeing": "Fitness & Exercise",
  "Psychological Wellbeing": "Mental Health & Mindfulness",
  "Medical Rehabilitation": "Medical & Allied Health",
  "Holistic Therapy": "Massage & Bodywork",
  "Recovery Services": "Recovery & Rehabilitation",
  "Nutritional Support": "Nutrition & Dietetics",
  "Preventive Health": "Medical & Allied Health",
  "Personal Care": "Beauty & Personal Care",
  "Mindfulness & Mental": "Mental Health & Mindfulness",
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

export function resolveBranchServiceView(serviceCategories: string[], selectedServices: { service: string, subServices: string[] }[]) {
  const catalog = buildBranchServiceCatalog(serviceCategories);
  
  // Group selected services by their category in the catalog
  const groups: { category: string, services: { name: string, subServices: string[] }[] }[] = [];
  const customServices: string[] = []; // Truly unknown main services

  selectedServices.forEach(line => {
    let found = false;
    for (const group of catalog) {
      const match = group.services.find(s => s.name === line.service);
      if (match) {
        let existingGroup = groups.find(g => g.category === group.category);
        if (!existingGroup) {
          existingGroup = { category: group.category, services: [] };
          groups.push(existingGroup);
        }
        existingGroup.services.push({
          name: line.service,
          subServices: line.subServices
        });
        found = true;
        break;
      }
    }
    
    if (!found) {
      customServices.push(line.service);
    }
  });

  return { groups, customServices };
}
