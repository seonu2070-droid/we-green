import { StrictMode } from "react";
import { act, render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { sendAmplitudeEvent } from "./amplitude";

beforeEach(() => vi.clearAllMocks());
function renderTracker(initialPath: string) {
  const router = createMemoryRouter([
    { path: "*", element: <AnalyticsProvider><p>Page</p></AnalyticsProvider> },
  ], { initialEntries: [initialPath] });
  render(<StrictMode><RouterProvider router={router} /></StrictMode>);
  return router;
}
function homeCalls() { return vi.mocked(sendAmplitudeEvent).mock.calls.filter(([name]) => name === "Viewed Home Page"); }

describe("page visit tracking", () => {
  it("counts initial home once under StrictMode with the bootstrap mapping", () => {
    renderTracker("/");
    expect(homeCalls()).toHaveLength(1);
    expect(sendAmplitudeEvent).toHaveBeenCalledTimes(1);
    expect(homeCalls()[0][1]).toEqual(expect.objectContaining({
      route_name: "home", page_path_template: "/", prompt_version: "BA400.4", schema_version: "1.0",
    }));
  });

  it("sends only templated routes and does not count query/hash changes", async () => {
    const router = renderTracker("/companies?email=private");
    expect(homeCalls()).toHaveLength(0);
    await act(() => router.navigate("/login"));
    expect(homeCalls()).toHaveLength(0);
    await act(() => router.navigate("/?message=private#faq"));
    expect(homeCalls()).toHaveLength(1);
    await act(() => router.navigate("/?message=another#steps"));
    expect(homeCalls()).toHaveLength(1);
    expect(JSON.stringify(vi.mocked(sendAmplitudeEvent).mock.calls)).not.toContain("private");
  });

  it("counts revisited Back/Forward entries as new visits", async () => {
    const router = renderTracker("/");
    await act(() => router.navigate("/companies"));
    await act(() => router.navigate("/"));
    expect(homeCalls()).toHaveLength(2);
    await act(() => router.navigate(-1));
    await act(() => router.navigate(-1));
    expect(homeCalls()).toHaveLength(3);
    await act(() => router.navigate(1));
    await act(() => router.navigate(1));
    expect(homeCalls()).toHaveLength(4);
    expect(new Set(homeCalls().map(([, properties]) => properties.page_visit_id)).size).toBe(4);
  });

  it("does not treat an unmatched route as a viewed home", () => {
    renderTracker("/unknown");
    expect(sendAmplitudeEvent).not.toHaveBeenCalled();
  });
});
