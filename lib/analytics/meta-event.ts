const standardEvents: Record<string, string> = {
  sign_up: "Lead",
  checkout_click: "InitiateCheckout",
  purchase: "Purchase",
  contact_whatsapp: "Contact",
  view_demo: "ViewContent",
};

export function dispatchMetaEvent(
  fbq: (...args: any[]) => void,
  eventName: string,
  params?: Record<string, any>
) {
  const metaEvent = standardEvents[eventName];
  fbq(metaEvent ? "track" : "trackCustom", metaEvent || eventName, params);
}
