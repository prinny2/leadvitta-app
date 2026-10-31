# Meta WhatsApp Cloud API

LeadBellus can use Meta's hosted WhatsApp Business Cloud API instead of Z-API.
Incoming messages are saved in the clinic inbox. A team member reviews them,
can ask the AI for a draft, and manually sends the chosen reply. The webhook
does not auto-reply.

## Current scope

This direct integration supports one Meta-configured sending number per app
deployment. The number must also be associated with the clinic in **Configurações
→ WhatsApp** so inbound events route to that clinic. Connecting each customer's
own WABA and phone through self-serve onboarding requires Meta Embedded Signup
and is a separate product integration.

Incoming text is shown verbatim. Other message types are recorded as a notice
that the clinic should open the original WhatsApp conversation to view them.
This first version sends free-form replies only; approved template messages for
out-of-window follow-ups are not implemented yet.

## Meta setup

1. Add WhatsApp to the Meta app and finish the WhatsApp Business Account setup.
   For development, use the test number Meta provides in its API setup.
2. Grant `whatsapp_business_messaging` to the access token. Use a system-user
   token for a production deployment; keep it on the server.
3. In Meta's Webhooks settings, use callback URL
   `https://www.leadbellus.com.br/api/whatsapp/webhook` and the exact verify
   token stored in `WHATSAPP_CLOUD_VERIFY_TOKEN`. Subscribe to the `messages`
   field and subscribe the app to the WABA.
4. Copy the phone number ID, the visible business number in international
   format, app secret, and Graph API version supported by the app into the VPS
   runtime environment.
5. Associate the same visible business number with the clinic account in
   LeadBellus settings. Only that clinic can send through this deployment's
   Meta number. Send and answer a test message; the inbound message
   should appear in `/conversas`, and sending should happen only after a person
   presses Send in the thread.

## Server environment

Set these values in the VPS `app.env` and select the provider:

```dotenv
WHATSAPP_PROVIDER=meta-cloud
WHATSAPP_CLOUD_ACCESS_TOKEN=
WHATSAPP_CLOUD_PHONE_NUMBER_ID=
WHATSAPP_CLOUD_DISPLAY_PHONE_NUMBER=
WHATSAPP_CLOUD_APP_SECRET=
WHATSAPP_CLOUD_VERIFY_TOKEN=
WHATSAPP_CLOUD_API_VERSION=
```

Do not commit populated secrets or paste them into chat. After recreating the
app container, `/api/health` should show `whatsapp: true` and
`whatsapp_provider: "meta-cloud"`. `/api/config` exposes the provider name and
a boolean readiness flag without returning secrets.

Meta webhook POST bodies are checked against `X-Hub-Signature-256` with the app
secret; the GET callback returns Meta's challenge only when the verify token
matches. Message IDs are deduplicated before the inbox is updated.
