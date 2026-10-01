import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.restoreAllMocks(); localStorage.removeItem("wegreen:anonymous-device-id"); });

it("uses one in-memory anonymous ID when storage is unavailable", async () => {
  vi.resetModules();
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  const { anonymousDeviceId } = await import("./anonymousIdentity");
  const first = anonymousDeviceId();
  expect(first).toMatch(/^wg_[0-9a-f-]{36}$/);
  expect(anonymousDeviceId()).toBe(first);
});

it("keeps the current page identity stable if persistence writes fail", async () => {
  vi.resetModules();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  const { anonymousDeviceId } = await import("./anonymousIdentity");
  expect(anonymousDeviceId()).toBe(anonymousDeviceId());
});
