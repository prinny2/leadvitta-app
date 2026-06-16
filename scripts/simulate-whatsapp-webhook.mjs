#!/usr/bin/env node
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

let url =
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
const zapiSecurityToken =
  options.zapiSecurityToken || process.env.ZAPI_SECURITY_TOKEN || "";

const payload = {
  phone: from,
  connectedPhone: displayPhoneNumber,
  messageId: `zapi_simulated_${Date.now()}`,
  text: { message: text },
  senderName: contactName,
  type: "ReceivedMessage",
  instanceId: process.env.ZAPI_INSTANCE_ID || "simulated-instance",
};
const rawBody = JSON.stringify(payload);
const headers = { "Content-Type": "application/json" };

if (zapiSecurityToken) {
  headers["x-zapi-token"] = zapiSecurityToken;
  const urlObj = new URL(url);
  if (!urlObj.searchParams.has("token")) {
    urlObj.searchParams.set("token", zapiSecurityToken);
  }
  url = urlObj.toString();
}

console.log("[whatsapp:simulate] POST", url);
console.log("[whatsapp:simulate] provider = zapi");
console.log("[whatsapp:simulate] to/connectedPhone =", displayPhoneNumber);
console.log("[whatsapp:simulate] from =", from);
console.log("[whatsapp:simulate] text =", text);
if (zapiSecurityToken) {
  console.log("[whatsapp:simulate] zapi token = attached");
}

let response;
try {
  response = await fetch(url, {
    method: "POST",
    headers,
    body: rawBody,
  });
} catch (error) {
  console.error("[whatsapp:simulate] request failed:", formatError(error));
  console.error("[whatsapp:simulate] Is the Next.js server running? Try: npm run dev");
  process.exit(1);
}

const responseBody = await response.text();

console.log("[whatsapp:simulate] status =", response.status);
console.log("[whatsapp:simulate] body =", responseBody || "(empty)");

if (!response.ok) {
  console.error(
    "[whatsapp:simulate] Webhook rejected the payload. Check ZAPI_SECURITY_TOKEN matches the server."
  );
  process.exit(1);
}

console.log(
  "[whatsapp:simulate] Ack received. Processing runs in background on the server."
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
    const inlineValue = equalsIndex === -1 ? undefined : arg.slice(equalsIndex + 1);
    const key = normalizeKey(rawKey);
    if (!key) throw new Error(`Unknown argument: ${arg}`);

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
    "--zapi-security-token": "zapiSecurityToken",
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
Simulate an inbound Z-API WhatsApp message against /api/whatsapp/webhook.

Usage:
  npm run whatsapp:simulate
  npm run whatsapp:simulate -- --text "Oi, queria saber sobre botox"

Options:
  --url                    Webhook URL (default: http://localhost:3000/api/whatsapp/webhook)
  --to, --display-phone-number  Clinic number (connectedPhone)
  --from                   Client number (phone)
  --name, --contact-name   Contact display name
  --text, --message        Message body
  --zapi-security-token    Token as x-zapi-token / ?token= (ZAPI_SECURITY_TOKEN)

Notes:
  Reads .env.local when present. Firestore must map --to to a clinica with active billing.
`);
}