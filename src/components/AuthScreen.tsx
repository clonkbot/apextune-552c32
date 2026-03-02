import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Decorative grid background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform -rotate-6">
                  <svg className="w-8 h-8 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">APEX<span className="text-amber-400">TUNE</span></h1>
                <p className="text-xs text-zinc-500 font-mono tracking-[0.2em] -mt-1">PRECISION MAINTENANCE</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto">
              AI-powered maintenance scheduling for your motorcycle
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex gap-1 mb-6 bg-zinc-800/50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFlow("signIn")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  flow === "signIn"
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setFlow("signUp")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  flow === "signUp"
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="rider@example.com"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <input name="flow" type="hidden" value={flow} />

              {error && (
                <p className="text-red-400 text-sm text-center py-2 bg-red-500/10 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : flow === "signIn" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <button
                onClick={() => signIn("anonymous")}
                className="w-full py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Continue as Guest
              </button>
            </div>
          </div>

          {/* Features preview */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: "📊", label: "AI Planning" },
              { icon: "🔔", label: "Smart Alerts" },
              { icon: "🛒", label: "Parts Shop" },
            ].map((feature) => (
              <div key={feature.label} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs text-zinc-500 font-medium">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-zinc-600 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
