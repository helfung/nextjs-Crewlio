import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "notifications@getcrewlio.com";

export async function POST(request: Request) {
  const { type, to, data } = await request.json();

  let subject = "";
  let html = "";

  if (type === "booking_accepted") {
    subject = `New application for your ${data.role} shift`;
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">New shift application — Crewlio</h2>
        <p>A candidate has applied for your shift:</p>
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p><strong>Role:</strong> ${data.role}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Rate:</strong> $${data.rate}/hr</p>
        </div>
        <p>Log in to <a href="https://getcrewlio.com/shifts" style="color: #0f766e;">your shift dashboard</a> to review and confirm.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Crewlio — Secure healthcare workforce matching</p>
      </div>
    `;
  }

  if (type === "booking_confirmed") {
    subject = `Your shift is confirmed — ${data.role} on ${data.date}`;
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Shift confirmed ✓ — Crewlio</h2>
        <p>Great news! Your booking has been confirmed.</p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #bbf7d0;">
          <p><strong>Role:</strong> ${data.role}</p>
          <p><strong>Clinic:</strong> ${data.clinic}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Address:</strong> ${data.address || "See your bookings page"}</p>
          <p><strong>Rate:</strong> $${data.rate}/hr</p>
        </div>
        <p>View full details at <a href="https://getcrewlio.com/bookings" style="color: #0f766e;">your bookings page</a>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Crewlio — Secure healthcare workforce matching</p>
      </div>
    `;
  }

  if (type === "booking_declined") {
    subject = `Update on your shift application`;
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Shift application update — Crewlio</h2>
        <p>Unfortunately your application for the <strong>${data.role}</strong> shift on <strong>${data.date}</strong> was not successful this time.</p>
        <p>Don't worry — new shifts are posted regularly. <a href="https://getcrewlio.com" style="color: #0f766e;">Check for new shifts</a>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">Crewlio — Secure healthcare workforce matching</p>
      </div>
    `;
  }

  if (!subject) {
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.status });
}
