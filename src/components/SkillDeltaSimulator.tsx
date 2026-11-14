"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, MapPin, GraduationCap, Users } from "lucide-react";
import { UPSDM_CENTERS_SEED } from "@/data/upsdm_centers_seed";

const SKILL_META: Record<string, number> = {
  "plc basic programming": 3,
  "industrial safety 5s": 1,
  "cnc g-code fundamentals": 4,
  "basic spoken english": 4,
  "smt operation": 3,
  "battery pack assembly": 2,
  "ecommerce cataloging": 2,
  "solar panel installation": 3,
  "quality inspection": 2,
  "machine operation": 2,
  "shift management": 3,
  "ms excel": 2,
  "computer typing": 2,
  "inventory tracking": 2,
  "barcode scanning": 1,
  "team coordination": 1,
  "customer service": 2,
  "handloom knowledge": 2,
  "documentation": 1,
  "iso 9001 basics": 2,
  "calipers and micrometers": 2,
  "technical drawings": 3,
  "precision measurement": 2,
  "electrical wiring": 3,
  "ev charger installation": 3,
  "multimeter testing": 2,
  "safety compliance": 1,
  "packing": 1,
  "physical fitness": 1,
  "product photography": 2,
  "smartphone apps": 1,
  "kiln operation": 3,
  "carpet knotting": 4,
  "handloom weaving": 4,
  "food safety fsms": 2,
  "hindi communication": 1,
  "pick and place machine": 3,
  "lathe machine": 3,
  "loom operations": 3,
  "leather cad design": 4,
  "pattern making": 3,
  "client communication": 2,
  "illustrator": 3,
  "pcb soldering": 2,
  "surface mount assembly": 2,
  "rooftop mounting": 2,
  "battery": 2,
};

export default function SkillDeltaSimulator({
  missingSkills,
  toggles,
  onToggle,
  baseJobCount,
  unlockedJobCount,
  baseAvgSalary,
  newAvgSalary,
  candidateDistrict,
  totalJobs,
}: {
  missingSkills: string[];
  toggles: Record<string, boolean>;
  onToggle: (skill: string, on: boolean) => void;
  baseJobCount: number;
  unlockedJobCount: number;
  baseAvgSalary: number;
  newAvgSalary: number;
  candidateDistrict: string;
  totalJobs: number;
}) {
  const nearest =
    UPSDM_CENTERS_SEED.find(
      (c) =>
        candidateDistrict.toLowerCase().includes(c.district.toLowerCase()) ||
        c.district.toLowerCase().includes(candidateDistrict.toLowerCase())
    ) ?? UPSDM_CENTERS_SEED[0];

  const chartData = [
    { name: "Abhi (Now)", salary: baseAvgSalary },
    { name: "Skills ON", salary: newAvgSalary },
  ];

  return (
    <div className="card border-2 border-amber-300 bg-gradient-to-br from-white to-amber-50/50">
      <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-1">
        <TrendingUp className="h-5 w-5 text-amber-500" /> Skill-Delta Career Simulator
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Toggle a missing skill = simulate completing a free UPSDM course. Watch jobs unlock & salary jump 🎛️
      </p>

      <div className="space-y-2 mb-4">
        {missingSkills.map((s) => (
          <label
            key={s}
            className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-amber-400 transition"
          >
            <span className="text-sm font-medium text-slate-700">{s}</span>
            <span className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {SKILL_META[s] ?? 3}-wk free course
              </span>
              <input
                type="checkbox"
                checked={toggles[s] ?? false}
                onChange={(e) => onToggle(s, e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
            </span>
          </label>
        ))}
        {missingSkills.length === 0 && (
          <p className="text-sm text-emerald-700 font-medium">
            🎉 Wah! Aapke top matches mein koi critical missing skill nahi hai.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Unlocked Jobs" value={`${baseJobCount} → ${unlockedJobCount}`} sub={`of ${totalJobs} total`} />
        <Stat label="Projected Salary" value={`₹${newAvgSalary.toLocaleString("en-IN")}`} sub="per month" highlight />
        <Stat label="Salary Delta" value={`+₹${(newAvgSalary - baseAvgSalary).toLocaleString("en-IN")}`} sub="monthly hike" />
      </div>

      <div className="h-36 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={45} />
            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}/mo`, "Avg. Salary"]} />
            <Bar dataKey="salary" radius={[6, 6, 0, 0]}>
              <Cell fill="#94a3b8" />
              <Cell fill="#10B981" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
        <MapPin className="h-4 w-4 text-indigo-700 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-indigo-900 flex items-center gap-1">
            <GraduationCap className="h-4 w-4" /> Nearest UPSDM / Govt ITI Training Center
          </p>
          <p className="text-slate-700">
            {nearest.name}, {nearest.district} • {nearest.durationWeeks}-Week Free Course •{" "}
            <span className="text-emerald-700 font-semibold">{nearest.seatsOpen} Seats Open</span>
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Users className="h-3 w-3" /> {nearest.fee} • 📞 {nearest.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-emerald-100 border border-emerald-300" : "bg-white border border-slate-200"}`}>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-emerald-700" : "text-indigo-900"}`}>{value}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}
