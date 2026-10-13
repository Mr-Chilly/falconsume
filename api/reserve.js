// Vercel Function: receives a reservation request and emails it to the restaurant via Resend.
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY     API key from resend.com
//   RESERVATIONS_TO    inbox that receives requests, e.g. reservations@example.com
//   RESERVATIONS_FROM  verified sender, e.g. "Fal-consumé <reservations@example.com>"
//                      (defaults to Resend's test sender, which can only deliver to your Resend account email)

const TIMES = ["8:00pm", "8:30pm", "9:00pm", "9:30pm", "10:00pm"];
const GUESTS = ["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6 guests"];
const OCCASIONS = ["", "Birthday", "Anniversary", "Proposal", "Business", "Birdwatching"];
const SERVICE_DAYS = [4, 5, 6]; // Thu, Fri, Sat
const OPENING = Date.UTC(2027, 0, 1);
const FULLY_BOOKED_UNTIL = Date.UTC(2027, 2, 13);
const LAST_DATE = Date.UTC(2027, 5, 30);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function parseDate(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  if (d.getUTCMonth() !== +m[2] - 1) return null;
  if (t < OPENING || t > LAST_DATE || !SERVICE_DAYS.includes(d.getUTCDay())) return null;
  return d;
}

function longDate(d) {
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "Invalid request" });

  // Honeypot: real visitors never see or fill this field.
  if (str(body.company, 200)) return res.status(200).json({ ok: true, ref: "FC-27-0000", waitlist: false });

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const time = str(body.time, 20);
  const guests = str(body.guests, 20);
  const occasion = str(body.occasion, 40);
  const notes = str(body.notes, 2000);
  const date = parseDate(str(body.date, 10));

  const errors = [];
  if (!/^[^\d@]{2,}\s+[^\d@]{2,}/.test(name)) errors.push("name");
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i.test(email)) errors.push("email");
  const digits = phone.replace(/\D/g, "");
  if (phone && (!/^\+?[\d\s()-]+$/.test(phone) || digits.length < 10 || digits.length > 15)) errors.push("phone");
  if (!date) errors.push("date");
  if (!TIMES.includes(time)) errors.push("time");
  if (!GUESTS.includes(guests)) errors.push("guests");
  if (!OCCASIONS.includes(occasion)) errors.push("occasion");
  if (body.terms !== true) errors.push("terms");
  if (errors.length) return res.status(400).json({ ok: false, error: "Invalid fields", fields: errors });

  const { RESEND_API_KEY, RESERVATIONS_TO } = process.env;
  const from = process.env.RESERVATIONS_FROM || "Fal-consumé <onboarding@resend.dev>";
  if (!RESEND_API_KEY || !RESERVATIONS_TO) {
    console.error("reserve: RESEND_API_KEY or RESERVATIONS_TO is not set");
    return res.status(500).json({ ok: false, error: "Reservations are temporarily unavailable" });
  }

  const waitlist = date.getTime() <= FULLY_BOOKED_UNTIL;
  const ref = "FC-27-" + String(Math.floor(1000 + Math.random() * 9000));
  const when = longDate(date);

  const rows = [
    ["Reference", ref],
    ["Type", waitlist ? "Waiting list (evening fully booked)" : "Reservation request"],
    ["Evening", when],
    ["Seating", time],
    ["Party", guests],
    ["Name", name],
    ["Email", email],
    ["Telephone", phone || "—"],
    ["Occasion", occasion || "—"],
    ["Notes", notes || "—"],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html =
    `<h2 style="font-family:Georgia,serif;font-weight:normal">${waitlist ? "Waiting list" : "Reservation request"}: ${escapeHtml(when)}</h2>` +
    `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><th align="left" valign="top" style="color:#6f6356">${k}</th><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`).join("") +
    `</table>`;

  const send = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: RESERVATIONS_TO.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: email,
      subject: `${waitlist ? "Waiting list" : "Reservation request"} · ${when} · ${guests} · ${name}`,
      text,
      html,
    }),
  });

  if (!send.ok) {
    console.error("reserve: Resend error", send.status, await send.text());
    return res.status(502).json({ ok: false, error: "Could not send request" });
  }

  return res.status(200).json({ ok: true, ref, waitlist });
};
