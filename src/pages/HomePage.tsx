import { useState } from "react";
import { Link } from "react-router-dom";
import { useCompanies } from "../context/CompanyContext";
import type { FaqItem } from "../types";
import { usePageTitle } from "../hooks/usePageTitle";
import { CompanyCard } from "../components/company/CompanyCard";
import { Button } from "../components/ui/Button";

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "WE:GREEN은 어떤 서비스인가요?",
    answer:
      "지역 조경업체의 서비스 범위, 전문 분야, 시공 사례를 한곳에서 비교하고 문의할 업체를 선택하도록 돕는 디렉토리 서비스입니다.",
  },
  {
    id: "faq-2",
    question: "견적·결제까지 제공하나요?",
    answer:
      "초기 서비스는 업체 비교와 직접 문의에 집중합니다. 견적, 결제, 계약 중개는 서비스 검증 이후 검토할 예정입니다.",
  },
  {
    id: "faq-3",
    question: "등록된 업체 정보는 어떻게 확인하나요?",
    answer:
      "운영자가 업체의 기본 정보와 공개 동의를 확인한 뒤 노출하는 방식을 계획하고 있습니다. MVP에서는 등록 정보가 브라우저에 저장됩니다.",
  },
  {
    id: "faq-4",
    question: "조경업체는 어떻게 참여할 수 있나요?",
    answer:
      "로그인 후 무료 업체 등록 페이지에서 정보를 제출하면 목록에 바로 반영됩니다.",
  },
];

export function HomePage() {
  usePageTitle("WE:GREEN | 우리 동네 조경업체 찾기");
  const { companies } = useCompanies();
  const previewCompanies = companies
    .filter((company) => !company.isUserRegistered)
    .slice(0, 3);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <main id="main-content">
      <section className="hero section" id="top" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy reveal is-visible">
            <p className="eyebrow">LOCAL LANDSCAPE DIRECTORY</p>
            <h1 id="hero-title">
              내 조건에 맞는
              <br />
              <span>조경업체를 한 곳에서</span>
            </h1>
            <p className="hero-description">
              흩어진 지역 조경업체의 전문 분야와 시공 사례를 한곳에서 살펴보고,
              우리 집에 꼭 맞는 파트너를 더 편하게 찾아보세요.
            </p>
            <div className="hero-actions">
              <Button as="link" to="/companies">
                다른 업체 찾기
              </Button>
              <Button as="link" to="/register" variant="secondary">
                무료 업체 등록
              </Button>
            </div>
            <ul className="hero-proof" aria-label="서비스 핵심 특징">
              <li>
                <span aria-hidden="true">✓</span> 지역 기반 탐색
              </li>
              <li>
                <span aria-hidden="true">✓</span> 실제 시공 사례
              </li>
              <li>
                <span aria-hidden="true">✓</span> 문의 전 정보 확인
              </li>
            </ul>
          </div>

          <div className="hero-visual reveal is-visible">
            <div className="hero-image-wrap">
              <img
                src="/assets/images/garden-hero.webp"
                width={1823}
                height={863}
                alt="디딤돌 산책로와 다양한 식재, 나무 데크가 조화된 주택 정원"
                fetchPriority="high"
              />
              <div className="hero-badge hero-badge-top">
                <span className="badge-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s7-7.58 7-12A7 7 0 0 0 5 9c0 4.42 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2.4" />
                  </svg>
                </span>
                <span>
                  <strong>지역부터</strong> 가까운 업체 탐색
                </span>
              </div>
              <div className="hero-badge hero-badge-bottom">
                <span className="badge-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3.5" y="3.5" width="11" height="11" rx="2" />
                    <path d="M9 20.5h9a2 2 0 0 0 2-2v-9" />
                  </svg>
                </span>
                <span>
                  <strong>사례까지</strong> 한눈에 비교
                </span>
              </div>
            </div>
            <p className="image-caption">
              WE:GREEN이 그리는 더 쉬운 조경 탐색 경험
            </p>
          </div>
        </div>
      </section>

      <section
        className="section problem-section"
        id="problem"
        aria-labelledby="problem-title"
      >
        <div className="container">
          <div className="section-heading reveal is-visible">
            <p className="eyebrow">WHY WE:GREEN</p>
            <h2 id="problem-title">조경업체 찾기, 왜 이렇게 어려울까요?</h2>
            <p>
              검색 결과는 많지만 내 상황에 필요한 정보는 한곳에 모여 있지
              않습니다.
            </p>
          </div>
          <div className="problem-grid">
            <article className="problem-card reveal is-visible">
              <span className="card-number">01</span>
              <h3>흩어진 업체 정보</h3>
              <p>블로그, 지도, SNS를 오가며 업체 정보를 다시 정리해야 합니다.</p>
            </article>
            <article className="problem-card reveal is-visible">
              <span className="card-number">02</span>
              <h3>어려운 조건 비교</h3>
              <p>
                가능 지역과 전문 분야가 제각각이라 후보를 좁히기 어렵습니다.
              </p>
            </article>
            <article className="problem-card reveal is-visible">
              <span className="card-number">03</span>
              <h3>부담스러운 첫 문의</h3>
              <p>
                사례와 상담 정보를 알기 전에 연락부터 해야 하는 경우가 많습니다.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section value-section"
        id="features"
        aria-labelledby="value-title"
      >
        <div className="container">
          <div className="value-intro">
            <div className="section-heading section-heading-left reveal is-visible">
              <p className="eyebrow">CLEARER CHOICE</p>
              <h2 id="value-title">
                필요한 정보만 모아
                <br />
                비교는 더 명확하게
              </h2>
            </div>
            <p className="value-lead reveal is-visible">
              WE:GREEN은 단순히 업체를 나열하지 않습니다. 사용자가 문의 전 꼭
              확인해야 할 정보에 집중합니다.
            </p>
          </div>
          <div className="value-grid">
            <article className="value-card reveal is-visible">
              <div className="line-icon" aria-hidden="true">
                01
              </div>
              <div>
                <h3>지역 기반 탐색</h3>
                <p>
                  내가 원하는 지역에서 실제 시공이 가능한 업체부터 확인합니다.
                </p>
                <span className="tag">가까운 업체</span>
              </div>
            </article>
            <article className="value-card reveal is-visible">
              <div className="line-icon" aria-hidden="true">
                02
              </div>
              <div>
                <h3>전문 분야 비교</h3>
                <p>
                  정원 조성, 잔디, 식재 등 필요한 작업에 맞는 업체를 비교합니다.
                </p>
                <span className="tag">명확한 비교</span>
              </div>
            </article>
            <article className="value-card reveal is-visible">
              <div className="line-icon" aria-hidden="true">
                03
              </div>
              <div>
                <h3>시공 사례 확인</h3>
                <p>
                  대표 작업과 스타일을 미리 보고 내 취향에 맞는지 판단합니다.
                </p>
                <span className="tag">신뢰할 단서</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section steps-section"
        id="how-it-works"
        aria-labelledby="steps-title"
      >
        <div className="container">
          <div className="section-heading reveal is-visible">
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 id="steps-title">복잡했던 탐색을 세 단계로</h2>
            <p>WE:GREEN이 준비하는 이용 경험을 미리 살펴보세요.</p>
          </div>
          <ol className="steps-list">
            <li className="step-item reveal is-visible">
              <span className="step-number">1</span>
              <div>
                <h3>지역과 시공 유형 선택</h3>
                <p>우리 집 위치와 필요한 작업을 간단히 선택합니다.</p>
              </div>
            </li>
            <li className="step-item reveal is-visible">
              <span className="step-number">2</span>
              <div>
                <h3>업체와 사례 비교</h3>
                <p>
                  가능 지역, 전문 분야, 대표 사례를 같은 기준으로 살펴봅니다.
                </p>
              </div>
            </li>
            <li className="step-item reveal is-visible">
              <span className="step-number">3</span>
              <div>
                <h3>적합한 업체에 문의</h3>
                <p>상담 방식과 준비 정보를 확인한 뒤 부담 없이 연락합니다.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section
        className="section companies-section"
        id="companies"
        aria-labelledby="companies-title"
      >
        <div className="container">
          <div className="companies-heading">
            <div className="section-heading section-heading-left reveal is-visible">
              <p className="eyebrow">COMPANY PREVIEW</p>
              <h2 id="companies-title">이런 업체들을 만나보세요</h2>
              <p>지역과 전문 분야가 다른 조경 파트너를 비교해 보세요.</p>
            </div>
            <Link className="text-link reveal is-visible" to="/companies">
              전체 업체 보기 ↗
            </Link>
          </div>
          <div className="company-grid">
            {previewCompanies.map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                delay={index}
                detailLabel="자세히 보기"
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className="section supplier-section"
        id="suppliers"
        aria-labelledby="supplier-title"
      >
        <div className="container supplier-panel reveal is-visible">
          <div className="supplier-copy">
            <p className="eyebrow eyebrow-light">FOR LANDSCAPERS</p>
            <h2 id="supplier-title">좋은 작업을 더 많은 지역 고객에게</h2>
            <p>
              WE:GREEN은 지역 조경업체가 전문 분야와 대표 사례를 부담 없이
              알리고 새로운 고객과 연결될 수 있는 공간을 준비하고 있습니다.
            </p>
            <Button as="link" to="/register" variant="light">
              무료 업체 등록하기
            </Button>
          </div>
          <ul className="supplier-benefits">
            <li>
              <span>01</span> 별도 광고비 없이 업체 정보 소개
            </li>
            <li>
              <span>02</span> 서비스 가능 지역과 전문 분야 안내
            </li>
            <li>
              <span>03</span> 시공 사례를 찾는 잠재 고객과 연결
            </li>
          </ul>
        </div>
      </section>

      <section className="section faq-section" id="faq" aria-labelledby="faq-title">
        <div className="container faq-grid">
          <div className="section-heading section-heading-left reveal is-visible">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-title">자주 묻는 질문</h2>
            <p>WE:GREEN이 준비하는 서비스에 대해 알려드릴게요.</p>
          </div>
          <div className="accordion reveal is-visible">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <article className="accordion-item" key={item.id}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${item.id}-panel`}
                      onClick={() =>
                        setOpenFaqId((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                    >
                      {item.question}
                      <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                    </button>
                  </h3>
                  <div
                    className="accordion-panel"
                    id={`${item.id}-panel`}
                    hidden={!isOpen}
                  >
                    <p>{item.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="section final-cta-section"
        aria-labelledby="final-cta-title"
      >
        <div className="container final-cta reveal is-visible">
          <p className="eyebrow">A BETTER WAY TO CHOOSE</p>
          <h2 id="final-cta-title">
            좋은 정원의 시작,
            <br />
            더 명확한 비교에서
          </h2>
          <p>
            우리 지역에서 활동하는 조경업체의 전문 분야와 시공 사례를 확인해
            보세요.
          </p>
          <div className="final-actions">
            <Button as="link" to="/companies">
              업체 찾기
            </Button>
            <Button as="link" to="/register" variant="secondary">
              업체 등록
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
