"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleUpdate() {
    if (!password.trim()) return setError("Please enter a new password.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    }
  }

  if (done) return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold">Password updated!</h2>
        <p className="mt-2 text-sm text-slate-500">Redirecting you to the app...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
          <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
          <p className="text-sm text-slate-500 mt-1">Secure healthcare workforce matching</p>

          <h2 className="text-xl font-bold mt-8">Set new password</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Choose a strong password for your account.</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="Repeat your password"
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
