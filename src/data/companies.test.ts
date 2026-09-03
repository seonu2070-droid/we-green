import { describe, expect, it, vi } from "vitest";
import { createCompanyFromRegistration } from "./companies";

describe("createCompanyFromRegistration", () => {
  const input = {
    companyName: "WE 조경",
    introduction:
      "가족 구성원의 생활 동선과 반려동물의 안전을 함께 고려하는 주택 정원 전문 업체입니다.",
    region: "경기 포천",
    specialties: ["주택 정원 조성", "식재 디자인"],
    career: "8",
    email: "user@example.com",
    managerName: "홍길동",
  };

  it("maps registration input onto a Company", () => {
    const company = createCompanyFromRegistration(input);

    expect(company.name).toBe(input.companyName);
    expect(company.specialties).toEqual(input.specialties);
    expect(company.category).toBe(input.specialties[0]);
    expect(company.services).toEqual(input.specialties);
    expect(company.description).toBe(input.introduction);
    expect(company.career).toBe("8년");
    expect(company.status).toBe("검토 중");
    expect(company.isUserRegistered).toBe(true);
  });

  it("normalizes the region for list filtering", () => {
    const company = createCompanyFromRegistration(input);
    expect(company.region).toBe("경기");
  });

  it("generates a unique id prefixed with 'user-'", () => {
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    const first = createCompanyFromRegistration(input);
    const second = createCompanyFromRegistration(input);

    expect(first.id).toBe("user-1000");
    expect(second.id).toBe("user-2000");

    nowSpy.mockRestore();
  });

  it("falls back to a default specialty when none are provided", () => {
    const company = createCompanyFromRegistration({
      ...input,
      specialties: [],
    });
    expect(company.category).toBe("주택 정원 조성");
    expect(company.services).toEqual([]);
  });

  it("labels career as '신규' when not provided", () => {
    const company = createCompanyFromRegistration({ ...input, career: "" });
    expect(company.career).toBe("신규");
  });

  it("truncates the tagline to 60 characters", () => {
    const longIntro = "가".repeat(100);
    const company = createCompanyFromRegistration({
      ...input,
      introduction: longIntro,
    });
    expect(company.tagline).toHaveLength(60);
  });
});
