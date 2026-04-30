"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Stats = {
  totalTalent: number;
  totalEmployers: number;
  totalShifts: number;
  openShifts: number;
  filledShifts: number;
  totalBookings: number;
  confirmedBookings: number;
  fillRate: number;
};

type ShiftRow = {
  id: string;
  role_required: string;
  shift_date: string;
  status: string;
  rate: number;
  clinic_name: string;
  booking_count: number;
};

type UserRow = {
  id: string;
  email: string;
  role: string;
  full_name: string;
  created_at: string;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "shifts" | "users" | "feedback">("overview");
  const router = useRouter();

  useEffect(() => {
    async function checkAdminAndFetch() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") { router.push("/"); return; }

      // Fetch all stats
      const [
        { count: totalTalent },
        { count: totalEmployers },
        { count: totalShifts },
        { count: openShifts },
        { count: filledShifts },
        { count: totalBookings },
        { count: confirmedBookings },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "staff"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "clinic"),
        supabase.from("shifts").select("*", { count: "exact", head: true }),
        supabase.from("shifts").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("shifts").select("*", { count: "exact", head: true }).eq("status", "filled"),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      ]);

      const fillRate = totalShifts ? Math.round(((filledShifts || 0) / (totalShifts || 1)) * 100) : 0;

      setStats({
        totalTalent: totalTalent || 0,
        totalEmployers: totalEmployers || 0,
        totalShifts: totalShifts || 0,
        openShifts: openShifts || 0,
        filledShifts: filledShifts || 0,
        totalBookings: totalBookings || 0,
        confirmedBookings: confirmedBookings || 0,
        fillRate,
      });

      // Fetch recent shifts with clinic name
      const { data: shiftsData } = await supabase
        .from("shifts")
        .select("id, role_required, shift_date, status, rate, clinic_id")
        .order("id", { ascending: false })
        .limit(20);

      if (shiftsData && shiftsData.length > 0) {
        const clinicIds = [...new Set(shiftsData.map(s => s.clinic_id))];
        const { data: clinics } = await supabase
          .from("clinic_profiles")
          .select("id, clinic_name")
          .in("id", clinicIds);

        const shiftIds = shiftsData.map(s => s.id);
        const { data: bookingCounts } = await supabase
          .from("bookings")
          .select("shift_id")
          .in("shift_id", shiftIds);

        setShifts(shiftsData.map(s => ({
          id: s.id,
          role_required: s.role_required,
          shift_date: s.shift_date,
          status: s.status,
          rate: s.rate,
          clinic_name: clinics?.find(c => c.id === s.clinic_id)?.clinic_name || "Unknown",
          booking_count: bookingCounts?.filter(b => b.shift_id === s.id).length || 0,
        })));
      }

      // Fetch all users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, email, role, full_name, created_at")
        .order("created_at", { ascending: false });
      setUsers(usersData || []);

      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("id, type, message, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(20);
      setFeedback(feedbackData || []);

      setLoading(false);
    }
    checkAdminAndFetch();
  }, []);

  const statusColour = (status: string) => {
    if (status === "filled" || status === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    if (status === "accepted") return "bg-teal-50 text-teal-700";
    return "bg-amber-50 text-amber-700";
  };

  const roleColour = (role: string) => {
    if (role === "admin") return "bg-purple-50 text-purple-700";
    if (role === "clinic") return "bg-blue-50 text-blue-700";
    return "bg-teal-50 text-teal-700";
  };

  if (loading) return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-slate-500">Loading admin dashboard...</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Platform overview for Crewlio.</p>
          </div>
          <Link href="/" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            ← Back
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["overview", "shifts", "users", "feedback"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={"rounded-2xl px-4 py-2 text-sm font-semibold transition capitalize " +
                (activeTab === tab ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Talent", value: stats.totalTalent, colour: "text-teal-700", icon: "🩺" },
                { label: "Employers", value: stats.totalEmployers, colour: "text-blue-700", icon: "🏥" },
                { label: "Total shifts", value: stats.totalShifts, colour: "text-slate-700", icon: "📋" },
                { label: "Fill rate", value: stats.fillRate + "%", colour: "text-emerald-700", icon: "✅" },
              ].map(({ label, value, colour, icon }) => (
                <div key={label} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className={"text-3xl font-bold " + colour}>{value}</div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Open shifts", value: stats.openShifts, colour: "text-amber-600" },
                { label: "Filled shifts", value: stats.filledShifts, colour: "text-emerald-600" },
                { label: "Total bookings", value: stats.totalBookings, colour: "text-slate-700" },
                { label: "Confirmed bookings", value: stats.confirmedBookings, colour: "text-teal-700" },
              ].map(({ label, value, colour }) => (
                <div key={label} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                  <div className={"text-3xl font-bold " + colour}>{value}</div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Quick actions</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("shifts")} className="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                  View all shifts
                </button>
                <button onClick={() => setActiveTab("users")} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  View all users
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shifts */}
        {activeTab === "shifts" && (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">All shifts</h2>
              <p className="text-sm text-slate-500 mt-1">Most recent 20 shifts across all employers.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {shifts.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No shifts yet.</div>
              ) : shifts.map(shift => (
                <div key={shift.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + statusColour(shift.status)}>
                        {shift.status}
                      </span>
                      {shift.booking_count > 0 && (
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700">
                          {shift.booking_count} booking{shift.booking_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm">{shift.role_required}</p>
                    <p className="text-xs text-slate-500">{shift.clinic_name} • {new Date(shift.shift_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="text-sm font-bold text-teal-700">${shift.rate}/hr</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">All users</h2>
              <p className="text-sm text-slate-500 mt-1">{users.length} total users on the platform.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map(user => (
                <div key={user.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + roleColour(user.role)}>
                        {user.role}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{user.full_name || "No name set"}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(user.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {activeTab === "feedback" && (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">💬 Feedback & bug reports</h2>
              <p className="text-sm text-slate-500 mt-1">{feedback.length} submission{feedback.length !== 1 ? "s" : ""} from users.</p>
            </div>
            {feedback.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No feedback yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {feedback.map(item => (
                  <div key={item.id} className={"p-4 " + (item.type === "bug" ? "bg-red-50" : "bg-white")}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + (item.type === "bug" ? "bg-red-100 text-red-700" : "bg-teal-50 text-teal-700")}>
                        {item.type === "bug" ? "🐛 Bug report" : "💬 Feedback"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
