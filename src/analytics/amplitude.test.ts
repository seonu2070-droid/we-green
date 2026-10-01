import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  track: vi.fn(),
  createInstance: vi.fn(),
}));
vi.mock("@amplitude/unified", () => ({ createInstance: sdk.createInstance }));

beforeEach(() => {
  vi.resetModules();
  vi.doUnmock("./amplitude");
  vi.clearAllMocks();
  vi.stubEnv("VITE_AMPLITUDE_API_KEY", "test-ingestion-key");
  sdk.init.mockReturnValue({ promise: Promise.resolve() });
  sdk.track.mockReturnValue({ promise: Promise.resolve() });
  sdk.createInstance.mockReturnValue({ init: sdk.init, track: sdk.track });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("home analytics", () => {
  it("initializes once and sends only the approved event and property", async () => {
    const { trackViewedHomePage } = await import("./amplitude");
    await Promise.all([trackViewedHomePage(), trackViewedHomePage()]);
    expect(sdk.createInstance).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledExactlyOnceWith("test-ingestion-key", undefined, {
      deviceId: expect.stringMatching(/^wg_[0-9a-f-]{36}$/),
      identityStorage: "none",
      autocapture: false,
      remoteConfig: { fetchRemoteConfig: false },
      trackingOptions: { ipAddress: false },
      enableDiagnostics: false,
    });
    expect(sdk.track.mock.calls).toEqual([
      ["Viewed Home Page", { prompt_version: "BA400.4" }],
      ["Viewed Home Page", { prompt_version: "BA400.4" }],
    ]);
  });

  it.each([undefined, "", "   "])("does not initialize or send with missing key %j", async (key) => {
    vi.stubEnv("VITE_AMPLITUDE_API_KEY", key);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { trackViewedHomePage } = await import("./amplitude");
    await trackViewedHomePage();
    await trackViewedHomePage();
    expect(sdk.createInstance).not.toHaveBeenCalled();
    expect(sdk.track).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      "Amplitude is disabled: VITE_AMPLITUDE_API_KEY is missing.",
    );
  });

  it("does not track before initialization completes", async () => {
    let resolveInit!: () => void;
    sdk.init.mockReturnValue({ promise: new Promise<void>((resolve) => { resolveInit = resolve; }) });
    const { trackViewedHomePage } = await import("./amplitude");
    const pending = trackViewedHomePage();
    expect(sdk.track).not.toHaveBeenCalled();
    resolveInit();
    await pending;
    expect(sdk.track).toHaveBeenCalledTimes(1);
  });

  it("contains SDK failures without logging the error or key", async () => {
    sdk.init.mockImplementation(() => ({ promise: Promise.reject(new Error("private details")) }));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { trackViewedHomePage } = await import("./amplitude");
    await expect(trackViewedHomePage()).resolves.toBeUndefined();
    expect(sdk.track).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledExactlyOnceWith("Amplitude could not send an analytics event.");
  });
});
