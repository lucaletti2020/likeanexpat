import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { wsUrl } from "@/lib/api";

interface Message {
  speaker: "ai" | "user";
  text: string;
  streaming?: boolean;
}

export default function Simulate() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connecting, setConnecting] = useState(true);
  const [wsError, setWsError] = useState(false);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const url = wsUrl(`/ws/meetings/${meetingId}/simulate/`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnecting(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "session_info") {
        setAssessmentId(data.assessment_id);
      } else if (data.type === "ai_message") {
        setAiThinking(false);
        setMessages((prev) => [...prev, { speaker: "ai", text: data.text }]);
      } else if (data.type === "ai_chunk") {
        setAiThinking(false);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.speaker === "ai" && last.streaming) {
            return [...prev.slice(0, -1), { speaker: "ai", text: last.text + data.text, streaming: true }];
          }
          return [...prev, { speaker: "ai", text: data.text, streaming: true }];
        });
      } else if (data.type === "ai_done") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.speaker === "ai" && last.streaming) {
            return [...prev.slice(0, -1), { speaker: "ai", text: data.text }];
          }
          return prev;
        });
      }
    };

    ws.onerror = () => setWsError(true);

    return () => ws.close();
  }, [meetingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiThinking]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ text }));
    setMessages((prev) => [...prev, { speaker: "user", text }]);
    setInput("");
    setAiThinking(true);
    inputRef.current?.focus();
  };

  const handleEnd = () => {
    wsRef.current?.close();
    if (assessmentId) {
      navigate(`/meeting/${meetingId}/feedback/${assessmentId}`);
    } else {
      navigate("/dashboard");
    }
  };

  if (connecting) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Starting conversation…</p>
      </div>
    );
  }

  if (wsError) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-500 font-semibold">Could not connect to the conversation.</p>
        <p className="text-gray-400 text-sm">Please check that the backend server is running.</p>
        <button
          onClick={() => navigate(`/meeting/${meetingId}`)}
          className="text-blue-500 underline text-sm mt-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            🟢 Live Conversation
          </span>
          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all"
          >
            <Square className="w-3.5 h-3.5" />
            End Conversation
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && !aiThinking && (
          <p className="text-center text-gray-400 text-sm mt-10">The conversation will start shortly…</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.speaker === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.speaker === "ai"
                  ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                  : "bg-blue-500 text-white rounded-tr-sm"
              )}
            >
              {msg.text}
              {msg.streaming && <span className="animate-pulse ml-0.5">▋</span>}
            </div>
          </div>
        ))}

        {aiThinking && (
          <div className="flex gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-400 shadow-sm">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type your message…"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95",
              input.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 flex justify-center px-6 py-4 bg-white">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          Exit to Learning Journey
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
