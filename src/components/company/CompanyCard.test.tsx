import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Company } from "../../types";
import { CompanyCard } from "./CompanyCard";

const company: Company = {
  id: "blue",
  name: "푸른정원 조경",
  location: "경기 포천",
  region: "경기",
  category: "주택 정원 조성",
  specialties: ["주택 정원 조성"],
  tagline: "가족의 일상을 담는 주택 정원 전문",
  area: "경기 포천",
  address: "경기 포천시",
  phone: "031-123-4567",
  career: "12년",
  caseCount: "대표 사례 28건",
  status: "상담 가능",
  image: "/assets/images/company-1.webp",
  description: "description",
  gallery: [],
  services: ["주택 정원 조성"],
};

function renderCard(props: Partial<ComponentProps<typeof CompanyCard>> = {}) {
  return render(
    <MemoryRouter>
      <CompanyCard company={company} {...props} />
    </MemoryRouter>,
  );
}

describe("CompanyCard", () => {
  it("renders the company's key details", () => {
    renderCard();
    expect(screen.getByRole("heading", { name: company.name })).toBeInTheDocument();
    expect(screen.getByText(company.tagline)).toBeInTheDocument();
    expect(screen.getByText(company.location)).toBeInTheDocument();
    expect(screen.getByText(`경력 ${company.career}`)).toBeInTheDocument();
    expect(screen.getByText(company.caseCount)).toBeInTheDocument();
  });

  it("links to the company detail page", () => {
    renderCard();
    expect(screen.getByRole("link", { name: /업체 상세보기/ })).toHaveAttribute(
      "href",
      "/companies/blue",
    );
  });

  it("uses a custom detail label when provided", () => {
    renderCard({ detailLabel: "자세히 보기" });
    expect(screen.getByRole("link", { name: /자세히 보기/ })).toBeInTheDocument();
  });
});
