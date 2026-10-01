import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPageVisit } from "./tracking";

beforeEach(() => {
  vi.resetModules();
  delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
});
afterEach(() => {
  window.history.replaceState({}, "", "/");
  document.querySelectorAll('script[src*="googletagmanager"]').forEach(script => script.remove());
});
const properties = { environment: "development", traffic_type: "qa" };
function layer() { return (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []; }
describe("GTM bridge", () => {
  it("loads nothing without a valid container and uses only the two atomic events", async () => {
    const { pushToDataLayer } = await import("./ga4Bridge");
    const visit = createPageVisit("/");
    pushToDataLayer("page_view", visit, properties);
    pushToDataLayer("company_list_view", visit, properties);
    pushToDataLayer("contact_button_clicked", visit, properties);
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(layer().map(row => row.event)).toEqual(["wegreen_page_view", "wegreen_contact_button_clicked"]);
    expect(layer()[1]).toEqual(expect.objectContaining({ wg_button_id: "company_contact", wg_button_location: "contact_panel" }));
  });
  it.each([
    ["kakaotalk", "social", "group_share_a"],
    ["naver_cafe", "referral", "community_post_a"],
    ["instagram", "social", "profile_link_a"],
  ])("retains only the planned %s UTM on initial entry", async (source, medium, content) => {
    const { sanitizedPageLocation } = await import("./ga4Bridge");
    const url = `https://example.com/?utm_source=${source}&utm_medium=${medium}&utm_campaign=wegreen_mission9_1&utm_content=${content}&email=private#secret`;
    const safe = sanitizedPageLocation(createPageVisit("/"), url);
    expect(safe).toContain(`utm_source=${source}`);
    expect(safe).not.toContain("private");
    expect(safe).not.toContain("secret");
    expect(sanitizedPageLocation(createPageVisit("/"), url, false)).toBe("https://example.com/");
  });
  it("sets safe defaults before GTM, refreshes SPA context and drops arbitrary query values", async () => {
    vi.stubEnv("VITE_GTM_CONTAINER_ID", "GTM-TEST123");
    const { pushToDataLayer } = await import("./ga4Bridge");
    window.history.replaceState({}, "", "/?email=private&utm_source=private");
    pushToDataLayer("page_view", createPageVisit("/"), properties);
    pushToDataLayer("page_view", createPageVisit("/companies/blue"), properties);
    expect(layer()[0].event).toBe("gtm.js");
    expect(layer()[0].wg_page_location).toBe(`${location.origin}/`);
    expect(layer()[1].event).toBe("wegreen_page_view");
    expect(layer()[2].wg_page_location).toBe(`${location.origin}/companies/:id`);
    expect(layer()[2].wg_page_referrer).toBe(`${location.origin}/`);
    expect(JSON.stringify(layer())).not.toContain("private");
    expect(JSON.stringify(layer())).not.toContain("blue");
    expect(document.querySelectorAll('script[src*="googletagmanager"]')).toHaveLength(1);
  });
  it("keeps production debug mode false", async () => {
    const { pushToDataLayer } = await import("./ga4Bridge");
    pushToDataLayer("page_view", createPageVisit("/"), { environment: "production", traffic_type: "external" });
    expect(layer()[0].wg_debug_mode).toBe(false);
  });
});
