import { Button } from "../ui/Button";

export function HeroSection() {
  return (
    <section className="hero section" id="top" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
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

        <div className="hero-visual">
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
  );
}
