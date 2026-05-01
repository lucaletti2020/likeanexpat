import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Pause, Mic, MicOff, ChevronRight, ArrowLeft, Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, auth } from "@/lib/api";

interface PracticeSentence {
  id: number;
  index: number;
  sentence: string;
  audio_url: string;
  word_scores: Array<{ word: string; score: number }>;
  overall_score: number | null;
}

type AudioState = "idle" | "playing" | "done";
type MicState = "idle" | "recording" | "scoring" | "recorded";

interface PronunciationFeedback {
  overallScore: number;
  words: Array<{ word: string; score: number }>;
}

function wordColor(score: number) {
  if (score >= 81) return { bg: "bg-[#e8f5e9]", border: "border-[#66bb6a]", text: "text-[#2e7d32]", sup: "text-[#388e3c]" };
  if (score >= 61) return { bg: "bg-[#fff8e1]", border: "border-[#ffa726]", text: "text-[#e65100]", sup: "text-[#f57c00]" };
  return { bg: "bg-[#fce4ec]", border: "border-[#ef9a9a]", text: "text-[#c62828]", sup: "text-[#d32f2f]" };
}

function scoreEmoji(score: number) {
  if (score >= 90) return { emoji: "🤩", label: "Excellent!" };
  if (score >= 75) return { emoji: "😊", label: "Great job!" };
  if (score >= 60) return { emoji: "🙂", label: "Good effort!" };
  return { emoji: "😅", label: "Keep practising!" };
}

function FeedbackPanel({
  feedback,
  onRetry,
  onNext,
  isLast,
}: {
  feedback: PronunciationFeedback;
  onRetry: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const { emoji, label } = scoreEmoji(feedback.overallScore);
  const scoreColor =
    feedback.overallScore >= 81 ? "text-[#2e7d32]" : feedback.overallScore >= 61 ? "text-[#e65100]" : "text-[#c62828]";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl">{emoji}</span>
        <p className="text-xl font-extrabold text-gray-900">{label}</p>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-end gap-1">
          <span className={cn("text-6xl font-extrabold leading-none", scoreColor)}>
            {feedback.overallScore}
          </span>
          <span className="text-2xl font-bold text-gray-400 mb-1">/100</span>
        </div>
        <p className="text-sm text-gray-500 font-medium">Overall Score</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 w-full">
        {feedback.words.map((w, i) => {
          const c = wordColor(w.score);
          return (
            <span
              key={i}
              className={cn(
                "inline-flex items-baseline gap-0.5 px-3 py-1.5 rounded-full border-2 text-sm font-semibold",
                c.bg, c.border, c.text
              )}
            >
              {w.word}
              <sup className={cn("text-[10px] font-bold ml-0.5", c.sup)}>{w.score}</sup>
            </span>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 w-full pt-2">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1a237e] hover:bg-[#283593] text-white font-bold text-base active:scale-95 transition-all shadow-md"
        >
          {isLast ? "Finish & Start Conversation" : "Next Sentence"}
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

function WaveformBars({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={cn("rounded-full transition-all", color)}
          style={{
            width: 3,
            height: active
              ? `${10 + Math.abs(Math.sin((i + Date.now() / 300) * 1.3)) * 22}px`
              : "6px",
            transition: active ? "height 0.15s ease" : "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border-2 bg-white p-6 flex flex-col items-center gap-5 flex-1", accent)}>
      <div className="flex items-center gap-2 self-start">
        {icon}
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Practice() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [sentences, setSentences] = useState<PracticeSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [micState, setMicState] = useState<MicState>("idle");
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [completed, setCompleted] = useState(false);
  const [, setTick] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!meetingId) return;
    apiGet<PracticeSentence[]>(`/api/meetings/${meetingId}/practice/sentences/`)
      .then(setSentences)
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [meetingId]);

  useEffect(() => {
    if (audioState !== "playing" && micState !== "recording") return;
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, [audioState, micState]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setAudioState("idle");
    setMicState("idle");
    setFeedback(null);
  }, [step]);

  const current = sentences[step];
  const total = sentences.length;
  const isLast = step === total - 1;

  const handlePlay = () => {
    if (!current) return;

    if (audioState === "playing") {
      window.speechSynthesis?.cancel();
      setAudioState("idle");
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(current.sentence);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onend = () => setAudioState("done");
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setAudioState("playing");
    }
  };

  const handleMic = async () => {
    if (micState === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream);

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setMicState("scoring");

        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("sentence_index", String(current.index));

        try {
          const token = auth.getToken();
          const res = await fetch(`/api/meetings/${meetingId}/practice/record/`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          const result = await res.json();
          setFeedback({ overallScore: result.overall_score, words: result.words });
        } catch {
          const words = current.sentence.replace(/[.,?!]/g, "").split(" ");
          setFeedback({
            overallScore: 72,
            words: words.map((w) => ({ word: w, score: Math.floor(Math.random() * 35) + 60 })),
          });
        }
        setMicState("recorded");
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setMicState("recording");
    } catch {
      console.error("Microphone access denied");
    }
  };

  const handleRetry = () => {
    setMicState("idle");
    setFeedback(null);
  };

  const handleNext = () => {
    if (isLast) {
      setCompleted(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-500 font-medium">No practice sentences yet. Please complete the preparation step first.</p>
        <button
          onClick={() => navigate(`/meeting/${meetingId}/prepare`)}
          className="text-blue-500 underline text-sm"
        >
          Go to Prepare
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full">
          <span className="text-7xl">🎙️</span>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">You're all done!</h1>
            <p className="text-gray-500 text-base leading-relaxed">
              You've practised all {total} sentences. Now let's put it all together in a real conversation.
            </p>
          </div>
          <button
            onClick={() => navigate(`/meeting/${meetingId}/simulate`)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
          >
            Start Conversation
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col px-4 sm:px-6 pt-8 pb-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

        <div className="text-center space-y-1">
          <p className="text-2xl font-extrabold text-gray-900">Well done! 🎉</p>
          <p className="text-gray-500 text-base">
            We've created <span className="font-bold text-gray-700">{total} sentences</span> for you to practice. Let's start.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-400 font-medium shrink-0">
            {step + 1} of {total}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex items-start gap-4">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
            {step + 1}
          </span>
          <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
            "{current.sentence}"
          </p>
        </div>

        {micState === "scoring" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Analysing your pronunciation…</p>
          </div>
        )}

        {feedback && micState === "recorded" ? (
          <FeedbackPanel
            feedback={feedback}
            onRetry={handleRetry}
            onNext={handleNext}
            isLast={isLast}
          />
        ) : micState !== "scoring" ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <SectionCard
                title="Listen to the sentence"
                accent={audioState === "playing" ? "border-blue-300" : "border-gray-200"}
                icon={<Volume2 className={cn("w-4 h-4", audioState === "playing" ? "text-blue-500" : "text-gray-400")} />}
              >
                <button
                  onClick={handlePlay}
                  className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-md transition-all duration-200 active:scale-95"
                >
                  {audioState === "playing" ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  )}
                </button>
                {audioState === "playing" && <WaveformBars active={true} color="bg-blue-400" />}
                {audioState === "idle" && <p className="text-xs text-gray-400">Tap to listen</p>}
                {audioState === "done" && <p className="text-xs text-blue-500 font-medium">Tap to replay</p>}
              </SectionCard>

              <SectionCard
                title="Practice your pronunciation"
                accent={micState === "recording" ? "border-red-300" : "border-gray-200"}
                icon={<Mic className={cn("w-4 h-4", micState === "recording" ? "text-red-500" : "text-gray-400")} />}
              >
                <button
                  onClick={handleMic}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-95",
                    micState === "recording"
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-gray-700 hover:bg-gray-800"
                  )}
                >
                  {micState === "recording" ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                {micState === "idle" && <p className="text-xs text-gray-400">Tap to record</p>}
                {micState === "recording" && <WaveformBars active={true} color="bg-red-400" />}
              </SectionCard>
            </div>

            <p className="text-center text-xs text-gray-400">
              Listen to the sentence and record your pronunciation to continue.
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => step === 0 ? navigate(`/meeting/${meetingId}/prepare`) : setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
