import { NextResponse } from "next/server";
import { llmChat, safeParseJSON, availableProvider } from "@/lib/ai";
import { normalizeDistrict } from "@/lib/matcher";
import { UP_DISTRICTS } from "@/data/up_districts";

// POST /api/parse-profile  — Voice (transcript) or text resume -> Structured Skill JSON
// Includes Hindi demo preset parsing even without any API key (zero-crash demo).

export interface ParsedProfile {
  name: string;
  district: string;
  education: string;
  hardSkills: string[];
  softSkills: string[];
  experienceYears: number;
  preferredSector: string;
  source: "ai" | "deterministic";
}

const SYSTEM = `You are a resume parser for blue-collar youth in Uttar Pradesh, India. Input is Hinglish/Hindi/English spoken self-introduction or resume text. Extract ONLY this JSON:
{"name":"","district":"","education":"","hardSkills":[],"softSkills":[],"experienceYears":0,"preferredSector":""}
- district must be a real UP district (e.g. Barabanki, Kanpur, Varanasi).
- education e.g. "10th Pass", "12th Pass", "ITI Electrician", "B.A. Graduate".
- hardSkills: lowercase technical skills (e.g. "motor winding","lathe machine","pcb soldering","carpet knotting").
- softSkills: lowercase soft skills (e.g. "team coordination","basic spoken english").
- experienceYears: integer.
Respond with JSON only.`;

/** Deterministic keyword-based parser fallback (works offline, no API key). */
function deterministicParse(text: string): ParsedProfile {
  const t = text.toLowerCase();

  // District detection
  let district = "Lucknow";
  for (const d of UP_DISTRICTS) {
    const key = d.name.split(" ")[0].toLowerCase();
    if (t.includes(key)) {
      district = normalizeDistrict(d.name);
      break;
    }
  }
  if (t.includes("noida")) district = "Gautam Buddha Nagar (Noida)";
  if (t.includes("prayagraj") || t.includes("allahabad")) district = "Prayagraj";
  if (t.includes("bhadohi")) district = "Bhadohi";

  // Education
  let education = "10th Pass";
  if (t.includes("iti")) education = "ITI Pass";
  if (t.includes("diploma")) education = "Diploma";
  if (t.includes("graduate") || t.includes("b.a.") || t.includes("b a")) education = "Graduate";
  if (t.includes("12th")) education = t.includes("iti") ? "12th Pass + ITI" : "12th Pass";
  if (t.includes("10th") && !t.includes("12th")) education = "10th Pass";

  // Experience ("2 saal", "3 years", "5 varsh")
  let experienceYears = 0;
  const expMatch = t.match(/(\d+)\s*(saal|varsh|year|yrs)/);
  if (expMatch) experienceYears = parseInt(expMatch[1], 10);

  // Skill keyword dictionary (Hinglish aware)
  const skillDict: Record<string, string> = {
    "motor winding": "motor winding",
    "winding": "motor winding",
    "lathe": "lathe machine",
    "machin": "machine operation",
    "solder": "pcb soldering",
    "welding": "arc welding",
    "weld": "arc welding",
    "electrician": "electrical wiring",
    "wiring": "electrical wiring",
    "weaving": "handloom weaving",
    "weaver": "handloom weaving",
    "carpet": "carpet knotting",
    "solar": "solar panel installation",
    "battery": "battery pack assembly",
    "multimeter": "multimeter testing",
    "quality": "quality inspection",
    "packing": "packing",
    "warehouse": "inventory tracking",
    "inventory": "inventory tracking",
    "typing": "computer typing",
    "excel": "ms excel",
    "catalog": "ecommerce cataloging",
    "ecommerce": "ecommerce cataloging",
    "photograph": "product photography",
    "cad": "leather cad design",
    "leather": "leather cutting",
    "cnc": "cnc g-code fundamentals",
    "plc": "plc basic programming",
    "kiln": "kiln operation",
    "terracotta": "terracotta craft",
    "food": "food safety fsms",
    "fitter": "precision measurement",
    "turner": "lathe machine",
    "driver": "driving license",
    "tailor": "tailoring",
    "chikankari": "handloom knowledge",
    "garage": "motor repair",
  };
  const hardSkills: string[] = [];
  for (const [k, v] of Object.entries(skillDict)) {
    if (t.includes(k) && !hardSkills.includes(v)) hardSkills.push(v);
  }
  if (hardSkills.length === 0) hardSkills.push("general labour", "physical fitness");

  const softSkills: string[] = [];
  if (t.includes("english")) softSkills.push("basic spoken english");
  if (t.includes("team") || t.includes("mila")) softSkills.push("team coordination");
  if (softSkills.length === 0) softSkills.push("punctual", "hardworking");

  // Name: "Main Ramesh hoon", "My name is X", "I am X"
  let name = "Candidate";
  const m1 = text.match(/(?:main|mera naam|my name is|i am|ihm)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (m1) name = m1[1].replace(/^(hoon|hu|hai)\b/i, "").trim() || name;

  const preferredSector = hardSkills[0] ? "Manufacturing" : "General";

  return { name, district, education, hardSkills, softSkills, experienceYears, preferredSector, source: "deterministic" };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const transcript: string = (body?.transcript ?? "").trim();
  if (!transcript) {
    return NextResponse.json({ error: "transcript is required" }, { status: 400 });
  }

  if (availableProvider() !== "mock") {
    const raw = await llmChat({ system: SYSTEM, user: transcript, jsonMode: true, maxTokens: 600 });
    const parsed = safeParseJSON<Partial<ParsedProfile>>(raw);
    if (parsed) {
      return NextResponse.json({
        profile: {
          name: parsed.name || "Candidate",
          district: normalizeDistrict(parsed.district || "Lucknow"),
          education: parsed.education || "10th Pass",
          hardSkills: (parsed.hardSkills ?? []).map((s) => String(s).toLowerCase()),
          softSkills: (parsed.softSkills ?? []).map((s) => String(s).toLowerCase()),
          experienceYears: Number(parsed.experienceYears) || 0,
          preferredSector: parsed.preferredSector || "General",
          source: "ai",
        },
      });
    }
  }

  return NextResponse.json({ profile: deterministicParse(transcript) });
}
