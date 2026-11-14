"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Briefcase, Users, MapPin, IndianRupee, Loader2, X, Calendar, GraduationCap,
  Sparkles, Smartphone, Factory,
} from "lucide-react";
import AudioResumeBuilder from "@/components/AudioResumeBuilder";
import SkillDeltaSimulator from "@/components/SkillDeltaSimulator";
import UPDistrictMap from "@/components/UPDistrictMap";
import MockInterviewModal from "@/components/MockInterviewModal";
import AdminCohortDashboard from "@/components/AdminCohortDashboard";
import { matchJobs, topMissingSkills, type JobMatch, type CandidateProfile } from "@/lib/matcher";
import { UP_JOBS_SEED } from "@/data/up_jobs_seed";
import type { Profile, Roadmap } from "@/lib/types";

type Mode = "youth" | "admin";

const PERSONAS: { label: string; emoji: string; profile: CandidateProfile }[] = [
  {
    label: "Ramesh (ITI Fitter, Barabanki)",
    emoji: "👨‍🔧",
    profile: {
      name: "Ramesh Kumar",
      district: "Barabanki",
      education: "12th Pass + ITI",
      hardSkills: ["motor winding", "lathe machine", "electrical wiring", "precision measurement"],
      softSkills: ["punctual", "team coordination"],
      experienceYears: 2,
      preferredSector: "Manufacturing",
    },
  },
  {
    label: "Priya (B.A. Grad, Varanasi)",
    emoji: "👩‍🎓",
    profile: {
      name: "Priya Sharma",
      district: "Varanasi",
      education: "Graduate",
      hardSkills: ["ecommerce cataloging", "product photography", "ms excel"],
      softSkills: ["communication", "basic spoken english"],
      experienceYears: 1,
      preferredSector: "Handloom / E-Commerce",
    },
  },
  {
    label: "Aamir (Loom Weaver, Bhadohi)",
    emoji: "🧵",
    profile: {
      name: "Aamir Ansari",
      district: "Bhadohi",
      education: "12th Pass",
      hardSkills: ["carpet knotting", "handloom weaving", "quality inspection"],
      softSkills: ["hardworking", "team coordination"],
      experienceYears: 4,
      preferredSector: "Handicrafts",
    },
  },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("youth");
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [simToggles, setSimToggles] = useState<Record<string, boolean>>({});
  const [roadmap, setRoadmap] = useState<{ job: JobMatch; data: Roadmap | null; loading: boolean } | null>(null);

  // Client-side matching (instant, zero-crash). Same engine as /api/match-jobs.
  const baseMatches = useCallback(
    (p: CandidateProfile | null) => (p ? matchJobs(p, UP_JOBS_SEED) : []),
    []
  );

  const effectiveSkills = useCallback((p: CandidateProfile | null): CandidateProfile | null => {
    if (!p) return null;
    const sim = Object.entries(simToggles).filter(([, on]) => on).map(([s]) => s);
    return { ...p, hardSkills: [...p.hardSkills, ...sim] };
  }, [simToggles]);

  const matches: JobMatch[] = baseMatches(effectiveSkills(profile));
  const baseMatchesList: JobMatch[] = baseMatches(profile);
  const topMatches = matches.slice(0, 6);

  const missing = topMissingSkills(baseMatchesList, 4);
  const simSkills = missing.map((m) => m.skill);

  const RELEVANT = 45;
  const baseRelevant = baseMatchesList.filter((m) => m.matchPercent >= RELEVANT);
  const newRelevant = matches.filter((m) => m.matchPercent >= RELEVANT);
  const avg = (list: JobMatch[]) =>
    list.length ? Math.round(list.reduce((s, m) => s + (m.job.salaryMin + m.job.salaryMax) / 2, 0) / list.length) : 0;

  const baseJobCount = baseRelevant.length;
  const unlockedJobCount = newRelevant.length;
  const baseAvgSalary = avg(baseRelevant);
  const newAvgSalary = avg(newRelevant);

  async function generateRoadmap(m: JobMatch) {
    setRoadmap({ job: m, data: null, loading: true });
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: m.job, missingSkills: m.missingSkills }),
      });
      setRoadmap({ job: m, data: await res.json(), loading: false });
    } catch {
      setRoadmap({ job: m, data: null, loading: false });
    }
  }

  // Handle parsed profile from AudioResumeBuilder (maps API shape -> matcher shape)
  const handleProfile = (p: Profile) => {
    setSimToggles({});
    setProfile({
      name: p.name,
      district: p.district,
      education: p.education,
      hardSkills: p.hardSkills,
      softSkills: p.softSkills,
      experienceYears: p.experienceYears,
      preferredSector: p.preferredSector,
    });
  };

  // PWA-ish manifest link injection skipped for MVP; document.title hint:
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      "%cKaushalSetu UP — AI Skill Gap Matchmaker",
      "background:#1E3A8A;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold"
    );
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Navbar */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-amber-500" />
            KaushalSetu UP <span className="text-amber-600 text-xl">कौशल सेतु</span>
          </h1>
          <p className="text-sm text-slate-500">
            AI Skill-Gap & Hyper-Local Employment Matchmaker for Uttar Pradesh • AI Kaushal Hackathon 2026
          </p>
        </div>
        <div className="flex bg-slate-200 rounded-xl p-1">
          <button
            onClick={() => setMode("youth")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${mode === "youth" ? "bg-white text-indigo-900 shadow" : "text-slate-600"}`}
          >
            <Smartphone className="h-4 w-4" /> Youth Co-Pilot
          </button>
          <button
            onClick={() => setMode("admin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${mode === "admin" ? "bg-white text-indigo-900 shadow" : "text-slate-600"}`}
          >
            <Factory className="h-4 w-4" /> Industry / UPSDM Admin
          </button>
        </div>
      </header>

      {mode === "admin" ? (
        <AdminCohortDashboard />
      ) : (
        <>
          {/* One-click demo personas */}
          <div className="card mb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              ⚡ One-Click Demo Personas (3-min judging mode)
            </p>
            <div className="flex flex-wrap gap-2">
              {PERSONAS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setSimToggles({});
                    setProfile(p.profile);
                  }}
                  className={`text-sm rounded-full px-4 py-2 border font-medium transition ${
                    profile?.name === p.profile.name
                      ? "bg-indigo-900 text-white border-indigo-900"
                      : "bg-white border-slate-300 hover:border-indigo-500 text-slate-700"
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 items-start">
            {/* Left column */}
            <div className="space-y-5">
              <AudioResumeBuilder onProfile={handleProfile} />
              <UPDistrictMap
                onSelectDistrict={(d) =>
                  setProfile((prev) => (prev ? { ...prev, district: d } : prev))
                }
              />
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {!profile && (
                <div className="card text-center py-12">
                  <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    Left sidebar se profile banayein ya ek demo persona click karein 👈
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Voice/text → skills → matched jobs → Skill-Delta simulator → roadmap
                  </p>
                </div>
              )}

              {profile && (
                <>
                  {/* Job matches */}
                  <div className="card">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-3">
                      <Briefcase className="h-5 w-5 text-amber-500" /> Top Job Matches for {profile.name}
                      <span className="text-xs font-normal text-slate-400">
                        (semantic + hyper-local proximity)
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {topMatches.map((m) => (
                        <div key={m.job.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-800">{m.job.title}</p>
                              <p className="text-sm text-slate-600">
                                {m.job.company} • 📍 {m.job.district}
                                {m.distanceKm !== null && m.distanceKm > 0 ? ` (~${m.distanceKm} km)` : " (home district)"}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">{m.job.description}</p>
                            </div>
                            <div className="text-center shrink-0">
                              <p className={`text-2xl font-extrabold ${m.matchPercent >= 70 ? "text-emerald-600" : m.matchPercent >= 55 ? "text-amber-600" : "text-slate-400"}`}>
                                {m.matchPercent}%
                              </p>
                              <p className="text-[10px] text-slate-400">match</p>
                            </div>
                          </div>
                          <p className="flex items-center gap-1 text-sm font-semibold text-indigo-800 mt-2">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {m.job.salaryMin.toLocaleString("en-IN")}–{m.job.salaryMax.toLocaleString("en-IN")}/mo
                            <span className="text-xs font-normal text-slate-500">• {m.job.openings} openings • {m.job.education}</span>
                          </p>
                          <div className="mt-2">
                            {m.matchedSkills.map((s) => (
                              <span key={s} className="pill-green">✓ {s}</span>
                            ))}
                            {m.missingSkills.map((s) => (
                              <span key={s} className="pill-amber">▲ {s}</span>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => generateRoadmap(m)}
                              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg px-3 py-1.5"
                            >
                              <Calendar className="h-3.5 w-3.5" /> Generate Roadmap
                            </button>
                            <MockInterviewModal jobTitle={m.job.title} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill-Delta Simulator */}
                  <SkillDeltaSimulator
                    missingSkills={simSkills}
                    toggles={simToggles}
                    onToggle={(s, on) => setSimToggles((t) => ({ ...t, [s]: on }))}
                    baseJobCount={baseJobCount}
                    unlockedJobCount={unlockedJobCount}
                    baseAvgSalary={baseAvgSalary}
                    newAvgSalary={newAvgSalary}
                    candidateDistrict={profile.district}
                    totalJobs={UP_JOBS_SEED.length}
                  />
                </>
              )}
            </div>
          </div>

          {/* Roadmap modal */}
          {roadmap && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setRoadmap(null)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-200 p-4 sticky top-0 bg-white rounded-t-2xl">
                  <h4 className="font-bold text-indigo-900">
                    📅 4-Week Roadmap — {roadmap.job.job.title}
                  </h4>
                  <button onClick={() => setRoadmap(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  {roadmap.loading && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" /> AI roadmap bana raha hai...
                    </div>
                  )}
                  {!roadmap.loading && roadmap.data && (
                    <>
                      <div className="space-y-3">
                        {roadmap.data.weeks.map((w) => (
                          <div key={w.week} className="border border-slate-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-600 uppercase">Week {w.week} • {w.hoursPerDay} hrs/day</p>
                            <p className="font-semibold text-slate-800">{w.theme}</p>
                            <ul className="list-disc list-inside text-sm text-slate-600 mt-1 space-y-0.5">
                              {w.modules.map((mo, i) => (
                                <li key={i}>{mo}</li>
                              ))}
                            </ul>
                            <p className="text-xs text-emerald-700 mt-2">🛠️ Task: {w.practicalTask}</p>
                            <p className="text-xs text-slate-400 mt-1">📺 YouTube search: &ldquo;{w.youtubeKeywords}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                      {roadmap.data.trainingCenter && (
                        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm flex items-start gap-2">
                          <GraduationCap className="h-5 w-5 text-indigo-700 mt-0.5" />
                          <div>
                            <p className="font-semibold text-indigo-900">{roadmap.data.trainingCenter.name}</p>
                            <p className="text-slate-700 text-xs">
                              <MapPin className="h-3 w-3 inline" /> {roadmap.data.trainingCenter.distanceHint} • 📞 {roadmap.data.trainingCenter.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 mt-3 text-right">
                        {roadmap.data.source === "ai" ? "✨ Generated by AI (Groq/OpenAI)" : "⚙️ Deterministic fallback (add GROQ_API_KEY for AI mode)"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <footer className="mt-10 text-center text-xs text-slate-400 pb-6">
        Built for AI Kaushal Hackathon 2026 • InMobi × Govt. of UP × IIIT Lucknow • KaushalSetu UP (कौशल सेतु यूपी)
        <br />
        Works fully offline with deterministic fallbacks — add <code className="bg-slate-100 px-1 rounded">GROQ_API_KEY</code> or{" "}
        <code className="bg-slate-100 px-1 rounded">OPENAI_API_KEY</code> in .env.local to enable live AI.
      </footer>
    </main>
  );
}
