# Flexi-Benefit Taxonomy Masterlist

This taxonomy is structured for HR Information Systems (HRIS) and flex-benefit wallet architectures. It eliminates the use of ampersands, groups overlapping services into mutually exclusive parent categories, and uses clinical or standard operational terminology recognized by benefits administrators.

## Taxonomy Table

| Service Category (Tier 1) | Primary Service (Tier 2) | Sub-Service Specifications (Tier 3) |
| :--- | :--- | :--- |
| **Physical Wellbeing** | Gymnasium Facilities | Standard Gym Access, Boutique Studio Memberships |
| | Group Fitness | Yoga, Pilates, Indoor Cycling, Zumba, Martial Arts |
| | Personal Coaching | Individual Training, Small Group Training, Virtual Coaching |
| | Recreational Sports | Swimming Pool Access, Court Bookings (Tennis, Badminton), Golf |
| **Psychological Wellbeing** | Clinical Therapy | Psychotherapy, Cognitive Behavioral Therapy, Psychiatric Care |
| | Mental Fitness | Meditation App Subscriptions, Mindfulness Workshops |
| | Crisis Intervention | Addiction Recovery Support, Grief Counseling |
| | Life Coaching | Behavioral Coaching, Financial Wellness Counseling |
| **Medical Rehabilitation** | Physical Therapy | Sports Injury Rehabilitation, Post-Surgical Recovery |
| | Specialized Therapies | Occupational Therapy, Speech Therapy, Cardiac Rehabilitation |
| **Holistic Therapy** | Traditional Medicine | Traditional Chinese Medicine, Ayurveda, Acupuncture |
| | Complementary Therapy | Chiropractic Care, Osteopathy, Homeopathy |
| **Recovery Services** | Musculoskeletal Recovery | Deep Tissue Massage, Sports Massage, Clinical Reflexology |
| | Advanced Recovery | Cryotherapy, Infrared Sauna, Floatation Therapy, Hyperbaric Oxygen |
| **Nutritional Support** | Dietary Counseling | Clinical Dietitian Consultations, Diabetic Management Planning |
| | Nutritional Education | Healthy Meal Preparation Workshops, Weight Management Programs |
| **Preventive Health** | Health Screenings | Comprehensive Blood Panels, Biometric Screenings, Bone Density |
| | Ergonomic Support | Posture Assessments, Ergonomic Equipment Allowances |
| **Personal Care** | Therapeutic Spa Services | Relaxation Massage, Prenatal Massage, Hydrotherapy |
| | Dermatological Care | Clinical Skin Treatments, Laser Therapy, Eczema Management |

## Database Implementation Notes

* **Scalability:** The Tier 3 `Sub-Service Specifications` should ideally be treated as a tag or array field within the database rather than rigid foreign keys, allowing benefits managers to dynamically add new trending activities (e.g., "Padel") without requiring schema migrations.
* **Tax Code Flags:** In a flexi-benefit system, you will need a boolean column at the Tier 2 level (e.g., `is_taxable`) because "Therapeutic Spa Services" is often classified as a taxable lifestyle perk, whereas "Clinical Therapy" is typically a tax-exempt medical benefit.