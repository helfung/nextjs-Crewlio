"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  invited_at: string;
  shifts: {
    role_required: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    rate: number;
    urgent: boolean;
    hospital: string;
    clinic_profiles: {
      clinic_name: string;
    };
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffProfile } = await supabase
        .from("staff_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!staffProfile) return;

      const { data } = await supabase
        .from("bookings")
        .select(`
          id, status, invited_at,
          shifts (
            role_required, shift_date, start_time, end_time, rate, urgent, hospital,
            clinic_profiles ( clinic_name )
          )
        `)
        .eq("staff_id", staffProfile.id)
        .order("invited_at", { ascending: false });

      setBookings((data as any) || []);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  const statusColour = (status: string) => {
    if (status === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (status === "accepted") return "bg-teal-50 text-teal-700";
    if (status === "declined" || status === "cancelled") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My bookings</h1>
            <p className="text-sm text-slate-500 mt-1">Shifts you have accepted or been invited to.</p>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            ← Back
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-lg font-semibold">No bookings yet</h2>
            <p className="text-sm text-slate-500 mt-1">Accept a shift to see it here.</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              View shifts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColour(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.shifts?.urgent && (
                        <span className="rounded-full px-3 py-1 text-xs font-medium bg-red-50 text-red-700">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{booking.shifts?.role_required}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {booking.shifts?.clinic_profiles?.clinic_name}
                      {booking.shifts?.hospital && ` • ${booking.shifts.hospital}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {booking.shifts?.shift_date && new Date(booking.shifts.shift_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                      {" • "}{booking.shifts?.start_time?.slice(0, 5)} – {booking.shifts?.end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-700">${booking.shifts?.rate}/hr</div>
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
