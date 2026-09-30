import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { mswServer } from "../test/msw/server";
import { FIXTURE_COMPANIES } from "../test/msw/fixtures";
import { renderWithProviders } from "../test/renderWithProviders";
import { CompaniesPage } from "./CompaniesPage";
import { SPECIALTY_OPTIONS } from "../data/companies";

describe("CompaniesPage", () => {
  it("keeps service-only and category-only matches when filters change", async () => {
    const user = userEvent.setup();
    const specialty = SPECIALTY_OPTIONS[1];
    const matches = FIXTURE_COMPANIES.filter((company) => company.services.includes(specialty) || company.category === specialty);
    expect(matches).toHaveLength(2);
    const response = await fetch(`/api/companies?specialty=${encodeURIComponent(specialty)}`);
    const body = await response.json();
    expect(body.data.companies.map((company: { id: string }) => company.id)).toEqual(matches.map((company) => company.id));
    renderWithProviders(<CompaniesPage />, { route: `/companies?specialty=${encodeURIComponent(specialty)}` });
    for (const company of matches) {
      expect(await screen.findByRole("heading", { name: company.name })).toBeInTheDocument();
    }
    const [regionSelect, specialtySelect] = screen.getAllByRole("combobox");
    await user.selectOptions(regionSelect, matches[0].region);
    for (const company of matches) {
      expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    }
    await user.selectOptions(specialtySelect, "all");
    await user.selectOptions(specialtySelect, specialty);
    for (const company of matches) {
      expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("heading", { name: FIXTURE_COMPANIES[1].name })).not.toBeInTheDocument();
    await user.selectOptions(regionSelect, FIXTURE_COMPANIES[1].region);
    for (const company of matches) {
      expect(screen.queryByRole("heading", { name: company.name })).not.toBeInTheDocument();
    }
    await user.selectOptions(regionSelect, "all");
    for (const company of matches) {
      expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("heading", { name: FIXTURE_COMPANIES[1].name })).not.toBeInTheDocument();
  });

  it("shows a loading state before the list arrives", () => {
    renderWithProviders(<CompaniesPage />, { route: "/companies" });
    expect(screen.getByText("업체 정보를 불러오는 중...")).toBeInTheDocument();
  });

  it("lists every company once loaded", async () => {
    renderWithProviders(<CompaniesPage />, { route: "/companies" });
    for (const company of FIXTURE_COMPANIES) {
      expect(
        await screen.findByRole("heading", { name: company.name }),
      ).toBeInTheDocument();
    }
  });

  it("filters the list when a region is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompaniesPage />, { route: "/companies" });
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });

    await user.selectOptions(screen.getByLabelText("지역"), "인천");

    const incheonCompanies = FIXTURE_COMPANIES.filter((c) => c.region === "인천");
    const otherCompanies = FIXTURE_COMPANIES.filter((c) => c.region !== "인천");

    for (const company of incheonCompanies) {
      expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    }
    for (const company of otherCompanies) {
      expect(
        screen.queryByRole("heading", { name: company.name }),
      ).not.toBeInTheDocument();
    }
  });

  it("shows an empty state when no company matches the filters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompaniesPage />, { route: "/companies" });
    await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name });

    await user.selectOptions(screen.getByLabelText("지역"), "인천");
    await user.selectOptions(screen.getByLabelText("전문 분야"), "데크·휴게 공간");

    expect(
      screen.getByText("조건에 맞는 업체가 없습니다."),
    ).toBeInTheDocument();
  });

  it("shows an error state with a retry when the request fails", async () => {
    mswServer.use(
      http.get("/api/companies", () => HttpResponse.error()),
    );
    renderWithProviders(<CompaniesPage />, { route: "/companies" });

    expect(
      await screen.findByText("업체 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("recovers when retry succeeds", async () => {
    const user = userEvent.setup();
    mswServer.use(
      http.get("/api/companies", () => HttpResponse.error(), { once: true }),
    );
    renderWithProviders(<CompaniesPage />, { route: "/companies" });

    await user.click(await screen.findByRole("button", { name: "다시 시도" }));

    expect(
      await screen.findByRole("heading", { name: FIXTURE_COMPANIES[0].name }),
    ).toBeInTheDocument();
  });
});
