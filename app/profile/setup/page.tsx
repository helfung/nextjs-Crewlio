"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const QUALIFICATIONS = ["Cert III DA", "Cert IV DA", "OHT", "RN", "Enrolled Nurse", "Receptionist"];
const AVAILABILITY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProfileSetupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("QLD");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleSave() {
    if (!fullName.trim()) return setError("Please enter your full name.");
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { error: staffError } = await supabase
      .from("staff_profiles")
      .upsert({
        user_id: user.id,
        qualifications,
        available_days: availability,
      });

    if (staffError) {
      setError(staffError.message);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
          <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
          <p className="text-sm text-slate-500 mt-1">Secure healthcare workforce matching</p>

          <h2 className="text-xl font-bold mt-8">Set up your profile</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">This helps clinics match you to the right shifts.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="04xx xxx xxx"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Suburb</label>
                <input
                  type="text"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                  placeholder="South Brisbane"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                >
                  {["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Qualifications</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUALIFICATIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => toggleItem(qualifications, setQualifications, q)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      qualifications.includes(q)
                        ? "bg-teal-700 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Availability</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVAILABILITY.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleItem(availability, setAvailability, day)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      availability.includes(day)
                        ? "bg-teal-700 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
