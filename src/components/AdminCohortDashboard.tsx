"use client";

import { useState } from "react";
import { Building2, Loader2, Users, ClipboardList, MapPin } from "lucide-react";
import type { CohortResponse } from "@/lib/types";

export default function AdminCohortDashboard() {
  const [requirement, setRequirement] = useState("");
  const [data, setData] = useState<CohortResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);

  async function generate(text?: string) {
    const req = text ?? requirement;
    if (!req.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reverse-cohort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: req }),
      });
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Heatmap */}
      <div className="card">
        <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-3">
          <Building2 className="h-5 w-5 text-amber-500" /> UP Talent Supply vs. Demand Heatmap
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HEATMAP.map((r) => (
            <div key={r.district} className={`rounded-lg p-3 border ${r.level === "high" ? "bg-emerald-100 border-emerald-300" : r.level === "medium" ? "bg-amber-100 border-amber-300" : "bg-slate-100 border-slate-200"}`}>
              <p className="font-semibold text-sm text-slate-800">{r.district}</p>
              <p className="text-[11px] text-slate-600">Supply {r.supply} profiles • Demand {r.demand} jobs</p>
              <div className="mt-1 h-1.5 bg-white/70 rounded-full overflow-hidden">
                <div className={`h-full ${r.level === "high" ? "bg-emerald-500" : r.level === "medium" ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${Math.min(100, (r.supply / (r.demand || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reverse-Cohort Builder */}
      <div className="card">
        <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-3">
          <Users className="h-5 w-5 text-amber-500" /> Reverse-Cohort Builder
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setRequirement(p);
                generate(p);
              }}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full px-3 py-1.5 font-medium"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="e.g., Need 150 EV Battery Assembly Technicians in Noida within 30 days"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={() => generate()}
            disabled={loading || !requirement.trim()}
            className="flex items-center gap-2 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-40 text-white font-semibold rounded-lg px-4 py-2 text-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Build Cohort
          </button>
        </div>

        {data && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
              <span className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 font-semibold">{data.detectedRole}</span>
              <span className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1 text-slate-700"><MapPin className="h-3 w-3" /> {data.detectedDistrict}</span>
              <span className="bg-slate-100 rounded-full px-3 py-1 text-slate-700">Need: {data.requiredCount}</span>
              <span className="bg-emerald-100 text-emerald-800 rounded-full px-3 py-1 font-semibold">Ready now (≥40% readiness): {data.candidates.length}</span>
              <span className="text-xs text-slate-400">{data.source === "ai" ? "✨ AI-parsed" : "⚙️ Offline fallback"}</span>
            </div>

            <p className="text-xs text-slate-500 mb-2">Prerequisites:</p>
            <div className="mb-4">
              {data.prerequisites.map((s) => (
                <span key={s} className="pill-amber">{s}</span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">Candidate</th>
                    <th className="px-3 py-2">District</th>
                    <th className="px-3 py-2">Edu / Exp</th>
                    <th className="px-3 py-2">Readiness</th>
                    <th className="px-3 py-2">Gap Skills</th>
                    <th className="px-3 py-2">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {data.candidates.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800">{c.name}</td>
                      <td className="px-3 py-2 text-slate-600">{c.district}</td>
                      <td className="px-3 py-2 text-slate-600 text-xs">{c.education} • {c.experienceYears}y</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full ${c.readinessPercent >= 70 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${c.readinessPercent}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{c.readinessPercent}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-amber-700">{c.missingSkills.join(", ") || "—"}</td>
                      <td className="px-3 py-2">{c.verified ? "✅" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 15-day bridge syllabus */}
            <button
              onClick={() => setShowSyllabus(!showSyllabus)}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-800 hover:underline"
            >
              <ClipboardList className="h-4 w-4" /> {showSyllabus ? "Hide" : "Show"} Auto-Generated 15-Day Bridge Training Syllabus
            </button>
            {showSyllabus && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                {data.bridgeSyllabus.map((d) => (
                  <div key={d.day} className="border border-slate-200 rounded-lg p-3 text-xs">
                    <p className="font-bold text-indigo-900">{d.day}</p>
                    <p className="font-medium text-slate-700">{d.focus}</p>
                    <p className="text-slate-500">{d.activity}</p>
                  </div>
                ))}
              </div>
            )}

            {data.trainingCenters.length > 0 && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-indigo-900 mb-1">🏫 Nearby Training Centers</p>
                <ul className="list-disc list-inside text-slate-700 text-xs space-y-0.5">
                  {data.trainingCenters.map((c) => (
                    <li key={c.id}>{c.name} ({c.district}) — {c.seatsOpen} seats open • {c.fee}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const HEATMAP: { district: string; supply: number; demand: number; level: "high" | "medium" | "low" }[] = [
  { district: "Lucknow", supply: 28, demand: 22, level: "high" },
  { district: "Barabanki", supply: 18, demand: 12, level: "high" },
  { district: "Kanpur Nagar", supply: 14, demand: 16, level: "medium" },
  { district: "Unnao", supply: 9, demand: 8, level: "medium" },
  { district: "Noida (GBN)", supply: 10, demand: 37, level: "low" },
  { district: "Varanasi", supply: 16, demand: 10, level: "high" },
  { district: "Bhadohi", supply: 12, demand: 5, level: "high" },
  { district: "Gorakhpur", supply: 8, demand: 4, level: "high" },
  { district: "Prayagraj", supply: 11, demand: 6, level: "medium" },
  { district: "Agra", supply: 7, demand: 9, level: "low" },
  { district: "Jhansi", supply: 5, demand: 6, level: "medium" },
  { district: "Ghaziabad", supply: 4, demand: 10, level: "low" },
];

const PRESETS = [
  "Need 150 EV Battery Assembly Technicians in Noida within 30 days",
  "Need 60 CNC Fitters for Defense Corridor in Kanpur within 45 days",
  "Need 80 Solar Panel Installers in Lucknow within 60 days",
  "Need 40 Handloom E-Commerce Associates in Varanasi within 30 days",
];
