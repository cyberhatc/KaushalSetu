import { NextResponse } from "next/server";
import { llmChat, safeParseJSON, availableProvider } from "@/lib/ai";

// POST /api/mock-interview — 3 role-specific questions in Hinglish + answer evaluation.

export interface InterviewQuestion {
  id: number;
  question: string;
  hint: string;
}

export interface InterviewEvaluation {
  score: number; // 0-100
  professionalRewrite: string; // recruiter-ready phrasing
  feedback: string;
}

const FALLBACK_QUESTIONS: Record<string, InterviewQuestion[]> = {
  default: [
    { id: 1, question: "Bataiye, aapke paas is kaam ke liye kaunsa hands-on experience hai? (Tell us about your hands-on experience for this role)", hint: "Mention your machines/tools + years of work." },
    { id: 2, question: "Agar machine suddenly band ho jaaye shift ke beech mein, aap kya karoge? (If the machine stops mid-shift, what will you do?)", hint: "Talk about safety first, then informing the supervisor." },
    { id: 3, question: "Aap target pressure ke saath quality kaise maintain karenge? (How will you maintain quality under target pressure?)", hint: "Mention checking output at fixed intervals." },
  ],
};

const FALLBACK_EVAL: InterviewEvaluation = {
  score: 72,
  professionalRewrite: "",
  feedback: "Aapke jawab mein practical understanding hai. Structure improve karein: (1) Situation, (2) Action, (3) Result. Specific tools/machines aur numbers zaroor batayein.",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const jobTitle: string = body?.jobTitle ?? "Technician";
  const answer: string | undefined = body?.answer;
  const question: string | undefined = body?.question;

  // Mode 1: generate questions
  if (!answer) {
    if (availableProvider() !== "mock") {
      const raw = await llmChat({
        system: `You are a Hinglish-speaking hiring coach for blue-collar jobs in UP, India. Reply ONLY with JSON: {"questions":[{"id":1,"question":"","hint":""}]}. Each question is in natural Hinglish (Roman Hindi + English mix), role-specific and practical.`,
        user: `Job: ${jobTitle}. Generate 3 interview questions.`,
        jsonMode: true,
        maxTokens: 500,
      });
      const parsed = safeParseJSON<{ questions: InterviewQuestion[] }>(raw);
      if (parsed?.questions?.length) return NextResponse.json({ questions: parsed.questions.slice(0, 3) });
    }
    return NextResponse.json({ questions: FALLBACK_QUESTIONS.default });
  }

  // Mode 2: evaluate answer
  if (availableProvider() !== "mock") {
    const raw = await llmChat({
      system: `You are a hiring coach for UP blue-collar youth. Evaluate the candidate's Hinglish answer. Reply ONLY with JSON: {"score":0-100,"professionalRewrite":"","feedback":""}. professionalRewrite: the candidate's rough answer rewritten in professional English for recruiters. feedback: 2 lines, friendly Hinglish.`,
      user: `Question: ${question}\nAnswer: ${answer}`,
      jsonMode: true,
      maxTokens: 500,
    });
    const parsed = safeParseJSON<InterviewEvaluation>(raw);
    if (parsed) return NextResponse.json({ evaluation: parsed });
  }

  const professionalRewrite =
    answer.length > 40
      ? `I have hands-on experience relevant to this ${jobTitle} role. In my previous work I consistently followed safety and quality standards, and I am confident I can deliver from day one.`
      : `I am eager to work as a ${jobTitle} and willing to learn quickly on the job.`;
  return NextResponse.json({ evaluation: { ...FALLBACK_EVAL, professionalRewrite } });
}
