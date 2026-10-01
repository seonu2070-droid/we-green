import { Link } from "react-router-dom";
import type { Company } from "../../types";
import { Card } from "../ui/Card";
import { useAnalyticsVisit } from "../../analytics/AnalyticsProvider";
import { trackEvent, type SourceSurface } from "../../analytics/tracking";

export interface CompanyCardProps {
  company: Company;
  detailLabel?: string;
  sourceSurface?: SourceSurface;
  position?: number;
}

export function CompanyCard({
  company,
  detailLabel = "업체 상세보기",
  sourceSurface = "direct_or_unknown",
  position = 1,
}: CompanyCardProps) {
  const visit = useAnalyticsVisit();
  return (
    <Card className="company-card" data-region={company.region}>
      <div className="company-image">
        <img
          src={company.image}
          width={720}
          height={540}
          alt={`${company.name} 시공 사례`}
          loading="lazy"
        />
        <span className="company-status">{company.status}</span>
      </div>
      <div className="company-body">
        <div className="company-meta">
          <span>{company.location}</span>
          <span>{company.category}</span>
        </div>
        <h3>{company.name}</h3>
        <p>{company.tagline}</p>
        <div className="card-stats">
          <span>경력 {company.career}</span>
          <span>{company.caseCount}</span>
        </div>
        <Link className="text-button" to={`/companies/${company.id}`}
          state={{ analyticsSource: sourceSurface, analyticsCompanyId: company.id }}
          onClick={() => trackEvent("company_card_click", visit, {
            company_id: company.id, source_surface: sourceSurface, position,
          })}>
          {detailLabel} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </Card>
  );
}
