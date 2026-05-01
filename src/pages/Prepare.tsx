import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiPost } from "@/lib/api";

interface PrepData {
  module_title: string;
  section_title: string;
  questions: string[];
}

const MIN_CHARS = 30;

function useAutoSave(value: string, key: string) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value) return;
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      sessionStorage.setItem(key, value);
      setSaved(true);
    }, 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, key]);

  return saved;
}

export default function Prepare() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [prep, setPrep] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (!meetingId) return;
    apiGet<PrepData>(`/api/meetings/${meetingId}/prepare/`)
      .then((data) => {
        setPrep(data);
        setAnswers(Array(data.questions.length).fill(""));
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [meetingId]);

  const total = prep?.questions.length ?? 0;
  const answer = answers[step] ?? "";
  const charCount = answer.trim().length;
  const canProceed = charCount >= MIN_CHARS;
  const isLast = step === total - 1;
  const progressPct = (step / Math.max(total, 1)) * 100;
  const saveKey = `prepare-${meetingId}-q${step}`;
  const autoSaved = useAutoSave(answer, saveKey);

  useEffect(() => {
    const saved = sessionStorage.getItem(`prepare-${meetingId}-q${step}`);
    if (saved && answers[step] === "") {
      setAnswers((prev) => {
        const next = [...prev];
        next[step] = saved;
        return next;
      });
    }
  }, [step]);

  const handleChange = (val: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = val;
      return next;
    });
  };

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    // Submit all answers
    setSubmitting(true);
    try {
      await apiPost(`/api/meetings/${meetingId}/prepare/submit/`, { answers });
      navigate(`/meeting/${meetingId}/practice-expressions`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      navigate(`/meeting/${meetingId}`);
    } else {
      setStep((s) => s - 1);
    }
  };

  if (loading || !prep) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col px-4 sm:px-6 pt-10 pb-6">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 gap-6">

        <div className="space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
            {prep.section_title}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {prep.module_title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-sm text-gray-400 font-medium shrink-0">
              {step + 1} of {total}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                {prep.questions[step]}
              </h2>
            </div>

            <div
              className={cn(
                "flex items-center gap-1.5 shrink-0 text-xs font-medium transition-opacity duration-300",
                autoSaved && answer ? "text-gray-400 opacity-100" : "opacity-0"
              )}
            >
              <Save className="w-3.5 h-3.5" />
              Auto-saved
            </div>
          </div>

          <textarea
            value={answer}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type your answer in any language...."
            rows={9}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition leading-relaxed"
          />

          <p
            className={cn(
              "text-sm font-medium transition-colors",
              charCount === 0
                ? "text-gray-400"
                : charCount < MIN_CHARS
                ? "text-orange-500"
                : "text-green-600"
            )}
          >
            {charCount} / {MIN_CHARS} characters minimum
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Back to Conversation" : "Previous"}
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className={cn(
              "flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95",
              canProceed && !submitting
                ? "bg-blue-500 hover:bg-blue-600 shadow-md"
                : "bg-blue-300 cursor-not-allowed opacity-70"
            )}
          >
            {submitting ? "Generating…" : isLast ? "Finish preparation" : "Next"}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
