import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { getDb, sendOpsNotify, upsertWaitlist } = vi.hoisted(() => ({
  getDb: vi.fn(),
  sendOpsNotify: vi.fn(),
  upsertWaitlist: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminDb: getDb,
}));
vi.mock("@/lib/ops-notify", () => ({
  sendOpsNotify,
}));
vi.mock("@/lib/supabase/server", () => ({
  upsertWaitlist,
}));

import { POST } from "@/app/api/waitlist/route";

let reqCounter = 0;
function makeRequest(body: unknown) {
  reqCounter += 1;
  return new Request("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "x-forwarded-for": `10.0.0.${reqCounter}`,
    },
    body: JSON.stringify(body),
  });
}

const mockSet = vi.fn().mockResolvedValue(undefined);
const mockDoc = vi.fn().mockReturnValue({ set: mockSet });
const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc });
const mockDb = { collection: mockCollection };

beforeEach(() => {
  getDb.mockReset().mockReturnValue(mockDb);
  sendOpsNotify.mockReset().mockResolvedValue({ sent: true });
  upsertWaitlist.mockReset().mockResolvedValue({ ok: true });
  mockSet.mockReset().mockResolvedValue(undefined);
  mockDoc.mockReset().mockReturnValue({ set: mockSet });
  mockCollection.mockReset().mockReturnValue({ doc: mockDoc });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/waitlist", () => {
  it("returns 400 for missing email", async () => {
    const res = await POST(makeRequest({ plan: "pro" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ email: "not-an-email", plan: "pro" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("e-mail");
  });

  it("returns 400 for email exceeding 200 chars", async () => {
    const longEmail = "a".repeat(190) + "@example.com";
    const res = await POST(makeRequest({ email: longEmail, plan: "pro" }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when Firebase Admin is not configured", async () => {
    getDb.mockReturnValue(null);
    const res = await POST(
      makeRequest({ email: "ana@clinica.com.br", plan: "pro" })
    );
    expect(res.status).toBe(503);
  });

  it("saves to waitlist collection with deterministic id", async () => {
    const res = await POST(
      makeRequest({ email: "Ana@Clinica.com.br", plan: "pro" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    expect(mockCollection).toHaveBeenCalledWith("waitlist");
    expect(mockDoc).toHaveBeenCalledWith("pro__ana@clinica.com.br");
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ana@clinica.com.br",
        plan: "pro",
      }),
      { merge: true }
    );
  });

  it("defaults to 'pro' plan for invalid plan value", async () => {
    await POST(makeRequest({ email: "test@test.com", plan: "invalid" }));
    expect(mockDoc).toHaveBeenCalledWith(expect.stringContaining("pro__"));
  });

  it("accepts 'premium' plan", async () => {
    await POST(makeRequest({ email: "test@test.com", plan: "premium" }));
    expect(mockDoc).toHaveBeenCalledWith(expect.stringContaining("premium__"));
  });

  it("treats 'start' as 'pro' (start is available, not waitlisted)", async () => {
    await POST(makeRequest({ email: "test@test.com", plan: "start" }));
    expect(mockDoc).toHaveBeenCalledWith(expect.stringContaining("pro__"));
  });

  it("sends ops notification (best-effort)", async () => {
    await POST(makeRequest({ email: "ana@test.com", plan: "pro" }));
    expect(sendOpsNotify).toHaveBeenCalledWith("waitlist.joined", {
      email: "ana@test.com",
      plan: "pro",
    });
  });

  it("mirrors to Supabase (best-effort)", async () => {
    await POST(makeRequest({ email: "ana@test.com", plan: "pro" }));
    expect(upsertWaitlist).toHaveBeenCalledWith({
      email: "ana@test.com",
      plan: "pro",
    });
  });

  it("does not fail if ops notification fails", async () => {
    sendOpsNotify.mockRejectedValue(new Error("ops down"));
    const res = await POST(
      makeRequest({ email: "ana@test.com", plan: "pro" })
    );
    expect(res.status).toBe(200);
  });

  it("normalizes email to lowercase", async () => {
    await POST(makeRequest({ email: "ANA@Test.COM", plan: "pro" }));
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@test.com" }),
      { merge: true }
    );
  });
});
