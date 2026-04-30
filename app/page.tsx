cat > app/page.tsx << 'EOF'
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

const badges = [
  "Fully Verified", "Last-Minute Legend", "Clinic Favourite", "Compliance Pro",
  "Reliable Pro", "Paeds Pro", "GA Veteran", "Fast Responder", "Availability Master",
];

const SKILLS = [
  "General Dentistry", "Paeds", "Ortho", "Perio", "Pros", "OHT", "Hygienist",
  "Steri", "Receptionist", "Clinical Team Leader", "Practice Manager",
  "Front Office Coordinator", "Implants", "Endo", "GA", "SND", "Oral Surgery",
  "Oral Med", "Oral Path", "Radiology", "Dental Sleep Medicine",
  "Functional Dentistry", "Cosmetic Dentistry",
];

const SOFTWARE = [
  "D4W", "Praktika", "Ultimo", "Exact", "Core Practice",
  "Dentally", "CareStack", "Principle",
];

const CERTIFICATES = [
  "Cert III", "Cert IV", "Radiation Licence", "Blue Card", "CPR",
  "First Aid", "Drivers Licence", "Immunisations", "Hospital Accreditation",
  "Orofacial Myology", "Sedation & GA Support Training", "Infection Control Certification",
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

    if (!staffProfile) {
      window.location.href = "/profile/setup";
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      shift_id: shiftId,
      staff_id: staffProfile.id,
      status: "accepted",
    });

    if (error) {
      alert(error.message);
      setAccepting(null);
      return;
    }

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
              <p className="mt-2 max-w-xl text-teal-50">
                Crewlio matches you with shifts based on availability, certificates, pay preferences and travel range.
              </p>
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
                          {shift.required_skills.map((tag) => (
                            <Pill key={tag} tone="green">{tag}</Pill>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-700">${shift.rate}/hr</div>
                      </div>
                      <Button
                        className={`text-white ${accepting === shift.id ? "bg-teal-400" : "bg-teal-700"}`}
                        onClick={() => acceptShift(shift.id)}
                      >
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
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [hospitalAccreditation, setHospitalAccreditation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handlePost() {
    if (!date || !startTime || !endTime || !rate) {
      setError("Please fill in date, times and rate.");
      return;
    }
    setLoading(true);
    setError("");
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clinicProfile } = await supabase
      .from("clinic_profiles").select("id").eq("user_id", user.id).single();
    if (!clinicProfile) {
      setError("Clinic profile not found.");
      setLoading(false);
      return;
    }

    const allDocs = selectedDocs.includes("Hospital Accreditation") && hospitalAccreditation
      ? [...selectedDocs.filter(d => d !== "Hospital Accreditation"), `Hospital Accreditation: ${hospitalAccreditation}`]
      : selectedDocs;

    const { error: shiftError } = await supabase.from("shifts").insert({
      clinic_id: clinicProfile.id,
      role_required: role,
      shift_date: date,
      start_time: startTime,
      end_time: endTime,
      rate: parseFloat(rate),
      hospital,
      urgent,
      required_skills: [...selectedSkills, ...selectedSoftware],
      required_documents: allDocs,
      status: "open",
      broadcast: true,
    });
    if (shiftError) {
      setError(shiftError.message);
      setLoading(false);
      return;
    }
    window.location.href = "/shifts";
  }

  const ToggleGroup = ({ label, items, selected, setSelected }: {
    label: string; items: string[]; selected: string[]; setSelected: (v: string[]) => void;
  }) => (
    <div>
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button key={item} onClick={() => toggleItem(selected, setSelected, item)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selected.includes(item) ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-700"
            }`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <h2 className="text-xl font-bold">Post a shift</h2>
        <p className="mt-1 text-sm text-slate-500">Create one-off or recurring shifts with skill, document and pay requirements.</p>
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 p-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <select className="rounded-2xl border border-slate-200 p-3" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Chairside Assistant</option>
              <option>Receptionist</option>
              <option>Steri</option>
              <option>OHT / Hygienist</option>
              <option>Clinical Team Leader</option>
              <option>Practice Manager</option>
              <option>Front Office Coordinator</option>
              <option>Dental Therapist</option>
              <option>Dental Prosthetist</option>
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input className="rounded-2xl border border-slate-200 p-3" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input className="rounded-2xl border border-slate-200 p-3" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <input className="rounded-2xl border border-slate-200 p-3" placeholder="$/hr e.g. 45" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))} />
          </div>
          <input className="w-full rounded-2xl border border-slate-200 p-3" placeholder="Hospital / facility (optional)" value={hospital} onChange={(e) => setHospital(e.target.value)} />

          <ToggleGroup label="Required clinical skills" items={SKILLS} selected={selectedSkills} setSelected={setSelectedSkills} />
          <ToggleGroup label="Practice management software" items={SOFTWARE} selected={selectedSoftware} setSelected={setSelectedSoftware} />

          <div>
            <div className="mb-2 text-sm font-semibold">Required certificates & documents</div>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATES.map((doc) => (
                <button key={doc} onClick={() => toggleItem(selectedDocs, setSelectedDocs, doc)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedDocs.includes(doc) ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"
                  }`}>
                  {doc}
                </button>
              ))}
            </div>
            {selectedDocs.includes("Hospital Accreditation") && (
              <div className="mt-3">
                <input
                  className="w-full rounded-2xl border border-slate-200 p-3 text-sm"
                  placeholder="Which hospital? e.g. PA Hospital, Mater"
                  value={hospitalAccreditation}
                  onChange={(e) => setHospitalAccreditation(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold">Preferred staff first</div>
              <p className="text-sm text-slate-500">Offer privately before public posting.</p>
            </div>
            <button onClick={() => setUrgent(!urgent)}
              className={`rounded-2xl border p-4 text-left transition ${urgent ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200"}`}>
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
        <h2 className="text-xl font-bold">Top candidate matches</h2>
        <p className="mt-1 text-sm text-slate-500">Names and contact details remain protected until the shift is accepted.</p>
        <div className="mt-5 space-y-4">
          {[
            { name: "Candidate #1", role: "Senior Dental Assistant", match: 96, rating: 4.9, distance: "8 min", rate: "$42/hr", badges: ["Fully Verified", "Paeds Pro", "Reliable Pro"] },
            { name: "Candidate #2", role: "OHT / Hygienist", match: 91, rating: 4.8, distance: "18 min", rate: "$58/hr", badges: ["Fast Responder", "Clinic Favourite"] },
            { name: "Candidate #3", role: "Reception + Steri", match: 84, rating: 4.7, distance: "22 min", rate: "$38/hr", badges: ["Front Desk Fluent", "Availability Master"] },
          ].map((candidate) => (
            <div key={candidate.name} className="rounded-3xl border border-slate-100 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Pill tone="teal">{candidate.match}% match</Pill>
                    <Pill tone="amber">⭐ {candidate.rating}</Pill>
                  </div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-slate-500">{candidate.role} • {candidate.distance} • {candidate.rate}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.badges.map((badge) => <Pill key={badge} tone="green">{badge}</Pill>)}
                  </div>
                </div>
                <Button className="bg-teal-700 text-white">Invite</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AdminView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[["Fill rate", "78%"], ["Avg response", "14 min"], ["Compliance alerts", "12"], ["Open disputes", "2"]].map(([label, value]) => (
          <Card key={label} className="p-5">
            <div className="text-2xl font-bold text-teal-700">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-bold">Compliance queue</h2>
          <p className="mt-1 text-sm text-slate-500">OCR validation with admin override.</p>
          <div className="mt-4 space-y-3">
            {["Radiation licence review", "Blue Card expiry warning", "CPR certificate unclear scan"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span className="text-sm font-medium">{item}</span>
                <Button className="border border-slate-200 bg-white">Review</Button>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold">Security posture</h2>
          <p className="mt-1 text-sm text-slate-500">Priority controls for sensitive workforce data.</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">✓ Role-based access control</div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">✓ Signed document URLs planned</div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">✓ Document access audit logs planned</div>
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-bold">Gamification catalogue</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {badges.map((badge) => (
            <div key={badge} className="rounded-2xl border border-slate-100 p-4">
              <div className="text-xl">🏅</div>
              <div className="font-semibold">{badge}</div>
              <div className="mt-1 text-sm text-slate-500">Behaviour-shaping badge for trust and retention.</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("candidate");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("full_name, email").eq("id", user.id).single();
        setUserName(profile?.full_name || user.email || "");
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
            <Button onClick={() => setTab("candidate")} className={tab === "candidate" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Candidate</Button>
            <Button onClick={() => setTab("clinic")} className={tab === "clinic" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Clinic</Button>
            <Button onClick={() => setTab("admin")} className={tab === "admin" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}>Admin</Button>
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
    </main>
  );
}
EOF