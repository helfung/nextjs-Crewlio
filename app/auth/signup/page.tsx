"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "clinic">("staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(role === "staff" ? "/profile/setup" : "/employer/setup");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
          <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
          <p className="text-sm text-slate-500 mt-1">Secure healthcare workforce matching</p>

          <h2 className="text-xl font-bold mt-8 mb-6">Create account</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">I am a...</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("staff")}
                  className={`rounded-2xl border p-3 text-sm font-semibold transition ${
                    role === "staff"
                      ? "border-teal-700 bg-teal-50 text-teal-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  🩺 Talent
                </button>
                <button
                  onClick={() => setRole("clinic")}
                  className={`rounded-2xl border p-3 text-sm font-semibold transition ${
                    role === "clinic"
                      ? "border-teal-700 bg-teal-50 text-teal-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  🏥 Employer
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="Min 6 characters"
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
