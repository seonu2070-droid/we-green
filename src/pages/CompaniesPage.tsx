import { useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAnalyticsVisit } from "../analytics/AnalyticsProvider";
import { controlledFilter, trackEvent } from "../analytics/tracking";
import { REGION_OPTIONS, SPECIALTY_OPTIONS } from "../data/companies";
import { useCompanies } from "../context/CompanyContext";
import {
  readFiltersFromSearchParams,
  writeFiltersToSearchParams,
} from "../utils/companyFilters";
import { usePageTitle } from "../hooks/usePageTitle";
import { CompanyCard } from "../components/company/CompanyCard";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHero } from "../components/layout/PageHero";
import type { CompanyFilters } from "../types";
import { LoadingState } from "../components/ui/LoadingState";
import { Button } from "../components/ui/Button";

export function CompaniesPage() {
  usePageTitle("업체 찾기 | WE:GREEN");
  const [searchParams, setSearchParams] = useSearchParams();
  const { filterCompanies, isLoading, error, reloadCompanies } = useCompanies();
  const filters = readFiltersFromSearchParams(searchParams);
  const companies = filterCompanies(filters);
  const visit = useAnalyticsVisit();
  const listedVisit = useRef<string | undefined>(undefined);
  const pendingFilter = useRef<{ visitId: string; key: keyof CompanyFilters; value: string } | undefined>(undefined);

  useEffect(() => {
    if (isLoading || error) return;
    const properties = {
      filter_region: controlledFilter(filters.region, "region"),
      filter_specialty: controlledFilter(filters.specialty, "specialty"),
      result_count: companies.length,
    };
    if (listedVisit.current !== visit.id) {
      listedVisit.current = visit.id;
      trackEvent("company_list_view", visit, properties);
    }
    const pending = pendingFilter.current;
    if (pending?.visitId !== visit.id) { pendingFilter.current = undefined; return; }
    if (filters[pending.key] === pending.value) {
      pendingFilter.current = undefined;
      trackEvent("company_filter_applied", visit, { ...properties, changed_filter: pending.key });
    }
  }, [visit, filters.region, filters.specialty, companies.length, isLoading, error]);

  const updateFilter = (key: keyof CompanyFilters, value: string) => {
    if (filters[key] === value) return;
    pendingFilter.current = { visitId: visit.id, key, value };
    setSearchParams(writeFiltersToSearchParams(searchParams, key, value), {
      replace: true,
    });
  };

  return (
    <main id="main-content">
      <PageHero
        eyebrow="LANDSCAPE PARTNERS"
        title="우리 지역의 조경업체를 한눈에 비교하세요"
        description="서비스 가능 지역과 전문 분야, 대표 시공 스타일을 확인하고 내 공간에 어울리는 파트너를 찾아보세요."
      />

      <section className="directory-section" aria-labelledby="directory-title">
        <div className="container">
          <div className="directory-toolbar">
            <div>
              <h2 id="directory-title">조경업체 찾기</h2>
              <p>
                <strong>{companies.length}</strong>개의 업체가 있습니다.
              </p>
            </div>
            <div className="filter-fields" aria-label="업체 필터">
              <label>
                <span>지역</span>
                <select
                  value={filters.region}
                  onChange={(event) =>
                    updateFilter("region", event.target.value)
                  }
                >
                  <option value="all">전체 지역</option>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>전문 분야</span>
                <select
                  value={filters.specialty}
                  onChange={(event) =>
                    updateFilter("specialty", event.target.value)
                  }
                >
                  <option value="all">전체 분야</option>
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {isLoading ? (
            <LoadingState label="업체 정보를 불러오는 중..." />
          ) : error ? (
            <div className="stack-gap">
              <EmptyState title="업체 정보를 불러오지 못했습니다." description={error} />
              <Button onClick={() => void reloadCompanies()} variant="secondary">
                다시 시도
              </Button>
            </div>
          ) : companies.length > 0 ? (
            <div className="company-grid directory-grid">
              {companies.map((company, index) => (
                <CompanyCard key={company.id} company={company} sourceSurface="directory" position={index + 1} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="조건에 맞는 업체가 없습니다."
              description="지역이나 전문 분야를 다르게 선택해 보세요."
            />
          )}
        </div>
      </section>
    </main>
  );
}
