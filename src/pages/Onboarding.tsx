import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { flag: "🇬🇧", name: "English" },
  { flag: "🇪🇸", name: "Spanish" },
  { flag: "🇫🇷", name: "French" },
  { flag: "🏴", name: "Catalan" },
  { flag: "🇧🇷", name: "Portuguese" },
  { flag: "🇮🇹", name: "Italian" },
];

const LEVELS = [
  { emoji: "🌱", name: "Beginner", description: "I know a few words and phrases" },
  { emoji: "🌳", name: "Intermediate", description: "I manage most daily situations" },
  { emoji: "🏔️", name: "Upper Intermediate", description: "I'm fairly fluent but want polish" },
  { emoji: "⭐", name: "Advanced", description: "I want to sound like a native" },
];

const SITUATIONS = [
  { emoji: "👋", name: "Social & Friendships", description: "Meeting people, small talk, making plans with friends" },
  { emoji: "🍽️", name: "Dining & Food", description: "Ordering at restaurants, food preferences, cooking discussions" },
  { emoji: "🛍️", name: "Shopping & Services", description: "Buying clothes, returns, asking for help in stores" },
  { emoji: "✈️", name: "Travel & Transport", description: "Airports, hotels, asking for directions, public transport" },
  { emoji: "💊", name: "Health & Wellness", description: "Doctor visits, pharmacy, describing symptoms, gym" },
  { emoji: "🏠", name: "Home & Neighborhood", description: "Landlords, neighbors, repairs, deliveries" },
  { emoji: "💳", name: "Money & Banking", description: "Banks, bills, splitting costs, negotiating prices" },
  { emoji: "🎭", name: "Entertainment & Culture", description: "Movies, events, hobbies, recommending things" },
  { emoji: "🚨", name: "Emergencies & Problems", description: "Lost items, accidents, complaints, asking for urgent help" },
  { emoji: "📋", name: "Paperwork & Admin", description: "Appointments, forms, visas, phone calls to offices" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [situations, setSituations] = useState<string[]>([]);

  const toggleSituation = (name: string) => {
    setSituations((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleFinish = () => {
    localStorage.setItem("onboarding_complete", "true");
    localStorage.setItem("onboarding_language", language!);
    localStorage.setItem("onboarding_level", level!);
    localStorage.setItem("onboarding_situations", JSON.stringify(situations));
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Step dots */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              step === s ? "bg-blue-600 scale-125" : "bg-gray-300"
            )}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 sm:p-12">

        {/* Step 1 — Language */}
        {step === 1 && (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Which language do you want to practice?
            </h1>
            <p className="text-gray-500 mb-8">
              Pick the language you'd like to improve through real-life conversations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.name}
                  onClick={() => setLanguage(lang.name)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 text-left font-semibold text-gray-800 transition-all duration-200",
                    language === lang.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — Level */}
        {step === 2 && (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              What's your current level?
            </h1>
            <p className="text-gray-500 mb-8">
              Be honest — we'll match situations to where you really are.
            </p>
            <div className="flex flex-col gap-4">
              {LEVELS.map((l) => (
                <button
                  key={l.name}
                  onClick={() => setLevel(l.name)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                    level === l.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                >
                  <span className="text-3xl">{l.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-900">{l.name}</p>
                    <p className="text-sm text-gray-500">{l.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3 — Situations */}
        {step === 3 && (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              What situations matter most?
            </h1>
            <p className="text-gray-500 mb-8">
              Pick at least 2. We'll build your practice around these.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {SITUATIONS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => toggleSituation(s.name)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                    situations.includes(s.name)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                >
                  <span className="text-2xl mb-1">{s.emoji}</span>
                  <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500 leading-snug">{s.description}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              {situations.length} selected — pick at least 2
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="w-full max-w-2xl flex justify-between items-center mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 && (
          <Button
            onClick={() => setStep((s) => (s + 1) as 2 | 3)}
            disabled={step === 1 ? !language : !level}
            className="rounded-full px-8 py-3 h-auto font-bold text-base bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}

        {step === 3 && (
          <Button
            onClick={handleFinish}
            disabled={situations.length < 2}
            className="rounded-full px-8 py-3 h-auto font-bold text-base bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
          >
            Try my first conversation
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
