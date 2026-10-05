import { expect, it } from "vitest";
import { validateAnalyticsDeployment } from "./analytics-env.ts";

const configured = {
  VERCEL: "1", VERCEL_ENV: "production", VITE_AMPLITUDE_API_KEY: "private-key-canary",
  VITE_GTM_CONTAINER_ID: "GTM-TEST123", VITE_ANALYTICS_ENVIRONMENT: "production",
  VITE_ANALYTICS_TRAFFIC_TYPE: "external",
};

it("keeps ordinary local builds optional", () => {
  expect(() => validateAnalyticsDeployment({})).not.toThrow();
});
it.each([
  ["production", "production", "external"], ["preview", "staging", "qa"],
])("accepts the explicit safe %s classification", (target, environment, traffic) => {
  expect(() => validateAnalyticsDeployment({ ...configured, VERCEL_ENV: target,
    VITE_ANALYTICS_ENVIRONMENT: environment, VITE_ANALYTICS_TRAFFIC_TYPE: traffic })).not.toThrow();
});
it.each(["VITE_AMPLITUDE_API_KEY", "VITE_GTM_CONTAINER_ID", "VITE_ANALYTICS_ENVIRONMENT", "VITE_ANALYTICS_TRAFFIC_TYPE"])(
  "rejects missing %s without exposing values", (key) => {
    let error: unknown;
    try { validateAnalyticsDeployment({ ...configured, [key]: "" }); } catch (caught) { error = caught; }
    expect(error).toBeInstanceOf(Error);
    const message = error instanceof Error ? error.message : "";
    expect(message).toContain(key);
    expect(message).not.toContain("private-key-canary");
  },
);
it("rejects preview carrying the production/external classification", () => {
  expect(() => validateAnalyticsDeployment({ ...configured, VERCEL_ENV: "preview" }))
    .toThrow("VITE_ANALYTICS_ENVIRONMENT, VITE_ANALYTICS_TRAFFIC_TYPE");
});
it("rejects invalid container and missing deployment target without echoing them", () => {
  expect(() => validateAnalyticsDeployment({ ...configured, VITE_GTM_CONTAINER_ID: "private@example.com" }))
    .toThrow("Analytics deployment configuration invalid: VITE_GTM_CONTAINER_ID");
  expect(() => validateAnalyticsDeployment({ ...configured, VERCEL_ENV: undefined }))
    .toThrow("Analytics deployment configuration invalid: VERCEL_ENV");
});
