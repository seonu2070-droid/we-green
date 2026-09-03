export function ProblemSection() {
  return (
    <section
      className="section problem-section"
      id="problem"
      aria-labelledby="problem-title"
    >
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">WHY WE:GREEN</p>
          <h2 id="problem-title">조경업체 찾기, 왜 이렇게 어려울까요?</h2>
          <p>
            검색 결과는 많지만 내 상황에 필요한 정보는 한곳에 모여 있지
            않습니다.
          </p>
        </div>
        <div className="problem-grid">
          <article className="problem-card">
            <span className="card-number">01</span>
            <h3>흩어진 업체 정보</h3>
            <p>블로그, 지도, SNS를 오가며 업체 정보를 다시 정리해야 합니다.</p>
          </article>
          <article className="problem-card">
            <span className="card-number">02</span>
            <h3>어려운 조건 비교</h3>
            <p>가능 지역과 전문 분야가 제각각이라 후보를 좁히기 어렵습니다.</p>
          </article>
          <article className="problem-card">
            <span className="card-number">03</span>
            <h3>부담스러운 첫 문의</h3>
            <p>
              사례와 상담 정보를 알기 전에 연락부터 해야 하는 경우가 많습니다.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
