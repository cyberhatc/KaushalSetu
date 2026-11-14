import { NextResponse } from "next/server";
import { llmChat, safeParseJSON, availableProvider } from "@/lib/ai";
import { YOUTH_PROFILES_SEED } from "@/data/youth_profiles_seed";
import { skillSimilarity } from "@/lib/matcher";
import { UPSDM_CENTERS_SEED, type TrainingCenter } from "@/data/upsdm_centers_seed";

// POST /api/reverse-cohort — Industry/UPSDM bulk requirement -> matched youth cohort + 15-day bridge syllabus.

export interface CohortCandidate {
  id: string;
  name: string;
  district: string;
  education: string;
  experienceYears: number;
  readinessPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
  verified: boolean;
}

export interface BridgeSyllabusDay {
  day: string;
  focus: string;
  activity: string;
}

export interface CohortResponse {
  requirement: string;
  detectedRole: string;
  detectedDistrict: string;
  requiredCount: number;
  prerequisites: string[];
  candidates: CohortCandidate[];
  bridgeSyllabus: BridgeSyllabusDay[];
  trainingCenters: TrainingCenter[];
  source: "ai" | "deterministic";
}

const ROLE_PREREQ_MAP: Record<string, string[]> = {
  "ev battery assembly technician": ["battery pack assembly", "electrical wiring", "multimeter testing", "industrial safety 5s"],
  "electronics assembly": ["pcb soldering", "surface mount assembly", "quality inspection"],
  "smt": ["smt operation", "pick and place machine", "quality inspection"],
  "solar": ["solar panel installation", "electrical wiring", "safety compliance"],
  "cnc": ["cnc g-code fundamentals", "lathe machine", "precision measurement"],
  "leather": ["leather cutting", "machine operation", "quality inspection"],
  "carpet": ["carpet knotting", "handloom weaving", "quality inspection"],
  "handloom": ["handloom weaving", "quality inspection"],
  "warehouse": ["inventory tracking", "barcode scanning", "team coordination"],
  "logistics": ["inventory tracking", "barcode scanning", "team coordination"],
  "food processing": ["food safety fsms", "machine operation", "quality inspection"],
  "bpo": ["computer typing", "basic spoken english", "customer service"],
  "welder": ["arc welding", "technical drawings", "precision measurement"],
};

function detectRequirement(text: string) {
  const t = text.toLowerCase();
  let role = "Warehouse Team Lead";
  let prereqs = ROLE_PREREQ_MAP["warehouse"];
  for (const [k, v] of Object.entries(ROLE_PREREQ_MAP)) {
    if (t.includes(k)) {
      role = k.replace(/\b\w/g, (c) => c.toUpperCase());
      prereqs = v;
      break;
    }
  }
  let district = "Lucknow";
  const dMatch = t.match(/in\s+([a-z]+(?:\s+[a-z]+)?)/);
  const districtWords = ["noida", "kanpur", "lucknow", "varanasi", "agra", "prayagraj", "ghaziabad", "barabanki", "bhadohi", "unnao", "gorakhpur", "jhansi", "meerut", "aligarh"];
  for (const d of districtWords) {
    if (t.includes(d)) {
      district = d.charAt(0).toUpperCase() + d.slice(1);
      break;
    }
  }
  if (dMatch && district === "Lucknow") district = "Lucknow";

  let count = 50;
  const cMatch = t.match(/(\d+)\s*(youth|candidates|people|technicians|workers|operators|fitters|looms|associates|cohort)?/);
  if (cMatch) count = parseInt(cMatch[1], 10);

  const deadlineDays = t.match(/(\d+)\s*day/) ? parseInt(t.match(/(\d+)\s*day/)![1], 10) : 30;

  return { role, district, count, prereqs, deadlineDays };
}

function deterministicCohort(requirement: string): CohortResponse {
  const { role, district, count, prereqs, deadlineDays } = detectRequirement(requirement);

  const candidates: CohortCandidate[] = [];
  for (const p of YOUTH_PROFILES_SEED) {
    const candidateSkills = [...p.hardSkills, ...p.softSkills];
    const { score, matched, missing } = skillSimilarity(candidateSkills, prereqs);
    const readiness = Math.round(score * 100);
    if (readiness >= 55) {
      candidates.push({
        id: p.id,
        name: p.name,
        district: p.district,
        education: p.education,
        experienceYears: p.experienceYears,
        readinessPercent: readiness,
        matchedSkills: matched,
        missingSkills: missing,
        verified: p.verified,
      });
    }
  }
  candidates.sort((a, b) => b.readinessPercent - a.readinessPercent);

  const bridgeSyllabus: BridgeSyllabusDay[] = [];
  const focusAreas = prereqs.length ? prereqs : ["industry basics", "safety"];
  const activities = [
    "Classroom theory + vocabulary (Hinglish)",
    "Hands-on lab practice at ITI workshop",
    "Supervised live line / machine work",
    "Mock interview + client walk-through",
    "Assessment & UPSDM certification prep",
  ];
  for (let d = 1; d <= 15; d++) {
    const focus = focusAreas[(d - 1) % focusAreas.length];
    bridgeSyllabus.push({
      day: `Day ${d}`,
      focus: focus.charAt(0).toUpperCase() + focus.slice(1),
      activity: `${activities[Math.floor((d - 1) / 3) % activities.length]} (${deadlineDays <= 30 ? "expedited" : "regular"} pace)`,
    });
  }

  const centers = UPSDM_CENTERS_SEED.filter((c) =>
    c.courses.some((cc) => prereqs.some((p) => cc.includes(p) || p.includes(cc)))
  ).slice(0, 4);

  return {
    requirement,
    detectedRole: role,
    detectedDistrict: district,
    requiredCount: count,
    prerequisites: prereqs,
    candidates: candidates.slice(0, 15),
    bridgeSyllabus,
    trainingCenters: centers.length ? centers : UPSDM_CENTERS_SEED.slice(0, 3),
    source: "deterministic",
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const requirement: string = (body?.requirement ?? "").trim();
  if (!requirement) return NextResponse.json({ error: "requirement is required" }, { status: 400 });

  if (availableProvider() !== "mock") {
    const raw = await llmChat({
      system: `You are an HR-tech parser. Extract bulk hiring needs for Uttar Pradesh. Reply ONLY with JSON: {"role":"","district":"","count":0,"prerequisites":["skill1","skill2"]}. prerequisites are 3-5 lowercase technical skill names.`,
      user: requirement,
      jsonMode: true,
      maxTokens: 400,
    });
    const parsed = safeParseJSON<{ role: string; district: string; count: number; prerequisites: string[] }>(raw);
    if (parsed?.prerequisites?.length) {
      const candidates: CohortCandidate[] = [];
      for (const p of YOUTH_PROFILES_SEED) {
        const { score, matched, missing } = skillSimilarity([...p.hardSkills, ...p.softSkills], parsed.prerequisites);
        const readiness = Math.round(score * 100);
        if (readiness >= 55) {
          candidates.push({
            id: p.id, name: p.name, district: p.district, education: p.education,
            experienceYears: p.experienceYears, readinessPercent: readiness,
            matchedSkills: matched, missingSkills: missing, verified: p.verified,
          });
        }
      }
      candidates.sort((a, b) => b.readinessPercent - a.readinessPercent);
      return NextResponse.json({
        requirement,
        detectedRole: parsed.role,
        detectedDistrict: parsed.district,
        requiredCount: parsed.count || 50,
        prerequisites: parsed.prerequisites,
        candidates: candidates.slice(0, 15),
        bridgeSyllabus: deterministicCohort(requirement).bridgeSyllabus,
        trainingCenters: deterministicCohort(requirement).trainingCenters,
        source: "ai",
      });
    }
  }

  return NextResponse.json(deterministicCohort(requirement));
}
