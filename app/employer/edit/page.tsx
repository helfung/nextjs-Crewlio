"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const STATES = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"];

export default function EmployerEditPage() {
  const [clinicName, setClinicName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("QLD");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth/login");

      const { data: profile } = await supabase
        .from("profiles").select("phone").eq("id", user.id).single();
      if (profile) setPhone(profile.phone || "");

      const { data: clinicProfile } = await supabase
        .from("clinic_profiles").select("*").eq("user_id", user.id).single();
      if (clinicProfile) {
        setClinicName(clinicProfile.clinic_name || "");
        setAddress(clinicProfile.address || "");
        setSuburb(clinicProfile.suburb || "");
        setState(clinicProfile.state || "QLD");
        setPostcode(clinicProfile.postcode || "");
      }
      setFetching(false);
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    if (!clinicName.trim()) return setError("Please enter your clinic name.");
    setLoading(true); setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    await supabase.from("profiles").update({ phone }).eq("id", user.id);

    const { error: clinicError } = await supabase
      .from("clinic_profiles")
      .upsert({ user_id: user.id, clinic_name: clinicName, address, suburb, state, postcode }, { onConflict: "user_id" });

    if (clinicError) { setError(clinicError.message); setLoading(false); return; }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/"), 1000);
  }

  if (fetching) return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-slate-500">Loading profile...</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
            <button onClick={() => router.push("/")} className="text-sm text-slate-400 hover:text-slate-600">← Back</button>
          </div>
          <p className="text-sm text-slate-500 mt-1">Secure healthcare workforce matching</p>

          <h2 className="text-xl font-bold mt-8">Edit clinic profile</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Keep your clinic details up to date.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Clinic name</label>
              <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="Inner South Dental" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="07xx xxx xxx" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Street address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-sm font-medium text-slate-700">Suburb</label>
                <input type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="South Brisbane" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm">
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Postcode</label>
                <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="4101" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}
            {saved && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-2xl p-3">✓ Saved! Redirecting...</p>}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push("/")} className="rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading}
                className="rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
