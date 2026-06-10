import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/config";

type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getAllowedOrigins(request: Request) {
  const allowed = new Set<string>();

  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // Ignora URL malformada; a checagem final vai bloquear.
  }

  try {
    allowed.add(new URL(siteUrl).origin);
  } catch {
    // Em desenvolvimento, siteUrl pode estar vazio/malformado.
  }

  return allowed;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function cleanupRateLimitStore(now: number) {
  if (rateLimitStore.size < 500) return;

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function rejectCrossOriginRequest(request: Request) {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const isProduction =
    process.env.NODE_ENV === "production" || !!process.env.K_SERVICE;

  if (origin) {
    if (allowedOrigins.has(origin)) return null;
    return NextResponse.json(
      { error: "Origem não autorizada." },
      { status: 403 }
    );
  }

  if (referer) {
    try {
      if (allowedOrigins.has(new URL(referer).origin)) return null;
    } catch {
      // Referer inválido cai no bloqueio abaixo.
    }

    return NextResponse.json(
      { error: "Referer não autorizado." },
      { status: 403 }
    );
  }

  if (isProduction) {
    return NextResponse.json(
      { error: "Origem obrigatória para esta operação." },
      { status: 403 }
    );
  }

  return null;
}

export function enforceRateLimit(
  request: Request,
  { bucket, limit, windowMs }: RateLimitOptions
) {
  const now = Date.now();
  cleanupRateLimitStore(now);

  const key = `${bucket}:${getClientIp(request)}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((entry.resetAt - now) / 1000)
    );

    return NextResponse.json(
      { error: "Limite de tentativas temporariamente excedido." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  return null;
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes: number
): Promise<{ data?: T; error?: NextResponse }> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      error: NextResponse.json(
        { error: "Content-Type deve ser application/json." },
        { status: 415 }
      ),
    };
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = Number(contentLengthHeader);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      error: NextResponse.json(
        { error: "Payload maior do que o permitido." },
        { status: 413 }
      ),
    };
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    return {
      error: NextResponse.json(
        { error: "Payload maior do que o permitido." },
        { status: 413 }
      ),
    };
  }

  try {
    return { data: JSON.parse(raw) as T };
  } catch {
    return {
      error: NextResponse.json({ error: "JSON inválido." }, { status: 400 }),
    };
  }
}

export function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
