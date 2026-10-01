import { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { sendAmplitudeEvent } from "./amplitude";
import { CompanyProvider } from "../context/CompanyContext";
import { AuthProvider } from "../context/AuthContext";
import { CompaniesPage } from "../pages/CompaniesPage";
import { CompanyDetailPage } from "../pages/CompanyDetailPage";
import { AiRecommendSection } from "../components/home/AiRecommendSection";
import { FIXTURE_COMPANIES } from "../test/msw/fixtures";
import { mswServer } from "../test/msw/server";

beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); localStorage.clear(); });
function calls(name: string) {
  return vi.mocked(sendAmplitudeEvent).mock.calls.filter(([event]) => event === name).map(([, properties]) => properties);
}
function renderFlow(route = "/companies") {
  return render(<StrictMode><MemoryRouter initialEntries={[route]}><AuthProvider><CompanyProvider>
    <Routes><Route element={<AnalyticsProvider><Link to="/companies/care">Other company</Link><Link to="/companies">Directory</Link><Outlet /></AnalyticsProvider>}>
      <Route index element={<AiRecommendSection />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="companies/:id" element={<CompanyDetailPage />} />
    </Route></Routes>
  </CompanyProvider></AuthProvider></MemoryRouter></StrictMode>);
}

describe("directory/contact tracking", () => {
  it("tracks ready list once, changed filters after render, and no duplicate page views", async () => {
    const user = userEvent.setup();
    renderFlow("/companies?region=all");
    expect(calls("company_list_view")).toHaveLength(0);
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });
    expect(calls("company_list_view")).toHaveLength(1);
    expect(calls("company_list_view")[0].result_count).toBe(FIXTURE_COMPANIES.length);
    expect(calls("company_filter_applied")).toHaveLength(0);
    await user.selectOptions(screen.getByLabelText("지역"), "인천");
    await user.selectOptions(screen.getByLabelText("지역"), "인천");
    expect(calls("company_filter_applied")).toHaveLength(1);
    await user.selectOptions(screen.getByLabelText("전문 분야"), "데크·휴게 공간");
    expect(calls("company_filter_applied")).toHaveLength(2);
    expect(calls("company_filter_applied")[1]).toEqual(expect.objectContaining({ changed_filter: "specialty", result_count: 0 }));
    expect(calls("page_view")).toHaveLength(1);
    expect(calls("company_list_view")).toHaveLength(1);
  });

  it("counts a normal zero list but never loading/error as zero", async () => {
    mswServer.use(http.get("/api/companies", () => HttpResponse.json({ data: { companies: [] } })));
    renderFlow();
    await screen.findByText("조건에 맞는 업체가 없습니다.");
    expect(calls("company_list_view")).toHaveLength(1);
    expect(calls("company_list_view")[0].result_count).toBe(0);
  });

  it("does not track list/details on a failed request", async () => {
    mswServer.use(http.get("/api/companies", () => HttpResponse.error()));
    renderFlow("/companies/blue");
    await screen.findByText("업체 정보를 불러오지 못했습니다.");
    expect(calls("company_list_view")).toHaveLength(0);
    expect(calls("company_detail_view")).toHaveLength(0);
    expect(calls("contact_revealed")).toHaveLength(0);
  });

  it("keeps company/source consistent and separates reveal from simulated contact completion", async () => {
    const user = userEvent.setup();
    const { container } = renderFlow();
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });
    await user.click(screen.getAllByRole("link", { name: /업체 상세보기/ })[0]);
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });
    expect(calls("company_card_click")).toHaveLength(1);
    expect(calls("company_card_click")[0]).toEqual(expect.objectContaining({ company_id: "blue", source_surface: "directory", position: 1 }));
    expect(calls("company_detail_view")[0]).toEqual(expect.objectContaining({ company_id: "blue", source_surface: "directory" }));
    expect(screen.queryByRole("button", { name: "연락하기" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "이 업체에 문의하기" }));
    await user.click(screen.getByRole("button", { name: "연락처 확인하기" }));
    expect(calls("contact_revealed")).toHaveLength(1);
    expect(calls("contact_revealed")[0].cta_position).toBe("detail_hero");
    expect(calls("contact_button_clicked")).toHaveLength(0);
    const button = screen.getByRole("button", { name: "연락하기" });
    expect(button).toHaveAttribute("type", "button");
    button.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("실제 전화나 메시지는 발송되지 않습니다.");
    const completed = screen.getByRole("button", { name: "문의 완료" });
    await user.click(completed);
    expect(completed).toBeDisabled();
    expect(calls("contact_button_clicked")).toHaveLength(1);
    expect(calls("contact_button_clicked")[0].company_id).toBe("blue");
    expect(container.querySelector('a[href^="tel:"],a[href^="mailto:"]')).toBeNull();
    await user.click(screen.getByRole("link", { name: "Other company" }));
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[1].name });
    expect(screen.queryByText(FIXTURE_COMPANIES[1].phone)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "연락하기" })).not.toBeInTheDocument();
    expect(calls("contact_revealed")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "연락처 확인하기" }));
    await user.click(screen.getByRole("button", { name: "연락하기" }));
    expect(calls("contact_revealed")).toHaveLength(2);
    expect(calls("contact_button_clicked")[1].company_id).toBe("care");
  });

  it("offers the same simulated completion when phone data is absent", async () => {
    mswServer.use(http.get("/api/companies", () => HttpResponse.json({ data: { companies: [{ ...FIXTURE_COMPANIES[0], phone: "" }] } })));
    const user = userEvent.setup();
    renderFlow("/companies/blue");
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });
    await user.click(screen.getByRole("button", { name: "연락처 확인하기" }));
    await user.click(screen.getByRole("button", { name: "연락하기" }));
    expect(calls("contact_button_clicked")).toHaveLength(1);
    expect(calls("company_detail_view")[0].source_surface).toBe("direct_or_unknown");
  });

  it("does not record detail/contact for an unknown company", async () => {
    renderFlow("/companies/not-found");
    await screen.findByText("업체를 찾을 수 없습니다.");
    expect(calls("company_detail_view")).toHaveLength(0);
    expect(calls("contact_revealed")).toHaveLength(0);
    expect(calls("contact_button_clicked")).toHaveLength(0);
  });
});

describe("AI privacy and outcomes", () => {
  const message = "Private freeform QA input only";
  async function submit() {
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox"), message);
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));
    return user;
  }
  it("does not track invalid input", async () => {
    renderFlow("/");
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox"), "abc");
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));
    expect(calls("ai_recommend_requested")).toHaveLength(0);
    expect(calls("ai_recommend_result")).toHaveLength(0);
  });
  it("correlates visible success without exporting input or recommendation text", async () => {
    renderFlow("/");
    await submit();
    await screen.findByText(FIXTURE_COMPANIES[0].name);
    expect(calls("ai_recommend_requested")).toHaveLength(1);
    expect(calls("ai_recommend_result")).toHaveLength(1);
    expect(calls("ai_recommend_result")[0]).toEqual(expect.objectContaining({ request_id: calls("ai_recommend_requested")[0].request_id, result_status: "success", result_count: 1 }));
    const data = JSON.stringify(vi.mocked(sendAmplitudeEvent).mock.calls);
    expect(data).not.toContain(message);
    expect(data).not.toContain("테스트 추천 이유입니다.");
  });
  it.each([[503, "unavailable"], [502, "upstream"], [400, "validation"], [500, "other"]])("classifies HTTP %s without exporting error text", async (status, errorType) => {
    mswServer.use(http.post("/api/recommend", () => HttpResponse.json({ error: { message: "Private server error" } }, { status: Number(status) })));
    renderFlow("/");
    await submit();
    await screen.findByRole("alert");
    expect(calls("ai_recommend_result")[0]).toEqual(expect.objectContaining({ result_status: "error", error_type: errorType }));
    expect(calls("ai_recommend_result")[0]).not.toHaveProperty("result_count");
    expect(JSON.stringify(vi.mocked(sendAmplitudeEvent).mock.calls)).not.toContain("Private server error");
  });
  it("separates empty results from network errors", async () => {
    mswServer.use(http.post("/api/recommend", () => HttpResponse.json({ data: { recommendations: [] } }), { once: true }));
    mswServer.use(http.post("/api/recommend", () => HttpResponse.error()));
    // Register the one-time success last so it handles the first request.
    mswServer.use(http.post("/api/recommend", () => HttpResponse.json({ data: { recommendations: [] } }), { once: true }));
    renderFlow("/");
    const user = await submit();
    await waitFor(() => expect(calls("ai_recommend_result")).toHaveLength(1));
    expect(calls("ai_recommend_result")[0]).toEqual(expect.objectContaining({ result_status: "empty", result_count: 0 }));
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));
    await screen.findByRole("alert");
    expect(calls("ai_recommend_result")[1]).toEqual(expect.objectContaining({ result_status: "error", error_type: "network" }));
  });
  it("blocks duplicate submissions and does not report results after leaving", async () => {
    let finish!: () => void;
    let requests = 0;
    mswServer.use(http.post("/api/recommend", async () => {
      requests++;
      await new Promise<void>(resolve => { finish = resolve; });
      return HttpResponse.json({ data: { recommendations: [] } });
    }));
    renderFlow("/");
    const user = await submit();
    await waitFor(() => expect(requests).toBe(1));
    await user.click(screen.getByRole("button", { name: "AI에게 추천받기" }));
    expect(calls("ai_recommend_requested")).toHaveLength(1);
    await user.click(screen.getByRole("link", { name: "Directory" }));
    finish();
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });
    expect(calls("ai_recommend_result")).toHaveLength(0);
    expect(requests).toBe(1);
  });
});
