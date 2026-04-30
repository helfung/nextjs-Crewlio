"use client";

import type React from "react";
import { useState, useEffect } from "react";

type Tab = "candidate" | "clinic" | "admin";

type Shift = {
  id: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  rate: number;
  urgent: boolean;
  hospital: string;
  required_skills: string[];
  required_documents: string[];
  clinic_profiles: { clinic_name: string };
};

type CandidateMatch = {
  id: string;
  user_id: string;
  qualifications: string[];
  skills: string[];
  available_days: string[];
  matchScore: number;
  profileName: string;
  profileEmail: string;
};

const badges = [
  "Fully Verified", "Last-Minute Legend", "Clinic Favourite", "Compliance Pro",
  "Reliable Pro", "Paeds Pro", "GA Veteran", "Fast Responder", "Availability Master",
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

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "red" | "amber" | "teal" }) {
  const colours = {
    default: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    teal: "bg-teal-50 text-teal-700",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${colours[tone]}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-100 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Button({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${className}`}>
      {children}
    </button>
  );
}

function ToggleGroup({ label, items, selected, setSelected, otherValue, setOtherValue, activeColour = "teal" }: {
  label: string;
  items: string[];
  selected: string[];
  setSelected: (v: string[]) => void;
  otherValue?: string;
  setOtherValue?: (v: string) => void;
  activeColour?: "teal" | "emerald";
}) {
  function toggleItem(item: string) {
    setSelected(selected.includes(item) ? selected.filter((i) => i !== item) : [...selected, item]);
  }
  const activeBg = activeColour === "emerald" ? "bg-emerald-700 text-white" : "bg-teal-700 text-white";
  const inactiveBg = activeColour === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-teal-50 text-teal-700";
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button key={item} onClick={() => toggleItem(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${selected.includes(item) ? activeBg : inactiveBg}`}>
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

function CandidateView() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShifts() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("shifts")
        .select("*, clinic_profiles(clinic_name)")
        .eq("status", "open")
        .order("shift_date", { ascending: true });
      setShifts((data as any) || []);
      setLoading(false);
    }
    fetchShifts();
  }, []);

  async function acceptShift(shiftId: string) {
    setAccepting(shiftId);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: staffProfile } = await supabase
      .from("staff_profiles").select("id").eq("user_id", user.id).single();
    if (!staffProfile) { window.location.href = "/profile/setup"; return; }
    const { error } = await supabase.from("bookings").upsert({
      shift_id: shiftId, staff_id: staffProfile.id, status: "accepted",
    }, { onConflict: "shift_id,staff_id" });
    if (error) { alert(error.message); setAccepting(null); return; }
    window.location.href = "/bookings";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-6">
        <Card className="border-0 bg-teal-700 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex gap-2">
                <Pill tone="green">{shifts.length} matched shifts</Pill>
                {shifts.some(s => s.urgent) && <Pill tone="amber">{shifts.filter(s => s.urgent).length} urgent</Pill>}
              </div>
              <h2 className="text-3xl font-bold">Available shifts</h2>
              <p className="mt-2 max-w-xl text-teal-50">Crewlio matches you with shifts based on availability, certificates, pay preferences and travel range.</p>
            </div>
            <Button className="bg-white text-teal-800">Update availability</Button>
          </div>
        </Card>

        <div>
          <h2 className="mb-1 text-xl font-bold">Open shifts</h2>
          <p className="mb-4 text-sm text-slate-500">Accept a shift to lock in your booking.</p>
          {loading ? (
            <div className="text-center text-slate-500 py-12">Loading shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-lg font-semibold">No shifts available yet</h2>
              <p className="text-sm text-slate-500 mt-1">Check back soon — clinics are posting shifts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <Card key={shift.id} className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {shift.urgent && <Pill tone="red">Urgent</Pill>}
                        <Pill tone="teal">{shift.role_required}</Pill>
                      </div>
                      <h3 className="text-lg font-semibold">{shift.clinic_profiles?.clinic_name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(shift.shift_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                        {" • "}{shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                        {shift.hospital && ` • ${shift.hospital}`}
                      </p>
                      {shift.required_skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {shift.required_skills.map((tag) => <Pill key={tag} tone="green">{tag}</Pill>)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-700">${shift.rate}/hr</div>
                      </div>
                      <Button className={`text-white ${accepting === shift.id ? "bg-teal-400" : "bg-teal-700"}`} onClick={() => acceptShift(shift.id)}>
                        {accepting === shift.id ? "Accepting..." : "Accept shift"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="text-xl font-bold">Profile strength</h2>
          <p className="mt-1 text-sm text-slate-500">Higher completion improves match priority.</p>
          <div className="mt-4 flex justify-between text-sm">
            <span>82% complete</span>
            <span className="font-semibold text-teal-700">Strong</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-slate-100">
            <div className="h-3 w-[82%] rounded-full bg-teal-700" />
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            Upload your radiation licence to unlock Credential Complete+.
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-bold">Badges</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {badges.slice(0, 6).map((badge) => (
              <div key={badge} className="rounded-2xl border border-slate-100 p-3 text-center text-sm font-semibold">
                🏅<div>{badge}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-bold">Secure documents</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">✓ CPR certificate verified</div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">✓ Cert III verified</div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">⚠ First Aid expires in 26 days</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClinicView() {
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
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  async function loadMatches(skills: string[], docs: string[]) {
    if (skills.length === 0 && docs.length === 0) return;
    setMatchesLoading(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: staffProfiles } = await supabase
      .from("staff_profiles")
      .select("id, user_id, qualifications, skills, available_days");

    if (!staffProfiles) { setMatchesLoading(false); return; }

    const userIds = staffProfiles.map(p => p.user_id);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const scored = staffProfiles.map((sp) => {
      const profileInfo = profileData?.find(p => p.id === sp.user_id);
      const candidateSkills = [...(sp.skills || []), ...(sp.qualifications || [])];
      const required = [...skills, ...docs];
      const matches = required.filter(r =>
        candidateSkills.some(cs => cs.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(cs.toLowerCase()))
      );
      const matchScore = required.length > 0 ? Math.round((matches.length / required.length) * 100) : 50;
      return {
        ...sp,
        matchScore,
        profileName: profileInfo?.full_name || "Candidate",
        profileEmail: profileInfo?.email || "",
      };
    });

    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
    setMatches(sorted);
    setMatchesLoading(false);
  }

  async function handlePost() {
    if (!date || !startTime || !endTime || !rate) { setError("Please fill in date, times and rate."); return; }
    setLoading(true); setError("");
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clinicProfile } = await supabase.from("clinic_profiles").select("id").eq("user_id", user.id).single();
    if (!clinicProfile) { setError("Clinic profile not found."); setLoading(false); return; }

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

    const { error: shiftError } = await supabase.from("shifts").insert({
      clinic_id: clinicProfile.id, role_required: role, shift_date: date,
      start_time: startTime, end_time: endTime, rate: parseFloat(rate),
      hospital, urgent, required_skills: finalSkills, required_documents: finalDocs,
      status: "open", broadcast: true,
    });
    if (shiftError) { setError(shiftError.message); setLoading(false); return; }
    window.location.href = "/shifts";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <h2 className="text-xl font-bold">Post a shift</h2>
        <p className="mt-1 text-sm text-slate-500">Create one-off or recurring shifts with skill, document and pay requirements.</p>
        <div className="mt-5 space-y-4">
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
          <ToggleGroup label="Required clinical skills" items={SKILLS} selected={selectedSkills}
            setSelected={(v) => { setSelectedSkills(v); loadMatches(v, selectedDocs); }}
            otherValue={otherSkill} setOtherValue={setOtherSkill} />
          <ToggleGroup label="Practice management software" items={SOFTWARE} selected={selectedSoftware}
            setSelected={(v) => { setSelectedSoftware(v); loadMatches(selectedSkills, selectedDocs); }}
            otherValue={otherSoftware} setOtherValue={setOtherSoftware} />
          <ToggleGroup label="Required certificates & documents" items={CERTIFICATES} selected={selectedDocs}
            setSelected={(v) => { setSelectedDocs(v); loadMatches(selectedSkills, v); }}
            otherValue={otherDoc} setOtherValue={setOtherDoc} activeColour="emerald" />
          {selectedDocs.includes("Hospital Accreditation") && (
            <input className="w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="Which hospital? e.g. PA Hospital, Mater" value={hospitalAccreditation} onChange={(e) => setHospitalAccreditation(e.target.value)} />
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold">Preferred staff first</div>
              <p className="text-sm text-slate-500">Offer privately before public posting.</p>
            </div>
            <button onClick={() => setUrgent(!urgent)} className={`rounded-2xl border p-4 text-left transition ${urgent ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200"}`}>
              <div className="font-semibold">Urgent shift</div>
              <p className="text-sm opacity-70">Notify candidates who allow urgent alerts.</p>
            </button>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-2xl p-3">{error}</p>}
          <Button onClick={handlePost} className={`w-full py-4 text-white ${loading ? "bg-teal-400" : "bg-teal-700"}`}>
            {loading ? "Posting..." : "Post shift"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">Candidate matches</h2>
        <p className="mt-1 text-sm text-slate-500">
          {matches.length > 0
            ? "Names and contact details revealed after shift is accepted."
            : "Select skills and documents to see matching candidates."}
        </p>

        <div className="mt-5 space-y-4">
          {matchesLoading ? (
            <div className="text-center text-slate-500 py-8">Finding matches...</div>
          ) : matches.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              Matches will appear here as you fill in the shift requirements above.
            </div>
          ) : (
            matches.map((candidate, i) => (
              <div key={candidate.id} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Pill tone="teal">{candidate.matchScore}% match</Pill>
                    </div>
                    <h3 className="font-semibold">Candidate #{i + 1}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {candidate.qualifications?.slice(0, 2).join(", ") || "Profile incomplete"}
                    </p>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((s) => (
                          <Pill key={s} tone="green">{s}</Pill>
                        ))}
                        {candidate.skills.length > 4 && (
                          <Pill tone="default">+{candidate.skills.length - 4} more</Pill>
                        )}
                      </div>
                    )}
                  </div>
                  <Button className="bg-teal-700 text-white">Invite</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function AdminView() {
  const [adminData, setAdminData] = useState<{
    totalTalent: number;
    totalEmployers: number;
    totalShifts: number;
    openShifts: number;
    totalBookings: number;
    confirmedBookings: number;
    fillRate: number;
    recentUsers: any[];
    recentShifts: any[];
    incompleteProfiles: any[];
    feedback: any[];
  } | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const [
        { count: totalTalent },
        { count: totalEmployers },
        { count: totalShifts },
        { count: openShifts },
        { count: totalBookings },
        { count: confirmedBookings },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "staff"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "clinic"),
        supabase.from("shifts").select("*", { count: "exact", head: true }),
        supabase.from("shifts").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      ]);

      const fillRate = totalShifts ? Math.round(((confirmedBookings || 0) / (totalShifts || 1)) * 100) : 0;

      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("id, email, role, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: recentShifts } = await supabase
        .from("shifts")
        .select("id, role_required, shift_date, status, rate, clinic_id")
        .order("id", { ascending: false })
        .limit(5);

      const { data: incompleteProfiles } = await supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .eq("role", "staff")
        .is("full_name", null);

      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("id, type, message, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(10);

      let enrichedShifts: any[] = [];
      if (recentShifts && recentShifts.length > 0) {
        const clinicIds = recentShifts.map(s => s.clinic_id);
        const { data: clinics } = await supabase
          .from("clinic_profiles").select("id, clinic_name").in("id", clinicIds);
        enrichedShifts = recentShifts.map(s => ({
          ...s,
          clinic_name: clinics?.find(c => c.id === s.clinic_id)?.clinic_name || "Unknown",
        }));
      }

      setAdminData({
        totalTalent: totalTalent || 0,
        totalEmployers: totalEmployers || 0,
        totalShifts: totalShifts || 0,
        openShifts: openShifts || 0,
        totalBookings: totalBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        fillRate,
        recentUsers: recentUsers || [],
        recentShifts: enrichedShifts,
        incompleteProfiles: incompleteProfiles || [],
        feedback: feedbackData || [],
      });
    }
    fetchAdminData();
  }, []);

  if (!adminData) return <div className="text-center text-slate-500 py-12">Loading admin data...</div>;

  const statusColour = (status: string) => {
    if (status === "filled" || status === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    if (status === "open") return "bg-amber-50 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const roleColour = (role: string) => {
    if (role === "admin") return "bg-purple-50 text-purple-700";
    if (role === "clinic") return "bg-blue-50 text-blue-700";
    return "bg-teal-50 text-teal-700";
  };

  return (
    <div className="space-y-6">
      {/* Real stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Talent", value: adminData.totalTalent, icon: "🩺", colour: "text-teal-700" },
          { label: "Employers", value: adminData.totalEmployers, icon: "🏥", colour: "text-blue-700" },
          { label: "Open shifts", value: adminData.openShifts, icon: "📋", colour: "text-amber-600" },
          { label: "Fill rate", value: adminData.fillRate + "%", icon: "✅", colour: "text-emerald-700" },
        ].map(({ label, value, icon, colour }) => (
          <Card key={label} className="p-5">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={"text-2xl font-bold " + colour}>{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total shifts", value: adminData.totalShifts, colour: "text-slate-700" },
          { label: "Total bookings", value: adminData.totalBookings, colour: "text-slate-700" },
          { label: "Confirmed bookings", value: adminData.confirmedBookings, colour: "text-emerald-700" },
          { label: "Incomplete profiles", value: adminData.incompleteProfiles.length, colour: "text-amber-600" },
        ].map(({ label, value, colour }) => (
          <Card key={label} className="p-5">
            <div className={"text-2xl font-bold " + colour}>{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent signups */}
        <Card className="p-6">
          <h2 className="text-xl font-bold">Recent signups</h2>
          <p className="mt-1 text-sm text-slate-500">Latest users on the platform.</p>
          <div className="mt-4 space-y-3">
            {adminData.recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400">No users yet.</p>
            ) : adminData.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-semibold">{user.full_name || "No name"}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + roleColour(user.role)}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent shifts */}
        <Card className="p-6">
          <h2 className="text-xl font-bold">Recent shifts</h2>
          <p className="mt-1 text-sm text-slate-500">Latest shifts posted by employers.</p>
          <div className="mt-4 space-y-3">
            {adminData.recentShifts.length === 0 ? (
              <p className="text-sm text-slate-400">No shifts yet.</p>
            ) : adminData.recentShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-semibold">{shift.role_required}</p>
                  <p className="text-xs text-slate-500">{shift.clinic_name} • {new Date(shift.shift_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + statusColour(shift.status)}>
                  {shift.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Incomplete profiles */}
      {adminData.incompleteProfiles.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold">⚠️ Incomplete talent profiles</h2>
          <p className="mt-1 text-sm text-slate-500">These talent users haven't completed their profile setup.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {adminData.incompleteProfiles.map((user) => (
              <div key={user.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-800">{user.email}</p>
                <p className="text-xs text-amber-600 mt-0.5">No profile set up</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Feedback & bug reports */}
      {adminData.feedback.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold">💬 Feedback & bug reports</h2>
          <p className="mt-1 text-sm text-slate-500">{adminData.feedback.length} submission{adminData.feedback.length > 1 ? "s" : ""} from users.</p>
          <div className="mt-4 space-y-3">
            {adminData.feedback.map((item: any) => (
              <div key={item.id} className={"rounded-2xl border p-4 " + (item.type === "bug" ? "border-red-100 bg-red-50" : "border-slate-100 bg-white")}>
                <div className="flex items-center justify-between mb-2">
                  <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + (item.type === "bug" ? "bg-red-100 text-red-700" : "bg-teal-50 text-teal-700")}>
                    {item.type === "bug" ? "🐛 Bug" : "💬 Feedback"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{item.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security posture */}
      <Card className="p-6">
        <h2 className="text-xl font-bold">Security posture</h2>
        <p className="mt-1 text-sm text-slate-500">Platform security controls.</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">✓ Role-based access control active</div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">✓ Row-level security enabled on all tables</div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">✓ Candidate details hidden until confirmed</div>
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">⚠ Document upload not yet implemented</div>
          <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">⚠ Email notifications not yet set up</div>
        </div>
      </Card>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("candidate");
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feedback" | "bug">("feedback");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  async function submitFeedback() {
    if (!feedbackMessage.trim()) return;
    setFeedbackSending(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("feedback").insert({
      user_id: user.id,
      type: feedbackType,
      message: feedbackMessage,
    });
    setFeedbackSent(true);
    setFeedbackSending(false);
    setFeedbackMessage("");
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); }, 2000);
  }

  useEffect(() => {
    async function fetchUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("full_name, email, role").eq("id", user.id).single();
        setUserName(profile?.full_name || user.email || "");
        setUserRole(profile?.role || "");
        if (profile?.role === "clinic") setTab("clinic");
      }
    }
    fetchUser();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white bg-white/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
            <p className="text-sm text-slate-500">Secure healthcare workforce matching</p>
            {userName && <p className="text-sm font-medium text-teal-700">👋 {userName}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {userRole === "staff" && (
              <>
                <Button onClick={() => setTab("candidate")} className={tab === "candidate" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Shifts</Button>
                <a href="/bookings" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200">
                  📅 Accepted shifts
                </a>
                <button onClick={() => setShowFeedback(true)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                  💬 Feedback
                </button>
                <a href="/profile/edit" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200">
                  ✏️ Edit profile
                </a>
                </>
            )}
            {userRole === "clinic" && (
              <>
                <Button onClick={() => setTab("clinic")} className={tab === "clinic" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Post a shift</Button>
                <a href="/shifts" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200">
                  📋 Posted shifts
                </a>
                <button onClick={() => setShowFeedback(true)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                  💬 Feedback
                </button>
                <a href="/employer/edit" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200">
                  ✏️ Edit profile
                </a>
              </>
            )}
            {userRole === "admin" && (
              <>
                <Button onClick={() => setTab("candidate")} className={tab === "candidate" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Candidate</Button>
                <Button onClick={() => setTab("clinic")} className={tab === "clinic" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Clinic</Button>
                <Button onClick={() => setTab("admin")} className={tab === "admin" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Admin</Button>
                <a href="/admin" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200">
                  🔧 Admin dashboard
                </a>
              </>
            )}
            <button
              onClick={async () => {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/auth/login";
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              Sign out
            </button>
          </div>
        </header>
        {tab === "candidate" && <CandidateView />}
        {tab === "clinic" && <ClinicView />}
        {tab === "admin" && <AdminView />}
      </div>

      {showFeedback && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Send feedback</h2>
              <button onClick={() => setShowFeedback(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            {feedbackSent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🙏</div>
                <p className="font-semibold">Thanks for your feedback!</p>
                <p className="text-sm text-slate-500 mt-1">We'll review it shortly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button onClick={() => setFeedbackType("feedback")}
                      className={"rounded-2xl border p-3 text-sm font-semibold transition " + (feedbackType === "feedback" ? "border-teal-700 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600")}>
                      💬 Feedback
                    </button>
                    <button onClick={() => setFeedbackType("bug")}
                      className={"rounded-2xl border p-3 text-sm font-semibold transition " + (feedbackType === "bug" ? "border-red-500 bg-red-50 text-red-600" : "border-slate-200 text-slate-600")}>
                      🐛 Report a bug
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Message</label>
                  <textarea value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} rows={4}
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm resize-none"
                    placeholder={feedbackType === "bug" ? "Describe what happened..." : "Share your thoughts..."} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowFeedback(false)}
                    className="rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button onClick={submitFeedback} disabled={feedbackSending || !feedbackMessage.trim()}
                    className="rounded-2xl bg-teal-700 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                    {feedbackSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
