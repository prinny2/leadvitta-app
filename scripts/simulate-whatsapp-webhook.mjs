#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadLocalEnv(path.join(projectRoot, ".env.local"));

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const url =
  options.url ||
  process.env.WHATSAPP_WEBHOOK_URL ||
  "http://localhost:3000/api/whatsapp/webhook";
const displayPhoneNumber = onlyDigits(
  options.displayPhoneNumber ||
    process.env.WHATSAPP_SIM_DISPLAY_PHONE_NUMBER ||
    "5591999999999"
);
const from = onlyDigits(
  options.from || process.env.WHATSAPP_SIM_FROM || "5591888888888"
);
const contactName =
  options.name || process.env.WHATSAPP_SIM_CONTACT_NAME || "Cliente Teste";
const text =
  options.text ||
  process.env.WHATSAPP_SIM_TEXT ||
  "Oi, queria saber sobre botox";
const appSecret = options.appSecret || process.env.WHATSAPP_APP_SECRET || "";

const payload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "simulated-waba",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: displayPhoneNumber,
              phone_number_id: "simulated-phone-number-id",
            },
            contacts: [
              {
                profile: { name: contactName },
                wa_id: from,
              },
            ],
            messages: [
              {
                from,
                id: `wamid.simulated.${Date.now()}`,
                timestamp: String(Math.floor(Date.now() / 1000)),
                type: "text",
                text: { body: text },
              },
            ],
          },
        },
      ],
    },
  ],
};

const rawBody = JSON.stringify(payload);
const headers = {
  "Content-Type": "application/json",
};

if (appSecret) {
  headers["X-Hub-Signature-256"] =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
}

console.log("[whatsapp:simulate] POST", url);
console.log("[whatsapp:simulate] display_phone_number =", displayPhoneNumber);
console.log("[whatsapp:simulate] from =", from);
console.log("[whatsapp:simulate] text =", text);
console.log(
  "[whatsapp:simulate] signature =",
  appSecret ? "enabled (WHATSAPP_APP_SECRET found)" : "disabled"
);

let response;
try {
  response = await fetch(url, {
    method: "POST",
    headers,
    body: rawBody,
  });
} catch (error) {
  console.error("[whatsapp:simulate] request failed:", formatError(error));
  console.error(
    "[whatsapp:simulate] Is the Next.js server running? Try: npm run dev"
  );
  process.exit(1);
}

const responseBody = await response.text();

console.log("[whatsapp:simulate] status =", response.status);
console.log("[whatsapp:simulate] body =", responseBody || "(empty)");

if (!response.ok) {
  console.error(
    "[whatsapp:simulate] Webhook did not accept the payload. If your server has WHATSAPP_APP_SECRET, run this script with the same secret available locally."
  );
  process.exit(1);
}

console.log(
  "[whatsapp:simulate] Ack received. Watch the Next.js terminal for [whatsapp] processing logs; the route runs IA/Firestore/send in background."
);

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    const equalsIndex = arg.indexOf("=");
    const rawKey = equalsIndex === -1 ? arg : arg.slice(0, equalsIndex);
    const inlineValue =
      equalsIndex === -1 ? undefined : arg.slice(equalsIndex + 1);
    const key = normalizeKey(rawKey);
    if (!key) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    const value = inlineValue ?? argv[i + 1];
    if (inlineValue == null) i += 1;
    if (value == null || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    parsed[key] = value;
  }
  return parsed;
}

function normalizeKey(key) {
  const map = {
    "--url": "url",
    "--display-phone-number": "displayPhoneNumber",
    "--to": "displayPhoneNumber",
    "--from": "from",
    "--name": "name",
    "--contact-name": "name",
    "--text": "text",
    "--message": "text",
    "--app-secret": "appSecret",
  };
  return map[key];
}

function onlyDigits(value) {
  return String(value).replace(/\D/g, "");
}

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function formatError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function printHelp() {
  console.log(`
Simulate an inbound WhatsApp Cloud API text message against the local webhook.

Usage:
  npm run whatsapp:simulate
  npm run whatsapp:simulate -- --text "Oi, queria saber sobre botox"
  npm run whatsapp:simulate -- --to 5591999999999 --from 5591888888888

Options:
  --url                    Webhook URL. Default: http://localhost:3000/api/whatsapp/webhook
  --to, --display-phone-number
                           Clinic WhatsApp number used in metadata.display_phone_number
  --from                   Simulated client WhatsApp number
  --name, --contact-name   Simulated contact name
  --text, --message        Simulated inbound message text
  --app-secret             Meta app secret used to sign X-Hub-Signature-256

Notes:
  The script also reads .env.local when present.
  For the full flow, Firestore must contain a clinica whose whatsapp field equals --to,
  and billing.status must be active, paid, or trialing.
`);
}
