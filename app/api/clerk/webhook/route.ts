import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { type NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/api-security";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPrimaryEmail(data: unknown): string | undefined {
  const user = data as {
    email_addresses?: Array<{ id?: string; email_address?: string }>;
    primary_email_address_id?: string;
  };

  const primary = user.email_addresses?.find(
    (email) => email.id === user.primary_email_address_id
  );
  return primary?.email_address || user.email_addresses?.[0]?.email_address;
}

export async function POST(request: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(request);
  } catch {
    return jsonNoStore({ error: "Webhook Clerk inválido." }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return jsonNoStore({ ok: true, ignored: true });
  }

  const user = event.data as { id?: string };
  const result = await sendOpsNotify("signup.created", {
    firebase_uid: user.id,
    email: getPrimaryEmail(event.data),
    provider: "clerk",
  });

  return jsonNoStore({ ok: result.sent, result });
}
