export const SERVICE_TAXONOMY = [
  {
    category: "Fitness & Exercise",
    services: ["Gym Access", "Personal Training", "Fitness Classes", "Dance", "Martial Arts & Combat", "Swimming", "Outdoor & Adventure", "Racket Sports", "Team Sports", "Cycling", "Water Sports"]
  },
  {
    category: "Massage & Bodywork",
    services: ["Traditional / Relaxation Massage", "Therapeutic Massage", "Foot & Reflexology", "Prenatal & Postnatal", "Energy & Holistic Bodywork", "Head & Scalp"]
  },
  {
    category: "Spa & Aesthetics",
    services: ["Face & Skin Care", "Body Treatments", "Cosmetic Procedures", "Laser & Technology", "Nail & Grooming", "Waxing & Hair Removal"]
  },
  {
    category: "Beauty & Personal Care",
    services: ["Hair Care", "Makeup", "Eyebrow & Lash", "Teeth & Oral Aesthetics", "Ear Candling", "Tanning"]
  },
  {
    category: "Mental Health & Mindfulness",
    services: ["Therapy & Counselling", "Life & Executive Coaching", "Meditation", "Sound & Sensory Therapy", "Art & Expressive Therapy", "Stress & Anxiety Programs", "Psychiatry & Psychology"]
  },
  {
    category: "Medical & Allied Health",
    services: ["Physiotherapy", "Chiropractic & Osteopathy", "Occupational Therapy", "Speech Therapy", "Acupuncture & TCM", "Podiatry", "Optical", "Dental", "Health Screening", "Vaccination"]
  },
  {
    category: "Nutrition & Dietetics",
    services: ["Nutritional Counselling", "Meal Planning", "Body Composition Analysis", "Supplement Consultation"]
  },
  {
    category: "Recovery & Rehabilitation",
    services: ["Cryotherapy", "Heat Therapy", "Compression & Circulation", "Sports Recovery", "IV Therapy & Drips", "Hyperbaric Oxygen"]
  },
  {
    category: "Yoga & Pilates",
    services: ["Yoga", "Pilates", "Barre", "Stretching & Flexibility"]
  },
  {
    category: "Corporate & Group Wellness",
    services: ["Corporate Wellness Program", "Team Building", "Ergonomics", "Health Talk & Seminar"]
  },
  {
    category: "Alternative & Holistic Therapies",
    services: ["Energy Healing", "Hypnotherapy", "Naturopathy", "Ayurveda", "Aromatherapy"]
  },
  {
    category: "Maternal & Child Wellness",
    services: ["Prenatal Care", "Paediatric Wellness"]
  },
  {
    category: "Senior & Geriatric Wellness",
    services: ["Senior Fitness", "Geriatric Physiotherapy", "Dementia & Memory Support", "Palliative & Comfort Care"]
  }
];

export const SERVICE_SPEC_TAXONOMY: Record<string, string[]> = {
  "Gym Access": ["Daily Pass", "Weekly Pass", "Monthly Membership", "Annual Membership", "Off-Peak Pass"],
  "Personal Training": ["1-on-1 Session", "Small Group Training (2–5 pax)", "Online Coaching Session"],
  "Fitness Classes": ["Yoga", "Pilates", "Zumba", "HIIT", "Spin / Cycling", "Aerobics", "Body Pump", "CrossFit", "Barre", "TRX Suspension"],
  "Dance": ["Zumba", "Ballet", "Hip Hop", "Contemporary", "Latin Dance", "K-Pop Dance", "Salsa", "Ballroom"],
  "Martial Arts & Combat": ["Boxing", "Muay Thai", "Brazilian Jiu-Jitsu (BJJ)", "Kickboxing", "Taekwondo", "Karate", "MMA", "Self-Defence"],
  "Swimming": ["Lane Swim", "Aqua Aerobics", "Swim Coaching", "Kids Swim Lesson"],
  "Outdoor & Adventure": ["Boot Camp", "Trail Running", "Obstacle Course", "Rock Climbing", "Hiking Guide"],
  "Racket Sports": ["Badminton Court Rental", "Tennis Court Rental", "Squash Court Rental", "Padel Tennis"],
  "Team Sports": ["Futsal", "Basketball", "Volleyball", "Netball"],
  "Cycling": ["Indoor Cycling Class", "Outdoor Cycling Group Ride"],
  "Water Sports": ["Kayaking", "Stand-Up Paddleboarding (SUP)", "Surfing Lesson"],
  "Traditional / Relaxation Massage": ["Swedish Massage", "Balinese Massage", "Aromatherapy Massage", "Hot Stone Massage", "Lomi Lomi"],
  "Therapeutic Massage": ["Deep Tissue Massage", "Sports Recovery Massage", "Myofascial Release", "Trigger Point Therapy"],
  "Foot & Reflexology": ["Foot Reflexology", "Foot Soak + Scrub", "Traditional Chinese Reflexology"],
  "Prenatal & Postnatal": ["Prenatal Massage", "Postnatal Massage", "Confinement Massage (Urut Bersalin)"],
  "Energy & Holistic Bodywork": ["Reiki", "Thai Yoga Massage", "Shiatsu", "Acupressure"],
  "Head & Scalp": ["Indian Head Massage", "Scalp Treatment Massage", "Hair & Scalp Therapy"],
  "Face & Skin Care": ["Classic Facial", "Anti-Aging Facial", "Brightening Facial", "Acne Treatment Facial", "Hydrafacial", "Oxygen Facial"],
  "Body Treatments": ["Body Scrub", "Body Wrap", "Body Polish", "Hydrotherapy", "Slimming Wrap", "Detox Treatment"],
  "Cosmetic Procedures": ["Botox", "Dermal Fillers", "Thread Lift", "Chemical Peel", "Microdermabrasion", "PRP Treatment"],
  "Laser & Technology": ["Laser Hair Removal", "Laser Skin Resurfacing", "IPL Photofacial", "RF Skin Tightening", "Cryotherapy"],
  "Nail & Grooming": ["Manicure", "Pedicure", "Gel Nails", "Nail Art", "Paraffin Treatment"],
  "Waxing & Hair Removal": ["Full Body Wax", "Brazilian Wax", "Eyebrow Threading", "Facial Hair Removal"],
  "Hair Care": ["Haircut", "Hair Colouring", "Highlights / Balayage", "Keratin Treatment", "Hair Rebonding", "Perming", "Scalp Treatment"],
  "Makeup": ["Bridal Makeup", "Event Makeup", "Makeup Lesson", "Airbrush Makeup"],
  "Eyebrow & Lash": ["Eyebrow Embroidery", "Eyelash Extension", "Lash Lift & Tint", "Microblading"],
  "Teeth & Oral Aesthetics": ["Teeth Whitening", "Dental Cleaning (Aesthetic)", "Invisalign Consultation"],
  "Ear Candling": ["Ear Candling Session"],
  "Tanning": ["Spray Tan", "UV Tanning Bed"],
  "Therapy & Counselling": ["Individual Therapy", "Couples Therapy", "Group Counselling", "Family Therapy", "Grief Counselling", "Trauma Therapy"],
  "Life & Executive Coaching": ["Life Coaching Session", "Executive Coaching", "Career Coaching", "Burnout Recovery Coaching"],
  "Meditation": ["Guided Meditation Session", "Mindfulness-Based Stress Reduction (MBSR)", "Transcendental Meditation", "Breathwork"],
  "Sound & Sensory Therapy": ["Sound Bath", "Singing Bowl Therapy", "Floatation / Sensory Deprivation Tank"],
  "Art & Expressive Therapy": ["Art Therapy", "Music Therapy", "Drama Therapy", "Journalling Workshop"],
  "Stress & Anxiety Programs": ["Corporate Wellness Workshop", "Stress Management Program", "Sleep Improvement Program"],
  "Psychiatry & Psychology": ["Psychiatric Assessment", "Psychological Testing", "Medication Review"],
  "Physiotherapy": ["Injury Rehabilitation", "Post-Surgery Recovery", "Sports Physiotherapy", "Dry Needling"],
  "Chiropractic & Osteopathy": ["Spinal Adjustment", "Posture Correction", "Neck & Back Treatment", "Scoliosis Management"],
  "Occupational Therapy": ["Workplace Ergonomics Assessment", "Motor Skills Rehabilitation", "Sensory Integration Therapy"],
  "Speech Therapy": ["Adult Speech Therapy", "Swallowing Therapy", "Voice Therapy"],
  "Acupuncture & TCM": ["Traditional Acupuncture", "Cupping Therapy", "TCM Consultation", "Herbal Therapy"],
  "Podiatry": ["Foot Assessment", "Orthotics Fitting", "Nail Treatment", "Diabetic Foot Care"],
  "Optical": ["Eye Screening", "Vision Test", "Contact Lens Fitting"],
  "Dental": ["Dental Checkup & Cleaning", "Tooth Extraction", "Filling", "Root Canal", "Orthodontic Consultation"],
  "Health Screening": ["Basic Health Screening", "Comprehensive Health Screening", "Executive Health Check", "Cardiac Screening"],
  "Vaccination": ["Influenza Vaccine", "Hepatitis Vaccine", "Travel Vaccine", "HPV Vaccine"],
  "Nutritional Counselling": ["General Nutrition Consultation", "Sports Nutrition", "Weight Management", "Clinical Nutrition (Diabetes / Kidney)"],
  "Meal Planning": ["Custom Meal Plan", "Diet Planning for Weight Loss", "Plant-Based Diet Plan", "Post-Op Nutrition Plan"],
  "Body Composition Analysis": ["DEXA Scan", "InBody Scan", "Hydrostatic Weighing"],
  "Supplement Consultation": ["Sports Supplement Advice", "Vitamin & Mineral Review"],
  "Cryotherapy": ["Whole Body Cryotherapy", "Localised Cryotherapy", "Ice Bath / Cold Plunge"],
  "Heat Therapy": ["Infrared Sauna", "Steam Room", "Traditional Sauna", "Hot Tub"],
  "Compression & Circulation": ["Lymphatic Drainage Massage", "Compression Therapy (Boots)", "NormaTec Session"],
  "Sports Recovery": ["Foam Rolling Class", "Stretching Session", "Active Recovery Class", "IASTM (Instrument-Assisted)"],
  "IV Therapy & Drips": ["Vitamin C IV Drip", "Hydration IV Drip", "NAD+ Therapy", "Immunity Boost Drip"],
  "Hyperbaric Oxygen": ["Hyperbaric Oxygen Therapy (HBOT) Session"],
  "Yoga": ["Hatha Yoga", "Vinyasa Flow", "Yin Yoga", "Restorative Yoga", "Hot Yoga", "Aerial Yoga", "Prenatal Yoga", "Kids Yoga"],
  "Pilates": ["Mat Pilates", "Reformer Pilates", "Clinical Pilates", "Prenatal Pilates"],
  "Barre": ["Barre Class", "Barre Fusion (Pilates + Barre)"],
  "Stretching & Flexibility": ["Assisted Stretching Session", "Flexibility Workshop"],
  "Corporate Wellness Program": ["Onsite Wellness Day", "Employee Wellness Workshop", "Mental Health First Aid Training"],
  "Team Building": ["Wellness-Themed Team Building", "Yoga / Fitness Team Session", "Cooking (Healthy) Workshop"],
  "Ergonomics": ["Workplace Ergonomics Assessment", "Desk Setup Consultation"],
  "Health Talk & Seminar": ["Nutrition Talk", "Stress Management Seminar", "Sleep Hygiene Workshop", "Mental Health Awareness Talk"],
  "Energy Healing": ["Reiki Session", "Pranic Healing", "Crystal Healing", "Chakra Balancing"],
  "Hypnotherapy": ["Hypnotherapy for Anxiety", "Hypnotherapy for Weight Loss", "Hypnotherapy for Smoking Cessation"],
  "Naturopathy": ["Naturopathic Consultation", "Homeopathy", "Herbal Medicine Consultation"],
  "Ayurveda": ["Ayurvedic Consultation", "Abhyanga (Ayurvedic Massage)", "Shirodhara", "Panchakarma"],
  "Aromatherapy": ["Aromatherapy Consultation", "Custom Blend Session"],
  "Prenatal Care": ["Prenatal Yoga", "Prenatal Massage", "Antenatal Class", "Hypnobirthing"],
  "Paediatric Wellness": ["Paediatric Physiotherapy", "Child Occupational Therapy", "Infant Massage Class"],
  "Senior Fitness": ["Silver Yoga", "Chair Exercise Class", "Low-Impact Aerobics", "Balance & Fall Prevention Class"],
  "Geriatric Physiotherapy": ["Mobility Rehabilitation", "Post-Stroke Physiotherapy", "Joint Replacement Recovery"],
  "Dementia & Memory Support": ["Cognitive Stimulation Therapy", "Memory Enhancement Program"],
  "Palliative & Comfort Care": ["Palliative Massage", "Comfort Care Therapy"]
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
