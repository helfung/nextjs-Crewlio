"use client";

import type React from "react";
import { useState } from "react";

type Tab = "candidate" | "clinic" | "admin";

const shifts = [
  {
    clinic: "Inner South Clinic",
    role: "Chairside Assistant",
    date: "Today",
    time: "1:00pm - 5:30pm",
    rate: "$45/hr",
    distance: "12 min away",
    urgent: true,
    tags: ["Cert III", "CPR", "Paeds"],
  },
  {
    clinic: "Northside Family Dental",
    role: "Steri + Float DA",
    date: "Tomorrow",
    time: "8:00am - 4:00pm",
    rate: "$39/hr",
    distance: "21 min away",
    urgent: false,
    tags: ["Steri", "Infection Control"],
  },
  {
    clinic: "Preferred Clinic",
    role: "Reception Cover",
    date: "Fri 17 May",
    time: "8:30am - 12:30pm",
    rate: "$40/hr",
    distance: "9 min away",
    urgent: false,
    tags: ["Open Dental", "Phones"],
  },
];

const candidates = [
  {
    name: "Candidate #1",
    role: "Senior Dental Assistant",
    match: 96,
    rating: 4.9,
    distance: "8 min",
    rate: "$42/hr",
    badges: ["Fully Verified", "Paeds Pro", "Reliable Pro"],
  },
  {
    name: "Candidate #2",
    role: "OHT / Hygienist",
    match: 91,
    rating: 4.8,
    distance: "18 min",
    rate: "$58/hr",
    badges: ["Fast Responder", "Clinic Favourite"],
  },
  {
    name: "Candidate #3",
    role: "Reception + Steri",
    match: 84,
    rating: 4.7,
    distance: "22 min",
    rate: "$38/hr",
    badges: ["Front Desk Fluent", "Availability Master"],
  },
];

const badges = [
  "Fully Verified",
  "Last-Minute Legend",
  "Clinic Favourite",
  "Compliance Pro",
  "Reliable Pro",
  "Paeds Pro",
  "GA Veteran",
  "Fast Responder",
  "Availability Master",
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
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}

function CandidateView() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-6">
        <Card className="border-0 bg-teal-700 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex gap-2">
                <Pill tone="green">3 matched shifts</Pill>
                <Pill tone="amber">1 urgent</Pill>
              </div>
              <h2 className="text-3xl font-bold">Good afternoon, Alex</h2>
              <p className="mt-2 max-w-xl text-teal-50">
                Crewlio matches you with shifts based on availability, certificates, pay preferences and travel range.
              </p>
            </div>
            <Button className="bg-white text-teal-800">Update availability</Button>
          </div>
        </Card>

        <div>
          <h2 className="mb-1 text-xl font-bold">Matched shifts</h2>
          <p className="mb-4 text-sm text-slate-500">
            Only jobs that match your active documents, pay rate and availability are shown.
          </p>

          <div className="space-y-4">
            {shifts.map((shift) => (
              <Card key={shift.clinic} className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {shift.urgent && <Pill tone="red">Urgent</Pill>}
                      <Pill tone="teal">{shift.role}</Pill>
                    </div>

                    <h3 className="text-lg font-semibold">{shift.clinic}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {shift.date} • {shift.time} • {shift.distance}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {shift.tags.map((tag) => (
                        <Pill key={tag} tone="green">
                          {tag}
                        </Pill>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-700">{shift.rate}</div>
                      <div className="text-xs text-slate-500">meets your minimum</div>
                    </div>
                    <Button className="bg-teal-700 text-white">Accept shift</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
                🏅
                <div>{badge}</div>
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
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <h2 className="text-xl font-bold">Post a shift</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create one-off or recurring shifts with skill, document and pay requirements.
        </p>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 p-3" type="date" />
            <select className="rounded-2xl border border-slate-200 p-3">
              <option>Chairside Assistant</option>
              <option>Reception</option>
              <option>Steri</option>
              <option>OHT / Hygienist</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input className="rounded-2xl border border-slate-200 p-3" type="time" />
            <input className="rounded-2xl border border-slate-200 p-3" type="time" />
            <input className="rounded-2xl border border-slate-200 p-3" placeholder="$45/hr" />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">Required skills</div>
            <div className="flex flex-wrap gap-2">
              {["Chairside", "Paeds", "GA", "Ortho", "Reception", "Steri", "Open Dental", "Exact"].map((skill) => (
                <Pill key={skill} tone="teal">
                  {skill}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">Required documents</div>
            <div className="flex flex-wrap gap-2">
              {["Cert III", "CPR", "First Aid", "Radiation licence", "Blue Card", "Immunisation"].map((doc) => (
                <Pill key={doc} tone="green">
                  {doc}
                </Pill>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold">Preferred staff first</div>
              <p className="text-sm text-slate-500">Offer privately before public posting.</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800">
              <div className="font-semibold">Urgent shift</div>
              <p className="text-sm">Notify candidates who allow urgent alerts.</p>
            </div>
          </div>

          <Button className="w-full bg-teal-700 py-4 text-white">Post shift</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold">Top candidate matches</h2>
        <p className="mt-1 text-sm text-slate-500">
          Names and contact details remain protected until the shift is accepted.
        </p>

        <div className="mt-5 space-y-4">
          {candidates.map((candidate) => (
            <div key={candidate.name} className="rounded-3xl border border-slate-100 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Pill tone="teal">{candidate.match}% match</Pill>
                    <Pill tone="amber">⭐ {candidate.rating}</Pill>
                  </div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-slate-500">
                    {candidate.role} • {candidate.distance} • {candidate.rate}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.badges.map((badge) => (
                      <Pill key={badge} tone="green">
                        {badge}
                      </Pill>
                    ))}
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
        {[
          ["Fill rate", "78%"],
          ["Avg response", "14 min"],
          ["Compliance alerts", "12"],
          ["Open disputes", "2"],
        ].map(([label, value]) => (
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white bg-white/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crewlio</h1>
            <p className="text-sm text-slate-500">Secure healthcare workforce matching</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setTab("candidate")}
              className={tab === "candidate" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}
            >
              Candidate
            </Button>
            <Button
              onClick={() => setTab("clinic")}
              className={tab === "clinic" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}
            >
              Clinic
            </Button>
            <Button
              onClick={() => setTab("admin")}
              className={tab === "admin" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white"}
            >
              Admin
            </Button>
          </div>
        </header>

        {tab === "candidate" && <CandidateView />}
        {tab === "clinic" && <ClinicView />}
        {tab === "admin" && <AdminView />}
      </div>
    </main>
  );
}