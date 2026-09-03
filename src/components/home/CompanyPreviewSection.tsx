import { Link } from "react-router-dom";
import type { Company } from "../../types";
import { CompanyCard } from "../company/CompanyCard";

interface CompanyPreviewSectionProps {
  companies: Company[];
}

export function CompanyPreviewSection({
  companies,
}: CompanyPreviewSectionProps) {
  return (
    <section
      className="section companies-section"
      id="companies"
      aria-labelledby="companies-title"
    >
      <div className="container">
        <div className="companies-heading">
          <div className="section-heading section-heading-left">
            <p className="eyebrow">COMPANY PREVIEW</p>
            <h2 id="companies-title">이런 업체들을 만나보세요</h2>
            <p>지역과 전문 분야가 다른 조경 파트너를 비교해 보세요.</p>
          </div>
          <Link className="text-link" to="/companies">
            전체 업체 보기 ↗
          </Link>
        </div>
        <div className="company-grid">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              detailLabel="자세히 보기"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
