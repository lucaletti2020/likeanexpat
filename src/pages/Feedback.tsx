import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  X,
  Sparkles,
  ArrowRight,
  CircleHelp,
  MessageCircle,
  ChevronDown,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";

interface Skill {
  name: string;
  score: number;
}

interface TranscriptLine {
  turn_number: number;
  speaker: "ai" | "user";
  text: string;
  timestamp: string;
}

interface FeedbackData {
  module_title: string;
  section_title: string;
  overall_score: number;
  performance_label: string;
  skills: Skill[];
  strengths: string[];
  improvements: string[];
  transcript: TranscriptLine[];
  created_at: string;
}

function performanceColor(score: number) {
  if (score >= 8) return "bg-green-400";
  if (score >= 6) return "bg-yellow-400";
  return "bg-red-400";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function CircularScore({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = animated ? (score / 10) * circumference : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} strokeWidth="10" className="fill-none stroke-muted/30" />
        <circle
          cx="64" cy="64" r={radius}
          strokeWidth="10"
          className="fill-none stroke-primary transition-all duration-1000 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">/ 10</span>
      </div>
    </div>
  );
}

function SkillBar({ name, score }: { name: string; score: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const color =
    score >= 8 ? "bg-green-500" : score >= 6.5 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="space-y-3 w-full p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <button className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <CircleHelp className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-2xl font-bold tabular-nums">{score.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground"> / 10</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-muted/40 w-full">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
          style={{ width: animated ? `${(score / 10) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function TranscriptPanel({ transcript }: { transcript: TranscriptLine[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/50 bg-card/80 backdrop-blur">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 flex items-center justify-between gap-2 text-left hover:bg-muted/30 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Transcript</h3>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {transcript.map((line, i) => (
            <div key={i} className={cn("flex gap-3", line.speaker === "user" && "flex-row-reverse")}>
              <span className="text-xs font-bold text-muted-foreground shrink-0 mt-1 w-6 text-center">
                {line.speaker === "ai" ? "AI" : "You"}
              </span>
              <p
                className={cn(
                  "text-sm leading-relaxed p-3 rounded-xl max-w-[80%]",
                  line.speaker === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-foreground"
                )}
              >
                {line.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Feedback() {
  const { meetingId, assessmentId } = useParams();
  const navigate = useNavigate();

  const [fb, setFb] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId || !assessmentId) return;
    apiGet<FeedbackData>(`/api/meetings/${meetingId}/feedback/${assessmentId}/`)
      .then(setFb)
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [meetingId, assessmentId]);

  if (loading || !fb) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="w-8 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold truncate">Conversation Feedback</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-10 flex-1 space-y-4 sm:space-y-6">

        {/* Title card */}
        <div className="rounded-lg border border-border/50 bg-card/80 backdrop-blur p-4 sm:p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                {fb.module_title}
              </h2>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full shrink-0">
                {fb.section_title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Completed on {formatDate(fb.created_at)}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => navigate(`/meeting/${meetingId}/quiz/generated`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Start Quiz
              </button>
              <button
                onClick={() => navigate(`/meeting/${meetingId}/prepare`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Prepare Again
              </button>
              <button
                onClick={() => navigate(`/meeting/${meetingId}/simulate`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Repeat Conversation
              </button>
            </div>
          </div>
        </div>

        {/* Score + skills */}
        <div className="rounded-lg border border-border/50 bg-card/80 backdrop-blur p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <CircularScore score={fb.overall_score} />
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground">Overall Performance</h3>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className={cn("w-3 h-3 rounded-full", performanceColor(fb.overall_score))} />
                <span className="text-lg font-medium">{fb.performance_label}</span>
              </div>
            </div>
          </div>

          {fb.skills.length > 0 && (
            <div className="border-t border-border/30 pt-6 space-y-2">
              <h2 className="text-xl font-bold text-foreground">Communication Skills</h2>
              <div className="space-y-3">
                {fb.skills.map((skill) => (
                  <SkillBar key={skill.name} name={skill.name} score={skill.score} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>

          {fb.strengths.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-card/80 backdrop-blur p-4 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Strengths</h3>
                <div className="space-y-3">
                  {fb.strengths.map((s, i) => (
                    <p key={i} className="text-sm text-foreground leading-relaxed p-3 rounded-lg bg-green-50 border border-green-100">
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {fb.improvements.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-card/80 backdrop-blur p-4 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Areas for Improvement</h3>
                <div className="space-y-3">
                  {fb.improvements.map((s, i) => (
                    <p key={i} className="text-sm text-foreground leading-relaxed p-3 rounded-lg bg-orange-50 border border-orange-100">
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {fb.transcript.length > 0 && <TranscriptPanel transcript={fb.transcript} />}
        </div>

        {/* Quiz CTA */}
        <div className="rounded-lg bg-card border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">A quiz made just for you!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn your mistakes into progress with this personalized practice.
              </p>
            </div>
            <button
              onClick={() => navigate(`/meeting/${meetingId}/quiz/generated`)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Start Quiz
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Go to your Learning Journey
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </footer>
    </div>
  );
}
