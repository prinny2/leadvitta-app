import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getStoredTheme", () => {
  it("returns 'dark' when window is undefined (SSR)", async () => {
    vi.stubGlobal("window", undefined);
    const { getStoredTheme } = await import("@/lib/theme");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns stored 'light' value from localStorage", async () => {
    const mockStorage = { getItem: vi.fn().mockReturnValue("light") };
    vi.stubGlobal("window", { localStorage: mockStorage });
    vi.stubGlobal("localStorage", mockStorage);
    const { getStoredTheme } = await import("@/lib/theme");
    expect(getStoredTheme()).toBe("light");
  });

  it("returns stored 'dark' value from localStorage", async () => {
    const mockStorage = { getItem: vi.fn().mockReturnValue("dark") };
    vi.stubGlobal("window", { localStorage: mockStorage });
    vi.stubGlobal("localStorage", mockStorage);
    const { getStoredTheme } = await import("@/lib/theme");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns 'dark' for unrecognized value", async () => {
    const mockStorage = { getItem: vi.fn().mockReturnValue("neon") };
    vi.stubGlobal("window", { localStorage: mockStorage });
    vi.stubGlobal("localStorage", mockStorage);
    const { getStoredTheme } = await import("@/lib/theme");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns 'dark' for null (no stored value)", async () => {
    const mockStorage = { getItem: vi.fn().mockReturnValue(null) };
    vi.stubGlobal("window", { localStorage: mockStorage });
    vi.stubGlobal("localStorage", mockStorage);
    const { getStoredTheme } = await import("@/lib/theme");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns 'dark' when localStorage throws", async () => {
    const mockStorage = {
      getItem: vi.fn().mockImplementation(() => {
        throw new Error("quota exceeded");
      }),
    };
    vi.stubGlobal("window", { localStorage: mockStorage });
    vi.stubGlobal("localStorage", mockStorage);
    const { getStoredTheme } = await import("@/lib/theme");
    expect(getStoredTheme()).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("applies 'light-theme' class for light theme", async () => {
    const classList = { remove: vi.fn(), add: vi.fn() };
    vi.stubGlobal("document", { documentElement: { classList } });
    const mockStorage = { setItem: vi.fn() };
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("window", { localStorage: mockStorage });
    const { applyTheme } = await import("@/lib/theme");

    applyTheme("light");

    expect(classList.remove).toHaveBeenCalledWith("light-theme", "dark-theme");
    expect(classList.add).toHaveBeenCalledWith("light-theme");
    expect(mockStorage.setItem).toHaveBeenCalledWith("lb_theme", "light");
  });

  it("applies 'dark-theme' class for dark theme", async () => {
    const classList = { remove: vi.fn(), add: vi.fn() };
    vi.stubGlobal("document", { documentElement: { classList } });
    const mockStorage = { setItem: vi.fn() };
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("window", { localStorage: mockStorage });
    const { applyTheme } = await import("@/lib/theme");

    applyTheme("dark");

    expect(classList.add).toHaveBeenCalledWith("dark-theme");
    expect(mockStorage.setItem).toHaveBeenCalledWith("lb_theme", "dark");
  });

  it("does not throw when localStorage.setItem fails", async () => {
    const classList = { remove: vi.fn(), add: vi.fn() };
    vi.stubGlobal("document", { documentElement: { classList } });
    const mockStorage = {
      setItem: vi.fn().mockImplementation(() => {
        throw new Error("quota exceeded");
      }),
    };
    vi.stubGlobal("localStorage", mockStorage);
    vi.stubGlobal("window", { localStorage: mockStorage });
    const { applyTheme } = await import("@/lib/theme");

    expect(() => applyTheme("dark")).not.toThrow();
    expect(classList.add).toHaveBeenCalledWith("dark-theme");
  });
});
