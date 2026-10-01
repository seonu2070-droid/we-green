import { REGION_OPTIONS, SPECIALTY_OPTIONS } from "../data/companies";
import { sendAmplitudeEvent } from "./amplitude";
import { pushToDataLayer } from "./ga4Bridge";

export type EventName = "page_view" | "company_list_view" | "company_filter_applied" |
  "company_card_click" | "company_detail_view" | "contact_revealed" |
  "contact_button_clicked" | "ai_recommend_requested" | "ai_recommend_result";
export type SourceSurface = "directory" | "home_preview" | "ai_recommend" | "direct_or_unknown";
export interface PageVisit {
  id: string;
  pathname: string;
  route: "home" | "company_list" | "company_detail" | "partner_login" | "partner_register" | "partner_register_complete";
  template: string;
}

export function createPageVisit(pathname: string): PageVisit {
  let route: PageVisit["route"] = "home";
  let template = "/";
  if (pathname === "/companies") { route = "company_list"; template = pathname; }
  else if (/^\/companies\/[^/]+$/.test(pathname)) { route = "company_detail"; template = "/companies/:id"; }
  else if (pathname === "/login") { route = "partner_login"; template = pathname; }
  else if (pathname === "/register") { route = "partner_register"; template = pathname; }
  else if (/^\/register\/complete\/[^/]+$/.test(pathname)) { route = "partner_register_complete"; template = "/register/complete/:id"; }
  return { id: crypto.randomUUID(), pathname, route, template };
}

export function collectionDisabled(): boolean {
  const privacyNavigator = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (privacyNavigator.globalPrivacyControl || navigator.doNotTrack === "1") return true;
  try { return sessionStorage.getItem("wegreen:analytics-disabled") === "true"; }
  catch { return true; }
}

export function trafficContext() {
  const value = import.meta.env.VITE_ANALYTICS_ENVIRONMENT;
  const environment = ["development", "staging", "production"].includes(value)
    ? value : import.meta.env.PROD ? "production" : "development";
  const traffic = import.meta.env.VITE_ANALYTICS_TRAFFIC_TYPE;
  const traffic_type = ["internal", "qa", "external"].includes(traffic)
    ? traffic : environment === "production" ? "external" : "internal";
  return { environment, traffic_type };
}

export function controlledFilter(value: string, kind: "region" | "specialty"): string {
  const options: readonly string[] = kind === "region" ? REGION_OPTIONS : SPECIALTY_OPTIONS;
  return value === "all" || options.includes(value) ? value : "other";
}

export function isSourceSurface(value: unknown): value is SourceSurface {
  return typeof value === "string" && ["directory", "home_preview", "ai_recommend", "direct_or_unknown"].includes(value);
}

// Each event gets a separate allowlist. Unknown fields are dropped; missing or
// invalid required values drop the event rather than exporting arbitrary text.
const fields: Record<EventName, string[]> = {
  page_view: [],
  company_list_view: ["filter_region", "filter_specialty", "result_count"],
  company_filter_applied: ["changed_filter", "filter_region", "filter_specialty", "result_count"],
  company_card_click: ["company_id", "source_surface", "position"],
  company_detail_view: ["company_id", "source_surface"],
  contact_revealed: ["company_id", "cta_position"],
  contact_button_clicked: ["company_id", "cta_position"],
  ai_recommend_requested: ["request_id"],
  ai_recommend_result: ["request_id", "result_status"],
};

function valid(field: string, value: unknown): boolean {
  if (["company_id", "request_id"].includes(field)) return typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
  if (["result_count", "position", "duration_ms"].includes(field)) return Number.isInteger(value) && Number(value) >= (field === "position" ? 1 : 0);
  if (field === "source_surface") return isSourceSurface(value);
  if (typeof value !== "string") return false;
  if (field === "changed_filter") return ["region", "specialty"].includes(String(value));
  if (field === "cta_position") return ["detail_hero", "inquiry_section", "contact_panel"].includes(String(value));
  if (field === "result_status") return ["success", "empty", "error"].includes(String(value));
  if (field === "error_type") return ["unavailable", "upstream", "validation", "network", "other"].includes(String(value));
  if (field === "filter_region") return ["all", "other", ...REGION_OPTIONS].includes(String(value));
  if (field === "filter_specialty") return ["all", "other", ...SPECIALTY_OPTIONS].includes(String(value));
  return false;
}

export function safeProperties(name: EventName, raw: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!fields[name] || fields[name].some(field => !valid(field, raw[field]))) return;
  const props: Record<string, unknown> = {};
  for (const field of fields[name]) props[field] = raw[field];
  if (name === "ai_recommend_result") {
    if (raw.result_status === "error") {
      if (!valid("error_type", raw.error_type)) return;
      props.error_type = raw.error_type;
    } else {
      if (!valid("result_count", raw.result_count) || Number(raw.result_count) > 3 ||
        (raw.result_status === "empty" ? raw.result_count !== 0 : Number(raw.result_count) === 0)) return;
      props.result_count = raw.result_count;
    }
  }
  return props;
}

export function trackEvent(name: EventName, visit: PageVisit, raw: Record<string, unknown> = {}): void {
  if (collectionDisabled()) return;
  if (visit.route === "home" && visit.pathname !== "/") return;
  const props = safeProperties(name, raw);
  if (!props) return;
  const common = { schema_version: "1.0", ...trafficContext(), route_name: visit.route, page_visit_id: visit.id };
  const properties = { ...common, ...props, ...(name === "page_view" ? { page_path_template: visit.template } : {}) };
  const amplitudeName = name === "page_view" && visit.route === "home" ? "Viewed Home Page" : name;
  void sendAmplitudeEvent(amplitudeName, {
    ...properties,
    ...(amplitudeName === "Viewed Home Page" ? { prompt_version: "BA400.4" } : {}),
  });
  pushToDataLayer(name, visit, properties);
}
