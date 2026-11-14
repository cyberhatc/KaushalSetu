"use client";

import { useState } from "react";
import { MessageCircle, X, Loader2, Send, CheckCircle2 } from "lucide-react";
import type { InterviewQuestion, InterviewEvaluation } from "@/lib/types";

export default function MockInterviewModal({
  jobTitle,
  onClose,
}: {
  jobTitle: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluations, setEvaluations] = useState<InterviewEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "asking" | "evaluating" | "done">("idle");

  async function start() {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setPhase("asking");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    setPhase("evaluating");
    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          question: questions[qIndex]?.question,
          answer,
        }),
      });
      const data = await res.json();
      setEvaluations((e) => [...e, data.evaluation]);
      setAnswer("");
      if (qIndex < 2) setQIndex(qIndex + 1);
      else setPhase("done");
    } finally {
      setLoading(false);
    }
  }

  const avgScore = evaluations.length
    ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length)
    : 0;

  return (
    <>
      <button
        onClick={start}
        className="w-full flex items-center justify-center gap-2 bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold rounded-lg px-4 py-2 transition"
      >
        <MessageCircle className="h-4 w-4" /> 3-Min AI Mock Interview (Hinglish)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sticky top-0 bg-white rounded-t-2xl">
              <h4 className="font-bold text-indigo-900">🎤 Mock Interview — {jobTitle}</h4>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" /> AI soch raha hai...
                </div>
              )}

              {!loading && phase === "asking" && questions[qIndex] && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Question {qIndex + 1} of 3</p>
                  <p className="font-medium text-slate-800 mb-2">{questions[qIndex].question}</p>
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">
                    💡 Hint: {questions[qIndex].hint}
                  </p>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Apna jawab Hinglish mein type karein..."
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px]"
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={!answer.trim()}
                    className="mt-3 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-semibold rounded-lg px-4 py-2"
                  >
                    <Send className="h-4 w-4" /> Submit Answer
                  </button>
                </div>
              )}

              {!loading && evaluations.length > 0 && phase !== "done" && (
                <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-700">
                    ✅ Q{qIndex} — Score {evaluations[qIndex - 1]?.score ?? 0}/100
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{evaluations[qIndex - 1]?.feedback}</p>
                  {evaluations[qIndex - 1]?.professionalRewrite && (
                    <p className="text-xs text-slate-500 mt-2 italic border-t border-emerald-200 pt-2">
                      ✍️ Recruiter-ready version: &ldquo;{evaluations[qIndex - 1].professionalRewrite}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {!loading && phase === "done" && (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h5 className="text-lg font-bold text-slate-800">Interview Complete!</h5>
                  <p className="text-3xl font-extrabold text-indigo-900 my-2">{avgScore}/100</p>
                  <div className="space-y-3 mt-4 text-left">
                    {evaluations.map((e, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-500">Q{i + 1} • Score {e.score}/100</p>
                        <p className="text-sm text-slate-700">{e.feedback}</p>
                        {e.professionalRewrite && (
                          <p className="text-xs text-slate-500 mt-1 italic">✍️ &ldquo;{e.professionalRewrite}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setOpen(false)} className="mt-4 bg-indigo-900 text-white rounded-lg px-4 py-2 text-sm font-semibold">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
