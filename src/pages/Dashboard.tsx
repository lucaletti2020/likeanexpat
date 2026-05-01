import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Flame,
  CircleCheck,
  TrendingUp,
  Clock,
  ChevronDown,
  CirclePlay,
  Trophy,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeetingCollections, type CollectionModule } from "@/store/slices/meetingSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleStatus = "done" | "in_progress" | "not_started";

interface Module {
  id: number;
  title: string;
  status: ModuleStatus;
}

interface Section {
  id: number;
  title: string;
  modules: Module[];
}

const STATS = [
  { icon: Flame, value: "0", label: "Day Streak", iconColor: "text-orange-500", bgColor: "bg-orange-500/10" },
  { icon: CircleCheck, value: "0", label: "Sessions", iconColor: "text-green-500", bgColor: "bg-green-500/10" },
  { icon: TrendingUp, value: "–", label: "Avg Score", iconColor: "text-primary", bgColor: "bg-primary/10" },
  { icon: Clock, value: "–", label: "Last Practice", iconColor: "text-yellow-600", bgColor: "bg-yellow-600/10" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ModuleStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
        <CircleCheck className="w-3 h-3" />
        Done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
        START →
      </span>
    );
  }
  return (
    <span className="inline-block mt-1 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
      Not Started
    </span>
  );
}

function ModuleNode({
  module,
  side,
  onClick,
}: {
  module: Module;
  side: "left" | "right";
  onClick: () => void;
}) {
  const isDone = module.status === "done";
  const isInProgress = module.status === "in_progress";

  return (
    <div
      className={cn(
        "relative w-full flex",
        side === "right"
          ? "justify-end pr-[calc(50%-30px)] sm:pr-[calc(50%-36px)]"
          : "justify-start pl-[calc(50%-30px)] sm:pl-[calc(50%-36px)]"
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          "relative z-10 flex items-center gap-3 rounded-xl border px-3 py-2.5 shadow-sm transition-all duration-200 max-w-[180px] sm:max-w-[200px] w-full",
          side === "right" ? "flex-row-reverse text-right" : "flex-row text-left",
          isDone && "border-green-200 bg-white hover:border-green-300",
          isInProgress && "border-primary/30 bg-primary/5 hover:border-primary/50",
          !isDone && !isInProgress && "border-border bg-card hover:border-muted-foreground/30"
        )}
      >
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs sm:text-sm font-bold leading-tight truncate",
              isDone && "text-foreground",
              isInProgress && "text-foreground",
              !isDone && !isInProgress && "text-muted-foreground"
            )}
          >
            {module.title}
          </p>
          <StatusBadge status={module.status} />
        </div>
        {isDone && <CircleCheck className="w-6 h-6 text-green-600 fill-green-100 flex-shrink-0" />}
        {isInProgress && <CirclePlay className="w-5 h-5 text-primary flex-shrink-0" />}
        {!isDone && !isInProgress && (
          <CirclePlay className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        )}
      </button>
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  const navigate = useNavigate();
  const allDone = section.modules.every((m) => m.status === "done");
  const [open, setOpen] = useState(true);

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-colors bg-card",
        allDone ? "border-primary/30" : "border-border"
      )}
    >
      <div className="flex justify-center">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center justify-center gap-2 border rounded-xl shadow-sm px-4 py-2 -mt-4 bg-card transition-colors",
            allDone ? "border-primary/30 hover:border-primary/50" : "border-border hover:border-muted-foreground/30"
          )}
        >
          <span className="text-sm font-bold text-foreground">{section.title}</span>
          {allDone && <CircleCheck className="w-5 h-5 text-green-500" />}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[2000px] pb-6" : "max-h-0"
        )}
      >
        <div className="relative flex flex-col items-center gap-5 sm:gap-6 pt-4 px-4">
          <div className="absolute left-1/2 top-0 bottom-8 w-px -translate-x-1/2 bg-border" />

          {section.modules.map((mod, i) => (
            <ModuleNode
              key={mod.id}
              module={mod}
              side={i % 2 === 0 ? "right" : "left"}
              onClick={() => navigate(`/meeting/${mod.id}`)}
            />
          ))}

          <div className="relative w-full flex justify-center mt-2 z-10">
            <div
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center shadow-lg",
                allDone
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300"
                  : "bg-muted border-border"
              )}
            >
              <Trophy
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8",
                  allDone ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { collections, collectionsLoading } = useAppSelector((state) => state.meeting);

  useEffect(() => {
    dispatch(fetchMeetingCollections(false));
  }, [dispatch]);

  const sections: Section[] = collections.map((col) => ({
    id: col.id,
    title: col.name,
    modules: col.modules.map((mod: CollectionModule) => ({
      id: mod.id,
      title: mod.title,
      status: "not_started" as ModuleStatus,
    })),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-accent px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-lg">Like an Expat</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          Your Learning Journey
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border border-border shadow-sm">
              <div className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", stat.bgColor)}>
                  <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {collectionsLoading && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-muted-foreground">Loading your modules…</p>
          </div>
        )}

        {!collectionsLoading && sections.length > 0 && (
          <div className="relative py-4">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-border rounded-full" />
            <div className="absolute left-1/2 top-0 w-1 -translate-x-1/2 bg-primary rounded-full" style={{ height: "0%" }} />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-border border-4 border-background" />

            <div className="relative flex flex-col gap-10">
              {sections.map((section) => (
                <SectionBlock key={section.id} section={section} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
