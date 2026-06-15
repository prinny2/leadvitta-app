/**
 * Script para configurar automaticamente os webhooks da Z-API.
 * Uso: node scripts/setup-zapi-webhook.mjs [URL_DO_WEBHOOK]
 * 
 * Se URL_DO_WEBHOOK não for passado, usa a variável NEXT_PUBLIC_SITE_URL + /api/whatsapp/webhook
 */
import "dotenv/config";

const INSTANCE = process.env.ZAPI_INSTANCE_ID;
const TOKEN = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;
const SECURITY_TOKEN = process.env.ZAPI_SECURITY_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function setup() {
  if (!INSTANCE || !TOKEN) {
    console.error("❌ Erro: ZAPI_INSTANCE_ID e ZAPI_TOKEN devem estar no .env");
    process.exit(1);
  }

  let webhookUrl = process.argv[2] || `${SITE_URL}/api/whatsapp/webhook`;
  
  // Adiciona o token de segurança se existir
  if (SECURITY_TOKEN) {
    const url = new URL(webhookUrl);
    url.searchParams.set("token", SECURITY_TOKEN);
    webhookUrl = url.toString();
  }

  console.log(`🚀 Configurando webhooks para: ${webhookUrl}...`);

  const headers = {
    "Content-Type": "application/json",
  };
  if (CLIENT_TOKEN) headers["Client-Token"] = CLIENT_TOKEN;

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}/update-every-webhooks`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          value: webhookUrl,
        }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      console.log("✅ Webhooks atualizados com sucesso!");
      console.log(data);
    } else {
      console.error("❌ Falha ao atualizar webhooks:", data);
    }
  } catch (e) {
    console.error("❌ Erro na requisição:", e.message);
  }
}

setup();
