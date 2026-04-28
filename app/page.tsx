import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileCheck2,
  MapPin,
  Medal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  Zap,
  Building2,
  Lock,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const candidates = [
  {
    id: 1,
    initials: "AM",
    role: "Senior Dental Assistant",
    distance: "8 min",
    rate: "$42/hr",
    match: 96,
    rating: 4.9,
    badges: ["Fully Verified", "Paeds Pro", "Reliable Pro"],
    skills: ["Chairside", "Paeds", "GA", "Open Dental"],
  },
  {
    id: 2,
    initials: "LS",
    role: "OHT / Hygienist",
    distance: "18 min",
    rate: "$58/hr",
    match: 91,
    rating: 4.8,
    badges: ["Fast Responder", "Clinic Favourite"],
    skills: ["Hygiene", "Radiographs", "Exact"],
  },
  {
    id: 3,
    initials: "RK",
    role: "Reception + Steri",
    distance: "22 min",
    rate: "$38/hr",
    match: 84,
    rating: 4.7,
    badges: ["Front Desk Fluent", "Availability Master"],
    skills: ["Reception", "Sterilisation", "D4W"],
  },
];

const shifts = [
  {
    id: 1,
    clinic: "Inner South Clinic",
    date: "Today",
    time: "1:00pm – 5:30pm",
    role: "Chairside Assistant",
    rate: "$45/hr",
    distance: "12 min away",
    urgent: true,
    requirements: ["Cert III", "CPR", "Paeds experience"],
  },
  {
    id: 2,
    clinic: "Northside Family Dental",
    date: "Tomorrow",
    time: "8:00am – 4:00pm",
    role: "Steri + Float DA",
    rate: "$39/hr",
    distance: "21 min away",
    urgent: false,
    requirements: ["Infection control", "Steri experience"],
  },
  {
    id: 3,
    clinic: "Preferred Clinic",
    date: "Fri 17 May",
    time: "8:30am – 12:30pm",
    role: "Reception Cover",
    rate: "$40/hr",
    distance: "9 min away",
    urgent: false,
    requirements: ["Open Dental", "Phone skills"],
  },
];

const badges = [
  { name: "Fully Verified", icon: ShieldCheck, detail: "All key documents checked" },
  { name: "Last-Minute Legend", icon: Zap, detail: "Fills urgent shifts" },
  { name: "Clinic Favourite", icon: Star, detail: "Preferred by clinics" },
  { name: "Compliance Pro", icon: FileCheck2, detail: "No expired documents" },
  { name: "Reliable Pro", icon: CheckCircle2, detail: "Low cancellation history" },
  { name: "Paeds Pro", icon: Sparkles, detail: "Strong paediatric experience" },
];

function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-1 ring-red-100",
    teal: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Shell({ tab, setTab, children }) {
  const tabs = [
    { id: "candidate", label: "Candidate", icon: UserRound },
    { id: "clinic", label: "Clinic", icon: Building2 },
    { id: "admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Crewlio</h1>
              <p className="text-sm text-slate-500">Secure healthcare workforce matching</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={tab === item.id ? "default" : "outline"}
                  onClick={() => setTab(item.id)}
                  className={`rounded-2xl ${tab === item.id ? "bg-teal-700 hover:bg-teal-800" : "bg-white"}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
            <Button variant="outline" className="rounded-2xl bg-white">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function CandidateDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <div className="space-y-6">
        <Card className="overflow-hidden rounded-3xl border-0 bg-teal-700 text-white shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 flex gap-2">
                  <Pill tone="green">3 matched shifts</Pill>
                  <Pill tone="amber">1 urgent</Pill>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Good afternoon, Alex</h2>
                <p className="mt-2 max-w-xl text-teal-50">Your profile is matching with clinics based on availability, certificates, pay preferences and travel range.</p>
              </div>
              <Button className="rounded-2xl bg-white text-teal-800 hover:bg-teal-50">
                Update availability
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <section>
          <SectionHeader title="Matched shifts" subtitle="Only roles that fit your availability, valid documents and minimum rate are shown." />
          <div className="grid gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id} className="rounded-3xl border-slate-100 shadow-sm transition hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {shift.urgent && <Pill tone="red">Urgent</Pill>}
                        {shift.clinic === "Preferred Clinic" && <Pill tone="teal">Preferred clinic</Pill>}
                        <Pill>{shift.role}</Pill>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{shift.clinic}</h3>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {shift.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {shift.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {shift.distance}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {shift.requirements.map((req) => <Pill key={req} tone="green">{req}</Pill>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-700">{shift.rate}</div>
                        <div className="text-xs text-slate-500">meets your minimum</div>
                      </div>
                      <Button className="rounded-2xl bg-teal-700 hover:bg-teal-800">Accept shift</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <SectionHeader title="Profile strength" subtitle="Higher completion improves match priority." />
            <div className="mb-3 flex items-center justify-between text-sm">
              <span>82% complete</span>
              <span className="font-medium text-teal-700">Strong</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[82%] rounded-full bg-teal-700" />
            </div>
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              Upload your radiation licence to unlock <b>Credential Complete+</b>.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <SectionHeader title="Badges" subtitle="Earned through reliability, compliance and great shifts." />
            <div className="grid grid-cols-2 gap-3">
              {badges.slice(0, 4).map(({ name, icon: Icon }) => (
                <div key={name} className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-teal-700" />
                  <div className="text-xs font-semibold">{name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <SectionHeader title="Secure documents" subtitle="Encrypted storage with audit logs planned for production." />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-3 text-emerald-800"><span>CPR certificate</span><CheckCircle2 className="h-4 w-4" /></div>
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-3 text-emerald-800"><span>Cert III</span><CheckCircle2 className="h-4 w-4" /></div>
              <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-3 text-amber-800"><span>First Aid expires in 26 days</span><AlertTriangle className="h-4 w-4" /></div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function ClinicDashboard() {
  const [preferredFirst, setPreferredFirst] = useState(true);
  const totalMatches = useMemo(() => candidates.length, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <SectionHeader title="Post a shift" subtitle="Crewlio ranks candidates by relationship, skills, ratings, reliability, pay and travel fit." />
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">Date<input className="w-full rounded-2xl border border-slate-200 p-3 font-normal" type="date" /></label>
                <label className="space-y-1 text-sm font-medium">Role<select className="w-full rounded-2xl border border-slate-200 p-3 font-normal"><option>Chairside Assistant</option><option>Reception</option><option>Steri</option><option>OHT / Hygienist</option></select></label>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1 text-sm font-medium">Start<input className="w-full rounded-2xl border border-slate-200 p-3 font-normal" type="time" /></label>
                <label className="space-y-1 text-sm font-medium">End<input className="w-full rounded-2xl border border-slate-200 p-3 font-normal" type="time" /></label>
                <label className="space-y-1 text-sm font-medium">Pay rate<input className="w-full rounded-2xl border border-slate-200 p-3 font-normal" placeholder="$45/hr" /></label>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Required skills</div>
                <div className="flex flex-wrap gap-2">
                  {["Chairside", "Paeds", "GA", "Ortho", "Reception", "Steri", "Open Dental", "Exact"].map((skill) => <Pill key={skill} tone="teal">{skill}</Pill>)}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Required documents</div>
                <div className="flex flex-wrap gap-2">
                  {["Cert III", "CPR", "First Aid", "Radiation licence", "Blue Card", "Immunisation"].map((doc) => <Pill key={doc} tone="green">{doc}</Pill>)}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button onClick={() => setPreferredFirst(!preferredFirst)} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left">
                  <span><b>Preferred staff first</b><br /><span className="text-sm text-slate-500">Offer privately before public posting</span></span>
                  <span className={`h-6 w-11 rounded-full p-1 ${preferredFirst ? "bg-teal-700" : "bg-slate-200"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${preferredFirst ? "translate-x-5" : ""}`} /></span>
                </button>
                <button className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-red-800">
                  <span><b>Urgent shift</b><br /><span className="text-sm text-red-600">Notify candidates who allow urgent alerts</span></span>
                  <Zap className="h-5 w-5" />
                </button>
              </div>
              <Button className="rounded-2xl bg-teal-700 py-6 hover:bg-teal-800"><Plus className="mr-2 h-4 w-4" /> Post shift</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <SectionHeader title={`${totalMatches} top matches`} subtitle="Names and contact details stay protected until a shift is accepted." action={<Button variant="outline" className="rounded-2xl"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</Button>} />
            <div className="space-y-4">
              {candidates.map((c, index) => (
                <div key={c.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-600">{c.initials}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">Candidate #{index + 1}</h3><Pill tone="teal">{c.match}% match</Pill></div>
                        <p className="mt-1 text-sm text-slate-500">{c.role} • {c.distance} • {c.rate}</p>
                        <div className="mt-2 flex flex-wrap gap-2">{c.badges.map((badge) => <Pill key={badge} tone="green">{badge}</Pill>)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"><Star className="mr-1 inline h-4 w-4" />{c.rating}</div>
                      <Button className="rounded-2xl bg-teal-700 hover:bg-teal-800">Invite</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const metrics = [
    { label: "Fill rate", value: "78%", icon: CheckCircle2 },
    { label: "Avg response", value: "14 min", icon: Clock },
    { label: "Compliance alerts", value: "12", icon: AlertTriangle },
    { label: "Disputes open", value: "2", icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="p-5">
              <Icon className="mb-3 h-5 w-5 text-teal-700" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <SectionHeader title="Compliance queue" subtitle="OCR validation with admin override for edge cases." />
            <div className="space-y-3">
              {["Radiation licence review", "Blue Card expiry warning", "CPR certificate unclear scan"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span className="text-sm font-medium">{item}</span>
                  <Button variant="outline" className="rounded-2xl">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-6">
            <SectionHeader title="Security posture" subtitle="Priority controls for sensitive workforce and document data." />
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><Lock className="h-4 w-4" /> Role-based access control enabled</div>
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><ShieldCheck className="h-4 w-4" /> Signed document URLs planned</div>
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><Search className="h-4 w-4" /> Document access audit logs planned</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="p-6">
          <SectionHeader title="Gamification catalogue" subtitle="Badges drive compliance, reliability and repeat relationships." />
          <div className="grid gap-3 md:grid-cols-3">
            {badges.map(({ name, icon: Icon, detail }) => (
              <div key={name} className="rounded-2xl border border-slate-100 bg-white p-4">
                <Icon className="mb-3 h-5 w-5 text-teal-700" />
                <div className="font-semibold">{name}</div>
                <div className="mt-1 text-sm text-slate-500">{detail}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CrewlioMVP() {
  const [tab, setTab] = useState("candidate");

  return (
    <Shell tab={tab} setTab={setTab}>
      {tab === "candidate" && <CandidateDashboard />}
      {tab === "clinic" && <ClinicDashboard />}
      {tab === "admin" && <AdminDashboard />}
    </Shell>
  );
}
