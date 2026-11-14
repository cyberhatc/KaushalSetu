"use client";

import { useState } from "react";
import { Mic, FileText, Sparkles, QrCode, Loader2, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/types";

const DEMO_PRESETS = [
  {
    label: "🎙️ Ramesh (ITI, Barabanki)",
    transcript:
      "Main Ramesh hoon, Barabanki se. Maine 2 saal local garage mein motor winding aur basic lathe machine ka kaam kiya hai, 12th pass hoon aur ITI fitter bhi hoon.",
  },
  {
    label: "🎙️ Priya (B.A. Grad, Varanasi)",
    transcript:
      "My name is Priya Sharma, I am from Varanasi. I am a B.A. graduate and I have 1 year experience in ecommerce cataloging and product photography for handloom sarees. I know basic spoken English and MS Excel.",
  },
  {
    label: "🎙️ Aamir (Weaver, Bhadohi)",
    transcript:
      "Main Aamir Ansari hoon, Bhadohi se. 4 saal carpet knotting aur handloom weaving ka kaam kiya hai. Quality inspection bhi jaanta hoon.",
  },
];

export default function AudioResumeBuilder({
  onProfile,
}: {
  onProfile: (p: Profile) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fileMode, setFileMode] = useState(false);

  async function parse(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      setProfile(data.profile);
      onProfile(data.profile);
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = f.name.endsWith(".pdf")
      ? `Resume PDF candidate: ${f.name.replace(/\.[^.]+$/, "")} — upload a .txt or use voice for richer parsing in the live demo.`
      : await f.text();
    parse(text);
  }

  function toggleMic() {
    // Web Speech API (Chrome) supports hi-IN; graceful fallback to text area.
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input needs Chrome. Use the demo presets or paste text instead 🙂");
      return;
    }
    const rec = new SR();
    rec.lang = "hi-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (ev) => {
      const t = Array.from(ev.results).map((r) => r[0].transcript).join(" ");
      setTranscript((prev) => (prev ? prev + " " : "") + t);
    };
    rec.start();
  }

  return (
    <div className="card">
      <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-900 mb-3">
        <Sparkles className="h-5 w-5 text-amber-500" /> Audio-to-Resume — अपनी कहानी बोलें
      </h3>

      {/* One-click demo presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEMO_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setTranscript(p.transcript);
              parse(p.transcript);
            }}
            className="text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full px-3 py-1.5 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition ${
            listening ? "bg-red-600 animate-pulse" : "bg-indigo-900 hover:bg-indigo-800"
          }`}
        >
          <Mic className="h-4 w-4" /> {listening ? "Sun raha hoon... (band karne ke liye dobara click)" : "Speak Your Skills (Hindi/English)"}
        </button>
        <button
          onClick={() => setFileMode(!fileMode)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
        >
          <FileText className="h-4 w-4" /> Upload Resume
        </button>
      </div>

      {fileMode && (
        <input type="file" accept=".txt,.pdf" onChange={handleFile} className="text-sm mb-3 block" />
      )}

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="...ya yahan apni skill story type karein (Hindi/English/Hinglish)"
        className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        onClick={() => parse(transcript)}
        disabled={loading || !transcript.trim()}
        className="mt-3 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-semibold rounded-lg px-4 py-2 transition"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Build My Kaushal Profile
      </button>

      {profile && (
        <div className="mt-5 border border-emerald-200 bg-emerald-50 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Digital Kaushal Passport</p>
              <h4 className="text-xl font-bold text-slate-900">{profile.name}</h4>
              <p className="text-sm text-slate-600">
                📍 {profile.district} • 🎓 {profile.education} • 💼 {profile.experienceYears} yrs
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {profile.source === "ai" ? "✨ AI-parsed" : "⚙️ Offline parser (no API key — demo fallback)"}
              </p>
              <div className="mt-2">
                {profile.hardSkills.map((s) => (
                  <span key={s} className="pill-green">✅ {s}</span>
                ))}
                {profile.softSkills.map((s) => (
                  <span key={s} className="pill-amber">{s}</span>
                ))}
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <QRCodeSVG
                  value={JSON.stringify({ id: profile.name, d: profile.district, skills: profile.hardSkills.length })}
                  size={80}
                />
              </div>
              <p className="text-[10px] mt-1 text-slate-500 flex items-center justify-center gap-1">
                <QrCode className="h-3 w-3" /> KS-{Math.abs(hashStr(profile.name)) % 10000}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `kaushal-passport-${profile.name.toLowerCase().replace(/\s+/g, "-")}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="mt-3 text-xs flex items-center gap-1 text-indigo-700 hover:underline"
          >
            <Download className="h-3 w-3" /> Download Passport (JSON)
          </button>
        </div>
      )}
    </div>
  );
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h;
}
