import { Resend } from "resend";

function emailClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendTransactionalEmail({ to, subject, html, text, idempotencyKey }) {
  const resend = emailClient();
  if (!resend) {
    return { skipped: true, reason: "RESEND_API_KEY is not configured." };
  }

  return resend.emails.send(
    {
      from: process.env.RESEND_FROM_EMAIL || "BubbleBud <orders@bubblebud.app>",
      to,
      subject,
      html,
      text,
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
}

export function orderConfirmationHtml(order, items = []) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">${item.product_title}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;">$${(item.total_cents / 100).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#111;line-height:1.55;">
      <h1 style="font-size:28px;">Thanks for your BubbleBud order</h1>
      <p>We received order <strong>${order.order_number}</strong> and will send tracking as soon as it ships.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="center">Qty</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:18px;"><strong>Total: $${(order.total_cents / 100).toFixed(2)}</strong></p>
      <p>Questions? Reply to this email or contact ${process.env.BUBBLEBUD_SUPPORT_EMAIL || "sytnix479@gmail.com"}.</p>
    </div>`;
}
