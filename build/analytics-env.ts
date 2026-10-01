type Environment = Record<string, string | undefined>;

export function validateAnalyticsDeployment(env: Environment): void {
  if (env.VERCEL !== "1") return;
  const target = env.VERCEL_ENV;
  const expected = target === "production" ? ["production", "external"] :
    target === "preview" ? ["staging", "qa"] : undefined;
  if (!expected) throw new Error("Analytics deployment configuration invalid: VERCEL_ENV");
  const invalid: string[] = [];
  if (!env.VITE_AMPLITUDE_API_KEY?.trim()) invalid.push("VITE_AMPLITUDE_API_KEY");
  if (!/^GTM-[A-Z0-9]+$/.test(env.VITE_GTM_CONTAINER_ID?.trim() ?? "")) invalid.push("VITE_GTM_CONTAINER_ID");
  if (env.VITE_ANALYTICS_ENVIRONMENT !== expected[0]) invalid.push("VITE_ANALYTICS_ENVIRONMENT");
  if (env.VITE_ANALYTICS_TRAFFIC_TYPE !== expected[1]) invalid.push("VITE_ANALYTICS_TRAFFIC_TYPE");
  if (invalid.length) throw new Error(`Analytics deployment configuration invalid: ${invalid.join(", ")}`);
}
