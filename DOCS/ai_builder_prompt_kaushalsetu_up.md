# Master Build Prompt: **KaushalSetu UP** (कौशल सेतु यूपी)
**Project:** AI-Driven Skill Gap & Hyper-Local Employment Matchmaker for Uttar Pradesh  
**Event:** AI Kaushal Hackathon 2026 (InMobi × Govt. of UP × IIIT Lucknow)  

> **How to use this file:** Copy and paste the prompt below into your AI coding assistant (Cursor, Windsurf, Lovable, Bolt, or Claude) to generate the complete full-stack MVP, database seed data, and UI components.

---

## 📋 COPY-PASTE PROMPT FOR AI CODING AGENT

```text
You are an expert Full-Stack AI Engineer and Product Architect. Build a complete, working MVP web application called **"KaushalSetu UP" (कौशल सेतु यूपी)** — an AI-Driven Skill Gap & Hyper-Local Employment Matchmaker built specifically for youth and industries in Uttar Pradesh, India.

### 1. CORE OBJECTIVE & PERSONA
Build a modern, high-contrast, bilingual-ready (English + Hindi labels) Progressive Web App (PWA) with two switchable modes in the top navbar:
1. **Youth / Candidate Co-Pilot Mode** (For blue-collar, grey-collar, ITI, and graduate job seekers in UP).
2. **Industry / UPSDM Admin Mode** (For factory HR managers & UP Skill Development Mission officials).

---

### 2. TECH STACK REQUIREMENTS
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts (for skill/salary charts), and React-Leaflet (or an interactive SVG/Canvas District Map of Uttar Pradesh).
- **Backend:** Next.js API Routes (or Python FastAPI microservice) with clean TypeScript interfaces.
- **Database & Vector Search:** Local SQLite / JSON-backed in-memory Vector Store (using cosine similarity on embeddings) so the app runs out-of-the-box with zero external DB setup friction during a live hackathon demo, while remaining ready for PostgreSQL + pgvector.
- **AI Integrations (with graceful mock fallbacks if API keys are missing):**
  - OpenAI / Groq API (`llama-3.1-70b-versatile` or `gpt-4o-mini`) for structured JSON extraction, skill-gap analysis, and micro-roadmap generation.
  - Whisper API (`whisper-1`) for Hindi/Hinglish voice-to-resume transcription.
  - Embeddings (`text-embedding-3-small` or local TF-IDF/cosine similarity fallback) for semantic job-to-candidate matching.

---

### 3. KEY FEATURES TO IMPLEMENT

#### Feature A: "Audio-to-Resume" & Smart Profile Builder (Candidate Mode)
- Allow users to either **upload a PDF/text resume** OR click a **"Speak Your Skills (Hindi/English)"** microphone button.
- When voice is recorded (or a sample Hindi voice transcript button is clicked for demo ease, e.g., *"Main Ramesh hoon, Barabanki se. Maine 2 saal local garage mein motor winding aur basic lathe machine ka kaam kiya hai, 12th pass hoon"*), send it to `/api/parse-profile`.
- The AI extracts structured JSON:
  - `name`, `district`, `education`, `hard_skills[]`, `soft_skills[]`, `experience_years`, `preferred_sector`.
- Generate a downloadable/viewable **"Digital Kaushal Passport"** card with a unique QR code and verified skill badges.

#### Feature B: Hyper-Local UP District Job & Industrial Hub Matcher
- Seed a realistic dataset of **20+ Uttar Pradesh Jobs** across key industrial clusters:
  - **Noida / Greater Noida:** Electronics Assembly Technician, SMT Operator, Quality Control Inspector.
  - **Kanpur / Unnao:** Leather Goods CAD Designer, Textile Loom Supervisor, Defense Corridor CNC Fitter.
  - **Lucknow / Barabanki:** EV Charging Technician, Solar Panel Installer, Logistics Hub Coordinator.
  - **Varanasi / Gorakhpur:** Handloom E-Commerce Associate, Food Processing Technician.
- Compute a **Semantic Match Score (0–100%)** and a **Local Proximity Score** (prioritizing jobs within the candidate's home district or adjacent UP districts).
- Display matched jobs with: Match %, Salary Range (₹/month), District Distance, Matched Skills (green pills), and **Missing Skills (amber pills)**.

#### Feature C: Interactive "Skill-Delta" Simulator (The Wow Feature)
- Build an interactive UI panel next to the job matches called **"Skill-Delta Career Simulator"**.
- List the top 4 missing micro-skills blocking the candidate from higher-paying jobs (e.g., *PLC Basic Programming*, *Industrial Safety & 5S*, *CNC G-Code Fundamentals*, *Basic Spoken English for Supervisors*).
- Give each skill a toggle switch (`[Simulate Completing Course]`).
- When the user toggles a skill ON, dynamically recalculate in real-time:
  - **New Unlocked Jobs Count** (e.g., jumps from `4` to `14` jobs).
  - **Projected Monthly Salary Hike** (e.g., `₹13,500` → `₹21,000/mo` with an animated bar chart).
  - **Nearest UPSDM / Govt ITI Training Center** (e.g., *"Govt. ITI Aliganj, Lucknow — 18 km away | 3-Week Free Course | 12 Seats Open"*).

#### Feature D: Personalized 4-Week Micro-Learning Roadmap & AI Mock Interview
- Clicking **"Generate Roadmap"** on any target job calls `/api/generate-roadmap` to output a week-by-week vernacular-friendly study plan (YouTube/NSDC/Skill India Digital modules + practical tasks).
- Include a **"3-Min AI Mock Interview"** modal where the AI asks 3 role-specific technical questions in Hinglish, evaluates the user's answer, and translates their rough answer into professional recruiter-ready phrasing.

#### Feature E: Industry / UPSDM "Reverse-Cohort" Generator (Admin Mode)
- Switch to **Industry / Govt Admin Mode** to view:
  1. **UP District Talent Supply vs. Demand Heatmap** (highlighting districts with high youth availability vs. industrial demand).
  2. **Reverse-Cohort Builder:** An input box where an HR manager or UPSDM official types a bulk hiring requirement (e.g., *"Need 150 EV Battery Assembly Technicians in Noida within 30 days"*).
  3. The system searches the seeded database of 30+ UP youth profiles, identifies candidates who already have **>=70% prerequisite skills** (e.g., ITI Electrician/Wireman), and auto-generates a **15-Day Bridge Training Syllabus** for nearby training centers.

---

### 4. FOLDER STRUCTURE & ARCHITECTURE
Organize the codebase cleanly:
```text
/src
  /app
    /page.tsx                  # Main dashboard with Candidate / Admin mode switcher
    /api
      /parse-profile/route.ts  # Voice/Text -> Structured Skill JSON
      /match-jobs/route.ts     # Cosine similarity + District proximity scoring
      /generate-roadmap/route.ts # LLM 4-week upskilling plan
      /reverse-cohort/route.ts # B2G/B2B bulk talent matching
  /components
    /AudioResumeBuilder.tsx    # Mic recorder + Hindi demo presets + QR Skill Passport
    /SkillDeltaSimulator.tsx   # Interactive toggles updating salary & unlocked jobs
    /UPDistrictMap.tsx         # Interactive visual UP industrial cluster selector
    /MockInterviewModal.tsx    # Hinglish AI interview coach
    /AdminCohortDashboard.tsx  # Recruiter & UPSDM analytics view
  /data
    /up_jobs_seed.ts           # 20+ realistic UP industrial & ODOP jobs
    /upsdm_centers_seed.ts     # Real UP districts, ITI & UPSDM training centers
    /youth_profiles_seed.ts    # 30+ diverse UP candidate profiles for Reverse-Cohort
  /lib
    /matcher.ts                # Vector/keyword cosine similarity + district distance logic
```

---

### 5. UI/UX DESIGN & DEMO READINESS RULES
- **Aesthetic:** Clean, trustworthy civic-tech palette (Deep Indigo `#1E3A8A`, Saffron/Amber `#F59E0B` accents, Emerald `#10B981` for matched skills, crisp white cards on `#F8FAFC` background).
- **One-Click Demo Presets:** Because hackathon demos last 3 minutes, include 3 one-click sample candidate personas at the top (e.g., *"Ramesh (ITI Fitter, Barabanki)"*, *"Priya (B.A. Grad, Varanasi)"*, *"Aamir (Loom Weaver, Bhadohi)"*) so judges can test the entire flow without typing.
- **Zero-Crash Guarantee:** Ensure every API route checks `process.env.OPENAI_API_KEY` / `process.env.GROQ_API_KEY` and falls back to realistic, deterministic AI responses if keys aren't configured yet.

Start by creating the seed data files (`/src/data/*`), the matching engine (`/src/lib/matcher.ts`), and the main interactive UI components. Write clean, production-grade TypeScript code.
```

---

## 🛠️ Quick Setup Checklist (Before Running the Prompt)

1. **Initialize Project:**
   ```bash
   npx create-next-app@latest kaushal-setu-up --typescript --tailwind --eslint
   cd kaushal-setu-up
   npm install lucide-react recharts qrcode.react
   ```
2. **Environment Variables (`.env.local`):**
   ```env
   GROQ_API_KEY=your_groq_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```
3. **Pitch Tip for IIIT Lucknow Finale:**
   - Open your live demo with the **Audio-to-Resume** button speaking a 10-second Hindi clip, immediately toggle the **Skill-Delta Slider** to show a ₹7,500/month salary jump in the user's home district, and finish on the **UPSDM Reverse-Cohort** screen to show state-wide scalability.