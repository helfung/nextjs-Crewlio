"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const STATES = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"];

export default function EmployerSetupPage() {
  const [clinicName, setClinicName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("QLD");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    if (!clinicName.trim()) return setError("Please enter your clinic name.");
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { error: clinicError } = await supabase
      .from("clinic_profiles")
      .upsert({
        user_id: user.id,
        clinic_name: clinicName,
        address,
        suburb,
        state,
        postcode,
      });

    if (clinicError) {
      setError(clinicError.message);
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

          <h2 className="text-xl font-bold mt-8">Set up your clinic</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Tell us about your practice so we can match you with the right staff.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Clinic name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="Inner South Dental"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="07xx xxx xxx"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Street address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
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
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Postcode</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                  placeholder="4101"
                />
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
