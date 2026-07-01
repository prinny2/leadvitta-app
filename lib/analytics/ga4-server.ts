import {
  ga4ApiSecret,
  ga4MeasurementId,
  isGa4ServerConfigured,
} from "@/lib/config";

export type Ga4SendResult =
  | { sent: true; status: number }
  | {
      sent: false;
      reason: "not_configured" | "invalid_event" | "missing_client_id" | "failed";
      status?: number;
    };

type Ga4EventInput = {
  name: string;
  clientId?: string;
  userId?: string;
  params?: Record<string, unknown>;
};

const SAFE_NAME_KEYS = new Set(["item_name"]);
const BLOCKED_PARAM_PARTS = [
  "address",
  "cnpj",
  "cpf",
  "customer",
  "email",
  "endereco",
  "firebase",
  "lat",
  "lng",
  "longitude",
  "mensagem",
  "message",
  "nome",
  "phone",
  "stripe_customer",
  "subscription",
  "telefone",
  "whatsapp",
];

function validEventName(name: string) {
  return /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(name);
}

function cleanString(value: string) {
  return value.trim().slice(0, 120);
}

function cleanValue(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") return cleanString(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map(cleanValue).filter((v) => v !== undefined);
  }
  if (typeof value === "object") {
    return cleanParams(value as Record<string, unknown>);
  }
  return undefined;
}

function cleanParams(params: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params).slice(0, 25)) {
    const normalized = key.toLowerCase();
    if (
      !SAFE_NAME_KEYS.has(normalized) &&
      (normalized === "name" ||
        normalized.endsWith("_name") ||
        BLOCKED_PARAM_PARTS.some((part) => normalized.includes(part)))
    ) {
      continue;
    }
    const clean = cleanValue(value);
    if (clean !== undefined) out[key.slice(0, 40)] = clean;
  }
  return out;
}

export function ga4ValueFromCents(amount?: number | null) {
  return typeof amount === "number" && Number.isFinite(amount)
    ? Math.max(0, amount) / 100
    : undefined;
}

export async function sendGa4Event({
  name,
  clientId,
  userId,
  params,
}: Ga4EventInput): Promise<Ga4SendResult> {
  if (!isGa4ServerConfigured) return { sent: false, reason: "not_configured" };
  if (!validEventName(name)) return { sent: false, reason: "invalid_event" };

  const safeClientId = cleanString(clientId || "");
  if (!safeClientId) return { sent: false, reason: "missing_client_id" };
  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", ga4MeasurementId);
  endpoint.searchParams.set("api_secret", ga4ApiSecret);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        client_id: safeClientId,
        user_id: userId ? cleanString(userId) : undefined,
        events: [
          {
            name,
            params: {
              engagement_time_msec: 1,
              ...(params ? cleanParams(params) : {}),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn("[ga4] Measurement Protocol status", response.status);
      return { sent: false, reason: "failed", status: response.status };
    }
    return { sent: true, status: response.status };
  } catch (err) {
    console.warn("[ga4] falha ao enviar evento", err);
    return { sent: false, reason: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}
