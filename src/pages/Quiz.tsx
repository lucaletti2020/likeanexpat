import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, CheckCircle, XCircle, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, apiPost } from "@/lib/api";

interface QuizQuestion {
  id: number;
  question: string;
  answers: string[];
  correct_index: number;
  explanation: string;
  order: number;
}

interface BottomSheetProps {
  isCorrect: boolean;
  explanation: string;
  isLast: boolean;
  onNext: () => void;
}

function BottomSheet({ isCorrect, explanation, isLast, onNext }: BottomSheetProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" />
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl px-6 pt-6 pb-10",
          isCorrect ? "bg-green-50 border-t-4 border-green-400" : "bg-red-50 border-t-4 border-red-400"
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          {isCorrect ? (
            <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          )}
          <p className={cn("text-xl font-extrabold", isCorrect ? "text-green-700" : "text-red-600")}>
            {isCorrect ? "Correct!" : "Not quite!"}
          </p>
        </div>

        <p className={cn("text-sm leading-relaxed mb-6", isCorrect ? "text-green-800" : "text-red-800")}>
          {explanation}
        </p>

        <button
          onClick={onNext}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base text-white transition-opacity hover:opacity-90 active:scale-95",
            isCorrect ? "bg-green-600" : "bg-red-500"
          )}
        >
          {isLast ? "See Results" : "Next Question"}
          {isLast ? <ArrowRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
}

export default function Quiz() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [allSelected, setAllSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    apiGet<QuizQuestion[]>(`/api/meetings/${meetingId}/quiz/generated/`)
      .then(setQuestions)
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-500 font-medium">No quiz questions available yet.</p>
        <button onClick={() => navigate("/dashboard")} className="text-blue-500 underline text-sm">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const question = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correct_index;
  const progressPct = (currentIndex / total) * 100;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    if (index === question.correct_index) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    const newSelected = [...allSelected, selectedAnswer!];

    if (isLast) {
      setSubmitting(true);
      try {
        await apiPost(`/api/meetings/${meetingId}/quiz/submit/`, {
          selected_answers: newSelected,
        });
      } catch {
        // Continue even if submission fails
      } finally {
        setSubmitting(false);
      }
      const finalScore = isCorrect ? score : score;
      navigate(`/meeting/${meetingId}/quiz/generated/results`, {
        state: { score: finalScore, total },
      });
      return;
    }

    setAllSelected(newSelected);
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Question {currentIndex + 1} of {total}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Question + answers */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Choose the best answer
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {question.question}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {question.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            const isRight = i === question.correct_index;

            let style = "border-gray-200 bg-white text-gray-800 hover:border-primary/50 hover:bg-primary/5";
            if (isAnswered) {
              if (isRight) {
                style = "border-green-400 bg-green-50 text-green-900";
              } else if (isSelected && !isRight) {
                style = "border-red-400 bg-red-50 text-red-900";
              } else {
                style = "border-gray-200 bg-white text-gray-400 opacity-60";
              }
            } else if (isSelected) {
              style = "border-primary bg-primary/10 text-primary";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left font-semibold transition-all duration-200",
                  style,
                  !isAnswered && "cursor-pointer active:scale-[0.98]",
                  isAnswered && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2",
                    !isAnswered && "border-current",
                    isAnswered && isRight && "border-green-500 bg-green-500 text-white",
                    isAnswered && isSelected && !isRight && "border-red-500 bg-red-500 text-white",
                    isAnswered && !isSelected && !isRight && "border-gray-300 text-gray-400"
                  )}
                >
                  {["A", "B", "C", "D"][i]}
                </span>
                <span className="flex-1 text-sm sm:text-base">{answer}</span>

                {isAnswered && isRight && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                {isAnswered && isSelected && !isRight && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <BottomSheet
          isCorrect={isCorrect}
          explanation={question.explanation}
          isLast={isLast}
          onNext={submitting ? () => {} : handleNext}
        />
      )}
    </div>
  );
}
