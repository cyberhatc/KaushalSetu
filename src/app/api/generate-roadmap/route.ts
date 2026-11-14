import { NextResponse } from "next/server";
import { llmChat, safeParseJSON, availableProvider } from "@/lib/ai";
import type { UPJob } from "@/data/up_jobs_seed";
import { UPSDM_CENTERS_SEED, type TrainingCenter } from "@/data/upsdm_centers_seed";

// POST /api/generate-roadmap — 4-week micro-learning plan for a target job,
// AI-generated when a key exists, deterministic vernacular fallback otherwise.

export interface RoadmapWeek {
  week: number;
  theme: string;
  modules: string[];
  practicalTask: string;
  youtubeKeywords: string;
  hoursPerDay: number;
}

export interface RoadmapResponse {
  targetJob: string;
  weeks: RoadmapWeek[];
  trainingCenter: (TrainingCenter & { distanceHint: string }) | null;
  source: "ai" | "deterministic";
}

const SKILL_TO_CENTER_COURSE: Record<string, string> = {
  "plc basic programming": "plc basic programming",
  "cnc g-code fundamentals": "cnc g-code fundamentals",
  "smt operation": "smt operation",
  "solar panel installation": "solar panel installation",
  "battery pack assembly": "battery pack assembly",
  "ev charger installation": "ev charger installation",
  "handloom weaving": "handloom weaving",
  "carpet knotting": "carpet knotting",
  "ecommerce cataloging": "ecommerce cataloging",
  "basic spoken english": "basic spoken english",
  "ms excel": "ms excel",
  "quality inspection": "quality inspection",
  "machine operation": "machine operation",
  "leather cutting": "leather cutting",
  "food safety fsms": "food safety fsms",
  "industrial safety 5s": "industrial safety 5s",
  "electrical wiring": "electrical wiring",
  "precision measurement": "precision measurement",
};

function nearestCenter(job: UPJob, missingSkills: string[]) {
  const wanted = missingSkills.map((s) => SKILL_TO_CENTER_COURSE[s.toLowerCase()]).filter(Boolean) as string[];
  const scored = UPSDM_CENTERS_SEED.map((c) => {
    const hits = wanted.filter((w) => c.courses.some((cc) => cc.includes(w) || w.includes(cc))).length;
    const sameCluster = c.district === job.district || job.cluster.includes(c.district);
    return { c, score: hits * 10 + (sameCluster ? 5 : 0) };
  }).sort((a, b) => b.score - a.score);
  return scored[0]?.c ?? UPSDM_CENTERS_SEED[0];
}

function deterministicRoadmap(job: UPJob, missingSkills: string[]): RoadmapResponse {
  const center = nearestCenter(job, missingSkills);
  const skillPlan = missingSkills.length ? missingSkills : ["industrial safety 5s", "basic spoken english"];

  const weeks: RoadmapWeek[] = [
    {
      week: 1,
      theme: `Mool Buniyad (Foundation) — ${skillPlan[0] ?? "Job Basics"}`,
      modules: [
        `NSDC / Skill India Digital: "${skillPlan[0]}" introductory module`,
        "Safety & 5S workplace culture (UPSDM core module)",
        "Tool familiarization & terminology in Hindi + English",
      ],
      practicalTask: "Practice the core skill for 1 hour daily; maintain a daily kaushal diary.",
      youtubeKeywords: `${skillPlan[0]} in Hindi tutorial NSDC`,
      hoursPerDay: 2,
    },
    {
      week: 2,
      theme: `Skill Deep-dive — ${skillPlan[1] ?? skillPlan[0] ?? "Hands-on Practice"}`,
      modules: [
        `Skill India Digital: "${skillPlan[1] ?? skillPlan[0]}" practical course`,
        "Industry machine/process walkthrough videos",
        "Simple measurement & quality basics",
      ],
      practicalTask: "Complete 3 guided practice tasks; record a 2-min self-demo video.",
      youtubeKeywords: `${skillPlan[1] ?? skillPlan[0]} practical Hindi video`,
      hoursPerDay: 2,
    },
    {
      week: 3,
      theme: `Workplace Readiness — ${skillPlan[2] ?? "Communication"}`,
      modules: [
        "Basic Spoken English for Supervisors (Hinglish phrases)",
        "Interview etiquette & resume polish (KaushalSetu passport)",
        `Company context: how ${job.company} works in ${job.district}`,
      ],
      practicalTask: "Give 2 mock interviews (use KaushalSetu AI Mock Interview).",
      youtubeKeywords: "blue collar interview questions Hindi English",
      hoursPerDay: 1.5,
    },
    {
      week: 4,
      theme: "Final Sprint — Apply & Interview",
      modules: [
        `Apply to "${job.title}" at ${job.company} via KaushalSetu`,
        "Revise all 4 weeks with flashcards",
        `Enroll at ${center.name} for the remaining gap skills`,
      ],
      practicalTask: "Attend local ITI/UPSDM demo day; collect trainer feedback.",
      youtubeKeywords: "UPSDM free training enrollment process",
      hoursPerDay: 2,
    },
  ];

  return {
    targetJob: job.title,
    weeks,
    trainingCenter: { ...center, distanceHint: `${center.district} • ${center.seatsOpen} seats open • ${center.fee}` },
    source: "deterministic",
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const job: UPJob | undefined = body?.job;
  const missingSkills: string[] = Array.isArray(body?.missingSkills) ? body.missingSkills : [];

  if (!job || !job.title) {
    return NextResponse.json({ error: "job object is required" }, { status: 400 });
  }

  if (availableProvider() !== "mock") {
    const raw = await llmChat({
      system: `You create 4-week micro-learning roadmaps for UP (India) blue-collar job seekers. Reply ONLY with JSON: {"weeks":[{"week":1,"theme":"","modules":["",""],"practicalTask":"","youtubeKeywords":"","hoursPerDay":2}]}. Use Hinglish (Hindi+English) vernacular-friendly language. Reference free resources: NSDC, Skill India Digital, YouTube.`,
      user: `Target job: ${job.title} at ${job.company}, ${job.district}. Missing skills: ${missingSkills.join(", ") || "none"}.`,
      jsonMode: true,
      maxTokens: 1400,
    });
    const parsed = safeParseJSON<{ weeks: RoadmapWeek[] }>(raw);
    if (parsed?.weeks?.length) {
      const center = nearestCenter(job, missingSkills);
      const resp: RoadmapResponse = {
        targetJob: job.title,
        weeks: parsed.weeks.slice(0, 4),
        trainingCenter: { ...center, distanceHint: `${center.district} • ${center.seatsOpen} seats open • ${center.fee}` },
        source: "ai",
      };
      return NextResponse.json(resp);
    }
  }

  return NextResponse.json(deterministicRoadmap(job, missingSkills));
}
