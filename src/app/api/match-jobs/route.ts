import { NextResponse } from "next/server";
import { UP_JOBS_SEED, type UPJob } from "@/data/up_jobs_seed";
import { matchJobs, type CandidateProfile, type JobMatch } from "@/lib/matcher";

// POST /api/match-jobs — Cosine similarity + district proximity scoring (deterministic, no keys needed)

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const profile: CandidateProfile | undefined = body?.profile;
  const simulatedSkills: string[] | undefined = body?.simulatedSkills; // Skill-Delta toggles add these

  if (!profile || !Array.isArray(profile.hardSkills)) {
    return NextResponse.json({ error: "profile with hardSkills[] is required" }, { status: 400 });
  }

  const effective: CandidateProfile = {
    ...profile,
    hardSkills: [
      ...profile.hardSkills,
      ...(profile.softSkills ?? []),
      ...(simulatedSkills ?? []),
    ],
  };

  const matches: JobMatch[] = matchJobs(effective, UP_JOBS_SEED as UPJob[]);

  return NextResponse.json({ matches });
}
