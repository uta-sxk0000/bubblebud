import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/email";
import { jsonError } from "@/lib/validation";

const schema = z.object({ email: z.string().email() });

export async function POST(request) {
  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return jsonError(error.message, 422);
  }

  await sendTransactionalEmail({
    to: payload.email,
    subject: "Welcome to BubbleBud",
    html: "<p>You are on the BubbleBud list. We will only send meaningful product updates and offers.</p>",
    idempotencyKey: `newsletter-${payload.email}`,
  });

  return Response.json({ ok: true });
}
