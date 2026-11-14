// Semantic matching engine: keyword/TF-IDF cosine similarity + UP district proximity scoring.
// Runs zero-dependency (no external vector DB) — swap with pgvector later.

import { UP_DISTRICTS, haversineKm } from "@/data/up_districts";
import type { UPJob } from "@/data/up_jobs_seed";

export interface CandidateProfile {
  name: string;
  district: string;
  education: string;
  hardSkills: string[];
  softSkills: string[];
  experienceYears: number;
  preferredSector?: string;
}

export interface JobMatch {
  job: UPJob;
  matchPercent: number; // semantic skill match 0-100
  proximityScore: number; // 0-100, home district & adjacent clusters prioritized
  distanceKm: number | null;
  matchedSkills: string[]; // green pills
  missingSkills: string[]; // amber pills
}

/** Normalize a skill/phrase into a comparable token set. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/** Concept groups: tokens in the same group share a tag, giving synonym-aware similarity. */
const CONCEPT_GROUPS: [tag: string, words: string[]][] = [
  ["@machine-ops", ["machine", "machines", "machinery", "operation", "operating", "operator", "operate"]],
  ["@machining", ["lathe", "cnc", "turning", "milling", "gcode", "code"]],
  ["@quality", ["quality", "inspection", "inspect", "qc", "checks"]],
  ["@electrical", ["electrical", "electric", "wiring", "wire", "wires"]],
  ["@safety", ["safety", "compliance", "5s"]],
  ["@comm", ["english", "communication", "spoken", "hindi"]],
  ["@measure", ["measurement", "measuring", "precision", "calipers", "micrometers"]],
  ["@drawing", ["drawings", "drawing", "diagrams", "blueprint", "diagram"]],
  ["@teamwork", ["team", "coordination", "collaboration", "shift"]],
  ["@digital", ["excel", "spreadsheet", "computer", "typing"]],
  ["@ecom", ["ecommerce", "cataloging", "catalogue", "listing", "online"]],
  ["@solar", ["solar", "panel", "panels", "rooftop", "mounting"]],
  ["@ev", ["ev", "charger", "charging", "battery", "batteries", "pack"]],
  ["@leather", ["leather", "footwear", "shoe", "shoes", "bag"]],
  ["@food", ["food", "fsms", "fssai", "dairy"]],
  ["@kiln", ["kiln", "furnace", "terracotta"]],
  ["@handloom", ["loom", "looms", "weaving", "weaver", "handloom", "handlooms"]],
];

/** Tokens + concept-group tags for synonym-aware cosine similarity. */
function enrichTokens(text: string): Set<string> {
  const toks = tokenize(text);
  const set = new Set<string>(toks);
  for (const [tag, words] of CONCEPT_GROUPS) {
    if (toks.some((t) => words.includes(t))) set.add(tag);
  }
  return set;
}

/** Cosine similarity between two phrase bag-of-words (with synonym concepts + partial token credit). */
export function phraseSimilarity(a: string, b: string): number {
  const ta = enrichTokens(a);
  const tb = enrichTokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  return overlap / Math.sqrt(ta.size * tb.size);
}

/** Candidate skill vector vs job required-skill vector -> score 0..1.
 * Full credit (1.0) for close match (>=0.45), half credit (0.5) for a near miss (>=0.28). */
export function skillSimilarity(candidateSkills: string[], jobSkills: string[]): { score: number; matched: string[]; missing: string[] } {
  if (candidateSkills.length === 0) return { score: 0, matched: [], missing: jobSkills };
  const matched: string[] = [];
  const missing: string[] = [];
  let simSum = 0;
  for (const js of jobSkills) {
    let best = 0;
    let bestSkill = "";
    for (const cs of candidateSkills) {
      const s = phraseSimilarity(cs, js);
      if (s > best) {
        best = s;
        bestSkill = cs;
      }
    }
    if (best >= 0.45) {
      simSum += 1;
      if (!matched.includes(bestSkill)) matched.push(bestSkill);
    } else if (best >= 0.28) {
      simSum += 0.5; // near miss — partially related skill
      missing.push(js);
    } else {
      missing.push(js);
    }
  }
  return { score: simSum / jobSkills.length, matched, missing };
}

/** District proximity score 0-100 (home district = 100, same cluster = 80, else distance-decayed). */
export function proximityScore(candidateDistrict: string, jobDistrict: string): { score: number; distanceKm: number | null } {
  const cand = normalizeDistrict(candidateDistrict);
  const job = normalizeDistrict(jobDistrict);
  const cd = UP_DISTRICTS.find((d) => d.name === cand);
  const jd = UP_DISTRICTS.find((d) => d.name === job);
  if (!cd || !jd) return { score: 40, distanceKm: null };
  if (cd.name === jd.name) return { score: 100, distanceKm: 0 };
  const km = haversineKm(cd, jd);
  let score = Math.max(0, Math.round(100 - km / 2.2));
  if (cd.cluster === jd.cluster) score = Math.max(score, 80);
  return { score, distanceKm: km };
}

export function normalizeDistrict(name: string): string {
  const lower = name.toLowerCase().trim();
  const alias: Record<string, string> = {
    "noida": "Gautam Buddha Nagar (Noida)",
    "greater noida": "Gautam Buddha Nagar (Noida)",
    "gautam buddha nagar": "Gautam Buddha Nagar (Noida)",
    "gbn": "Gautam Buddha Nagar (Noida)",
    "kanpur": "Kanpur Nagar",
    "kanpur dehat": "Kanpur Dehat",
    "prayag": "Prayagraj",
    "allahabad": "Prayagraj",
    "banaras": "Varanasi",
    "kashi": "Varanasi",
    "bhadohi": "Bhadohi",
    "sant ravidas nagar": "Bhadohi",
  };
  for (const [k, v] of Object.entries(alias)) {
    if (lower.includes(k)) return v;
  }
  const direct = UP_DISTRICTS.find(
    (d) => lower.includes(d.name.split(" ")[0].toLowerCase()) || d.name.toLowerCase().includes(lower)
  );
  return direct ? direct.name : lower;
}

/** Full match pipeline for one candidate against all jobs. */
export function matchJobs(profile: CandidateProfile, jobs: UPJob[]): JobMatch[] {
  const candidateSkills = [
    ...profile.hardSkills.map((s) => s.toLowerCase()),
    ...profile.softSkills.map((s) => s.toLowerCase()),
  ];
  return jobs
    .map((job) => {
      const { score: skillScore, matched, missing } = skillSimilarity(candidateSkills, job.skills);
      const { score: prox, distanceKm } = proximityScore(profile.district, job.district);
      // Weighted: 70% semantic skills, 25% proximity, 5% education keyword hit
      const eduHit = job.education.toLowerCase().includes(profile.education.toLowerCase().slice(0, 4)) ? 1 : 0.5;
      const total = Math.round((skillScore * 0.7 + (prox / 100) * 0.25 + eduHit * 0.05) * 100);
      return {
        job,
        matchPercent: Math.min(99, total),
        proximityScore: prox,
        distanceKm,
        matchedSkills: matched,
        missingSkills: missing,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

/** Top missing micro-skills across the best 5 job matches (drives Skill-Delta Simulator). */
export function topMissingSkills(matches: JobMatch[], topN = 4): { skill: string; blockedJobs: number }[] {
  const counts = new Map<string, number>();
  for (const m of matches.slice(0, 5)) {
    for (const s of m.missingSkills) {
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([skill, blockedJobs]) => ({ skill, blockedJobs }))
    .sort((a, b) => b.blockedJobs - a.blockedJobs)
    .slice(0, topN);
}
