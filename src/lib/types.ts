// Shared client-facing types (mirrors API responses).

export interface Profile {
  name: string;
  district: string;
  education: string;
  hardSkills: string[];
  softSkills: string[];
  experienceYears: number;
  preferredSector: string;
  source: "ai" | "deterministic";
}

export interface JobMatch {
  job: {
    id: string;
    title: string;
    company: string;
    district: string;
    cluster: string;
    sector: string;
    salaryMin: number;
    salaryMax: number;
    openings: number;
    education: string;
    skills: string[];
    description: string;
  };
  matchPercent: number;
  proximityScore: number;
  distanceKm: number | null;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface RoadmapWeek {
  week: number;
  theme: string;
  modules: string[];
  practicalTask: string;
  youtubeKeywords: string;
  hoursPerDay: number;
}

export interface Roadmap {
  targetJob: string;
  weeks: RoadmapWeek[];
  trainingCenter: {
    id: string;
    name: string;
    type: string;
    district: string;
    courses: string[];
    durationWeeks: number;
    fee: string;
    seatsOpen: number;
    phone: string;
    distanceHint: string;
  } | null;
  source: "ai" | "deterministic";
}

export interface InterviewQuestion {
  id: number;
  question: string;
  hint: string;
}

export interface InterviewEvaluation {
  score: number;
  professionalRewrite: string;
  feedback: string;
}

export interface CohortResponse {
  requirement: string;
  detectedRole: string;
  detectedDistrict: string;
  requiredCount: number;
  prerequisites: string[];
  candidates: {
    id: string;
    name: string;
    district: string;
    education: string;
    experienceYears: number;
    readinessPercent: number;
    matchedSkills: string[];
    missingSkills: string[];
    verified: boolean;
  }[];
  bridgeSyllabus: { day: string; focus: string; activity: string }[];
  trainingCenters: { id: string; name: string; type: string; district: string; seatsOpen: number; fee: string }[];
  source: "ai" | "deterministic";
}
