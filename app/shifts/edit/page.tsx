"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SKILLS = [
  "General Dentistry", "Paeds", "Ortho", "Perio", "Pros", "OHT", "Hygienist",
  "Steri", "Receptionist", "Clinical Team Leader", "Practice Manager",
  "Front Office Coordinator", "Implants", "Endo", "GA", "SND", "Oral Surgery",
  "Oral Med", "Oral Path", "Radiology", "Dental Sleep Medicine",
  "Functional Dentistry", "Cosmetic Dentistry", "Other",
];

const SOFTWARE = [
  "D4W", "Praktika", "Ultimo", "Exact", "Core Practice",
  "Dentally", "CareStack", "Principle", "Other",
];

const CERTIFICATES = [
  "Cert III", "Cert IV", "Radiation Licence", "Blue Card", "CPR",
  "First Aid", "Drivers Licence", "Immunisations", "Hospital Accreditation",
  "AHPRA Registration", "Orofacial Myology", "Sedation & GA Support Training",
  "Infection Control Certification", "Other",
];

function ToggleGroup({ label, items, selected, setSelected, otherValue, setOtherValue, activeColour = "teal" }: {
  label: string; items: string[]; selected: string[]; setSelected: (v: string[]) => void;
  otherValue?: string; setOtherValue?: (v: string) => void; activeColour?: "teal" | "emerald";
}) {
  function toggle(item: string) {
    setSelected(selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item]);
  }
  const activeBg = activeColour === "emerald" ? "bg-emerald-700 text-white" : "bg-teal-700 text-white";
  const inactiveBg = activeColour === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-teal-50 text-teal-700";
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button key={item} onClick={() => toggle(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${selected.includes(item) ? activeBg : inactiveBg}`}>
            {item}
          </button>
        ))}
      </div>
      {selected.includes("Other") && setOtherValue !== undefined && (
        <input className="mt-3 w-full rounded-2xl border border-slate-200 p-3 text-sm"
          placeholder="Please specify..." value={otherValue || ""} onChange={(e) => setOtherValue(e.target.value)} />
      )}
    </div>
  );
}

function EditShiftForm() {
  const searchParams = useSearchParams();
  const shiftId = searchParams.get("id");
  const router = useRouter();

  const [date, setDate] = useState("");
  const [role, setRole] = useState("Chairside Assistant");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rate, setRate] = useState("");
  const [hospital, setHospital] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [otherSkill, setOtherSkill] = useState("");
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [otherSoftware, setOtherSoftware] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [otherDoc, setOtherDoc] = useState("");
  const [hospitalAccreditation, setHospitalAccreditation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchShift() {
      if (!shiftId) return;
      const supabase = createClient();
      const { data } = await supabase.from("shifts").select("*").eq("id", shiftId).single();
      if (data) {
        setDate(data.shift_date || "");
        setRole(data.role_required || "Chairside Assistant");
        setStartTime(data.start_time?.slice(0, 5) || "");
        setEndTime(data.end_time?.slice(0, 5) || "");
        setRate(String(data.rate || ""));
        setHospital(data.hospital || "");
        setUrgent(data.urgent || false);
        const skills = (data.required_skills || []).filter((s: string) => SOFTWARE.includes(s));
        const nonSoftware = (data.required_skills || []).filter((s: string) => !SOFTWARE.includes(s));
        setSelectedSkills(nonSoftware);
        setSelectedSoftware(skills);
        const hospAccred = (data.required_documents || []).find((d: string) => d.startsWith("Hospital Accreditation:"));
        if (hospAccred) {
          setHospitalAccreditation(hospAccred.replace("Hospital Accreditation: ", ""));
          setSelectedDocs([...(data.required_documents || []).filter((d: string) => !d.startsWith("Hospital Accreditation")), "Hospital Accreditation"]);
        } else {
          setSelectedDocs(data.required_documents || []);
        }
      }
      setFetching(false);
    }
    fetchShift();
  }, [shiftId]);

  async function handleSave() {
    if (!date || !startTime || !endTime || !rate) { setError("Please fill in date, times and rate."); return; }
    setLoading(true); setError("");
    const supabase = createClient();

    const finalSkills = [
      ...selectedSkills.filter(s => s !== "Other"),
      ...(selectedSkills.includes("Other") && otherSkill ? [otherSkill] : []),
      ...selectedSoftware.filter(s => s !== "Other"),
      ...(selectedSoftware.includes("Other") && otherSoftware ? [otherSoftware] : []),
    ];
    const finalDocs = [
      ...selectedDocs.filter(d => d !== "Other" && d !== "Hospital Accreditation"),
      ...(selectedDocs.includes("Hospital Accreditation") ? [`Hospital Accreditation${hospitalAccreditation ? `: ${hospitalAccreditation}` : ""}`] : []),
      ...(selectedDocs.includes("Other") && otherDoc ? [otherDoc] : []),
    ];

    const { error: updateError } = await supabase.from("shifts").update({
      role_required: role, shift_date: date, start_time: startTime,
      end_time: endTime, rate: parseFloat(rate), hospital, urgent,
      required_skills: finalSkills, required_documents: finalDocs,
    }).eq("id", shiftId);

    if (updateError) { setError(updateError.message); setLoading(false); return; }
    router.push("/shifts");
  }

  if (fetching) return <div className="text-center text-slate-500 py-12">Loading shift...</div>;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-8">
      <h2 className="text-xl font-bold mb-6">Edit shift</h2>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-2xl border border-slate-200 p-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select className="rounded-2xl border border-slate-200 p-3" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Chairside Assistant</option><option>Receptionist</option><option>Steri</option>
            <option>OHT / Hygienist</option><option>Clinical Team Leader</option><option>Practice Manager</option>
            <option>Front Office Coordinator</option><option>Dental Therapist</option><option>Dental Prosthetist</option>
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-2xl border border-slate-200 p-3" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input className="rounded-2xl border border-slate-200 p-3" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <input className="rounded-2xl border border-slate-200 p-3" placeholder="$/hr e.g. 45" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))} />
        </div>
        <input className="w-full rounded-2xl border border-slate-200 p-3" placeholder="Hospital / facility (optional)" value={hospital} onChange={(e) => setHospital(e.target.value)} />
        <ToggleGroup label="Required clinical skills" items={SKILLS} selected={selectedSkills} setSelected={setSelectedSkills} otherValue={otherSkill} setOtherValue={setOtherSkill} />
        <ToggleGroup label="Practice management software" items={SOFTWARE} selected={selectedSoftware} setSelected={setSelectedSoftware} otherValue={otherSoftware} setOtherValue={setOtherSoftware} />
        <ToggleGroup label="Required certificates & documents" items={CERTIFICATES} selected={selectedDocs} setSelected={setSelectedDocs} otherValue={otherDoc} setOtherValue={setOtherDoc} activeColour="emerald" />
        {selectedDocs.includes("Hospital Accreditation") && (
          <input className="w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="Which hospital?" value={hospitalAccreditation} onChange={(e) => setHospitalAccreditation(e.target.value)} />
        )}
        <button onClick={() => setUrgent(!urgent)} className={`w-full rounded-2xl border p-4 text-left transition ${urgent ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200"}`}>
          <div className="font-semibold">Urgent shift</div>
          <p className="text-sm opacity-70">{urgent ? "Marked as urgent" : "Mark as urgent to notify candidates"}</p>
        </button>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push("/shifts")} className="rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditShiftPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Crewlio</h1>
        <Suspense fallback={<div className="text-center text-slate-500 py-12">Loading...</div>}>
          <EditShiftForm />
        </Suspense>
      </div>
    </main>
  );
}
