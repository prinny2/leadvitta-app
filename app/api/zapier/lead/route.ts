import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { sendZapierEvent } from "@/lib/zapier";

export const runtime = "nodejs";

type LeadBody = {
  event?: string;
  plan?: string;
};

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : undefined;
}

export async function POST(request: Request) {
  const decodedToken = await verifyFirebaseIdToken(getBearerToken(request));
  if (!decodedToken) {
    return NextResponse.json(
      { error: "Firebase Admin/ID token obrigatório para enviar lead." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as LeadBody;
  const event = body.event || "lead.created";
  const result = await sendZapierEvent(event, {
    firebase_uid: decodedToken.uid,
    email: decodedToken.email,
    plan: body.plan,
  });

  return NextResponse.json({ ok: result.sent, result });
}
