import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";

interface MeetingInfo {
  id: number;
  title: string;
  section: string;
  description: string;
  language: string;
  level: string;
}

export default function MeetingDetail() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) return;
    apiGet<MeetingInfo>(`/api/meetings/${meetingId}/`)
      .then(setMeeting)
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-32">
        <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
          {meeting.section}
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 max-w-xl leading-tight">
          {meeting.title}
        </h1>

        <p className="text-gray-500 text-lg max-w-md leading-relaxed mb-12">
          {meeting.description || "Practice your conversation skills with AI and get ready for real-world conversations."}
        </p>

        <button
          onClick={() => navigate(`/meeting/${meetingId}/simulate`)}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xl px-14 py-5 rounded-full shadow-lg transition-all duration-200"
        >
          <Play className="w-5 h-5 fill-white" />
          Start Conversation
        </button>

        <button
          onClick={() => navigate(`/meeting/${meetingId}/prepare`)}
          className="flex items-center gap-2 mt-10 text-gray-500 hover:text-gray-800 transition-colors duration-200 group"
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="underline underline-offset-2 text-sm font-medium">
            Not ready yet? Prepare first.
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="border-t border-gray-200 flex justify-center px-6 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors duration-200 shadow-sm"
        >
          Go to your Learning Journey
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
