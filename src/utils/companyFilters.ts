import type { Company, CompanyFilters } from "../types";

export function matchesCompanyFilters(
  company: Company,
  filters: CompanyFilters,
): boolean {
  const regionMatch =
    filters.region === "all" || company.region === filters.region;

  const specialtyMatch =
    filters.specialty === "all" ||
    company.specialties.includes(filters.specialty) ||
    company.category === filters.specialty ||
    company.services.includes(filters.specialty);

  return regionMatch && specialtyMatch;
}

export function filterCompaniesBy(
  companies: Company[],
  filters: CompanyFilters,
): Company[] {
  return companies.filter((company) =>
    matchesCompanyFilters(company, filters),
  );
}

export function readFiltersFromSearchParams(
  params: URLSearchParams,
): CompanyFilters {
  return {
    region: params.get("region") || "all",
    specialty: params.get("specialty") || "all",
  };
}

export function writeFiltersToSearchParams(
  current: URLSearchParams,
  key: keyof CompanyFilters,
  value: string,
): URLSearchParams {
  const next = new URLSearchParams(current);
  if (value === "all") next.delete(key);
  else next.set(key, value);
  return next;
}

/** 등록 지역 값을 목록 필터용 region으로 정규화 */
export function normalizeFilterRegion(region: string): string {
  if (region.includes("서울")) return "서울";
  if (region.includes("인천")) return "인천";
  if (region.includes("경기")) return "경기";
  return region;
}
