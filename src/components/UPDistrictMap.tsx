"use client";

import { useMemo, useState } from "react";
import { Map as MapIcon, Factory } from "lucide-react";
import { UP_DISTRICTS } from "@/data/up_districts";
import { UP_JOBS_SEED } from "@/data/up_jobs_seed";

// Lightweight interactive SVG/Canvas-free district selector: cluster heat grid of UP.
// Colors encode industrial job openings per district (supply vs demand feel).

export default function UPDistrictMap({
  onSelectDistrict,
}: {
  onSelectDistrict: (district: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const openByDistrict = useMemo(() => {
    const m = new Map<string, number>();
    for (const j of UP_JOBS_SEED) m.set(j.district, (m.get(j.district) ?? 0) + j.openings);
    return m;
  }, []);

  const maxOpenings = Math.max(...openByDistrict.values(), 1);

  const clusters = useMemo(() => {
    const groups = new Map<string, typeof UP_DISTRICTS>();
    for (const d of UP_DISTRICTS) {
      if (!groups.has(d.cluster)) groups.set(d.cluster, []);
      groups.get(d.cluster)!.push(d);
    }
    return [...groups.entries()];
  }, []);

  return (
    <div className="card">
      <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-3">
        <MapIcon className="h-5 w-5 text-amber-500" /> UP Industrial Cluster Map (ODOP + Hiring Heat)
      </h3>
      <div className="space-y-3">
        {clusters.map(([cluster, districts]) => (
          <div key={cluster}>
            <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Factory className="h-3 w-3" /> {cluster}
            </p>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => {
                const openings = openByDistrict.get(d.name) ?? 0;
                const intensity = openings / maxOpenings;
                const isActive = active === d.name;
                return (
                  <button
                    key={d.name}
                    title={`${d.name} • ${d.odop} • ${openings} openings`}
                    onClick={() => {
                      setActive(d.name);
                      onSelectDistrict(d.name);
                    }}
                    className={`text-xs rounded-lg px-2.5 py-1.5 border transition font-medium ${
                      isActive
                        ? "border-indigo-900 bg-indigo-900 text-white"
                        : "border-slate-200 text-slate-700 hover:border-indigo-400"
                    }`}
                    style={
                      !isActive
                        ? {
                            backgroundColor: openings
                              ? `rgba(245, 158, 11, ${0.15 + intensity * 0.6})`
                              : undefined,
                          }
                        : undefined
                    }
                  >
                    {d.name.split(" ")[0].replace(/[()]/g, "")} {openings ? `· ${openings}` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mt-3">
        🟠 Amber intensity = job openings demand. Click a district to re-run hyper-local matching.
      </p>
    </div>
  );
}
