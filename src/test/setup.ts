import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { mswServer } from "./msw/server";

// Component tests must never initialize the SDK with a local project key.
// Dedicated SDK tests explicitly unmock this boundary and use a dummy key/MSW.
vi.mock("../analytics/amplitude", () => ({
  sendAmplitudeEvent: vi.fn().mockResolvedValue(undefined),
  trackViewedHomePage: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  vi.stubEnv("VITE_GTM_CONTAINER_ID", "");
  vi.stubEnv("VITE_ANALYTICS_ENVIRONMENT", "development");
  vi.stubEnv("VITE_ANALYTICS_TRAFFIC_TYPE", "qa");
});

afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
  vi.unstubAllEnvs();
});

afterAll(() => {
  mswServer.close();
});
