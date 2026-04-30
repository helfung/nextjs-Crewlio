"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Shift = {
  id: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  rate: number;
  urgent: boolean;
  status: string;
  hospital: string;
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShifts() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clinicProfile } = await supabase
        .from("clinic_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!clinicProfile) return;

      const { data } = await supabase
        .from("shifts")
        .select("*")
        .eq("clinic_id", clinicProfile.id)
        .order("shift_date", { ascending: true });

      setShifts(data || []);
      setLoading(false);
    }
    fetchShifts();
  }, []);

  const statusColour = (status: string) => {
    if (status === "filled") return "bg-emerald-50 text-emerald-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Posted shifts</h1>
            <p className="text-sm text-slate-500 mt-1">All shifts you have posted on Crewlio.</p>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            ← Back
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading shifts...</div>
        ) : shifts.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-semibold">No shifts posted yet</h2>
            <p className="text-sm text-slate-500 mt-1">Post your first shift from the Clinic tab.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Post a shift
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div key={shift.id} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColour(shift.status)}`}>
                        {shift.status}
                      </span>
                      {shift.urgent && (
                        <span className="rounded-full px-3 py-1 text-xs font-medium bg-red-50 text-red-700">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{shift.role_required}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(shift.shift_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                      {" • "}{shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                      {shift.hospital && ` • ${shift.hospital}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-700">${shift.rate}/hr</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
