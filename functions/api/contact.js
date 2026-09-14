const allowedTypes = new Set(["general", "collaboration", "sponsorship"]);
const maxLengths = {
  name: 120,
  email: 180,
  company: 180,
  website: 240,
  inquiryType: 80,
  collaborationType: 120,
  budget: 120,
  timeline: 120,
  platforms: 240,
  subject: 180,
  message: 5000,
  notes: 5000,
  honeypot: 180
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});

const clean = (value, limit) => String(value || "").trim().slice(0, limit);

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
})[character]);

const emailIsValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const verifyTurnstile = async (token, request, secret) => {
  if (!secret) return true;
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  const result = await response.json();
  return result.success === true;
};

const fieldLines = (payload) => [
  ["Name", payload.name],
  ["Email", payload.email],
  ["Company / organization", payload.company],
  ["Website / social link", payload.website],
  ["Inquiry type", payload.inquiryType],
  ["Collaboration type", payload.collaborationType],
  ["Budget / opportunity size", payload.budget],
  ["Timeline", payload.timeline],
  ["Platforms", payload.platforms],
  ["Subject", payload.subject],
  ["Message", payload.message],
  ["Additional notes", payload.notes]
].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ message: "Please send the form as JSON." }, 400);
  }

  const normalized = {};
  Object.entries(maxLengths).forEach(([key, limit]) => {
    normalized[key] = clean(payload[key], limit);
  });
  normalized.formType = clean(payload.formType, 40).toLowerCase();
  normalized.inquiryType = clean(payload.inquiryType, maxLengths.inquiryType);

  if (normalized.honeypot) {
    return json({ message: "Thanks — your note is on its way." });
  }
  if (!allowedTypes.has(normalized.formType)) {
    return json({ message: "Please choose a valid form." }, 400);
  }
  if (!normalized.name || !emailIsValid(normalized.email)) {
    return json({ message: "Please provide your name and a valid email address." }, 400);
  }
  if (normalized.formType === "general" && !normalized.message) {
    return json({ message: "Please add a message." }, 400);
  }
  if (normalized.formType !== "general" && !normalized.message && !normalized.notes) {
    return json({ message: "Please describe the opportunity." }, 400);
  }

  const turnstilePassed = await verifyTurnstile(
    clean(payload.turnstileToken, 4000),
    request,
    env.TURNSTILE_SECRET_KEY
  );
  if (!turnstilePassed) {
    return json({ message: "Please complete the anti-spam check and try again." }, 400);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) {
    return json({ message: "The form is not configured yet. Please email Bradley directly." }, 503);
  }

  const typeLabel = normalized.formType === "collaboration"
    ? "Collaboration"
    : normalized.formType === "sponsorship"
      ? "Sponsorship"
      : "General";
  const subject = `[${typeLabel}] ${normalized.subject || normalized.company || normalized.name}`;
  const text = fieldLines(normalized).join("\n");
  const html = fieldLines(normalized)
    .map((line) => {
      const split = line.indexOf(": ");
      return `<p><strong>${escapeHtml(line.slice(0, split))}</strong><br />${escapeHtml(line.slice(split + 2))}</p>`;
    }).join("");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL || "bradleymminnich@gmail.com"],
      reply_to: normalized.email,
      subject,
      text,
      html: `<div style="font-family:Arial,sans-serif">${html}</div>`
    })
  });

  if (!emailResponse.ok) {
    return json({ message: "The email service could not accept the message. Please email Bradley directly." }, 502);
  }

  return json({ message: "Thanks — your note is on its way." });
}