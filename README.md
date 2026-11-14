# KaushalSetu UP (कौशल सेतु यूपी)

**AI-Driven Skill Gap & Hyper-Local Employment Matchmaker for Uttar Pradesh**
Built for **AI Kaushal Hackathon 2026** (InMobi × Govt. of UP × IIIT Lucknow).

KaushalSetu bridges UP's blue-collar / grey-collar youth to nearby industrial jobs — with AI-powered resume building from voice, semantic job matching, a salary-unlocking Skill-Delta simulator, and a reverse-cohort generator for UPSDM officials & industry HR.

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| A | **Audio-to-Resume** | Speak your skills in Hindi/English (Web Speech API) or paste/upload text → AI extracts a structured profile → **Digital Kaushal Passport** with QR code |
| B | **Hyper-Local Job Matcher** | 24 realistic UP jobs across Noida, Kanpur, Lucknow, Varanasi, Bhadohi & more. Cosine-similarity semantic matching + district proximity scoring (Haversine) |
| C | **Skill-Delta Simulator** 🌟 | Toggle missing micro-skills → watch unlocked jobs count jump + projected monthly salary rise in real time (Recharts) |
| D | **4-Week Micro-Roadmap + AI Mock Interview** | Week-by-week NSDC/Skill India study plan + 3-question Hinglish mock interview with recruiter-ready answer rewrites |
| E | **Reverse-Cohort Generator (Admin)** | UPSDM/HR types "Need 150 EV Battery Technicians in Noida in 30 days" → matched youth cohort (≥55% readiness) + auto 15-day bridge training syllabus |

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

**Optional — enable live AI** (app works fully without keys via deterministic fallbacks):

```env
# .env.local
GROQ_API_KEY=your_groq_key      # llama-3.1-70b-versatile
OPENAI_API_KEY=your_openai_key  # gpt-4o-mini fallback
```

## 🎯 One-Click Demo (for judges)

1. Open **Youth Co-Pilot** mode → click persona **“🎙️ Ramesh (ITI Fitter, Barabanki)”**
2. See matched jobs with green (matched) / amber (missing) skill pills
3. Toggle **Skill-Delta Simulator** switches → jobs unlock + salary jumps ₹
4. Click **Generate Roadmap** → 4-week plan + nearest Govt ITI/UPSDM center
5. Click **3-Min AI Mock Interview** → Hinglish Q&A coach
6. Switch to **Industry / UPSDM Admin** → click the EV preset → cohort + 15-day bridge syllabus

## 🏗️ Architecture

```text
src/
  app/
    page.tsx                     # Youth/Admin mode dashboard
    api/parse-profile/route.ts   # Voice/text → structured skill JSON
    api/match-jobs/route.ts      # Cosine similarity + district proximity
    api/generate-roadmap/route.ts# 4-week upskilling plan
    api/mock-interview/route.ts  # Hinglish interview coach
    api/reverse-cohort/route.ts  # B2G/B2B bulk talent matching
  components/                    # AudioResumeBuilder, SkillDeltaSimulator,
                                 # UPDistrictMap, MockInterviewModal, AdminCohortDashboard
  data/                          # 24 UP jobs, 32 youth profiles, 12 UPSDM centers, district geo data
  lib/matcher.ts                 # Semantic matching engine (isomorphic, zero-dep)
  lib/ai.ts                      # Groq/OpenAI client with mock fallback
```

**Design:** Deep Indigo `#1E3A8A` + Saffron `#F59E0B` civic-tech palette, bilingual (English + Hindi) labels.

**Zero-crash guarantee:** every AI route checks for API keys and falls back to deterministic, realistic responses — perfect for unstable hackathon Wi-Fi.

## 📄 License

MIT
