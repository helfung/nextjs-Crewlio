"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    if (!email.trim()) return setError("Please enter your email.");
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/reset-password",
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSent(true); }
  }

  if (sent) return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="mt-2 text-sm text-slate-500">We sent a reset link to <strong>{email}</strong>.</p>
        <Link href="/auth/login" className="mt-6 inline-block text-sm font-semibold text-teal-700">Back to login</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
          <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
          <p className="text-sm text-slate-500 mt-1">Secure healthcare workforce matching</p>
          <h2 className="text-xl font-bold mt-8">Reset password</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Enter your email and we'll send you a reset link.</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleReset()} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}
            <button onClick={handleReset} disabled={loading}
              className="w-full rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/auth/login" className="font-semibold text-teal-700">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
