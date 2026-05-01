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
  required_skills: string[];
  required_documents: string[];
};

type Booking = {
  id: string;
  shift_id: string;
  status: string;
  staff_id: string;
  staff_name?: string;
  staff_email?: string;
  qualifications?: string[];
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedShift, setExpandedShift] = useState<string | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clinicProfile } = await supabase
      .from("clinic_profiles").select("id").eq("user_id", user.id).single();
    if (!clinicProfile) { setLoading(false); return; }

    // Fetch shifts
    const { data: shiftsData, error: shiftsError } = await supabase
      .from("shifts")
      .select("id, role_required, shift_date, start_time, end_time, rate, urgent, status, hospital, required_skills, required_documents")
      .eq("clinic_id", clinicProfile.id)
      .order("id", { ascending: false });

    if (shiftsError) { console.error("Shifts error:", shiftsError); }
    const fetchedShifts = shiftsData || [];
    setShifts(fetchedShifts);

    if (fetchedShifts.length > 0) {
      const shiftIds = fetchedShifts.map(s => s.id);

      // Fetch bookings for these shifts
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, shift_id, status, staff_id")
        .in("shift_id", shiftIds);

      if (bookingsError) { console.error("Bookings error:", bookingsError); }

      const fetchedBookings = bookingsData || [];

      // Fetch staff profiles and profiles for each booking
      if (fetchedBookings.length > 0) {
        const staffIds = fetchedBookings.map(b => b.staff_id);
        const { data: staffData } = await supabase
          .from("staff_profiles")
          .select("id, user_id, qualifications")
          .in("id", staffIds);

        const userIds = (staffData || []).map(s => s.user_id);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const enriched = fetchedBookings.map(b => {
          const staff = staffData?.find(s => s.id === b.staff_id);
          const profile = profileData?.find(p => p.id === staff?.user_id);
          return {
            ...b,
            staff_name: profile?.full_name,
            staff_email: profile?.email,
            qualifications: staff?.qualifications,
          };
        });
        setBookings(enriched);
      }
    }

    setLoading(false);
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    setUpdatingBooking(bookingId);
    const supabase = createClient();
    await supabase.from("bookings").update({ status }).eq("id", bookingId);

    // Send email notification
    try {
      const booking = bookings.find(b => b.id === bookingId);
      const shift = shifts.find(s => s.id === booking?.shift_id);
      if (booking && shift) {
        const { data: staffData } = await supabase
          .from("staff_profiles").select("user_id").eq("id", booking.staff_id).single();
        const { data: profileData } = await supabase
          .from("profiles").select("email").eq("id", staffData?.user_id).single();

        console.log("Notify: staffData=", staffData, "profileData=", profileData);
        if (profileData?.email) {
          console.log("Sending notification to", profileData.email);
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: status === "confirmed" ? "booking_confirmed" : "booking_declined",
              to: profileData.email,
              data: {
                role: shift.role_required,
                date: new Date(shift.shift_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }),
                time: shift.start_time?.slice(0, 5) + " – " + shift.end_time?.slice(0, 5),
                rate: shift.rate,
                clinic: "",
                address: shift.hospital || "",
              },
            }),
          });
        }
      }
    } catch (e) {
      console.error("Email notification failed:", e);
    }

    await fetchData();
    setUpdatingBooking(null);
  }

  async function cancelShift(shiftId: string) {
    const supabase = createClient();
    await supabase.from("shifts").update({ status: "cancelled" }).eq("id", shiftId);
    await fetchData();
  }

  const statusColour = (status: string) => {
    if (status === "filled" || status === "confirmed") return "bg-emerald-50 text-emerald-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    if (status === "accepted") return "bg-teal-50 text-teal-700";
    return "bg-amber-50 text-amber-700";
  };

  const stats = {
    total: shifts.length,
    open: shifts.filter(s => s.status === "open").length,
    filled: shifts.filter(s => s.status === "filled").length,
    pending: bookings.filter(b => b.status === "accepted").length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shift dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your posted shifts and bookings.</p>
          </div>
          <Link href="/" className="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            + Post new shift
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total shifts", value: stats.total, colour: "text-slate-700" },
            { label: "Open", value: stats.open, colour: "text-amber-600" },
            { label: "Filled", value: stats.filled, colour: "text-emerald-600" },
            { label: "Awaiting confirmation", value: stats.pending, colour: "text-teal-600" },
          ].map(({ label, value, colour }) => (
            <div key={label} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
              <div className={"text-3xl font-bold " + colour}>{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading shifts...</div>
        ) : shifts.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-semibold">No shifts posted yet</h2>
            <p className="text-sm text-slate-500 mt-1">Post your first shift to start finding candidates.</p>
            <Link href="/" className="mt-4 inline-block rounded-2xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
              Post a shift
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => {
              const isExpanded = expandedShift === shift.id;
              const shiftBookings = bookings.filter(b => b.shift_id === shift.id);
              const editHref = "/shifts/edit?id=" + shift.id;

              return (
                <div key={shift.id} className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={"rounded-full px-3 py-1 text-xs font-medium " + statusColour(shift.status)}>
                            {shift.status}
                          </span>
                          {shift.urgent && (
                            <span className="rounded-full px-3 py-1 text-xs font-medium bg-red-50 text-red-700">Urgent</span>
                          )}
                          {shiftBookings.filter(b => b.status === "accepted").length > 0 && (
                            <span className="rounded-full px-3 py-1 text-xs font-medium bg-teal-50 text-teal-700">
                              {shiftBookings.filter(b => b.status === "accepted").length} application{shiftBookings.filter(b => b.status === "accepted").length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{shift.role_required}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(shift.shift_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          {" • "}{shift.start_time?.slice(0, 5)} – {shift.end_time?.slice(0, 5)}
                          {shift.hospital ? " • " + shift.hospital : ""}
                        </p>
                        {shift.required_skills?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {shift.required_skills.slice(0, 4).map(s => (
                              <span key={s} className="rounded-full px-2 py-0.5 text-xs bg-teal-50 text-teal-700">{s}</span>
                            ))}
                            {shift.required_skills.length > 4 && (
                              <span className="rounded-full px-2 py-0.5 text-xs bg-slate-100 text-slate-500">+{shift.required_skills.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-xl font-bold text-teal-700 mr-2">${shift.rate}/hr</div>
                        {shiftBookings.length > 0 && (
                          <button
                            onClick={() => setExpandedShift(isExpanded ? null : shift.id)}
                            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            {isExpanded ? "Hide" : shiftBookings.length + " booking" + (shiftBookings.length > 1 ? "s" : "")}
                          </button>
                        )}
                        {shift.status === "open" && (
                          <>
                            <a href={editHref} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                              Edit
                            </a>
                            <button
                              onClick={() => cancelShift(shift.id)}
                              className="rounded-2xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && shiftBookings.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50 p-5">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Bookings</h4>
                      <div className="space-y-3">
                        {shiftBookings.map((booking) => (
                          <div key={booking.id} className="rounded-2xl bg-white border border-slate-100 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + statusColour(booking.status)}>
                                  {booking.status}
                                </span>
                                <p className="font-semibold text-sm mt-2">
                                  {booking.status === "confirmed" ? booking.staff_name || "Confirmed candidate" : "Anonymous candidate"}
                                </p>
                                {booking.status === "confirmed" && booking.staff_email && (
                                  <p className="text-xs text-slate-500 mt-0.5">{booking.staff_email}</p>
                                )}
                                {booking.qualifications && booking.qualifications.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {booking.qualifications.slice(0, 3).map((q: string) => (
                                      <span key={q} className="rounded-full px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700">{q}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {booking.status === "accepted" && (
                                  <>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                      disabled={updatingBooking === booking.id}
                                      className="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                    >
                                      {updatingBooking === booking.id ? "..." : "Confirm"}
                                    </button>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, "declined")}
                                      disabled={updatingBooking === booking.id}
                                      className="rounded-2xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {booking.status === "confirmed" && (
                                  <span className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Confirmed</span>
                                )}
                                {booking.status === "declined" && (
                                  <span className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-500">Declined</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
