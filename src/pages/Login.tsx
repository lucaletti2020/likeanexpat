import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { auth } from "@/lib/api";

const IS_DEV = import.meta.env.DEV;

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dev-only state
  const [devEmail, setDevEmail] = useState("");
  const [devPassword, setDevPassword] = useState("");

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign-in failed. Please try again.");
      auth.setTokens(data.access, data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  // ── DEV ONLY ────────────────────────────────────────────────────────────────
  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: devEmail, password: devPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed.");
      auth.setTokens(data.access, data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex flex-col">
      <header className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-4">
        <span className="text-white font-bold text-lg">Like an Expat</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-10 flex flex-col items-center gap-8">

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome!</h1>
            <p className="text-gray-500">Sign in to start your language journey</p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="w-10 h-10">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.4 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l6-6C34.4 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.8 1.1 7.9 2.9l6-6C34.4 6.1 29.5 4 24 4c-7.8 0-14.5 4.4-18.2 10.7z"/>
              <path fill="#FBBC05" d="M24 44c5.4 0 10.2-1.8 13.9-4.9l-6.4-5.2C29.6 35.4 27 36 24 36c-5.5 0-10.2-3.5-11.8-8.4l-7 5.4C8.5 39.7 15.7 44 24 44z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.4 4.3-4.4 5.6l6.4 5.2C41.4 36 44.5 30.4 44.5 24c0-1.3-.1-2.7-.2-4z"/>
            </svg>
          </div>

          <div className="w-full flex flex-col items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Signing you in…
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rectangular"
                text="signin_with"
                width="320"
              />
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </div>

          {/* ── DEV LOGIN — only visible locally, stripped from production build ── */}
          {IS_DEV && (
            <div className="w-full border-t border-dashed border-gray-200 pt-6">
              <p className="text-xs text-gray-400 text-center mb-3 font-mono">DEV LOGIN</p>
              <form onSubmit={handleDevLogin} className="space-y-3">
                <input
                  type="text"
                  placeholder="Username or email"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
                >
                  Dev Sign In
                </button>
              </form>
            </div>
          )}
          {/* ───────────────────────────────────────────────────────────────────── */}

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            By continuing, you agree to our{" "}
            <Link to="/terms-of-service" className="underline hover:text-gray-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="underline hover:text-gray-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
