import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useCompanies } from "../context/CompanyContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";

export function CompanyDetailPage() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { getCompanyById } = useCompanies();
  const company = getCompanyById(id);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  usePageTitle(
    company ? `${company.name} | WE:GREEN` : "업체 상세 | WE:GREEN",
  );

  const backToList = useMemo(() => {
    const params = new URLSearchParams();
    const region = searchParams.get("region");
    const specialty = searchParams.get("specialty");
    if (region) params.set("region", region);
    if (specialty) params.set("specialty", specialty);
    const query = params.toString();
    return query ? `/companies?${query}` : "/companies";
  }, [searchParams]);

  if (!company) {
    return (
      <main id="main-content">
        <section className="section">
          <div className="container">
            <div className="stack-gap">
              <EmptyState
                title="업체를 찾을 수 없습니다."
                description="목록에서 다른 업체를 선택해 주세요."
              />
              <Button as="link" to="/companies" variant="secondary">
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content">
      <div className="container breadcrumb">
        <Link to={backToList}>업체 찾기</Link>
        <span aria-hidden="true">/</span>
        <span>{company.name}</span>
      </div>

      <section className="detail-hero">
        <div className="container detail-hero-grid">
          <div className="detail-image">
            <img
              src={company.image}
              width={900}
              height={700}
              alt={`${company.name} 대표 시공 정원`}
            />
          </div>
          <div className="detail-summary">
            <div className="company-meta">
              <span>{company.location}</span>
              <span>{company.category}</span>
            </div>
            <p className="eyebrow">LANDSCAPE PARTNER</p>
            <h1>{company.name}</h1>
            <p className="detail-tagline">{company.tagline}</p>
            <dl className="detail-facts">
              <div>
                <dt>주요 지역</dt>
                <dd>{company.area}</dd>
              </div>
              <div>
                <dt>경력</dt>
                <dd>{company.career}</dd>
              </div>
              <div>
                <dt>상담 가능</dt>
                <dd>평일 09:00–18:00</dd>
              </div>
            </dl>
            <Button
              className="button-wide"
              wide
              onClick={() => setInquiryOpen(true)}
            >
              이 업체에 문의하기
            </Button>
          </div>
        </div>
      </section>

      <section className="section detail-content-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <article className="detail-block">
              <p className="eyebrow">ABOUT</p>
              <h2>공간의 쓰임에서 시작하는 정원</h2>
              <p>{company.description}</p>
            </article>

            <article className="detail-block">
              <p className="eyebrow">SPECIALTY</p>
              <h2>주요 전문 분야</h2>
              <ul className="service-chip-list">
                {company.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </article>

            <article className="detail-block">
              <p className="eyebrow">PORTFOLIO</p>
              <h2>대표 시공 사례</h2>
              <div className="portfolio-grid">
                {company.gallery.map((src, index) => (
                  <img
                    key={`${company.id}-gallery-${index}`}
                    src={src}
                    alt={`${company.name} 대표 시공 사례 ${index + 1}`}
                  />
                ))}
              </div>
            </article>

            <article className="detail-block inquiry-block">
              <p className="eyebrow">INQUIRY</p>
              <h2>업체에 문의하기</h2>
              <p>
                희망 지역, 공간 유형, 예상 시공 시기와 참고 사진을 준비하면 더
                구체적인 상담이 가능합니다.
              </p>
              <Button onClick={() => setInquiryOpen(true)}>
                연락처 확인하기
              </Button>
              {inquiryOpen ? (
                <div className="contact-reveal" tabIndex={-1}>
                  <p className="contact-reveal-label">CONTACT</p>
                  <dl>
                    <div>
                      <dt>업체 위치</dt>
                      <dd>{company.address}</dd>
                    </div>
                    <div>
                      <dt>대표 전화</dt>
                      <dd>{company.phone}</dd>
                    </div>
                    <div>
                      <dt>상담 시간</dt>
                      <dd>평일 09:00–18:00</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </article>
          </div>

          <aside className="detail-aside" aria-label="업체 요약">
            <strong>빠른 정보</strong>
            <ul>
              <li>
                <span>현장 상담</span>
                <b>가능</b>
              </li>
              <li>
                <span>설계·시공</span>
                <b>통합 진행</b>
              </li>
              <li>
                <span>유지관리</span>
                <b>별도 상담</b>
              </li>
            </ul>
            <Button as="link" to={backToList} variant="secondary" wide>
              목록으로 돌아가기
            </Button>
          </aside>
        </div>
      </section>
    </main>
  );
}
