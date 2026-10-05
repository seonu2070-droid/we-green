import { afterEach, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { mswServer } from "../test/msw/server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  localStorage.removeItem("wegreen:anonymous-device-id");
  window.history.replaceState({}, "", "/");
});

async function sendThroughInstalledSdk(url: string, refresh = false) {
  window.history.replaceState({}, "", url);
  const payloads: { events: Record<string, unknown>[] }[] = [];
  mswServer.use(http.post<never, (typeof payloads)[number]>("https://api2.amplitude.com/2/httpapi", async ({ request }) => {
    const payload = await request.json();
    payloads.push(payload);
    return HttpResponse.json({ code: 200, events_ingested: payload.events.length,
      payload_size_bytes: 0, server_upload_time: Date.now() });
  }));
  for (let index = 0; index < (refresh ? 2 : 1); index++) {
    vi.resetModules();
    vi.doUnmock("./amplitude");
    vi.stubEnv("VITE_AMPLITUDE_API_KEY", "test-ingestion-key");
    const { trackViewedHomePage } = await import("./amplitude");
    await trackViewedHomePage();
    if (refresh) window.history.replaceState({}, "", "/?deviceId=private-changed&ampDeviceId=private-changed-other");
  }
  return payloads;
}

it.each(["deviceId", "ampDeviceId"])("the real SDK rejects arbitrary %s URL identity", async (query) => {
  const payloads = await sendThroughInstalledSdk(`/?${query}=private%40example.com&userId=private-login#private-hash`);
  expect(payloads).toHaveLength(1);
  const event = payloads[0].events[0];
  expect(event.device_id).toMatch(/^wg_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(event.user_id).toBeUndefined();
  expect(JSON.stringify(payloads)).not.toMatch(/private|example\.com/);
});

it.each(["private@example.com", "wg_private@example.com", "wg_not-a-random-uuid"])(
  "the real SDK replaces unsafe stored identity %s", async (stored) => {
    localStorage.setItem("wegreen:anonymous-device-id", stored);
    const payloads = await sendThroughInstalledSdk("/?deviceId=private-url&ampDeviceId=private-other");
    const event = payloads[0].events[0];
    expect(event.device_id).toMatch(/^wg_[0-9a-f-]{36}$/);
    expect(event.device_id).not.toBe(stored);
    expect(JSON.stringify(payloads)).not.toContain("private");
    expect(localStorage.getItem("wegreen:anonymous-device-id")).toBe(event.device_id);
  },
);

it("the real SDK preserves its anonymous identity across refresh despite changed URL identity", async () => {
  const payloads = await sendThroughInstalledSdk("/?deviceId=private-first&ampDeviceId=private-second", true);
  expect(payloads).toHaveLength(2);
  expect(payloads[0].events[0].device_id).toMatch(/^wg_[0-9a-f-]{36}$/);
  expect(payloads[1].events[0].device_id).toBe(payloads[0].events[0].device_id);
  expect(JSON.stringify(payloads)).not.toContain("private");
});

it("the installed SDK sends only the home event without IP, identity, or URL/input values", async () => {
  vi.resetModules();
  vi.doUnmock("./amplitude");
  vi.stubEnv("VITE_AMPLITUDE_API_KEY", "test-ingestion-key");
  window.history.replaceState({}, "", "/?email=private-contact&message=private-ai-input&utm_campaign=private-campaign#private-hash");
  const payloads: { api_key: string; events: Record<string, unknown>[] }[] = [];
  mswServer.use(http.post<never, (typeof payloads)[number]>("https://api2.amplitude.com/2/httpapi", async ({ request }) => {
    const payload = await request.json();
    payloads.push(payload);
    return HttpResponse.json({
      code: 200,
      events_ingested: payload.events.length,
      payload_size_bytes: 0,
      server_upload_time: Date.now(),
    });
  }));
  const { trackViewedHomePage } = await import("./amplitude");
  await trackViewedHomePage();
  expect(payloads).toHaveLength(1);
  expect(payloads[0].api_key).toBe("test-ingestion-key");
  expect(payloads[0].events).toHaveLength(1);
  const event = payloads[0].events[0];
  expect(event.event_type).toBe("Viewed Home Page");
  expect(event.event_properties).toEqual({ prompt_version: "BA400.4" });
  expect(event.ip).toBeUndefined();
  expect(event.user_id).toBeUndefined();
  expect(event.user_properties).toBeUndefined();
  for (const privateValue of ["private-contact", "private-ai-input", "private-campaign", "private-hash"]) {
    expect(JSON.stringify(payloads)).not.toContain(privateValue);
  }
});
