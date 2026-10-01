import type * as amplitude from "@amplitude/unified";
import { anonymousDeviceId } from "./anonymousIdentity";

let initialization: Promise<amplitude.UnifiedClient> | undefined;
let warnedMissingKey = false;
let warnedFailure = false;

async function getAnalytics(): Promise<amplitude.UnifiedClient | undefined> {
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY?.trim();
  if (!apiKey) {
    if (!warnedMissingKey) {
      console.warn("Amplitude is disabled: VITE_AMPLITUDE_API_KEY is missing.");
      warnedMissingKey = true;
    }
    return;
  }

  if (!initialization) {
    initialization = (async () => {
      const amplitude = await import("@amplitude/unified");
      const analytics = amplitude.createInstance();
      // initAll also starts Replay, Experiment, and Engagement. Use analytics only.
      // Unified forwards three arguments to Browser.init; use its three-argument
      // overload explicitly so privacy options are not interpreted as a user ID.
      await analytics.init(apiKey, undefined, {
        deviceId: anonymousDeviceId(),
        identityStorage: "none",
        autocapture: false,
        remoteConfig: { fetchRemoteConfig: false },
        trackingOptions: { ipAddress: false },
        enableDiagnostics: false,
      }).promise;
      return analytics;
    })();
  }
  return initialization;
}

export async function sendAmplitudeEvent(name: string, properties: Record<string, unknown>): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (analytics) {
      await analytics.track(name, properties).promise;
    }
  } catch {
    // Analytics must not interrupt the application or log payloads/credentials.
    if (!warnedFailure) {
      console.warn("Amplitude could not send an analytics event.");
      warnedFailure = true;
    }
  }
}

// Keep the verified first-event contract available for installation QA.
export function trackViewedHomePage(): Promise<void> {
  return sendAmplitudeEvent("Viewed Home Page", { prompt_version: "BA400.4" });
}
