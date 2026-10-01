import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPageVisit, safeProperties, trackEvent, controlledFilter } from "./tracking";
import { sendAmplitudeEvent } from "./amplitude";

beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });
describe("privacy allowlist", () => {
  it("drops unapproved fields and marks explicit QA without login identifiers", () => {
    const visit = createPageVisit("/companies/blue");
    trackEvent("contact_button_clicked", visit, { company_id: "blue", cta_position: "contact_panel",
      email: "private@example.com", phone: "private", prompt: "private", reason: "private", user_id: "private" });
    expect(sendAmplitudeEvent).toHaveBeenCalledExactlyOnceWith("contact_button_clicked", {
      company_id: "blue", cta_position: "contact_panel", schema_version: "1.0",
      environment: "development", traffic_type: "qa", route_name: "company_detail", page_visit_id: visit.id,
    });
  });
  it("rejects invalid IDs/enums and converts uncontrolled filters to other", () => {
    expect(safeProperties("contact_revealed", { company_id: "email@example.com", cta_position: "detail_hero" })).toBeUndefined();
    expect(safeProperties("company_detail_view", { company_id: "blue", source_surface: { toString: () => "directory", secret: "private" } })).toBeUndefined();
    expect(controlledFilter("private query", "region")).toBe("other");
    expect(controlledFilter("private query", "specialty")).toBe("other");
  });
  it("distinguishes AI empty/error and rejects impossible counts", () => {
    expect(safeProperties("ai_recommend_result", { request_id: "request", result_status: "error", error_type: "upstream", result_count: 0, error: "private" }))
      .toEqual({ request_id: "request", result_status: "error", error_type: "upstream" });
    expect(safeProperties("ai_recommend_result", { request_id: "request", result_status: "empty", result_count: 0 }))
      .toEqual({ request_id: "request", result_status: "empty", result_count: 0 });
    expect(safeProperties("ai_recommend_result", { request_id: "request", result_status: "success", result_count: 4 })).toBeUndefined();
    expect(safeProperties("ai_recommend_result", { request_id: "request", result_status: "success", result_count: 0 })).toBeUndefined();
  });
  it("does not send either SDK/dataLayer events when collection is disabled", () => {
    sessionStorage.setItem("wegreen:analytics-disabled", "true");
    const before = (window as Window & { dataLayer?: unknown[] }).dataLayer?.length ?? 0;
    trackEvent("page_view", createPageVisit("/"));
    expect(sendAmplitudeEvent).not.toHaveBeenCalled();
    expect((window as Window & { dataLayer?: unknown[] }).dataLayer?.length ?? 0).toBe(before);
  });
});
