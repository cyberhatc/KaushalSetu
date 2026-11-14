// 30+ diverse UP youth candidate profiles for the Admin "Reverse-Cohort" generator.

export interface YouthProfile {
  id: string;
  name: string;
  district: string;
  education: string;
  experienceYears: number;
  hardSkills: string[];
  softSkills: string[];
  preferredSector: string;
  verified: boolean; // UPSDM / Skill India verified badge
}

export const YOUTH_PROFILES_SEED: YouthProfile[] = [
  { id: "YP-001", name: "Ramesh Kumar", district: "Barabanki", education: "12th Pass + ITI (Fitter)", experienceYears: 2, hardSkills: ["motor winding", "lathe machine", "basic lathe operation", "electrical wiring"], softSkills: ["punctual", "team coordination"], preferredSector: "Manufacturing", verified: true },
  { id: "YP-002", name: "Priya Sharma", district: "Varanasi", education: "B.A. Graduate", experienceYears: 1, hardSkills: ["ecommerce cataloging", "product photography", "ms excel"], softSkills: ["communication", "basic spoken english"], preferredSector: "Handloom / E-Commerce", verified: true },
  { id: "YP-003", name: "Aamir Ansari", district: "Bhadohi", education: "12th Pass", experienceYears: 4, hardSkills: ["carpet knotting", "handloom weaving", "quality inspection"], softSkills: ["hardworking"], preferredSector: "Handicrafts", verified: false },
  { id: "YP-004", name: "Deepak Yadav", district: "Lucknow", education: "ITI Electrician", experienceYears: 3, hardSkills: ["electrical wiring", "multimeter testing", "ev charger installation"], softSkills: ["problem solving"], preferredSector: "Electric Vehicles", verified: true },
  { id: "YP-005", name: "Sunita Devi", district: "Sitapur", education: "10th Pass", experienceYears: 0, hardSkills: ["packing", "handloom weaving"], softSkills: ["punctual", "eager to learn"], preferredSector: "Textiles", verified: false },
  { id: "YP-006", name: "Mohd. Sarfaraz", district: "Kanpur Nagar", education: "ITI (Welder)", experienceYears: 2, hardSkills: ["arc welding", "technical drawings", "precision measurement"], softSkills: ["team coordination"], preferredSector: "Manufacturing", verified: true },
  { id: "YP-007", name: "Ankit Verma", district: "Gautam Buddha Nagar (Noida)", education: "Diploma Electronics", experienceYears: 1, hardSkills: ["pcb soldering", "surface mount assembly", "quality inspection"], softSkills: ["basic spoken english"], preferredSector: "Electronics", verified: true },
  { id: "YP-008", name: "Kavita Gupta", district: "Lucknow", education: "B.Sc. Graduate", experienceYears: 1, hardSkills: ["computer typing", "ms excel", "inventory tracking"], softSkills: ["customer service", "hindi communication"], preferredSector: "Services / BPO", verified: true },
  { id: "YP-009", name: "Sandeep Singh", district: "Unnao", education: "12th Pass + ITI", experienceYears: 5, hardSkills: ["leather cutting", "machine operation", "shift management"], softSkills: ["leadership"], preferredSector: "Leather & Footwear", verified: true },
  { id: "YP-010", name: "Ravi Prakash", district: "Prayagraj", education: "B.Com Graduate", experienceYears: 2, hardSkills: ["ms excel", "inventory tracking", "barcode scanning"], softSkills: ["team coordination", "basic spoken english"], preferredSector: "Logistics", verified: false },
  { id: "YP-011", name: "Neha Kumari", district: "Varanasi", education: "12th Pass", experienceYears: 1, hardSkills: ["smartphone apps", "ecommerce cataloging", "product photography"], softSkills: ["communication"], preferredSector: "Handloom / E-Commerce", verified: false },
  { id: "YP-012", name: "Imran Qureshi", district: "Agra", education: "ITI (Fitter)", experienceYears: 3, hardSkills: ["leather cutting", "machine operation", "precision measurement"], softSkills: ["punctual"], preferredSector: "Leather & Footwear", verified: true },
  { id: "YP-013", name: "Shivam Patel", district: "Gorakhpur", education: "10th Pass", experienceYears: 0, hardSkills: ["terracotta craft", "kiln operation"], softSkills: ["eager to learn"], preferredSector: "Handicrafts", verified: false },
  { id: "YP-014", name: "Pooja Singh", district: "Barabanki", education: "12th Pass", experienceYears: 2, hardSkills: ["solar panel installation", "rooftop mounting", "safety compliance"], softSkills: ["hardworking"], preferredSector: "Renewable Energy", verified: true },
  { id: "YP-015", name: "Farhan Ali", district: "Lucknow", education: "ITI (Mechanic)", experienceYears: 4, hardSkills: ["motor winding", "battery pack assembly", "multimeter testing", "industrial safety 5s"], softSkills: ["problem solving"], preferredSector: "Electric Vehicles", verified: true },
  { id: "YP-016", name: "Geeta Devi", district: "Bhadohi", education: "10th Pass", experienceYears: 6, hardSkills: ["carpet knotting", "handloom weaving", "quality inspection"], softSkills: ["team coordination"], preferredSector: "Handicrafts", verified: false },
  { id: "YP-017", name: "Vikas Chaudhary", district: "Meerut", education: "ITI (Machinist)", experienceYears: 2, hardSkills: ["lathe machine", "precision measurement", "technical drawings"], softSkills: ["punctual"], preferredSector: "Engineering Goods", verified: true },
  { id: "YP-018", name: "Rekha Yadav", district: "Kanpur Nagar", education: "12th Pass + ITI", experienceYears: 3, hardSkills: ["loom operations", "handloom weaving", "shift management"], softSkills: ["leadership"], preferredSector: "Textiles", verified: true },
  { id: "YP-019", name: "Rahul Mishra", district: "Ghaziabad", education: "Diploma Mechanical", experienceYears: 1, hardSkills: ["quality inspection", "calipers and micrometers", "iso 9001 basics"], softSkills: ["basic spoken english"], preferredSector: "Electronics", verified: false },
  { id: "YP-020", name: "Anchal Tiwari", district: "Prayagraj", education: "B.A. Graduate", experienceYears: 1, hardSkills: ["computer typing", "customer service", "ms excel"], softSkills: ["hindi communication", "basic spoken english"], preferredSector: "Services / BPO", verified: true },
  { id: "YP-021", name: "Javed Akhtar", district: "Moradabad", education: "12th Pass", experienceYears: 5, hardSkills: ["brass casting", "quality inspection", "kiln operation"], softSkills: ["hardworking"], preferredSector: "Handicrafts", verified: false },
  { id: "YP-022", name: "Manisha Rathore", district: "Jhansi", education: "ITI Electrician", experienceYears: 2, hardSkills: ["solar panel installation", "electrical wiring", "multimeter testing"], softSkills: ["problem solving"], preferredSector: "Renewable Energy", verified: true },
  { id: "YP-023", name: "Ashok Kumar", district: "Sitapur", education: "8th Pass", experienceYears: 8, hardSkills: ["packing", "barcode scanning"], softSkills: ["punctual"], preferredSector: "Logistics", verified: false },
  { id: "YP-024", name: "Shalini Verma", district: "Lucknow", education: "B.Sc. Graduate", experienceYears: 0, hardSkills: ["basic spoken english", "computer typing"], softSkills: ["eager to learn", "communication"], preferredSector: "Services / BPO", verified: false },
  { id: "YP-025", name: "Danish Khan", district: "Aligarh", education: "ITI (Fitter)", experienceYears: 3, hardSkills: ["lathe machine", "precision measurement", "quality inspection"], softSkills: ["team coordination"], preferredSector: "Engineering Goods", verified: true },
  { id: "YP-026", name: "Arti Kumari", district: "Varanasi", education: "12th Pass", experienceYears: 2, hardSkills: ["food safety fsms", "quality inspection", "machine operation"], softSkills: ["punctual"], preferredSector: "Food Processing", verified: true },
  { id: "YP-027", name: "Nikhil Dubey", district: "Gautam Buddha Nagar (Noida)", education: "B.Tech (Dropout)", experienceYears: 1, hardSkills: ["smt operation", "pick and place machine", "quality inspection"], softSkills: ["basic spoken english"], preferredSector: "Electronics", verified: true },
  { id: "YP-028", name: "Savita Bai", district: "Firozabad", education: "10th Pass", experienceYears: 4, hardSkills: ["kiln operation", "safety compliance", "quality inspection"], softSkills: ["hardworking"], preferredSector: "Glass & Ceramics", verified: false },
  { id: "YP-029", name: "Devendra Pal", district: "Unnao", education: "ITI (Turner)", experienceYears: 2, hardSkills: ["lathe machine", "cnc g-code fundamentals", "precision measurement"], softSkills: ["punctual"], preferredSector: "Defense Manufacturing", verified: true },
  { id: "YP-030", name: "Rukhsana Bano", district: "Lucknow", education: "12th Pass", experienceYears: 3, hardSkills: ["handloom knowledge", "ecommerce cataloging", "smartphone apps"], softSkills: ["communication"], preferredSector: "Handloom / ODOP", verified: true },
  { id: "YP-031", name: "Hemant Saini", district: "Saharanpur", education: "ITI (Carpenter)", experienceYears: 4, hardSkills: ["wood carving", "machine operation", "quality inspection"], softSkills: ["team coordination"], preferredSector: "Handicrafts", verified: false },
  { id: "YP-032", name: "Kiran Kumari", district: "Auraiya", education: "12th Pass", experienceYears: 1, hardSkills: ["dairy processing", "packing", "food safety fsms"], softSkills: ["punctual"], preferredSector: "Food Processing", verified: false },
];
