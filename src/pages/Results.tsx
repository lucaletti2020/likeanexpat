import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Star, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Confetti ─────────────────────────────────────────────────────────────────

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#f43f5e", "#14b8a6",
];

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: "rect" | "circle";
}

function Confetti() {
  const pieces: Piece[] = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 6,
    delay: Math.random() * 1.5,
    duration: Math.random() * 2 + 2.5,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.shape === "circle" ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, total }: { score: number; total: number }) {
  const [animated, setAnimated] = useState(false);
  const pct = score / total;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated ? pct * circumference : 0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  const color =
    pct === 1 ? "#10b981" : pct >= 0.7 ? "#6366f1" : pct >= 0.5 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} strokeWidth="12" className="fill-none stroke-gray-200" />
        <circle
          cx="80" cy="80" r={radius}
          strokeWidth="12"
          fill="none"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-4xl font-extrabold text-gray-900">{score}/{total}</span>
        <span className="text-sm text-gray-500 font-medium">correct</span>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMessage(pct: number) {
  if (pct === 1)  return { emoji: "🏆", headline: "Perfect score!", sub: "You nailed every question. Outstanding work!" };
  if (pct >= 0.75) return { emoji: "🌟", headline: "Great job!", sub: "You're building strong skills. Keep it up!" };
  if (pct >= 0.5)  return { emoji: "💪", headline: "Good effort!", sub: "More than half right — you're on the right track." };
  return           { emoji: "📚", headline: "Keep practising!", sub: "Every attempt makes you better. Try again!" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Results() {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  // Score passed from Quiz via navigate state; fall back to mock
  const { score = 3, total = 4 } = (location.state as { score: number; total: number }) ?? {};
  const pct = score / total;
  const msg = getMessage(pct);

  // Stop confetti after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full">

          {/* Emoji */}
          <span className="text-6xl animate-bounce-once">{msg.emoji}</span>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{msg.headline}</h1>
            <p className="text-gray-500 text-base leading-relaxed">{msg.sub}</p>
          </div>

          {/* Score ring */}
          <ScoreRing score={score} total={total} />

          {/* Star row */}
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-7 h-7 transition-all duration-300",
                  i < score
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 fill-gray-100"
                )}
                style={{ transitionDelay: `${i * 150 + 600}ms` }}
              />
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-lg"
            >
              Go to your Learning Journey
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate(`/meeting/${meetingId}/quiz/generated`)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
