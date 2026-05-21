import { createAdminSupabase } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email";
import { contactSchema, jsonError } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    rateLimit(request, { key: "contact", limit: 5, windowMs: 60_000 });
  } catch (error) {
    return jsonError(error.message, error.status || 429);
  }

  let payload;
  try {
    payload = contactSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.message, 422);
  }

  const supabase = createAdminSupabase();
  await supabase.from("contact_messages").insert({
    name: payload.name,
    email: payload.email,
    order_number: payload.orderNumber || null,
    subject: payload.subject,
    message: payload.message,
  });

  await sendTransactionalEmail({
    to: process.env.BUBBLEBUD_SUPPORT_EMAIL || "sytnix479@gmail.com",
    subject: `BubbleBud contact: ${payload.subject}`,
    html: `
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Order:</strong> ${payload.orderNumber || "N/A"}</p>
      <p>${payload.message.replaceAll("\n", "<br />")}</p>
    `,
  });

  return Response.json({ ok: true });
}
