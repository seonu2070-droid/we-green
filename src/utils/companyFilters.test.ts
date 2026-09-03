import { describe, expect, it } from "vitest";
import type { Company, CompanyFilters } from "../types";
import {
  filterCompaniesBy,
  matchesCompanyFilters,
  normalizeFilterRegion,
  readFiltersFromSearchParams,
  writeFiltersToSearchParams,
} from "./companyFilters";

function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: "test-1",
    name: "테스트 조경",
    location: "경기 포천",
    region: "경기",
    category: "주택 정원 조성",
    specialties: ["주택 정원 조성"],
    tagline: "tagline",
    area: "경기 포천",
    address: "경기 포천시",
    phone: "031-000-0000",
    career: "5년",
    caseCount: "대표 사례 5건",
    status: "상담 가능",
    image: "/assets/images/company-1.webp",
    description: "description",
    gallery: [],
    services: ["주택 정원 조성"],
    ...overrides,
  };
}

describe("matchesCompanyFilters", () => {
  const filters: CompanyFilters = { region: "all", specialty: "all" };

  it("matches everything when both filters are 'all'", () => {
    const company = makeCompany();
    expect(matchesCompanyFilters(company, filters)).toBe(true);
  });

  it("filters by region", () => {
    const company = makeCompany({ region: "서울" });
    expect(
      matchesCompanyFilters(company, { region: "경기", specialty: "all" }),
    ).toBe(false);
    expect(
      matchesCompanyFilters(company, { region: "서울", specialty: "all" }),
    ).toBe(true);
  });

  it("matches specialty via specialties, category, or services", () => {
    const bySpecialties = makeCompany({
      specialties: ["식재 디자인"],
      category: "기타",
      services: [],
    });
    const byCategory = makeCompany({
      specialties: [],
      category: "식재 디자인",
      services: [],
    });
    const byServices = makeCompany({
      specialties: [],
      category: "기타",
      services: ["식재 디자인"],
    });

    const specialtyFilter: CompanyFilters = {
      region: "all",
      specialty: "식재 디자인",
    };

    expect(matchesCompanyFilters(bySpecialties, specialtyFilter)).toBe(true);
    expect(matchesCompanyFilters(byCategory, specialtyFilter)).toBe(true);
    expect(matchesCompanyFilters(byServices, specialtyFilter)).toBe(true);
  });

  it("excludes companies that match neither region nor specialty", () => {
    const company = makeCompany({
      region: "인천",
      specialties: ["정원 유지관리"],
      category: "정원 유지관리",
      services: ["정원 유지관리"],
    });
    expect(
      matchesCompanyFilters(company, {
        region: "경기",
        specialty: "식재 디자인",
      }),
    ).toBe(false);
  });
});

describe("filterCompaniesBy", () => {
  it("returns only companies matching the filters", () => {
    const companies = [
      makeCompany({ id: "a", region: "경기" }),
      makeCompany({ id: "b", region: "서울" }),
      makeCompany({ id: "c", region: "경기" }),
    ];

    const result = filterCompaniesBy(companies, {
      region: "경기",
      specialty: "all",
    });

    expect(result.map((company) => company.id)).toEqual(["a", "c"]);
  });
});

describe("readFiltersFromSearchParams", () => {
  it("defaults to 'all' when params are missing", () => {
    expect(readFiltersFromSearchParams(new URLSearchParams())).toEqual({
      region: "all",
      specialty: "all",
    });
  });

  it("reads region and specialty from params", () => {
    const params = new URLSearchParams("region=서울&specialty=식재+디자인");
    expect(readFiltersFromSearchParams(params)).toEqual({
      region: "서울",
      specialty: "식재 디자인",
    });
  });
});

describe("writeFiltersToSearchParams", () => {
  it("sets a non-'all' value", () => {
    const next = writeFiltersToSearchParams(
      new URLSearchParams(),
      "region",
      "서울",
    );
    expect(next.get("region")).toBe("서울");
  });

  it("removes the key when value is 'all'", () => {
    const current = new URLSearchParams("region=서울");
    const next = writeFiltersToSearchParams(current, "region", "all");
    expect(next.has("region")).toBe(false);
  });

  it("does not mutate the original params", () => {
    const current = new URLSearchParams();
    writeFiltersToSearchParams(current, "region", "서울");
    expect(current.has("region")).toBe(false);
  });
});

describe("normalizeFilterRegion", () => {
  it.each([
    ["서울 강남구", "서울"],
    ["인천 서구", "인천"],
    ["경기 포천시", "경기"],
    ["부산 해운대구", "부산 해운대구"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeFilterRegion(input)).toBe(expected);
  });
});
