import { Link } from "react-router-dom";
import type { Company } from "../../types";
import { Card } from "../ui/Card";

export interface CompanyCardProps {
  company: Company;
  detailLabel?: string;
}

export function CompanyCard({
  company,
  detailLabel = "업체 상세보기",
}: CompanyCardProps) {
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
        <Link className="text-button" to={`/companies/${company.id}`}>
          {detailLabel} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </Card>
  );
}
