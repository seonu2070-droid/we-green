import type { EventName, PageVisit } from "./tracking";

export interface GtmMessage {
  event?: "wegreen_page_view" | "wegreen_contact_button_clicked" | "gtm.js";
  wg_page_location: string;
  wg_page_title: string;
  wg_page_referrer: string;
  wg_environment: string;
  wg_traffic_type: string;
  wg_debug_mode: boolean;
  wg_button_id?: "company_contact";
  wg_button_location?: "contact_panel";
  "gtm.start"?: number;
}

const channels: Record<string, { medium: string; content: string }> = {
  kakaotalk: { medium: "social", content: "group_share_a" },
  naver_cafe: { medium: "referral", content: "community_post_a" },
  instagram: { medium: "social", content: "profile_link_a" },
};
const titles: Record<PageVisit["route"], string> = {
  home: "WE:GREEN", company_list: "업체 찾기 | WE:GREEN", company_detail: "업체 상세 | WE:GREEN",
  partner_login: "파트너 로그인 | WE:GREEN", partner_register: "업체 등록 | WE:GREEN",
  partner_register_complete: "등록 완료 | WE:GREEN",
};
let priorLocation: string | undefined;
let pageContext: GtmMessage | undefined;
let initialized = false;

export function sanitizedPageLocation(visit: PageVisit, href: string, includeCampaign = true): string {
  const input = new URL(href);
  const safe = new URL(visit.template, input.origin);
  const source = input.searchParams.get("utm_source") ?? "";
  const channel = channels[source];
  if (includeCampaign && channel && input.searchParams.get("utm_medium") === channel.medium &&
    input.searchParams.get("utm_campaign") === "wegreen_mission9_1" &&
    input.searchParams.get("utm_content") === channel.content) {
    for (const field of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      safe.searchParams.set(field, input.searchParams.get(field)!);
    }
  }
  return safe.toString();
}

function initialReferrer(): string {
  try {
    const origin = new URL(document.referrer).origin;
    return origin === location.origin ? "" : origin;
  } catch { return ""; }
}

function dataLayer(): GtmMessage[] {
  const target = window as Window & { dataLayer?: GtmMessage[] };
  target.dataLayer ??= [];
  return target.dataLayer;
}

function loadGtm(context: GtmMessage): void {
  if (initialized) return;
  initialized = true;
  const containerId = import.meta.env.VITE_GTM_CONTAINER_ID?.trim();
  if (!/^GTM-[A-Z0-9]+$/.test(containerId ?? "")) return;
  // Safe defaults must exist before any Google tag code runs.
  dataLayer().push({ ...context, "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);
}

export function pushToDataLayer(name: EventName, visit: PageVisit, properties: Record<string, unknown>): void {
  if (name !== "page_view" && name !== "contact_button_clicked") return;
  if (name === "page_view") {
    const safeLocation = sanitizedPageLocation(visit, location.href, priorLocation === undefined);
    pageContext = {
      wg_page_location: safeLocation, wg_page_title: titles[visit.route],
      wg_page_referrer: priorLocation ?? initialReferrer(),
      wg_environment: String(properties.environment), wg_traffic_type: String(properties.traffic_type),
      wg_debug_mode: properties.traffic_type === "qa",
    };
    loadGtm(pageContext);
    dataLayer().push({ ...pageContext, event: "wegreen_page_view" });
    priorLocation = safeLocation;
  } else if (pageContext) {
    dataLayer().push({ ...pageContext, event: "wegreen_contact_button_clicked",
      wg_button_id: "company_contact", wg_button_location: "contact_panel" });
  }
}
