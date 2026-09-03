import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CompanyProvider } from "../context/CompanyContext";
import { CompanyDetailPage } from "./CompanyDetailPage";
import { FIXTURE_COMPANIES } from "../test/msw/fixtures";

function renderDetailPage(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <CompanyProvider>
          <Routes>
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
          </Routes>
        </CompanyProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("CompanyDetailPage", () => {
  const company = FIXTURE_COMPANIES[0];

  it("shows a loading state before the company loads", () => {
    renderDetailPage(`/companies/${company.id}`);
    expect(screen.getByText("업체 상세 정보를 불러오는 중...")).toBeInTheDocument();
  });

  it("renders company details for a valid id", async () => {
    renderDetailPage(`/companies/${company.id}`);
    expect(
      await screen.findByRole("heading", { name: company.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(company.description)).toBeInTheDocument();
  });

  it("reveals contact details only after clicking the inquiry button", async () => {
    const user = userEvent.setup();
    renderDetailPage(`/companies/${company.id}`);
    await screen.findByRole("heading", { name: company.name });

    expect(screen.queryByText(company.phone)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "연락처 확인하기" }),
    );

    expect(screen.getByText(company.phone)).toBeInTheDocument();
    expect(screen.getByText(company.address)).toBeInTheDocument();
  });

  it("shows an empty state for an unknown id", async () => {
    renderDetailPage("/companies/does-not-exist");
    expect(
      await screen.findByText("업체를 찾을 수 없습니다."),
    ).toBeInTheDocument();
  });
});
