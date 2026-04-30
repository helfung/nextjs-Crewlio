"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const QUALIFICATIONS = [
  "Cert III DA", "Cert IV DA", "OHT", "RN", "Enrolled Nurse", "Receptionist",
  "Bachelor of Oral Health", "Dental Therapist", "Dental Prosthetist", "Other",
];

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

const AVAILABILITY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ToggleGroup({ title, items, selected, setSelected, otherValue, setOtherValue }: {
  title: string;
  items: string[];
  selected: string[];
  setSelected: (v: string[]) => void;
  otherValue?: string;
  setOtherValue?: (v: string) => void;
}) {
  function toggle(item: string) {
    setSelected(selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item]);
  }
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{title}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => toggle(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selected.includes(item) ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      {selected.includes("Other") && setOtherValue !== undefined && (
        <input
          className="mt-3 w-full rounded-2xl border border-slate-200 p-3 text-sm"
          placeholder="Please specify..."
          value={otherValue || ""}
          onChange={(e) => setOtherValue(e.target.value)}
        />
      )}
    </div>
  );
}

export default function ProfileSetupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("QLD");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [otherQualification, setOtherQualification] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [otherSkill, setOtherSkill] = useState("");
  const [software, setSoftware] = useState<string[]>([]);
  const [otherSoftware, setOtherSoftware] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [otherCertificate, setOtherCertificate] = useState("");
  const [hospitalAccreditations, setHospitalAccreditations] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

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

    if (profileError) { setError(profileError.message); setLoading(false); return; }

    const finalQualifications = [
      ...qualifications.filter(q => q !== "Other"),
      ...(qualifications.includes("Other") && otherQualification ? [otherQualification] : []),
    ];

    const finalSkills = [
      ...skills.filter(s => s !== "Other"),
      ...(skills.includes("Other") && otherSkill ? [otherSkill] : []),
      ...software.filter(s => s !== "Other"),
      ...(software.includes("Other") && otherSoftware ? [otherSoftware] : []),
    ];

    const finalCertificates = [
      ...certificates.filter(c => c !== "Other" && c !== "Hospital Accreditation"),
      ...(certificates.includes("Hospital Accreditation") ? [`Hospital Accreditation${hospitalAccreditations ? `: ${hospitalAccreditations}` : ""}`] : []),
      ...(certificates.includes("Other") && otherCertificate ? [otherCertificate] : []),
    ];

    const { error: staffError } = await supabase
      .from("staff_profiles")
      .upsert({
        user_id: user.id,
        qualifications: finalQualifications,
        skills: finalSkills,
        available_days: availability,
        credentialled_hospitals: hospitalAccreditations
          ? hospitalAccreditations.split(",").map(h => h.trim())
          : [],
      });

    if (staffError) { setError(staffError.message); setLoading(false); return; }

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

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="Jane Smith" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="04xx xxx xxx" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Suburb</label>
                <input type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="South Brisbane" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm">
                  {["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <ToggleGroup title="Qualifications" items={QUALIFICATIONS} selected={qualifications} setSelected={setQualifications} otherValue={otherQualification} setOtherValue={setOtherQualification} />
            <ToggleGroup title="Clinical skills & interests" items={SKILLS} selected={skills} setSelected={setSkills} otherValue={otherSkill} setOtherValue={setOtherSkill} />
            <ToggleGroup title="Practice management software" items={SOFTWARE} selected={software} setSelected={setSoftware} otherValue={otherSoftware} setOtherValue={setOtherSoftware} />
            <ToggleGroup title="Certificates & documents" items={CERTIFICATES} selected={certificates} setSelected={setCertificates} otherValue={otherCertificate} setOtherValue={setOtherCertificate} />

            {certificates.includes("Hospital Accreditation") && (
              <div>
                <label className="text-sm font-medium text-slate-700">Hospital accreditation — which hospitals?</label>
                <input type="text" value={hospitalAccreditations} onChange={(e) => setHospitalAccreditations(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm"
                  placeholder="e.g. PA Hospital, Mater, Royal Brisbane" />
                <p className="mt-1 text-xs text-slate-400">Separate multiple hospitals with a comma.</p>
              </div>
            )}

            <ToggleGroup title="Availability" items={AVAILABILITY} selected={availability} setSelected={setAvailability} />

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}

            <button onClick={handleSave} disabled={loading}
              className="w-full rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              {loading ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
