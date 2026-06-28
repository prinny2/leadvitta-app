const DEFAULT_LEADBELLUS_PRICE_IDS = [
  "price_1Tj5ihRTJ7iCFKxknWoEhpka",
  "price_1Tj5j8RTJ7iCFKxkiXFVTyx1",
  "price_1Tj5jNRTJ7iCFKxkNGRYD3It",
  "price_1TjhRnRTJ7iCFKxk3Z1nbzIr",
  "price_1TjhS6RTJ7iCFKxkumFhplLQ",
  "price_1TjhS7RTJ7iCFKxk7P7efMJT",
] as const;

function parsePriceIds(raw?: string) {
  return (raw || "")
    .split(/[\s,;]+/)
    .map((priceId) => priceId.trim())
    .filter(Boolean);
}

export function getAllowedStripePriceIds(): string[] {
  const configured = parsePriceIds(process.env.STRIPE_ALLOWED_PRICE_IDS);
  return configured.length ? configured : [...DEFAULT_LEADBELLUS_PRICE_IDS];
}

export function isAllowedStripePriceId(priceId: string): boolean {
  return getAllowedStripePriceIds().includes(priceId);
}
