"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Booking = {
  id: string;
  status: string;
  invited_at: string;
  shift_id: string;
  shifts: any;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User:", user?.id);
    if (!user) { setLoading(false); return; }

    const { data: staffProfile, error: spError } = await supabase
      .from("staff_profiles").select("id").eq("user_id", user.id).single();
    console.log("Staff profile:", staffProfile, spError);

    if (!staffProfile) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("bookings")
      .select("id, status, invited_at, shift_id, shifts(*, clinic_profiles(clinic_name, suburb, address, phone))")
      .eq("staff_id", staffProfile.id)
      .order("invited_at", { ascending: false });

    console.log("Bookings data:", data, "Error:", error);
    setBookings((data as any) || []);
    setLoading(false);
  }

  async function withdrawBooking(bookingId: string) {
    setWithdrawing(bookingId);
    const supabase = createClient();
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    await fetchBookings();
    setWithdrawing(null);
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter(b =>
    (b.status === "confirmed" || b.status === "accepted") &&
    b.shifts?.shift_date >= today
  );
  const past = bookings.filter(b => b.shifts?.shift_date < today);

  const statusColour = (status: string) => {
    if (status === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (status === "accepted") return "bg-teal-50 text-teal-700";
    if (status === "declined" || status === "cancelled") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  const statusLabel = (status: string) => {
    if (status === "confirmed") return "✓ Confirmed";
    if (status === "accepted") return "Awaiting confirmation";
    if (status === "declined") return "Declined";
    if (status === "cancelled") return "Withdrawn";
    return status;
  };

  function BookingCard({ booking }: { booking: Booking }) {
    const shift = booking.shifts;
    const clinic = shift?.clinic_profiles;
    const isUpcoming = shift?.shift_date >= today;
    const canWithdraw = (booking.status === "accepted" || booking.status === "confirmed") && isUpcoming;

    return (
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={"rounded-full px-3 py-1 text-xs font-medium " + statusColour(booking.status)}>
                {statusLabel(booking.status)}
              </span>
              {shift?.urgent && (
                <span className="rounded-full px-3 py-1 text-xs font-medium bg-red-50 text-red-700">Urgent</span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{shift?.role_required}</h3>
            <p className="text-sm font-medium text-teal-700 mt-0.5">{clinic?.clinic_name}</p>
            <p className="text-sm text-slate-500 mt-1">
              {shift?.shift_date && new Date(shift.shift_date).toLocaleDateString("en-AU", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
            <p className="text-sm text-slate-500">
              {shift?.start_time?.slice(0, 5)} – {shift?.end_time?.slice(0, 5)}
              {shift?.hospital ? " • " + shift.hospital : ""}
            </p>
            {booking.status === "confirmed" && clinic && (
              <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
                <div className="font-semibold mb-1">📍 Clinic details</div>
                {clinic.address && <div>{clinic.address}{clinic.suburb ? ", " + clinic.suburb : ""}</div>}
                {clinic.phone && <div>📞 {clinic.phone}</div>}
              </div>
            )}
            {shift?.required_skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {shift.required_skills.slice(0, 4).map((s: string) => (
                  <span key={s} className="rounded-full px-2 py-0.5 text-xs bg-teal-50 text-teal-700">{s}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-2xl font-bold text-teal-700">${shift?.rate}/hr</div>
            {canWithdraw && (
              <button
                onClick={() => withdrawBooking(booking.id)}
                disabled={withdrawing === booking.id}
                className="rounded-2xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                {withdrawing === booking.id ? "..." : "Withdraw"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My shifts</h1>
            <p className="text-sm text-slate-500 mt-1">Your upcoming and past bookings.</p>
          </div>
          <Link href="/" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Upcoming", value: upcoming.length, colour: "text-teal-700" },
            { label: "Awaiting confirmation", value: bookings.filter(b => b.status === "accepted").length, colour: "text-amber-600" },
            { label: "Past shifts", value: past.length, colour: "text-slate-500" },
          ].map(({ label, value, colour }) => (
            <div key={label} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-4 text-center">
              <div className={"text-3xl font-bold " + colour}>{value}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading shifts...</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-lg font-semibold">No bookings yet</h2>
            <p className="text-sm text-slate-500 mt-1">Accept a shift to see it here.</p>
            <Link href="/" className="mt-4 inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
              View shifts
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Upcoming shifts</h2>
                <div className="space-y-4">
                  {upcoming.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}
            {bookings.filter(b => b.status === "accepted" && b.shifts?.shift_date >= today && !upcoming.find(u => u.id === b.id)).length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3">Awaiting confirmation</h2>
                <div className="space-y-4">
                  {bookings.filter(b => b.status === "accepted").map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}
            {bookings.filter(b => b.status === "declined" || b.status === "cancelled").length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 text-slate-500">Declined / Withdrawn</h2>
                <div className="space-y-4 opacity-75">
                  {bookings.filter(b => b.status === "declined" || b.status === "cancelled").map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 text-slate-500">Past shifts</h2>
                <div className="space-y-4 opacity-75">
                  {past.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
