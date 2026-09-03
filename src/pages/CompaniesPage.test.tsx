import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { CompaniesPage } from "./CompaniesPage";
import { MOCK_COMPANIES } from "../data/companies";

describe("CompaniesPage", () => {
  it("lists every mock company by default", () => {
    renderWithProviders(<CompaniesPage />, { route: "/companies" });
    for (const company of MOCK_COMPANIES) {
      expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    }
  });

  it("filters the list when a region is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompaniesPage />, { route: "/companies" });

    await user.selectOptions(screen.getByLabelText("지역"), "인천");

    const incheonCompanies = MOCK_COMPANIES.filter((c) => c.region === "인천");
    const otherCompanies = MOCK_COMPANIES.filter((c) => c.region !== "인천");

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

    await user.selectOptions(screen.getByLabelText("지역"), "인천");
    await user.selectOptions(screen.getByLabelText("전문 분야"), "데크·휴게 공간");

    expect(
      screen.getByText("조건에 맞는 업체가 없습니다."),
    ).toBeInTheDocument();
  });
});
