// Uttar Pradesh district reference data (industrial clusters + coordinates for proximity scoring)

export interface UPDistrict {
  name: string;
  lat: number;
  lng: number;
  cluster: string;
  odop: string; // One District One Product
}

export const UP_DISTRICTS: UPDistrict[] = [
  { name: "Gautam Buddha Nagar (Noida)", lat: 28.57, lng: 77.32, cluster: "Noida–Greater Noida", odop: "Electronics & Apparel" },
  { name: "Ghaziabad", lat: 28.67, lng: 77.42, cluster: "Noida–Greater Noida", odop: "Engineering Goods" },
  { name: "Meerut", lat: 28.98, lng: 77.71, cluster: "West UP", odop: "Sports Goods" },
  { name: "Aligarh", lat: 27.89, lng: 78.08, cluster: "West UP", odop: "Locks & Hardware" },
  { name: "Agra", lat: 27.18, lng: 78.01, cluster: "West UP", odop: "Leather Footwear" },
  { name: "Moradabad", lat: 28.84, lng: 78.77, cluster: "West UP", odop: "Brass Handicrafts" },
  { name: "Kanpur Nagar", lat: 26.45, lng: 80.33, cluster: "Kanpur–Unnao", odop: "Leather & Textiles" },
  { name: "Unnao", lat: 26.55, lng: 80.49, cluster: "Kanpur–Unnao", odop: "Leather & Brass" },
  { name: "Lucknow", lat: 26.85, lng: 80.95, cluster: "Lucknow–Barabanki", odop: "Chikankari" },
  { name: "Barabanki", lat: 26.93, lng: 81.19, cluster: "Lucknow–Barabanki", odop: "Onion & Handloom" },
  { name: "Hardoi", lat: 27.42, lng: 80.12, cluster: "Lucknow–Barabanki", odop: "Household Linen" },
  { name: "Sitapur", lat: 27.57, lng: 80.68, cluster: "Lucknow–Barabanki", odop: "Machine Made Rugs" },
  { name: "Varanasi", lat: 25.32, lng: 82.97, cluster: "Varanasi–Gorakhpur", odop: "Banarasi Sarees" },
  { name: "Bhadohi", lat: 25.42, lng: 82.57, cluster: "Varanasi–Gorakhpur", odop: "Hand-Knotted Carpets" },
  { name: "Mirzapur", lat: 25.15, lng: 82.56, cluster: "Varanasi–Gorakhpur", odop: "Brassware & Carpets" },
  { name: "Gorakhpur", lat: 26.76, lng: 83.37, cluster: "Varanasi–Gorakhpur", odop: "Terracotta" },
  { name: "Prayagraj", lat: 25.44, lng: 81.84, cluster: "Prayagraj Belt", odop: "Cotton & Vermilion" },
  { name: "Bareilly", lat: 28.37, lng: 79.43, cluster: "Bareilly Belt", odop: "Zari Work" },
  { name: "Jhansi", lat: 25.45, lng: 78.58, cluster: "Bundelkhand", odop: "Sports & Safety Goods" },
  { name: "Chitrakoot", lat: 25.21, lng: 80.85, cluster: "Bundelkhand", odop: "Traditional Sweets" },
  { name: "Firozabad", lat: 27.15, lng: 78.39, cluster: "West UP", odop: "Glassware & Bangles" },
  { name: "Saharanpur", lat: 29.97, lng: 77.55, cluster: "West UP", odop: "Wood Carving" },
  { name: "Auraiya", lat: 26.47, lng: 79.51, cluster: "Bundelkhand", odop: "Dalia & Dairy" },
  { name: "Kanpur Dehat", lat: 26.42, lng: 79.94, cluster: "Kanpur–Unnao", odop: "Dairy" },
  { name: "Raebareli", lat: 26.23, lng: 81.24, cluster: "Lucknow–Barabanki", odop: "Bamboo Craft" },
  { name: "Amethi", lat: 26.16, lng: 81.81, cluster: "Prayagraj Belt", odop: "Food Processing" },
  { name: "Basti", lat: 27.17, lng: 82.73, cluster: "Varanasi–Gorakhpur", odop: "Handloom" },
  { name: "Azamgarh", lat: 26.07, lng: 83.18, cluster: "Varanasi–Gorakhpur", odop: "Black Pottery" },
];

export function districtCoords(name: string): { lat: number; lng: number } | null {
  const d = UP_DISTRICTS.find(
    (x) => x.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(x.name.split(" ")[0].toLowerCase())
  );
  return d ? { lat: d.lat, lng: d.lng } : null;
}

/** Great-circle distance in km between two lat/lng points. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}
