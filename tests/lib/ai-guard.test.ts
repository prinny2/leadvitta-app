import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetAiGuardForTests, enforceAiDailyLimit } from "@/lib/ai-guard";

function request(ip = "192.0.2.1") {
  return new Request("http://localhost:3000/api/generate", {
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  __resetAiGuardForTests();
  vi.stubEnv("AI_ANON_DAILY_LIMIT", "2");
  vi.stubEnv("AI_USER_DAILY_LIMIT", "2");
  vi.stubEnv("AI_GLOBAL_DAILY_LIMIT", "100");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  __resetAiGuardForTests();
});

describe("enforceAiDailyLimit", () => {
  it("limits anonymous callers by IP across routes and returns Retry-After", async () => {
    expect(enforceAiDailyLimit(request("198.51.100.2"))).toBeNull();
    expect(enforceAiDailyLimit(request("198.51.100.2"))).toBeNull();
    const rejected = enforceAiDailyLimit(request("198.51.100.2"));
    expect(rejected?.status).toBe(429);
    expect(rejected?.headers.get("Retry-After")).toMatch(/^\d+$/);
    await expect(rejected?.json()).resolves.toMatchObject({ dailyLimit: true });
  });

  it("limits logged-in callers by uid", () => {
    expect(enforceAiDailyLimit(request(), { uid: "user-1", paid: true })).toBeNull();
    expect(enforceAiDailyLimit(request("192.0.2.2"), { uid: "user-1" })).toBeNull();
    expect(enforceAiDailyLimit(request(), { uid: "user-1" })?.status).toBe(429);
    expect(enforceAiDailyLimit(request(), { uid: "user-2" })).toBeNull();
  });

  it("applies the global process cap and logs once per local day", () => {
    vi.stubEnv("AI_GLOBAL_DAILY_LIMIT", "1");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(enforceAiDailyLimit(request("192.0.2.1"))).toBeNull();
    expect(enforceAiDailyLimit(request("192.0.2.2"))?.status).toBe(429);
    expect(enforceAiDailyLimit(request("192.0.2.3"))?.status).toBe(429);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("[ai-guard] limite global diário atingido");
  });

  it("resets at São Paulo local midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T02:59:00.000Z"));
    vi.stubEnv("AI_ANON_DAILY_LIMIT", "1");
    expect(enforceAiDailyLimit(request())?.status).not.toBe(429);
    expect(enforceAiDailyLimit(request())?.status).toBe(429);
    vi.setSystemTime(new Date("2026-11-03T03:00:00.000Z"));
    expect(enforceAiDailyLimit(request())?.status).not.toBe(429);
  });
});
