import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CompanyProvider } from "../context/CompanyContext";
import { CompanyDetailPage } from "./CompanyDetailPage";
import { MOCK_COMPANIES } from "../data/companies";

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
  const company = MOCK_COMPANIES[0];

  it("renders company details for a valid id", () => {
    renderDetailPage(`/companies/${company.id}`);
    expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    expect(screen.getByText(company.description)).toBeInTheDocument();
  });

  it("reveals contact details only after clicking the inquiry button", async () => {
    const user = userEvent.setup();
    renderDetailPage(`/companies/${company.id}`);

    expect(screen.queryByText(company.phone)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "연락처 확인하기" }),
    );

    expect(screen.getByText(company.phone)).toBeInTheDocument();
    expect(screen.getByText(company.address)).toBeInTheDocument();
  });

  it("shows an empty state for an unknown id", () => {
    renderDetailPage("/companies/does-not-exist");
    expect(screen.getByText("업체를 찾을 수 없습니다.")).toBeInTheDocument();
  });
});
